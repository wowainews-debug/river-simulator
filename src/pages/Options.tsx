export default function OptionsPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">📊 選擇權監控</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Delta 曝險</p>
          <p className="text-2xl font-bold text-slate-900">--</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Gamma</p>
          <p className="text-2xl font-bold text-slate-900">--</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Theta (日衰減)</p>
          <p className="text-2xl font-bold text-slate-900">--</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <p className="text-slate-500 text-xs">Vega</p>
          <p className="text-2xl font-bold text-slate-900">--</p>
        </div>
      </div>
      <div className="bg-white border border-slate-200/80 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">📋 選擇權持倉</h2>
        <p className="text-slate-400">尚無選擇權持倉</p>
      </div>
    </div>
  );
}
