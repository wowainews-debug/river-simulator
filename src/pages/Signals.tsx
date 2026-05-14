export default function SignalsPage() {
  return (
    <div className="bg-slate-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">📡 訊號監控</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <p className="text-slate-400">今日 AI 辯論委員會產出的所有訊號將顯示於此。</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3">標的</th>
                <th className="px-4 py-3">方向</th>
                <th className="px-4 py-3">綜合分數</th>
                <th className="px-4 py-3">信心度</th>
                <th className="px-4 py-3">建議進場</th>
                <th className="px-4 py-3">停損</th>
                <th className="px-4 py-3">產生時間</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800">
                <td className="px-4 py-3 font-medium text-white">TX (台指期)</td>
                <td className="px-4 py-3"><span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs">SELL</span></td>
                <td className="px-4 py-3">-82.5</td>
                <td className="px-4 py-3">85%</td>
                <td className="px-4 py-3 text-amber-400">19,850</td>
                <td className="px-4 py-3 text-rose-400">19,900</td>
                <td className="px-4 py-3 text-slate-500">05:32 AM</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="px-4 py-3 font-medium text-white">2330 台積電</td>
                <td className="px-4 py-3"><span className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded text-xs">BUY</span></td>
                <td className="px-4 py-3">78.1</td>
                <td className="px-4 py-3">80%</td>
                <td className="px-4 py-3 text-amber-400">980</td>
                <td className="px-4 py-3 text-rose-400">970</td>
                <td className="px-4 py-3 text-slate-500">05:30 AM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
