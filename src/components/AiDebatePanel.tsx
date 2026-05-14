import { useState } from "react";

interface AiDebatePanelProps {
  assetType?: string;
}

export default function AiDebatePanel({ assetType }: AiDebatePanelProps) {
  const [open, setOpen] = useState(false);

  const typeLabel = assetType === "futures" ? "期貨" : assetType === "options" ? "選擇權" : "個股";

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full glass-card rounded-xl p-3 text-left hover:bg-white/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-900">
            🧠 AI 辯論委員會 — {typeLabel}
          </span>
          <span className="text-slate-400 text-xs">展開 ▾</span>
        </div>
        <div className="text-xs text-slate-500 mt-0.5">今日尚無辯論結果</div>
      </button>
    );
  }

  return (
    <div className="glass-card rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-slate-900">🧠 AI 辯論委員會 — {typeLabel}</span>
        <button onClick={() => setOpen(false)} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">折疊 ▴</button>
      </div>
      <div className="space-y-2">
        <div className="bg-blue-50 rounded-lg p-2.5">
          <span className="text-xs font-medium text-blue-700">🏛️ 仲裁官裁定：BUY (85%)</span>
          <span className="text-xs text-blue-500 ml-1.5">多方共振，籌碼集中</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { agent: "Gemini\n價值", vote: "BUY", conf: 0.9, color: "blue" },
            { agent: "Gemini\n動能", vote: "BUY", conf: 0.8, color: "blue" },
            { agent: "Gemini\n事件", vote: "HOLD", conf: 0.6, color: "blue" },
            { agent: "DS\n地緣", vote: "BUY", conf: 0.7, color: "purple" },
            { agent: "DS\n籌碼", vote: "BUY", conf: 0.9, color: "purple" },
            { agent: "DS\n定價", vote: "HOLD", conf: 0.5, color: "purple" },
          ].map(a => (
            <div key={a.agent} className={`rounded-lg p-1.5 border text-center ${a.color === "blue" ? "border-blue-200 bg-blue-50/50" : "border-purple-200 bg-purple-50/50"}`}>
              <div className="text-[10px] leading-tight text-slate-500 whitespace-pre-line">{a.agent}</div>
              <div className={`text-xs font-bold mt-0.5 ${
                a.vote === "BUY" ? "text-rose-500" : a.vote === "SELL" ? "text-emerald-500" : "text-amber-500"
              }`}>{a.vote}</div>
              <div className="text-[10px] text-slate-400">{Math.round(a.conf * 100)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
