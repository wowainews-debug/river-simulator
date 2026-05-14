interface SignalTableProps {
  assetType: string;
}

const MOCK_SIGNALS: Record<string, any[]> = {
  stock: [
    { symbol: "2330", name: "台積電", signal: "BUY", entry: 980, stop: 950, target: 1050, qty: 2, confidence: 0.85 },
    { symbol: "2454", name: "聯發科", signal: "HOLD", entry: 0, stop: 0, target: 0, qty: 0, confidence: 0 },
    { symbol: "2317", name: "鴻海", signal: "SELL", entry: 150, stop: 155, target: 135, qty: 5, confidence: 0.72 },
    { symbol: "3008", name: "大立光", signal: "BUY", entry: 2550, stop: 2480, target: 2700, qty: 0, confidence: 0.91 },
    { symbol: "6505", name: "台塑化", signal: "HOLD", entry: 0, stop: 0, target: 0, qty: 0, confidence: 0 },
  ],
  futures: [
    { symbol: "TMF", name: "微台指", signal: "BUY", entry: 22150, stop: 22000, target: 22400, qty: 1, confidence: 0.78 },
  ],
  options: [],
};

export default function SignalTable({ assetType }: SignalTableProps) {
  const signals = MOCK_SIGNALS[assetType] || [];

  if (signals.length === 0) {
    return (
      <div className="glass-card p-8 rounded-xl text-center text-slate-400">
        尚無 {assetType === "stock" ? "個股" : assetType === "futures" ? "期貨" : "選擇權"} 訊號
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/50">
            <th className="text-left px-4 py-2.5 font-medium text-slate-600">標的</th>
            <th className="text-center px-4 py-2.5 font-medium text-slate-600">方向</th>
            <th className="text-right px-4 py-2.5 font-medium text-slate-600">進場價</th>
            <th className="text-right px-4 py-2.5 font-medium text-slate-600">停損</th>
            <th className="text-right px-4 py-2.5 font-medium text-slate-600">目標</th>
            <th className="text-center px-4 py-2.5 font-medium text-slate-600">口數</th>
            <th className="text-center px-4 py-2.5 font-medium text-slate-600">信心</th>
            <th className="text-center px-4 py-2.5 font-medium text-slate-600">操作</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((s, i) => (
            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50/50">
              <td className="px-4 py-2.5">
                <span className="font-medium text-slate-900">{s.symbol}</span>
                <span className="text-slate-500 ml-1.5">{s.name}</span>
              </td>
              <td className="px-4 py-2.5 text-center">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  s.signal === "BUY" ? "bg-rose-100 text-rose-600" :
                  s.signal === "SELL" ? "bg-emerald-100 text-emerald-600" :
                  "bg-amber-100 text-amber-600"
                }`}>
                  {s.signal === "BUY" ? "🔴 買進" : s.signal === "SELL" ? "🟢 賣出" : "🟡 觀望"}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-slate-900">
                {s.entry > 0 ? `$${s.entry.toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                {s.stop > 0 ? `$${s.stop.toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                {s.target > 0 ? `$${s.target.toLocaleString()}` : "—"}
              </td>
              <td className="px-4 py-2.5 text-center font-mono text-slate-900">
                {s.qty > 0 ? `${s.qty} 張` : "—"}
              </td>
              <td className="px-4 py-2.5 text-center">
                {s.confidence > 0 ? (
                  <div className="inline-flex items-center gap-1">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${s.confidence * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{Math.round(s.confidence * 100)}%</span>
                  </div>
                ) : "—"}
              </td>
              <td className="px-4 py-2.5 text-center">
                {s.signal !== "HOLD" ? (
                  <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 font-medium cursor-pointer">
                    執行
                  </button>
                ) : (
                  <button className="text-xs bg-slate-100 text-slate-400 px-3 py-1 rounded-lg cursor-default">
                    略過
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
