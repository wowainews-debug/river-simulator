/**
 * 📡 API Service Layer — 量化運算核心 (Port 8000) 前端鉤子
 * ==========================================================
 * 使用 TanStack Query (React Query) 管理 API 快取與自動重取。
 */

const API_BASE = "/api/v1";  // 走 Vite proxy → localhost:8000/api/v1，零 CORS 問題

/** 預設請求超時 (ms)，防止後端掛死導致前端永久卡住 */
const DEFAULT_TIMEOUT_MS = 15_000;

// ── 通用 fetch 封裝（含超時保護）──────────────────────
async function fetchApi<T>(path: string, options?: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`API ${res.status}: ${err}`);
    }
    return res.json();
  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === "AbortError") {
      throw new Error(`請求逾時（${timeoutMs / 1000} 秒內未回應），請檢查後端服務是否正常運作`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ═══════════════════════════════════════════════════════
// KPI 儀表板
// ═══════════════════════════════════════════════════════

export interface PerformanceData {
  initial_capital: number;
  current_equity: number;
  total_return_pct: number;
  today_pnl: number;
  pnl_history: Array<{
    date: string;
    ending_equity: number;
    daily_pnl: number;
    daily_return_pct: number;
    cumulative_return_pct: number;
    sharpe_ratio: number;
    max_drawdown: number;
    total_trades: number;
    winning_trades: number;
  }>;
}

export async function fetchPerformance(): Promise<PerformanceData> {
  return fetchApi<PerformanceData>("/simulator/performance");
}

// ═══════════════════════════════════════════════════════
// 持倉
// ═══════════════════════════════════════════════════════

export interface Position {
  id: number;
  stock_symbol: string;
  asset_type: string;
  side: "LONG" | "SHORT";
  entry_price: number;
  current_price: number;
  volume: number;
  unrealized_pnl: number;
  realized_pnl: number;
  status: "open" | "closed";
  opened_at: string;
}

export interface PositionsResponse {
  count: number;
  positions: Position[];
}

export async function fetchPositions(): Promise<PositionsResponse> {
  return fetchApi<PositionsResponse>("/simulator/positions");
}

// ═══════════════════════════════════════════════════════
// 狙擊目標
// ═══════════════════════════════════════════════════════

export interface SniperTarget {
  symbol: string;
  name: string;
  strategy?: string;
}

export interface TargetsResponse {
  status: string;
  count: number;
  targets: SniperTarget[];
}

export async function fetchTargets(): Promise<TargetsResponse> {
  return fetchApi<TargetsResponse>("/signals/targets");
}

// ═══════════════════════════════════════════════════════
// 今日訊號
// ═══════════════════════════════════════════════════════

export interface TradeSignal {
  id: number;
  stock_symbol: string;
  asset_type: string;
  signal_type: "BUY" | "SELL" | "HOLD";
  composite_score: number;
  confidence: number;
  entry_price: number;
  stop_loss_price: number;
  take_profit_price: number;
  fubon_order_payload: any;
  status: string;
  signal_date: string;
  created_at: string;
}

export interface TodaySignalsResponse {
  date: string;
  signals: TradeSignal[];
  total_targets: number;
  buy_count: number;
  sell_count: number;
  hold_count: number;
}

export async function fetchTodaySignals(): Promise<TodaySignalsResponse> {
  return fetchApi<TodaySignalsResponse>("/signals/today");
}

// ═══════════════════════════════════════════════════════
// 單一標的訊號
// ═══════════════════════════════════════════════════════

export interface SignalDetail {
  symbol: string;
  composite_score: number;
  confidence: number;
  signal: "BUY" | "SELL" | "HOLD";
  strategy_scores: Array<{
    strategy_name: string;
    raw_score: number;
    weight: number;
    weighted_score: number;
    signal: string;
    tier: string;
  }>;
  entry_price: number;
  stop_loss_price: number;
  risk_warnings: string[];
}

export async function fetchSignalDetail(symbol: string): Promise<SignalDetail> {
  return fetchApi<SignalDetail>(`/signals/${symbol}`);
}

// ═══════════════════════════════════════════════════════
// 健康檢查
// ═══════════════════════════════════════════════════════

export interface HealthStatus {
  war_room_db: string;
  trading_db: string;
  fubon_sdk: string;
  gemini_api: string;
  overall: "healthy" | "degraded" | "critical";
}

export async function fetchHealth(): Promise<HealthStatus> {
  return fetchApi<HealthStatus>("/status/health/detailed");
}

// ═══════════════════════════════════════════════════════
// 綁定參數
// ═══════════════════════════════════════════════════════

export interface ParamsResponse {
  symbol: string;
  params: Record<string, number> | null;
  count?: number;
  message?: string;
}

export async function fetchParams(symbol: string): Promise<ParamsResponse> {
  return fetchApi<ParamsResponse>(`/optimizer/params/${symbol}`);
}

// ═══════════════════════════════════════════════════════
// 回測
// ═══════════════════════════════════════════════════════

export interface BacktestRequest {
  symbol: string;
  strategy_name: string;
  params?: Record<string, number>;
  days_back?: number;
}

export async function runBacktest(req: BacktestRequest): Promise<any> {
  return fetchApi("/optimizer/backtest", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// ═══════════════════════════════════════════════════════
// 模擬設定（含三道防線全部 34 欄位）
// ═══════════════════════════════════════════════════════

export interface SimConfig {
  initial_capital: number;
  commission_rate: number;
  tax_rate: number;
  slippage_pct: number;
  risk_per_trade_pct: number;
  is_real_mode: boolean;
  max_position_pct: number;
  max_daily_loss_pct: number;
  /** 🆕 期貨合約模式 (v1.2) */
  futures_contract: "TX" | "MXF" | "TMF" | "off";
  /** 🆕 個股交易模式 (v1.2) */
  stock_mode: "full_lot" | "odd_lot" | "off";
  options_enabled: boolean;
  opt_call_buy_enabled: boolean;
  opt_call_sell_enabled: boolean;
  opt_put_buy_enabled: boolean;
  opt_put_sell_enabled: boolean;
  stock_short_term_pct: number;
  stock_mid_term_pct: number;
  stock_long_term_pct: number;
  max_entry_premium_short_pct: number;
  max_entry_premium_mid_pct: number;
  max_entry_premium_long_pct: number;
  futures_max_contracts: number;
  options_max_buy_contracts: number;
  options_max_sell_contracts: number;
  options_allow_naked_sell: boolean;
  stock_max_daily_trades: number;
  futures_max_daily_trades: number;
  options_max_daily_trades: number;
  last_entry_minutes_before_close: number;
  daily_profit_lock_pct: number;
  min_daily_shares: number;
  options_capital_reserve_pct: number;
  futures_margin_reserved: number;
  options_margin_reserved: number;
}

export async function fetchSimConfig(): Promise<{ status: string; config: SimConfig }> {
  return fetchApi<{ status: string; config: SimConfig }>("/simulator/config");
}

export async function updateSimConfig(updates: Partial<SimConfig>): Promise<{ status: string; updated: string[] }> {
  return fetchApi<{ status: string; updated: string[] }>("/simulator/config", {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

// ═══════════════════════════════════════════════════════
// 🆕 AI 辯論日誌 (v1.2)
// ═══════════════════════════════════════════════════════

export interface DebateMessage {
  id: number;
  round: number;
  agent_id: string;
  agent_label: string;
  role_name: string;
  model_type: "gemini" | "deepseek";
  direction: "BUY" | "SELL" | "HOLD";
  confidence: number;
  rationale: string;
  risk_factor?: string;
  opinion_changed?: boolean;
  entry_price?: number;
  stop_loss?: number;
  take_profit?: number;
  api_latency_ms?: number;
}

export interface DebateSession {
  id: string;
  symbol: string;
  name: string;
  asset_type: string;
  trade_mode: string;
  executed_at: string;
  total_rounds: number;
  arbiter_called: boolean;
  overall_verdict: "PROCEED" | "ABSTAIN";
  consensus: "BUY" | "SELL" | "HOLD";
  consensus_score: number;
  messages: DebateMessage[];
}

export interface DebateLogsResponse {
  status: string;
  debates: DebateSession[];
  total_count: number;
}

export async function fetchDebateLogs(
  symbol?: string,
  assetType?: string,
  verdict?: string,
  limit = 20,
  offset = 0
): Promise<DebateLogsResponse> {
  const params = new URLSearchParams();
  if (symbol) params.set("symbol", symbol);
  if (assetType) params.set("asset_type", assetType);
  if (verdict) params.set("verdict", verdict);
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  return fetchApi<DebateLogsResponse>(`/debate/logs?${params}`);
}

// ═══════════════════════════════════════════════════════
// 系統狀態 — 模組載入 + 工作日誌
// ═══════════════════════════════════════════════════════

export interface ModuleStatus {
  signals: Record<string, string>;
  risk: Record<string, string>;
  ai_context: Record<string, string>;
  optimizer: Record<string, string>;
  scheduler: Record<string, any>;
}

export interface ModulesResponse {
  status: string;
  modules: ModuleStatus;
  checked_at: string;
}

export async function fetchModules(): Promise<ModulesResponse> {
  return fetchApi<ModulesResponse>("/status/modules");
}

export interface LogsResponse {
  status: string;
  logs: string[];
  count: number;
}

export async function fetchRecentLogs(lines?: number): Promise<LogsResponse> {
  return fetchApi<LogsResponse>(`/status/logs/recent?lines=${lines ?? 50}`);
}

// ═══════════════════════════════════════════════════════
// 台指期即時行情
// ═══════════════════════════════════════════════════════

export interface FuturesQuote {
  status: string;
  message?: string;
  last_price: number | null;
  klines: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }>;
  margin_reserved: number;
  max_contracts: number;
}

export async function fetchFuturesQuote(): Promise<FuturesQuote> {
  return fetchApi<FuturesQuote>("/simulator/futures-quote");
}
