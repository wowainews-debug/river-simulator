import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTodaySignals, TodaySignalsResponse } from "../lib/api";

export default function SignalsPage() {
  const [data, setData] = useState<TodaySignalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodaySignals()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-400">⏳ 載入訊號中...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">📡 訊號監控</h1>
      <p className="text-sm text-slate-500 mb-6">
        日期: {data?.date} ｜ 共 {data?.signals.length ?? 0} 筆訊號
        {data && (
          <span className="ml-3">
            🟢 BUY: {data.buy_count} ｜ 🔴 SELL: {data.sell_count} ｜ 🟡 HOLD: {data.hold_count}
          </span>
        )}
      </p>

      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">標的</th>
                <th className="px-4 py-3">方向</th>
                <th className="px-4 py-3">綜合分數</th>
                <th className="px-4 py-3">信心度</th>
                <th className="px-4 py-3">建議進場</th>
                <th className="px-4 py-3">停損</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {data && data.signals.length > 0 ? data.signals.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{s.stock_symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.signal_type === "BUY" ? "bg-rose-100 text-rose-600" :
                      s.signal_type === "SELL" ? "bg-emerald-100 text-emerald-600" :
                      "bg-amber-100 text-amber-600"
                    }`}>{s.signal_type}</span>
                  </td>
                  <td className="px-4 py-3">{s.composite_score}</td>
                  <td className="px-4 py-3">{(s.confidence * 100).toFixed(0)}%</td>
                  <td className="px-4 py-3 font-mono">${s.entry_price?.toLocaleString() ?? "--"}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">${s.stop_loss_price?.toLocaleString() ?? "--"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      s.status === "executed" ? "bg-emerald-50 text-emerald-600" :
                      s.status === "pending" ? "bg-blue-50 text-blue-600" :
                      "bg-slate-50 text-slate-400"
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/signals/${s.stock_symbol}`)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={8}>
                    今日尚無交易訊號 (需等待運算核心排程產出)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
