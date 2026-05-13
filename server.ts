/**
 * 🚀 RIVER 下單模擬器 Express 伺服器 (Port 3001)
 * ===============================================
 * 負責：
 *   1. 提供 Vite 前端靜態資源
 *   2. API 代理層：讀取 Supabase B (river-trading) 訊號與模擬資料
 */

import express from 'express';
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

async function startServer() {
  const app = express();
  const PORT = 3001;

  app.use(express.json());

  // ── API Router ─────────────────────────────────────────
  const apiRouter = express.Router();

  apiRouter.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'river-simulator', version: '0.1.0' });
  });

  // GET /api/v1/signals/today — 取得今日訊號
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

  // GET /api/v1/positions — 模擬持倉
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

  app.use('/api/v1', apiRouter);

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
