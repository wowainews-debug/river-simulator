export default function FuturesPage() {
  return (
    <div className="bg-slate-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">📉 台指期監控</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">現價</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">保證金水位</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">持倉口數</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">未實現損益</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-96 flex items-center justify-center">
        <p className="text-slate-500">📊 3 分 K 線圖區 (即時更新)</p>
      </div>
    </div>
  );
}
