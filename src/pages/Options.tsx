export default function OptionsPage() {
  return (
    <div className="bg-slate-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">📊 選擇權監控</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">Delta 曝險</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">Gamma</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">Theta (日衰減)</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-slate-400 text-xs">Vega</p>
          <p className="text-2xl font-bold text-white">--</p>
        </div>
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-200 mb-3">📋 選擇權持倉</h2>
        <p className="text-slate-500">尚無選擇權持倉</p>
      </div>
    </div>
  );
}
