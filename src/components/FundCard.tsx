interface FundCardProps {
  label: string;
  value: string;
  sub?: string;
  editable?: boolean;
  onEdit?: () => void;
  isPositive?: boolean;
  color?: string;
}

export default function FundCard({ label, value, sub, editable, onEdit, isPositive, color }: FundCardProps) {
  const pnlColor = isPositive === true ? "text-rose-500" : isPositive === false ? "text-emerald-500" : "text-slate-900";

  return (
    <div className={`border border-slate-200/80 rounded-xl p-4 ${color || "bg-white"}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {editable && (
          <button onClick={onEdit} className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer">
            ✏️ 調整
          </button>
        )}
      </div>
      <div className={`text-2xl font-mono font-bold tracking-tight ${pnlColor}`}>{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${isPositive === true ? "text-rose-500" : isPositive === false ? "text-emerald-500" : "text-slate-500"}`}>{sub}</div>}
    </div>
  );
}
