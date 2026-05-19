import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchParams, ParamsResponse } from "../lib/api";

export default function ParamPanel() {
  const { symbol } = useParams<{ symbol: string }>();
  const [data, setData] = useState<ParamsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;
    fetchParams(symbol)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-400">⏳ 載入 {symbol} 綁定參數...</div>;
  }

  const params = data?.params;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">🔧 參數面板 — {symbol}</h1>

      <div className="bg-white border border-slate-200/80 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">⚙️ 已綁定參數</h2>
        {params && Object.keys(params).length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">參數名稱</th>
                  <th className="px-4 py-3">最優值</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {Object.entries(params).map(([key, value]) => (
                  <tr key={key} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-mono text-xs">{key}</td>
                    <td className="px-4 py-2 font-mono">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400">{data?.message || "尚無綁定參數 (需先執行 optimizer)"}</p>
        )}
      </div>

      <p className="text-xs text-slate-400">
        參數來源: Supabase B (<code>param_bindings</code> 表) ｜ 優化後永久綁定此標的
      </p>
    </div>
  );
}
