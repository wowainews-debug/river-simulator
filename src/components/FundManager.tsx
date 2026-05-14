import { useState } from "react";
import FundCard from "./FundCard";

export default function FundManager() {
  const [capital, setCapital] = useState("1000000");

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <FundCard label="啟動資金" value={`$${Number(capital).toLocaleString()}`} editable />
        <FundCard label="權益資金" value={`$350,000`} sub="(自動計算)" />
        <FundCard label="風險預留" value={`$20,700`} sub="期貨/選擇權" color="bg-amber-900/20" />
        <FundCard label="可動餘額" value={`$629,300`} sub="可下單" />
        <FundCard label="當日損益" value={`+$12,500`} sub="▲ +1.25%" isPositive={true} />
      </div>
      {/* 參數設定列 */}
      <div className="flex flex-wrap items-center gap-3 text-sm mt-4">
        <span className="text-slate-500 font-medium">⚙️ 參數設定</span>
        <div className="flex items-center gap-1 bg-white/60 rounded-lg px-3 py-1.5 border border-white/80">
          <span className="text-slate-500">手續費</span>
          <input className="w-16 text-right bg-transparent font-mono text-slate-900 outline-none" value="0.1425" />
          <span className="text-slate-400">%</span>
        </div>
        <div className="flex items-center gap-1 bg-white/60 rounded-lg px-3 py-1.5 border border-white/80">
          <span className="text-slate-500">交易稅</span>
          <input className="w-14 text-right bg-transparent font-mono text-slate-900 outline-none" value="0.3" />
          <span className="text-slate-400">%</span>
        </div>
        <div className="flex items-center gap-1 bg-white/60 rounded-lg px-3 py-1.5 border border-white/80">
          <span className="text-slate-500">滑價</span>
          <input className="w-14 text-right bg-transparent font-mono text-slate-900 outline-none" value="0.1" />
          <span className="text-slate-400">%</span>
        </div>
        <div className="flex items-center gap-1 bg-white/60 rounded-lg px-3 py-1.5 border border-white/80">
          <span className="text-slate-500">單筆風險</span>
          <input className="w-14 text-right bg-transparent font-mono text-slate-900 outline-none" value="2.0" />
          <span className="text-slate-400">%</span>
        </div>
        <button className="bg-blue-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-blue-700 cursor-pointer">
          🔒 儲存設定
        </button>
      </div>
    </div>
  );
}
