import { useState, useEffect } from "react";
import EquityCurveChart from "../components/EquityCurveChart";
import { fetchPerformance, fetchTargets, fetchTodaySignals, fetchHealth, fetchSimConfig, fetchArbiterReport, PerformanceData, TargetsResponse, TodaySignalsResponse, HealthStatus, SimConfig, ArbiterReport } from "../lib/api";

export default function Dashboard() {
  const [performance, setPerformance] = useState<PerformanceData | null>(null);
  const [targets, setTargets] = useState<TargetsResponse | null>(null);
  const [signals, setSignals] = useState<TodaySignalsResponse | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [simConfig, setSimConfig] = useState<SimConfig | null>(null);
  const [arbiterReport, setArbiterReport] = useState<ArbiterReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    async function loadAll() {
      try {
        setLoading(true);
        const [perf, tgt, sig, h, cfg, arb] = await Promise.all([
          fetchPerformance(),
          fetchTargets(),
          fetchTodaySignals(),
          fetchHealth(),
          fetchSimConfig().then(r => r.config).catch(() => null),
          fetchArbiterReport().catch(() => null),
        ]);
        if (disposed) return;
        setPerformance(perf);
        setTargets(tgt);
        setSignals(sig);
        setHealth(h);
        setSimConfig(cfg);
        setArbiterReport(arb);
        setError(null);
      } catch (e: any) {
        if (disposed) return;
        console.error("API 載入失敗:", e);
        setError(e.message || "無法連線至運算核心 (Port 8000)");
      } finally {
        if (!disposed) setLoading(false);
      }
    }
    loadAll();
    return () => { disposed = true; };
  }, []);

  // ── 載入中 ──
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <div className="animate-pulse text-slate-400 text-lg">⏳ 連線運算核心中...</div>
      </div>
    );
  }

  // ── 錯誤 ──
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold text-lg mb-2">⚠️ 無法連線至運算核心</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <p className="text-slate-500 text-xs">
            請確認量化引擎已啟動：<code className="bg-slate-100 px-2 py-0.5 rounded">uvicorn src.main:app --port 8000</code>
          </p>
        </div>
      </div>
    );
  }

  // ── 計算資金數據（聯動三道防線設定）──
  const initialCapital = simConfig?.initial_capital ?? performance?.initial_capital ?? 1_000_000;
  const currentEquity = performance?.current_equity ?? initialCapital;
  const totalReturn = performance?.total_return_pct ?? 0;
  const todayPnl = performance?.today_pnl ?? 0;
  // 🆕 v1.2 使用新型別：futures_contract 取代舊 futures_enabled / futures_margin_buffer_pct
  const futuresContract = simConfig?.futures_contract || "off";
  const futuresEnabled = futuresContract !== "off";
  const optionsEnabled = simConfig?.options_enabled ?? false;
  const futuresReserve = futuresEnabled ? (simConfig?.futures_margin_reserved ?? 0) : 0;
  const optionsReserve = optionsEnabled ? (simConfig?.options_margin_reserved ?? 0) : 0;
  const riskReserve = futuresReserve + optionsReserve || Math.round(currentEquity * 0.02); // 若皆未啟用則備援 2%
  const availableCash = currentEquity - riskReserve;

  return (
    <div className="max-w-7xl mx-auto py-4">
      {/* ── 健康燈號 ── */}
      {health && (
        <div className="px-4 mb-4 flex items-center gap-2 text-xs">
          <span className={`inline-block w-2 h-2 rounded-full ${health.overall === "healthy" ? "bg-emerald-500" : health.overall === "degraded" ? "bg-amber-500" : "bg-red-500"}`} />
          <span className="text-slate-500">
            戰情室: {health.war_room_db === "connected" ? "✅" : "❌"} |
            交易庫: {health.trading_db === "connected" ? "✅" : "❌"} |
            富邦: {health.fubon_sdk === "available" ? "✅" : "⚠️"} |
            Gemini: {health.gemini_api === "key_loaded" ? "✅" : "⚠️"}
          </span>
        </div>
      )}

      {/* ── 資金卡 ── */}
      <div className="px-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">啟動資金</span>
            <div className="text-2xl font-mono font-bold text-slate-900">${initialCapital.toLocaleString()}</div>
          </div>
          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">權益資金</span>
            <div className="text-2xl font-mono font-bold text-slate-900">${Math.round(currentEquity).toLocaleString()}</div>
            <div className="text-xs text-slate-400">總報酬: {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%</div>
          </div>
          <div className="border border-slate-200/80 rounded-xl p-4 bg-amber-50">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">風險預留</span>
            <div className="text-2xl font-mono font-bold text-slate-900">${riskReserve.toLocaleString()}</div>
            <div className="text-xs text-amber-600">期貨/選擇權</div>
          </div>
          <div className="border border-slate-200/80 rounded-xl p-4 bg-white">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">可動餘額</span>
            <div className="text-2xl font-mono font-bold text-slate-900">${availableCash.toLocaleString()}</div>
            <div className="text-xs text-slate-400">可下單</div>
          </div>
          <div className={`border rounded-xl p-4 ${todayPnl >= 0 ? "bg-rose-50 border-rose-200" : "bg-emerald-50 border-emerald-200"}`}>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">當日損益</span>
            <div className={`text-2xl font-mono font-bold ${todayPnl >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
              {todayPnl >= 0 ? "+" : ""}${Math.round(todayPnl).toLocaleString()}
            </div>
            <div className={`text-xs ${todayPnl >= 0 ? "text-rose-500" : "text-emerald-500"}`}>
              {todayPnl >= 0 ? "▲" : "▼"} {Math.abs(totalReturn).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* ── 狙擊目標 + 今日訊號 ── */}
      <div className="px-4 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* 狙擊目標 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">🎯 今日狙擊目標</h3>
          {targets && targets.targets.length > 0 ? (
            <div className="space-y-2">
              {targets.targets.slice(0, 10).map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-900">{t.symbol}</span>
                  <span className="text-slate-500">{t.name}</span>
                  {t.strategy && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">{t.strategy}</span>}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">今日尚無狙擊目標 (等待盤後 AI 篩選)</p>
          )}
        </div>

        {/* 今日訊號 */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">📡 今日訊號</h3>
          {signals && signals.signals.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {signals.signals.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b border-slate-100 pb-2">
                  <span className="font-medium text-slate-900">{s.stock_symbol}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    s.signal_type === "BUY" ? "bg-rose-100 text-rose-600" :
                    s.signal_type === "SELL" ? "bg-emerald-100 text-emerald-600" :
                    "bg-amber-100 text-amber-600"
                  }`}>{s.signal_type}</span>
                  <span className="text-slate-500">分數: {s.composite_score}</span>
                  <span className="text-slate-400">信心: {(s.confidence * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">今日尚無交易訊號</p>
          )}
          {signals && (
            <div className="flex gap-3 mt-3 text-xs text-slate-500">
              <span>🟢 BUY: {signals.buy_count}</span>
              <span>🔴 SELL: {signals.sell_count}</span>
              <span>🟡 HOLD: {signals.hold_count}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 權益曲線 ── */}
      <div className="px-4 mt-6">
        <EquityCurveChart data={performance?.pnl_history} />
      </div>

      {/* ── 🏛️ 超級仲裁官審查報告 ── */}
      {arbiterReport?.summary && (
        <div className="px-4 mt-6">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">🏛️ 超級仲裁官審查報告</h3>
              <span className="text-xs text-slate-400">{arbiterReport.date} · {arbiterReport.summary.fubon_order_payload?.session ?? "--"}</span>
            </div>

            {/* 摘要 */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">總權益</div>
                <div className="text-lg font-bold font-mono">${(arbiterReport.summary.fubon_order_payload?.total_equity ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">可用資金</div>
                <div className="text-lg font-bold font-mono">${(arbiterReport.summary.fubon_order_payload?.available_capital ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-500">已分配</div>
                <div className="text-lg font-bold font-mono text-blue-700">${(arbiterReport.summary.fubon_order_payload?.allocated_total ?? 0).toLocaleString()}</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs text-slate-500">剩餘資金</div>
                <div className="text-lg font-bold font-mono">${(arbiterReport.summary.fubon_order_payload?.remaining_capital ?? 0).toLocaleString()}</div>
              </div>
              <div className={arbiterReport.summary.fubon_order_payload?.fallback_used ? "bg-amber-50 rounded-lg p-3" : "bg-emerald-50 rounded-lg p-3"}>
                <div className="text-xs text-slate-500">核准/否決</div>
                <div className="text-lg font-bold font-mono">
                  {arbiterReport.summary.fubon_order_payload?.approved_count ?? 0}
                  <span className="text-slate-400 text-sm font-normal"> / </span>
                  {arbiterReport.summary.fubon_order_payload?.rejected_count ?? 0}
                </div>
                {arbiterReport.summary.fubon_order_payload?.fallback_used && (
                  <div className="text-[10px] text-amber-600 font-medium">⚠️ 降級方案 (無 AI 審查)</div>
                )}
              </div>
            </div>

            {/* 分配邏輯 */}
            {arbiterReport.summary.fubon_order_payload?.allocation_rationale && (
              <div className="mb-4">
                <div className="text-xs font-medium text-slate-500 mb-1">分配邏輯</div>
                <div className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3">{arbiterReport.summary.fubon_order_payload.allocation_rationale}</div>
              </div>
            )}

            {/* 風險評估 */}
            {arbiterReport.summary.fubon_order_payload?.risk_assessment && (
              <div className="mb-4">
                <div className="text-xs font-medium text-slate-500 mb-1">風險評估</div>
                <div className="text-sm text-slate-700 bg-amber-50 rounded-lg p-3">{arbiterReport.summary.fubon_order_payload.risk_assessment}</div>
              </div>
            )}

            {/* 核准明細 */}
            {arbiterReport.approved_signals && arbiterReport.approved_signals.length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-slate-500 mb-2">✅ 核准訊號</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase bg-slate-50 text-slate-500 border-b">
                      <tr>
                        <th className="px-2 py-1.5">#</th>
                        <th className="px-2 py-1.5">標的</th>
                        <th className="px-2 py-1.5">方向</th>
                        <th className="px-2 py-1.5">進場</th>
                        <th className="px-2 py-1.5">停損</th>
                        <th className="px-2 py-1.5">目標</th>
                        <th className="px-2 py-1.5">口數</th>
                        <th className="px-2 py-1.5">分配資金</th>
                        <th className="px-2 py-1.5">R/R</th>
                        <th className="px-2 py-1.5">原因</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {arbiterReport.approved_signals.map((s: any, i: number) => {
                        const pld = s.fubon_order_payload || {};
                        return (
                          <tr key={i} className="border-b border-slate-100">
                            <td className="px-2 py-1.5 text-slate-400">{pld.priority_rank ?? i + 1}</td>
                            <td className="px-2 py-1.5 font-medium">{s.stock_symbol}</td>
                            <td className="px-2 py-1.5">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                s.signal_type === "BUY" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                              }`}>{s.signal_type}</span>
                            </td>
                            <td className="px-2 py-1.5 font-mono">{s.entry_price ?? "--"}</td>
                            <td className="px-2 py-1.5 font-mono text-rose-500">{s.stop_loss_price ?? "--"}</td>
                            <td className="px-2 py-1.5 font-mono text-emerald-500">{s.take_profit_price ?? "--"}</td>
                            <td className="px-2 py-1.5 font-mono">{pld.quantity ?? "--"}</td>
                            <td className="px-2 py-1.5 font-mono">${(pld.allocated_capital ?? 0).toLocaleString()}</td>
                            <td className="px-2 py-1.5 font-mono">{pld.risk_reward_ratio ?? "--"}</td>
                            <td className="px-2 py-1.5 text-slate-400 max-w-[120px] truncate" title={pld.approval_reason || ""}>{pld.approval_reason || ""}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 否決明細 */}
            {arbiterReport.rejected_signals && arbiterReport.rejected_signals.length > 0 && (
              <div>
                <div className="text-xs font-medium text-slate-500 mb-2">❌ 否決訊號</div>
                <div className="space-y-1">
                  {arbiterReport.rejected_signals.map((s: any, i: number) => {
                    const pld = s.fubon_order_payload || {};
                    return (
                      <div key={i} className="flex items-center gap-2 text-sm bg-rose-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-slate-900">{s.stock_symbol}</span>
                        <span className="text-xs text-rose-600">{(pld.asset_type ?? s.asset_type) === "futures" ? "📈" : "📊"}</span>
                        <span className="text-xs text-rose-500">{pld.rejection_reason || "未知原因"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
