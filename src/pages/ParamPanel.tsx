import { useParams } from "react-router-dom";

export default function ParamPanel() {
  const { symbol } = useParams();
  return (
    <div className="bg-slate-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">🔧 參數面板 — {symbol}</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">⚙️ 已綁定參數</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3">策略</th>
                <th className="px-4 py-3">參數名稱</th>
                <th className="px-4 py-3">最優值</th>
                <th className="px-4 py-3">回測 Sharpe</th>
                <th className="px-4 py-3">回測勝率</th>
                <th className="px-4 py-3">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800 text-slate-500">
                <td className="px-4 py-3" colSpan={6}>尚無綁定參數 (需先執行 optimizer)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
        🔄 觸發重新搜尋參數
      </button>
    </div>
  );
}
