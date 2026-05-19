import { useState, useEffect, useCallback } from "react";
import { fetchFuturesQuote, fetchSimConfig, FuturesQuote, SimConfig } from "../lib/api";
import FuturesChart from "../components/FuturesChart";

export default function FuturesPage() {
  const [quote, setQuote] = useState<FuturesQuote | null>(null);
  const [simConfig, setSimConfig] = useState<SimConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQuote = useCallback(async () => {
    try {
      setError("");
      const [data, cfg] = await Promise.all([
        fetchFuturesQuote(),
        fetchSimConfig().then(r => r.config).catch(() => null),
      ]);
      setQuote(data);
      setSimConfig(cfg);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuote();
    const t = setInterval(loadQuote, 60_000); // 每 60 秒自動更新
    return () => clearInterval(t);
  }, [loadQuote]);

  if (loading) {
    return <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-400">⏳ 載入台指期即時行情...</div>;
  }

  const lastPrice = quote?.last_price ?? null;
  // 🆕 v1.2：futures_contract 取代舊 futures_enabled，保證金屬手動輸入不再依賴 buffer%
  const futuresContract = simConfig?.futures_contract || "off";
  const futuresEnabled = futuresContract !== "off";
  const futuresLabel = futuresContract === "TX" ? "大台 (TX)" : futuresContract === "MXF" ? "小台 (MXF)" : futuresContract === "TMF" ? "微台 (TMF)" : "關閉";
  const maxContracts = simConfig?.futures_max_contracts ?? quote?.max_contracts ?? 2;
  const marginReserved = simConfig?.futures_margin_reserved ?? quote?.margin_reserved ?? 0;
  const chartData = quote?.klines?.length
    ? { klines: quote.klines, indicators: { hma: [], ema: [] }, signals: [] }
    : undefined;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">📉 台指期監控</h1>
        <button
          onClick={() => { setLoading(true); loadQuote(); }}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer"
        >
          🔄 更新行情
        </button>
      </div>

      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-3 text-sm mb-4">
          ⚠️ {error}（將使用快取資料）
        </div>
      )}

      {/* KPI 卡 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <p className="text-slate-500 text-xs">現價</p>
          <p className="text-2xl font-bold text-slate-900">
            {lastPrice != null ? lastPrice.toLocaleString() : "--"}
          </p>
          <p className="text-xs text-slate-400">台指期近月 (TX)</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-slate-500 text-xs">保證金保留額</p>
          <p className="text-2xl font-bold text-slate-900">
            NT${marginReserved.toLocaleString()}
          </p>
          <p className="text-xs text-amber-600">第三道防線 · {futuresLabel}</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <p className="text-slate-500 text-xs">最大口數上限</p>
          <p className="text-2xl font-bold text-slate-900">{maxContracts}</p>
          <p className="text-xs text-slate-400">
            第二道防線
            <a href="/settings" className="ml-1 text-blue-500 underline">⚙️ 調整</a>
          </p>
        </div>
        <div className={`border rounded-xl p-4 ${futuresEnabled ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
          <p className="text-slate-500 text-xs">期貨總開關</p>
          <p className={`text-2xl font-bold ${futuresEnabled ? "text-emerald-600" : "text-slate-400"}`}>
            {futuresEnabled ? "✅ 啟用" : "⏸️ 關閉"}
          </p>
          <p className="text-xs text-slate-400">第一道防線</p>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-4">
          <p className="text-slate-500 text-xs">連線狀態</p>
          <p className={`text-2xl font-bold ${quote?.status === "ok" ? "text-emerald-600" : "text-amber-600"}`}>
            {quote?.status === "ok" ? "🟢 正常" : "🟡 降級"}
          </p>
          <p className="text-xs text-slate-400">{quote?.message ?? "富邦 SDK"}</p>
        </div>
      </div>

      {/* 技術線圖 */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4">
        <FuturesChart data={chartData} />
      </div>
    </div>
  );
}
