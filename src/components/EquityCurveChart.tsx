import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: '5/1', uv: 4000, pv: 2400, amt: 2400 },
  { name: '5/2', uv: 3000, pv: 1398, amt: 2210 },
  { name: '5/3', uv: 2000, pv: 9800, amt: 2290 },
  { name: '5/4', uv: 2780, pv: 3908, amt: 2000 },
  { name: '5/5', uv: 1890, pv: 4800, amt: 2181 },
  { name: '5/6', uv: 2390, pv: 3800, amt: 2500 },
  { name: '5/7', uv: 3490, pv: 4300, amt: 2100 },
];

export default function EquityCurveChart() {
  return (
    <div className="h-64 glass-card p-4 rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} />
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <Tooltip />
          <Area type="monotone" dataKey="uv" stroke="#F43F5E" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
