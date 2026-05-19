import { NavLink, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/", label: "📊 儀表板" },
  { to: "/signals", label: "🎯 訊號總覽" },
  { to: "/orders", label: "📋 委託紀錄" },
  { to: "/positions/futures", label: "📉 期貨" },
  { to: "/positions/options", label: "📊 選擇權" },
  { to: "/compute/stocks", label: "🧠 個股參數" },
  { to: "/settings", label: "⚙️ 設定" },
  { to: "/status", label: "🏥 系統狀態" },
];

export default function TopNavBar() {
  const location = useLocation();

  return (
    <nav className="bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/80 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* 左側：Logo + 導航連結 */}
          <div className="flex items-center gap-6">
            <NavLink to="/" className="flex items-center gap-2 shrink-0">
              <span className="text-xl">🏛️</span>
              <span className="text-base font-bold text-white tracking-tight">RIVER 交易模擬器</span>
            </NavLink>

            <div className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.to
                  || (item.to !== "/" && location.pathname.startsWith(item.to));
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* 右側：狀態燈號 + 時間 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs text-slate-400">系統正常</span>
            </div>
            <div className="text-xs font-mono text-slate-500">
              {new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
