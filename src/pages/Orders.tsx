export default function OrdersPage() {
  return (
    <div className="bg-slate-950 min-h-screen p-6">
      <h1 className="text-2xl font-bold text-white mb-6">📋 委託記錄</h1>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-300">
            <thead className="text-xs uppercase bg-slate-800 text-slate-400">
              <tr>
                <th className="px-4 py-3">時間</th>
                <th className="px-4 py-3">標的</th>
                <th className="px-4 py-3">方向</th>
                <th className="px-4 py-3">委託價</th>
                <th className="px-4 py-3">成交價</th>
                <th className="px-4 py-3">狀態</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-800 text-slate-500">
                <td className="px-4 py-3" colSpan={6}>尚無委託記錄</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
