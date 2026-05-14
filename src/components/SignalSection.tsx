import SignalTable from "./SignalTable";
import AiDebatePanel from "./AiDebatePanel";

interface SignalSectionProps {
  assetType: string;
  label: string;
  count: number;
  color: string;
}

export default function SignalSection({ assetType, label, count, color }: SignalSectionProps) {
  const bgColor = {
    blue: "bg-blue-600",
    amber: "bg-amber-500",
    purple: "bg-purple-600",
  }[color] || "bg-slate-600";

  const borderColor = {
    blue: "border-blue-400",
    amber: "border-amber-400",
    purple: "border-purple-400",
  }[color] || "border-slate-400";

  return (
    <div className="px-4 mt-6">
      <div className={`flex items-center justify-between p-3 rounded-t-lg ${bgColor}`}>
        <h2 className={`text-xl font-semibold text-white border-l-4 ${borderColor} pl-3`}>
          {label}
          {count > 0 && (
            <span className="ml-3 bg-white/10 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              {count} 檔
            </span>
          )}
        </h2>
      </div>

      <div className="bg-slate-900 p-4 rounded-b-lg grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SignalTable assetType={assetType} />
        </div>
        <div className="space-y-4">
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-3 grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xs text-slate-400">勝率</div>
              <div className="text-lg font-bold text-slate-100">68.5%</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">累積盈虧</div>
              <div className="text-lg font-bold text-rose-400">+$24,800</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Sharpe</div>
              <div className="text-lg font-bold text-slate-100">1.52</div>
            </div>
          </div>
          <AiDebatePanel assetType={assetType} />
        </div>
      </div>
    </div>
  );
}
