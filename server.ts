/**
 * 🚀 RIVER 下單模擬器 Express 伺服器 (Port 3001)
 * ===============================================
 * 負責：
 *   1. 提供 Vite 前端靜態資源
 *   2. API 代理層：部分直連 Supabase B，其餘轉發 FastAPI (Port 8000)
 *
 * 🔧 v1.1: HTTP Keep-Alive 連線池 + 智慧重試，杜絕間歇性 502 Bad Gateway
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══════════════════════════════════════════════════════════
// Supabase B (river-trading) 客戶端初始化
// ═══════════════════════════════════════════════════════════
const QUANT_SUPABASE_URL = process.env.QUANT_SUPABASE_URL || '';
const QUANT_SUPABASE_ANON_KEY = process.env.QUANT_SUPABASE_ANON_KEY || '';

let supabaseClient: ReturnType<typeof createClient> | null = null;

if (QUANT_SUPABASE_URL && QUANT_SUPABASE_ANON_KEY) {
  supabaseClient = createClient(QUANT_SUPABASE_URL, QUANT_SUPABASE_ANON_KEY);
  console.log('✅ Supabase B (river-trading) 客戶端已初始化');
} else {
  console.warn('⚠️ QUANT_SUPABASE_URL / QUANT_SUPABASE_ANON_KEY 未設定');
}

/** FastAPI 量化核心後端位址 */
const BACKEND_URL = process.env.QUANT_BACKEND_URL || 'http://localhost:8000';

// ── HTTP Keep-Alive 連線池 (agent) ─────────────────────
// 🔧 v1.1: 避免每次代理請求重建 TCP 連線（冷啟動延遲 + TIME_WAIT 堆積），
//         使用全域 agent 重用連線，大幅降低 502 發生機率。
const _keepAliveAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 30_000,   // 30 秒內閒置連線保活
  maxSockets: 32,           // 每主機最大並行 socket
  maxFreeSockets: 8,        // 閒置保留上限
  timeout: 60_000,          // socket 級逾時
});

// ── API 代理核心 (含智慧重試) ─────────────────────────
const PROXY_TIMEOUT_MS = 25_000;   // 單次請求逾時（需 < 前端 45s + server.ts 30s）
const MAX_RETRIES = 2;             // 最多重試次數
const RETRY_DELAY_MS = 600;        // 重試前等待

/**
 * 🆕 API 代理中間件 — 將 Express 未處理的 API 請求轉發到 FastAPI (Port 8000)
 *
 * 這個中間件解決了核心架構缺陷：server.ts 只處理少數 GET 路由，
 * 但 PUT/POST/DELETE（如三道防線設定儲存）根本沒有對應路由，
 * 導致請求落到 Vite SPA fallback（回傳 HTML）或直接逾時。
 */
