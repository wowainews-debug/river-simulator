import { useState, useEffect } from "react";
import { fetchPositions, Position } from "../lib/api";

export default function OrdersPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPositions()
      .then((res) => setPositions(res.positions))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-400">⏳ 載入持倉與委託記錄...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">📋 持倉與委託記錄</h1>

      <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">標的</th>
                <th className="px-4 py-3">方向</th>
                <th className="px-4 py-3">進場價</th>
                <th className="px-4 py-3">現價</th>
                <th className="px-4 py-3">數量</th>
                <th className="px-4 py-3">未實現損益</th>
                <th className="px-4 py-3">已實現損益</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">開倉時間</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              {positions.length > 0 ? positions.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-900">{p.stock_symbol}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.side === "LONG" ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"
                    }`}>{p.side}</span>
                  </td>
                  <td className="px-4 py-3 font-mono">${p.entry_price?.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">${p.current_price?.toLocaleString() ?? "--"}</td>
                  <td className="px-4 py-3">{p.volume}</td>
                  <td className={`px-4 py-3 font-mono ${(p.unrealized_pnl ?? 0) >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ${p.unrealized_pnl?.toLocaleString() ?? "0"}
                  </td>
                  <td className={`px-4 py-3 font-mono ${(p.realized_pnl ?? 0) >= 0 ? "text-rose-600" : "text-emerald-600"}`}>
                    ${p.realized_pnl?.toLocaleString() ?? "0"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      p.status === "open" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-400"
                    }`}>{p.status === "open" ? "持倉中" : "已平倉"}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{p.opened_at ? new Date(p.opened_at).toLocaleString("zh-TW") : "--"}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-400" colSpan={9}>
                    尚無持倉記錄 (模擬帳戶，等待訊號寫入)
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
