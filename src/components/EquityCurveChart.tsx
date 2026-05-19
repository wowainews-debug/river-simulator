import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PnlPoint {
  date?: string;
  ending_equity: number;
  daily_pnl?: number;
}

interface Props {
  data?: PnlPoint[];
}

// 預設示範資料（當 API 無回傳時使用）
const DEFAULT_DATA = [
  { date: '5/1', 權益: 1_000_000 },
  { date: '5/7', 權益: 1_012_500 },
];

function normalizeData(pnlHistory: PnlPoint[] | undefined) {
  if (!pnlHistory || pnlHistory.length === 0) return DEFAULT_DATA;
  return pnlHistory.map((p) => ({
    date: p.date ? p.date.slice(5) : '',  // MM-DD
    權益: Math.round(p.ending_equity),
  }));
}

export default function EquityCurveChart({ data }: Props) {
  const chartData = normalizeData(data);

  return (
    <div className="w-full" style={{ height: 280 }}>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">📈 權益曲線</h3>
      <div className="w-full rounded-xl border border-slate-200/80 bg-white p-4" style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <Tooltip
              formatter={(value: any) => {
                const n = Number(value);
                return [`$${n.toLocaleString()}`, '權益'];
              }}
              contentStyle={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Area
              type="monotone"
              dataKey="權益"
              stroke="#3B82F6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEquity)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