async function proxyToBackend(req: Request, res: Response, next: NextFunction) {
  // 只代理 API 路徑，非 API 路徑交給 Vite/靜態資源
  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const targetUrl = `${BACKEND_URL}${req.originalUrl}`;
  const method = req.method;
  const isWriteMethod = method === 'PUT' || method === 'POST' || method === 'PATCH' || method === 'DELETE';

  // 🔧 v1.1: 冪等 GET 可安全重試；寫入方法僅在後端回應 502/504 時重試
  const canRetry = (statusCode: number): boolean => {
    if (method === 'GET' || method === 'HEAD') return true;
    // 寫入方法：僅在後端明確回傳服務端錯誤（非業務邏輯錯誤）時重試
    return statusCode === 502 || statusCode === 503 || statusCode === 504;
  };

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const proxyTimer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
        },
        signal: controller.signal,
        // @ts-expect-error Node.js fetch 擴充 agent 參數（非標準 Web API）
        agent: (_parsedUrl: URL) => _keepAliveAgent,
      };

      // 對 PUT/POST/PATCH 請求附帶 body
      if (method !== 'GET' && method !== 'HEAD' && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }

      if (attempt > 0) {
        console.log(`🔄 [Proxy Retry #${attempt}] ${method} ${req.originalUrl} → ${targetUrl}`);
      } else {
        console.log(`🔄 [Proxy] ${method} ${req.originalUrl} → ${targetUrl}`);
      }

      const backendRes = await fetch(targetUrl, fetchOptions);
      clearTimeout(proxyTimer);

      const statusCode = backendRes.status;

      // 🔧 v1.1: 後端回 502/503/504 → 重試（若未超過上限）
      if ((statusCode === 502 || statusCode === 503 || statusCode === 504) && attempt < MAX_RETRIES && canRetry(statusCode)) {
        const bodyText = await backendRes.text().catch(() => '');
        console.warn(`⚠️ [Proxy] 後端回 ${statusCode}，${RETRY_DELAY_MS}ms 後重試 (${attempt + 1}/${MAX_RETRIES})...  body=${bodyText.slice(0, 200)}`);
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }

      // 轉發後端回應
      const contentType = backendRes.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await backendRes.json();
        return res.status(statusCode).json(data);
      }
      const text = await backendRes.text();
      return res.status(statusCode).send(text);
    } catch (e: any) {
      lastError = e;
      if (e.name === 'AbortError') {
        console.warn(`⏰ [Proxy Timeout] ${method} ${targetUrl} (${PROXY_TIMEOUT_MS / 1000}s)${attempt < MAX_RETRIES ? `，準備重試(${attempt + 1}/${MAX_RETRIES})...` : ''}`);
      } else {
        console.error(`🔥 [Proxy Error] ${method} ${targetUrl}: ${e.message}${attempt < MAX_RETRIES ? `，準備重試(${attempt + 1}/${MAX_RETRIES})...` : ''}`);
      }
      if (attempt < MAX_RETRIES && canRetry(502)) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
    }
  }

  // 所有重試耗盡
  const errMsg = lastError?.message || 'Unknown proxy error';
  console.error(`🔥 [Proxy FAILED] ${method} ${targetUrl} after ${MAX_RETRIES + 1} attempts: ${errMsg}`);
  return res.status(502).json({
    error: `無法連線到量化運算核心 (${BACKEND_URL})`,
    detail: errMsg,
    hint: '請確認 FastAPI 服務是否在 port 8000 運行',
    retries: MAX_RETRIES + 1,
  });
}

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(express.json());

  // ── API Router (僅處理需要直連 Supabase 的少數路由) ──
  const apiRouter = express.Router();

  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'river-simulator', version: '0.1.0' });
  });

  // GET /api/v1/signals/today — 取得今日訊號（直連 Supabase B）
  apiRouter.get('/signals/today', async (_req, res) => {
    if (!supabaseClient) {
      return res.status(503).json({ error: 'Supabase 連線未就緒' });
    }
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabaseClient
        .from('trade_signals')
        .select('*')
        .eq('signal_date', today)
        .order('composite_score', { ascending: false });

      if (error) throw error;
      res.json({ status: 'ok', date: today, signals: data || [] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // GET /api/v1/positions — 模擬持倉（直連 Supabase B）
  apiRouter.get('/positions', async (_req, res) => {
    if (!supabaseClient) {
      return res.status(503).json({ error: 'Supabase 連線未就緒' });
    }
    try {
      const { data, error } = await supabaseClient
        .from('simulated_positions')
        .select('*')
        .eq('status', 'open');

      if (error) throw error;
      res.json({ status: 'ok', positions: data || [] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 🆕 先註冊精確路由（apiRouter），再掛代理層做所有其他 API 轉發
  app.use('/api/v1', apiRouter);
  // 🆕 所有 apiRouter 未匹配的 API 請求 → 轉發到 FastAPI Port 8000
  app.use(proxyToBackend);

  // ── Vite 開發伺服器 ───────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ── 全域錯誤處理 ──────────────────────────────────────
  app.use((err: any, req: any, res: any, _next: any) => {
    console.error(`🔥 [API Error] ${req.method} ${req.url}:`, err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`📊 RIVER 下單模擬器運行中: http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('🔥 伺服器啟動失敗:', err);
});
