/**
 * 🧠 AI 辯論即時輸出監控頁面
 * ==========================
 * 顯示運算中心產出的所有 AI 辯論記錄。
 * 支援 5 秒輪詢、篩選（標的/模式/裁定）、手風琴展開。
 */
import { useState, useEffect, useCallback } from "react";
import type { DebateSession } from "../lib/api";
import { fetchDebateLogs } from "../lib/api";
import DebateSessionCard from "../components/DebateSessionCard";

/** 篩選器狀態 */
interface Filters {
  symbol: string;
  assetType: string;
  verdict: string;
}

export default function DebateMonitor() {
  const [debates, setDebates] = useState<DebateSession[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<Filters>({
    symbol: "",
    assetType: "",
    verdict: "",
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetchDebateLogs(
        filters.symbol || undefined,
        filters.assetType || undefined,
        filters.verdict || undefined,
        50,
        0
      );
      setDebates(res.debates || []);
      setTotalCount(res.total_count || 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "載入辯論日誌失敗");
      console.error("辯論日誌載入失敗:", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 初始載入 + 每 5 秒輪詢
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-5">
      {/* ── 標題列 ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            🧠 AI 辯論即時輸出
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            每 5 秒自動更新 · 共 {totalCount} 場辯論
          </p>
        </div>
        <button
          onClick={load}
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition"
        >
          🔄 立即刷新
        </button>
      </div>

      {/* ── 錯誤提示 ── */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* ── 篩選器 ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200/80 rounded-xl px-4 py-3">
        <span className="text-xs font-medium text-slate-500 shrink-0">篩選：</span>

        {/* 標的代碼 */}
        <input
          type="text"
          placeholder="標的代碼 (如 2330)"
          value={filters.symbol}
          onChange={(e) => setFilters((f) => ({ ...f, symbol: e.target.value }))}
          className="w-36 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* 資產類型 */}
        <select
          value={filters.assetType}
          onChange={(e) => setFilters((f) => ({ ...f, assetType: e.target.value }))}
          className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">全部類型</option>
          <option value="stock">📊 個股</option>
          <option value="futures">📈 期貨</option>
          <option value="options">📉 選擇權</option>
        </select>

        {/* 裁定結果 */}
        <select
          value={filters.verdict}
          onChange={(e) => setFilters((f) => ({ ...f, verdict: e.target.value }))}
          className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="">全部裁定</option>
          <option value="PROCEED">✅ PROCEED</option>
          <option value="ABSTAIN">❌ ABSTAIN</option>
        </select>

        {/* 清除篩選 */}
        {(filters.symbol || filters.assetType || filters.verdict) && (
          <button
            onClick={() => setFilters({ symbol: "", assetType: "", verdict: "" })}
            className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            清除篩選
          </button>
        )}
      </div>

      {/* ── 辯論場次清單 ── */}
      {loading && debates.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          ⏳ 載入辯論記錄中...
        </div>
      ) : debates.length === 0 ? (
        <div className="bg-white border border-slate-200/80 rounded-xl p-12 text-center">
          <div className="text-4xl mb-3">🏛️</div>
          <p className="text-slate-500 text-sm">尚無 AI 辯論記錄</p>
          <p className="text-slate-400 text-xs mt-1">
            等待運算中心執行每日分析後，辯論結果將自動顯示於此
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {debates.map((session, idx) => (
            <DebateSessionCard
              key={session.id}
              session={session}
              defaultExpanded={idx === 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}
