import { useParams } from "react-router-dom";

export default function StockPosition() {
  const { symbol } = useParams();
  return (
    <div className="bg-slate-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">📈 {symbol} 個股持倉</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">現價</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">平均成本</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">未實現損益</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-500">📊 K 線圖區 (HMA/EMA/BB 疊加)</p>
      </div>
    </div>
  );
}
