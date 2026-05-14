export default function SniperTargetList() {
  const targets = [
    { symbol: '2330', name: '台積電', rating: 5, signal: 'BUY', entry: 980, target: 1050, stop: 950, isPositive: true },
    { symbol: '2454', name: '聯發科', rating: 4, signal: 'HOLD', isPositive: null },
    { symbol: '2317', name: '鴻海', rating: 3, signal: 'SELL', entry: 150, target: 135, stop: 155, isPositive: false },
  ];

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">🎯 今日狙擊目標 ({targets.length} 檔)</h2>
      <div className="space-y-3">
        {targets.map(t => (
          <div key={t.symbol} className="glass-card p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-slate-900">{`⭐`.repeat(t.rating)} {t.symbol} {t.name}</span>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.isPositive === true ? 'bg-rose-100 text-rose-600' : t.isPositive === false ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                {t.signal}
              </span>
            </div>
            {t.signal !== 'HOLD' && <div className="text-sm text-slate-600 mt-1">{t.signal === 'BUY' ? '🔴' : '🟢'} ${t.entry} → ${t.target} (停損 ${t.stop})</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
