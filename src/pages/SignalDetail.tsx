import { useParams } from "react-router-dom";

export default function SignalDetail() {
  const { symbol } = useParams();
  return (
    <div className="bg-slate-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">🔍 訊號明細 — {symbol}</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-amber-400 mb-3">🏛️ 最終仲裁官裁定</h2>
        <p className="text-slate-400">AI 辯論委員會 (W2-RDC) 的完整決策過程將顯示於此。</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-blue-400 mb-3">🤖 AI 辯論時間軸</h2>
        <div className="space-y-4 text-slate-400">
          <div className="border-l-2 border-amber-500 pl-4">
            <p className="text-amber-300 text-sm font-medium">Round 1 — 獨立分析</p>
            <p className="text-xs mt-1">6 位代理人平行分析中...</p>
          </div>
          <div className="border-l-2 border-purple-500 pl-4">
            <p className="text-purple-300 text-sm font-medium">Round 2 — 反思辯論</p>
            <p className="text-xs mt-1">代理人收到 Round 1 全部答案後重新判斷...</p>
          </div>
          <div className="border-l-2 border-green-500 pl-4">
            <p className="text-green-300 text-sm font-medium">最終仲裁</p>
            <p className="text-xs mt-1">Gemini 仲裁官確認全部辯論內容...</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-cyan-400 mb-3">📐 量化訊號細節</h2>
        <p className="text-slate-400">14 組策略模組的個別評分與雷達圖。</p>
      </div>
    </div>
  );
}
