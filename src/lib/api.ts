/**
 * 📡 API Service Layer — 量化運算核心 (Port 8000) 前端鉤子
 * ==========================================================
 * 使用 TanStack Query (React Query) 管理 API 快取與自動重取。
 */

const API_BASE = "http://localhost:8000/api/v1";

// ── 通用 fetch 封裝 ──────────────────────────────────
async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }
  return res.json();
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
  return fetchApi<TodaySignalsResponse>("/signals/signals/today");
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
  return fetchApi<SignalDetail>(`/signals/signals/${symbol}`);
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
