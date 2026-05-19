import { useState, useEffect } from "react";
import type { SimConfig } from "../lib/api";
import { fetchSimConfig } from "../lib/api";

interface StrategyParam {
  strategy_name: string;
  param_name: string;
  param_value: number;
  sharpe_ratio?: number;
  win_rate?: number;
  max_drawdown?: number;
  total_trades?: number;
}

interface StockReport {
  symbol: string;
  strategies: StrategyParam[];
}

export default function ComputeStocks() {
  const [stocks, setStocks] = useState<StockReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/v1/optimizer/stock-report")
      .then(r => r.json())
      .then(data => setStocks(data.stocks || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-400">⏳ 載入個股回測數據...</div>;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-slate-900">🧠 個股運算中心</h1>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
          🔄 重新載入
        </button>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-sm mb-4">{error}</div>}

      {stocks.length === 0 && <div className="text-slate-400 text-center py-10">尚無標的參數資料（需先執行 optimizer）</div>}

      <div className="space-y-6">
        {stocks.map(stock => (
          <div key={stock.symbol} className="bg-white border border-slate-200/80 rounded-xl p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">{stock.symbol}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b">
                  <tr>
                    <th className="px-4 py-2">策略</th>
                    <th className="px-4 py-2">參數</th>
                    <th className="px-4 py-2">Sharpe</th>
                    <th className="px-4 py-2">勝率</th>
                    <th className="px-4 py-2">最大回撤</th>
                    <th className="px-4 py-2">總交易</th>
                  </tr>
                </thead>
                <tbody className="text-slate-700">
                  {stock.strategies.map((s, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="px-4 py-2 font-medium">{s.strategy_name}</td>
                      <td className="px-4 py-2 font-mono text-xs">{s.param_name}={s.param_value}</td>
                      <td className="px-4 py-2 font-mono">{s.sharpe_ratio?.toFixed(2) ?? "-"}</td>
                      <td className="px-4 py-2 font-mono">{s.win_rate != null ? `${(s.win_rate * 100).toFixed(0)}%` : "-"}</td>
                      <td className="px-4 py-2 font-mono">{s.max_drawdown != null ? `${(s.max_drawdown * 100).toFixed(1)}%` : "-"}</td>
                      <td className="px-4 py-2">{s.total_trades ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
