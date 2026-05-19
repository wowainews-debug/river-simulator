import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchSignalDetail, SignalDetail as SignalDetailType } from "../lib/api";

export default function SignalDetail() {
  const { symbol } = useParams<{ symbol: string }>();
  const [data, setData] = useState<SignalDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) return;
    fetchSignalDetail(symbol)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-400">⏳ 載入 {symbol} 訊號明細...</div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center text-amber-700">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">🔍 訊號明細 — {symbol}</h1>
      <p className="text-sm text-slate-500 mb-6">
        綜合分數: {data.composite_score} ｜ 信心度: {(data.confidence * 100).toFixed(0)}% ｜
        信號: <span className={`font-bold ${data.signal === "BUY" ? "text-rose-600" : data.signal === "SELL" ? "text-emerald-600" : "text-amber-600"}`}>{data.signal}</span>
      </p>

      {/* 各模組評分明細 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-4">📐 量化訊號細節</h2>
        {data.strategy_scores && data.strategy_scores.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left">策略</th>
                  <th className="px-4 py-3 text-right">原始分數</th>
                  <th className="px-4 py-3 text-right">權重</th>
                  <th className="px-4 py-3 text-right">加權分數</th>
                  <th className="px-4 py-3 text-center">層級</th>
                  <th className="px-4 py-3 text-center">方向</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                {data.strategy_scores.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-4 py-2 font-medium">{s.strategy_name}</td>
                    <td className="px-4 py-2 text-right font-mono">{s.raw_score.toFixed(4)}</td>
                    <td className="px-4 py-2 text-right font-mono">{(s.weight * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2 text-right font-mono">{s.weighted_score.toFixed(4)}</td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        s.tier === "core" ? "bg-red-50 text-red-600" :
                        s.tier === "aux" ? "bg-amber-50 text-amber-600" :
                        "bg-green-50 text-green-600"
                      }`}>{s.tier}</span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        s.signal === "BUY" ? "bg-rose-100 text-rose-600" :
                        s.signal === "SELL" ? "bg-emerald-100 text-emerald-600" :
                        s.signal === "SKIP" ? "bg-slate-100 text-slate-400" :
                        "bg-amber-100 text-amber-600"
                      }`}>{s.signal}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-400">無模組評分資料</p>
        )}
      </div>

      {/* 風險警告 */}
      {data.risk_warnings && data.risk_warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-2">⚠️ 風險警告</h3>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {data.risk_warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* 進出場價位 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500">建議進場價</p>
          <p className="text-xl font-bold text-slate-900">${data.entry_price?.toLocaleString() ?? "--"}</p>
        </div>
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
          <p className="text-xs text-rose-500">停損價</p>
          <p className="text-xl font-bold text-rose-600">${data.stop_loss_price?.toLocaleString() ?? "--"}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
          <p className="text-xs text-emerald-500">目標價</p>
          <p className="text-xl font-bold text-emerald-600">--</p>
        </div>
      </div>
    </div>
  );
}
