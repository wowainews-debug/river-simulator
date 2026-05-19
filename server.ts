/**
 * 🚀 RIVER 下單模擬器 Express 伺服器 (Port 3001)
 * ===============================================
 * 負責：
 *   1. 提供 Vite 前端靜態資源
 *   2. API 代理層：部分直連 Supabase B，其餘轉發 FastAPI (Port 8000)
 */

import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // 對 PUT/POST/PATCH 請求附帶 body
    if (method !== 'GET' && method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    console.log(`🔄 [Proxy] ${method} ${req.originalUrl} → ${targetUrl}`);
    const backendRes = await fetch(targetUrl, fetchOptions);

    // 轉發後端回應
    const contentType = backendRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await backendRes.json();
      return res.status(backendRes.status).json(data);
    }
    const text = await backendRes.text();
    return res.status(backendRes.status).send(text);
  } catch (e: any) {
    console.error(`🔥 [Proxy Error] ${method} ${targetUrl}: ${e.message}`);
    // 若後端完全無法連線，回傳明確錯誤而非讓 Vite 吃掉
    return res.status(502).json({
      error: `無法連線到量化運算核心 (${BACKEND_URL})`,
      detail: e.message,
      hint: '請確認 FastAPI 服務是否在 port 8000 運行',
    });
  }
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
