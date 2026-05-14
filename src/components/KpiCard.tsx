interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  isPositive?: boolean;
}

export default function KpiCard({ title, value, change, isPositive }: KpiCardProps) {
  const bgColor = change ? (isPositive ? 'bg-rose-50' : 'bg-emerald-50') : 'bg-slate-100';
  const textColor = change ? (isPositive ? 'text-rose-500' : 'text-emerald-500') : 'text-slate-900';

  return (
    <div className={`glass-card p-4 rounded-xl flex-1 ${bgColor}`}>
      <div className="text-sm text-slate-600">{title}</div>
      <div className="text-3xl font-mono font-bold text-slate-900 tracking-tight mt-1">{value}</div>
      {change && <div className={`text-sm font-medium ${textColor}`}>{change}</div>}
    </div>
  );
}
