export default function TopNavBar() {
  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-slate-200/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <span className="text-2xl">🏛️</span>
            <span className="text-xl font-bold text-slate-100">RIVER 交易模擬器</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="font-mono text-lg text-slate-400">2026-05-14 18:55</div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-sm text-slate-400">系統正常</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
