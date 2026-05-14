import { useState } from "react";
import SignalTable from "./SignalTable";

const TABS = [
  { key: "stock", label: "📈 個股", count: 5 },
  { key: "futures", label: "📉 期貨 (微台指)", count: 1 },
  { key: "options", label: "📊 選擇權", count: 0 },
] as const;

export default function AssetTabs() {
  const [active, setActive] = useState<string>("stock");

  return (
    <div className="px-4">
      {/* Tab 切換 */}
      <div className="flex border-b border-slate-200 mb-3">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              active === t.key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="ml-1.5 bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 各 Tab 獨立績效 */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="glass-card p-3 rounded-lg text-center">
          <div className="text-xs text-slate-500">勝率</div>
          <div className="text-lg font-bold text-slate-900">68.5%</div>
        </div>
        <div className="glass-card p-3 rounded-lg text-center">
          <div className="text-xs text-slate-500">累積盈虧</div>
          <div className="text-lg font-bold text-rose-500">+$24,800</div>
        </div>
        <div className="glass-card p-3 rounded-lg text-center">
          <div className="text-xs text-slate-500">Sharpe</div>
          <div className="text-lg font-bold text-slate-900">1.52</div>
        </div>
      </div>

      {/* 訊號表格 */}
      <SignalTable assetType={active} />
    </div>
  );
}
