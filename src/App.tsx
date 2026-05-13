import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ChartCandlestick, ListOrdered, Settings, Activity } from 'lucide-react';

// 🏗️ 分頁占位（階段五實作完整內容）
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/20 flex items-center justify-center">
          <Activity className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-200">{title}</h2>
        <p className="text-slate-400">此頁面將於階段五實作</p>
      </div>
    </div>
  );
}

// ── 導覽列 ──────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/', label: '持倉總覽', icon: LayoutDashboard },
  { to: '/signals', label: '訊號監控', icon: Activity },
  { to: '/orders', label: '委託記錄', icon: ListOrdered },
  { to: '/futures', label: '期貨監控', icon: ChartCandlestick },
  { to: '/settings', label: '設定', icon: Settings },
];

function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-1">
        <Link to="/" className="flex items-center gap-2 mr-6">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            RIVER 模擬器
          </span>
        </Link>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

// ── 主應用程式 ──────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<PlaceholderPage title="📊 模擬持倉總覽" />} />
          <Route path="/signals" element={<PlaceholderPage title="📡 訊號監控" />} />
          <Route path="/orders" element={<PlaceholderPage title="📋 委託記錄" />} />
          <Route path="/futures" element={<PlaceholderPage title="📈 期貨監控" />} />
          <Route path="/settings" element={<PlaceholderPage title="⚙️ 模擬設定" />} />
        </Routes>
      </main>
    </div>
  );
}
