import { useState, useEffect, useCallback } from "react";
import { fetchModules, fetchRecentLogs, ModulesResponse, LogsResponse } from "../lib/api";
import DebateMonitor from "./DebateMonitor";

/** 子頁籤定義 */
const TABS = [
  { key: "modules" as const, label: "📦 模組狀態" },
  { key: "logs" as const, label: "📜 工作日誌" },
  { key: "debate" as const, label: "🧠 AI 辯論輸出" },
];

export default function SystemStatusPage() {
  const [modules, setModules] = useState<ModulesResponse | null>(null);
  const [logs, setLogs] = useState<LogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"modules" | "logs" | "debate">("modules");

  const refresh = useCallback(async () => {
    if (activeTab === "debate") return;
    setLoading(true);
    try {
      const [mod, log] = await Promise.all([
        fetchModules(),
        fetchRecentLogs(80),
      ]);
      setModules(mod);
      setLogs(log);
    } catch (e: any) {
      console.error("系統狀態載入失敗:", e);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "debate") return;
    refresh();
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  if (activeTab !== "debate" && loading && !modules) {
    return <div className="max-w-7xl mx-auto py-12 px-4 text-center text-slate-400">⏳ 載入系統狀態...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">🏥 運算中心狀態</h1>
        {activeTab !== "debate" && (
          <button
            onClick={refresh}
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            🔄 重新整理
          </button>
        )}
      </div>

      {/* ── 子頁籤切換列 ── */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── 頁籤內容 ── */}
      {activeTab === "debate" ? (
        <DebateMonitor />
      ) : (
        <>
          {/* ── 模組狀態格 ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[["signals", "🎯 10 組量化訊號"], ["risk", "🛡️ 6 組風控"], ["ai_context", "🏛️ AI 辯論"], ["optimizer", "🔧 最佳化引擎"]].map(
              ([key, label]) => {
                const group = modules?.modules?.[key as keyof typeof modules.modules] as Record<string, string> | undefined;
                const loadedCount = group ? Object.values(group).filter((v) => v === "loaded").length : 0;
                const totalCount = group ? Object.keys(group).length : 0;
                const hasError = group && "error" in group;

                return (
                  <div key={key} className={`border rounded-xl p-4 ${hasError ? "border-red-300 bg-red-50" : "border-slate-200/80 bg-white"}`}>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">{label}</h3>
                    {hasError ? (
                      <p className="text-xs text-red-600">❌ {(group as any).error}</p>
                    ) : (
                      <>
                        <p className={`text-xl font-bold ${loadedCount === totalCount ? "text-emerald-600" : "text-amber-600"}`}>
                          {loadedCount}/{totalCount}
                        </p>
                        <p className="text-xs text-slate-400">模組已載入</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {group && Object.entries(group).map(([name, status]) => (
                            <span
                              key={name}
                              className={`text-[10px] px-1.5 py-0.5 rounded ${
                                status === "loaded" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* ── Scheduler 狀態 ── */}
          {modules?.modules?.scheduler && (
            <div className="bg-white border border-slate-200/80 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">⏰ 排程器</h3>
              <div className="flex gap-6 text-sm">
                <span>
                  運行中:{" "}
                  <span className={modules.modules.scheduler.running ? "text-emerald-600 font-bold" : "text-slate-400"}>
                    {modules.modules.scheduler.running ? "✅ 是" : "⏸️ 否"}
                  </span>
                </span>
                <span>
                  已掛載任務: <span className="font-mono font-bold">{modules.modules.scheduler.job_count ?? 0}</span>
                </span>
                <span className="text-slate-400 text-xs self-center">
                  檢查時間: {modules.checked_at ? new Date(modules.checked_at).toLocaleString("zh-TW") : "--"}
                </span>
              </div>
            </div>
          )}

          {/* ── 工作日誌 ── */}
          {activeTab === "logs" && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">📜 工作日誌 (即時)</h3>
              <div className="bg-black/50 rounded-lg p-3 max-h-96 overflow-y-auto font-mono text-xs leading-relaxed">
                {logs && logs.logs.length > 0 ? (
                  logs.logs.map((line, i) => {
                    const isError = line.includes("[ERROR]") || line.includes("🔥") || line.includes("❌");
                    const isWarn = line.includes("[WARNING]") || line.includes("⚠️");
                    const color = isError ? "text-red-400" : isWarn ? "text-amber-400" : "text-slate-300";
                    return (
                      <div key={i} className={`${color} py-0.5`}>
                        {line}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-slate-500">(尚無日誌 — 運算核心可能尚未啟動或尚未產出日誌)</p>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">共 {logs?.count ?? 0} 行，每 30 秒自動更新</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
