import { useState } from "react";

export default function SettingsPage() {
  const [capital, setCapital] = useState("1,000,000");
  const [commission, setCommission] = useState("0.001425");
  const [tax, setTax] = useState("0.003");
  const [slippage, setSlippage] = useState("0.1");
  const [isRealMode, setIsRealMode] = useState(false);

  return (
    <div className="bg-slate-950 min-h-screen p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">⚙️ 模擬設定</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm text-slate-400 mb-1">初始資金 (TWD)</label>
          <input type="text" value={capital} onChange={(e) => setCapital(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1">手續費率 (%)</label>
            <input type="text" value={commission} onChange={(e) => setCommission(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">交易稅率 (%)</label>
            <input type="text" value={tax} onChange={(e) => setTax(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">滑價 (%)</label>
          <input type="text" value={slippage} onChange={(e) => setSlippage(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" />
        </div>

        <div className="border-t border-slate-800 pt-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className={`w-12 h-6 rounded-full transition-colors ${isRealMode ? 'bg-red-600' : 'bg-slate-700'}`}
              onClick={() => setIsRealMode(!isRealMode)}>
              <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${isRealMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{isRealMode ? '🔴 真實下單模式' : '🟢 模擬下單模式'}</p>
              <p className="text-xs text-slate-400">{isRealMode ? '訊號將由獨立下單電腦執行真實交易' : '訊號僅記錄於模擬帳戶'}</p>
            </div>
          </label>
        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full mt-2">
          💾 儲存設定
        </button>
      </div>
    </div>
  );
}
