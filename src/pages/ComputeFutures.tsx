import { useState, useRef } from "react";
import FuturesChart from "../components/FuturesChart";

interface BacktestResult {
  sharpe_ratio?: number;
  win_rate?: number;
  max_drawdown?: number;
  total_trades?: number;
  winning_trades?: number;
  losing_trades?: number;
  profit_factor?: number;
  total_return_pct?: number;
  chart_data?: any;
}

const SIM_DEFAULTS = {
  trend: { hma_len: 83, ema_slow: 170, ema_buffer_pct: 0.05, max_trend_dev_pct: 5.0 },
  adx: { adx_len: 29, adx_limit: 17 },
  chop: { chop_len: 22, chop_threshold: 50 },
  fish: { enabled: true, slope: 2.5 },
  rev: { enabled: true, trend_len: 3, check_bars: 1, move_pct: 1.5 },
  reentry: { enabled: true, diff_pct: 1.1, rsi_zone: 55 },
};

export default function ComputeFutures() {
  const [sim, setSim] = useState(SIM_DEFAULTS);
  const [days, setDays] = useState(7);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  async function runBacktest() {
    try { setRunning(true); setError("");
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();
      const timer = setTimeout(() => abortRef.current?.abort(), 30_000);
      const res = await fetch("/api/v1/optimizer/futures-backtest", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ days_back: days, params: { trend_detector: sim.trend } }),
      });
      clearTimeout(timer);
      if (!res.ok) {
        let detail = `HTTP ${res.status}`;
        try { const errBody = await res.json(); detail = errBody.detail || detail; } catch {}
        throw new Error(detail);
      }
      setResult(await res.json());
    } catch (e: any) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError("請求逾時（30 秒內未回應），請檢查後端引擎是否正常運作");
        return;
      }
      setError(e.message);
    }
    finally { setRunning(false); }
  }

  const _set = (k: string, v: number | boolean) => {
    const [group, key] = k.split(".");
    setSim(prev => ({ ...prev, [group]: { ...(prev as any)[group], [key]: v } }));
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-6">
      <h1 className="text-xl font-bold text-slate-900">📈 期貨運算中心 — TAIEX V1 策略引擎</h1>

      {/* Production */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2"><span className="text-lg">🔒</span><h3 className="text-base font-semibold text-slate-900">正式交易參數 (Production)</h3><span className="text-xs text-slate-400">唯讀，實際下單使用</span></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div><span className="text-xs text-slate-400">HMA 週期</span><div className="font-mono font-semibold">{sim.trend.hma_len}</div></div>
          <div><span className="text-xs text-slate-400">EMA 週期</span><div className="font-mono font-semibold">{sim.trend.ema_slow}</div></div>
          <div><span className="text-xs text-slate-400">緩衝%</span><div className="font-mono font-semibold">{sim.trend.ema_buffer_pct}%</div></div>
          <div><span className="text-xs text-slate-400">最大乖離%</span><div className="font-mono font-semibold">{sim.trend.max_trend_dev_pct}%</div></div>
          <div><span className="text-xs text-slate-400">ADX</span><div className="font-mono font-semibold">{sim.adx.adx_len}/{sim.adx.adx_limit}</div></div>
          <div><span className="text-xs text-slate-400">CHOP</span><div className="font-mono font-semibold">{sim.chop.chop_len}/{sim.chop.chop_threshold}</div></div>
          <div><span className="text-xs text-slate-400">魚頭</span><div className="font-mono font-semibold">{sim.fish.enabled ? `✅ 斜率${sim.fish.slope}` : "❌"}</div></div>
          <div><span className="text-xs text-slate-400">反轉</span><div className="font-mono font-semibold">{sim.rev.enabled ? `✅ ${sim.rev.trend_len}/${sim.rev.check_bars}/${sim.rev.move_pct}%` : "❌"}</div></div>
          <div><span className="text-xs text-slate-400">接回</span><div className="font-mono font-semibold">{sim.reentry.enabled ? `✅ ${sim.reentry.diff_pct}%` : "❌"}</div></div>
          <div><span className="text-xs text-slate-400">狀態</span><div className="font-mono text-emerald-600 font-semibold">🟢 啟用</div></div>
        </div>
      </div>

      {/* Simulation */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2"><span className="text-lg">🧪</span><h3 className="text-base font-semibold text-slate-900">模擬回測區 (Simulation)</h3></div>
        <p className="text-xs text-slate-500">調整參數後點擊回測，系統計算 Sharpe + 勝率</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NF label="HMA 週期" v={sim.trend.hma_len} onChange={v => _set("trend.hma_len", v)} />
          <NF label="EMA 週期" v={sim.trend.ema_slow} onChange={v => _set("trend.ema_slow", v)} />
          <NF label="緩衝 %" v={sim.trend.ema_buffer_pct} step={0.05} onChange={v => _set("trend.ema_buffer_pct", v)} />
          <NF label="最大乖離 %" v={sim.trend.max_trend_dev_pct} onChange={v => _set("trend.max_trend_dev_pct", v)} />
          <NF label="ADX 週期" v={sim.adx.adx_len} onChange={v => _set("adx.adx_len", v)} />
          <NF label="ADX 門檻" v={sim.adx.adx_limit} onChange={v => _set("adx.adx_limit", v)} />
          <NF label="回溯天數" v={days} onChange={v => setDays(v)} min={1} max={30} />
        </div>

        <div className="flex items-center gap-4">
          <button onClick={runBacktest} disabled={running}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            {running ? "🚀 回測中..." : "🚀 執行回測"}
          </button>
          {error && <span className="text-rose-500 text-sm">{error}</span>}
        </div>

        {result && (
          <>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 p-4 bg-slate-50 rounded-lg">
              <KPI label="Sharpe" value={result.sharpe_ratio?.toFixed(2)} />
              <KPI label="勝率" value={`${((result.win_rate || 0) * 100).toFixed(0)}%`} />
              <KPI label="Max DD" value={`${((result.max_drawdown || 0) * 100).toFixed(1)}%`} />
              <KPI label="總交易" value={result.total_trades} />
              <KPI label="W/L" value={`${result.winning_trades}/${result.losing_trades}`} />
              <KPI label="PF" value={result.profit_factor?.toFixed(2)} />
            </div>
            <FuturesChart data={result.chart_data} />
          </>
        )}
      </div>
    </div>
  );
}

function NF({ label, v, step = 1, min, max, onChange }: { label: string; v: number; step?: number; min?: number; max?: number; onChange: (v: number) => void }) {
  return <label className="block"><span className="text-xs text-slate-500">{label}</span>
    <input type="number" step={step} min={min} max={max} value={v} onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full mt-0.5 px-2 py-1 border border-slate-300 rounded text-sm" /></label>;
}

function KPI({ label, value }: { label: string; value?: string | number }) {
  return <div className="text-center"><div className="text-xs text-slate-400">{label}</div><div className="text-sm font-semibold font-mono text-slate-800">{value ?? "-"}</div></div>;
}
