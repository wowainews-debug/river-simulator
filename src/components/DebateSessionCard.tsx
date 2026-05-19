/**
 * 🏛️ 辯論場次手風琴卡片
 * =======================
 * 顯示單場辯論的摘要 + 展開後顯示全部代理人輸出。
 * 包含：標的資訊、裁定結果、共識進度條、Round 1/2 代理人網格、仲裁官區塊。
 */
import { useState, useMemo } from "react";
import type { DebateSession } from "../lib/api";
import AgentCard from "./AgentCard";

interface Props {
  session: DebateSession;
  defaultExpanded?: boolean;
}

/** 裁定顏色 */
function getVerdictColors(verdict: string) {
  return verdict === "PROCEED"
    ? { bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-700", icon: "✅" }
    : { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-500", icon: "❌" };
}

/** 資產類型 icon */
function getAssetIcon(assetType: string) {
  switch (assetType) {
    case "futures": return "📈";
    case "options": return "📉";
    default: return "📊";
  }
}

/** 交易模式中文 */
function getTradeModeLabel(mode: string, assetType: string) {
  if (assetType === "futures") {
    switch (mode) {
      case "TX": return "大台";
      case "MXF": return "小台";
      case "TMF": return "微台";
      default: return mode || "期貨";
    }
  }
  switch (mode) {
    case "full_lot": return "整張";
    case "odd_lot": return "零股";
    default: return mode || "個股";
  }
}

export default function DebateSessionCard({ session, defaultExpanded = false }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [expandedAgents, setExpandedAgents] = useState<Set<number>>(new Set());

  const toggleAgent = (msgId: number) => {
    setExpandedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const verdictColors = getVerdictColors(session.overall_verdict);
  const assetIcon = getAssetIcon(session.asset_type);
  const tradeLabel = getTradeModeLabel(session.trade_mode, session.asset_type);

  // 分組訊息
  const { round1, round2, arbiter } = useMemo(() => {
    const r1 = session.messages.filter((m) => m.round === 1);
    const r2 = session.messages.filter((m) => m.round === 2);
    const arb = session.messages.find((m) => m.round === 3);
    return { round1: r1, round2: r2, arbiter: arb };
  }, [session.messages]);

  // 統計 R2 中改變立場的代理人數
  const changedCount = round2.filter((m) => m.opinion_changed).length;

  return (
    <div className={`border rounded-xl overflow-hidden ${verdictColors.border}`}>
      {/* ── 標頭（永遠顯示，點擊展開/折疊） ── */}
      <button
        type="button"
        className={`w-full text-left px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${
          expanded ? verdictColors.bg : "bg-white hover:bg-slate-50"
        }`}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* 左側：標的資訊 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{assetIcon}</span>
            <span className="text-sm font-bold text-slate-900 truncate">
              {session.symbol} {session.name}
            </span>
            <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
              {tradeLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-semibold ${verdictColors.text}`}>
              {verdictColors.icon} {session.overall_verdict}
            </span>
            <span className="text-xs text-slate-500">
              → {session.consensus}
            </span>
            {/* 共識進度條 */}
            <div className="flex items-center gap-1">
              <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    session.consensus_score >= 80
                      ? "bg-emerald-500"
                      : session.consensus_score >= 50
                      ? "bg-amber-500"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.min(session.consensus_score, 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                {session.consensus_score.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 右側：時間 + 展開箭頭 */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400">
            {session.executed_at
              ? new Date(session.executed_at).toLocaleString("zh-TW", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "--"}
          </span>
          <span
            className={`text-xs text-slate-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </div>
      </button>

      {/* ── 展開內容 ── */}
      {expanded && (
        <div className="bg-white border-t border-slate-100 px-4 py-4 space-y-4">
          {/* 📢 Round 1 */}
          {round1.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  📢 Round 1：獨立分析
                </span>
                <span className="text-[10px] text-slate-400">
                  {round1.length} 位代理人
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {round1.map((msg) => (
                  <AgentCard
                    key={msg.id}
                    message={msg}
                    isExpanded={expandedAgents.has(msg.id)}
                    onToggle={() => toggleAgent(msg.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 📢 Round 2 */}
          {round2.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  📢 Round 2：反思辯論
                </span>
                <span className="text-[10px] text-slate-400">
                  {round2.length} 位代理人
                </span>
                {changedCount > 0 && (
                  <span className="text-[10px] text-amber-600 font-medium">
                    ↻ {changedCount} 位改變立場
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {round2.map((msg) => (
                  <AgentCard
                    key={msg.id}
                    message={msg}
                    isExpanded={expandedAgents.has(msg.id)}
                    onToggle={() => toggleAgent(msg.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 🏛️ 仲裁官 */}
          {arbiter && (
            <div>
              <div className="text-xs font-semibold text-slate-700 mb-2">
                🏛️ 仲裁官 Z：最終裁定
              </div>
              <AgentCard
                message={arbiter}
                isExpanded={expandedAgents.has(arbiter.id)}
                onToggle={() => toggleAgent(arbiter.id)}
              />
            </div>
          )}

          {/* 無訊息時 */}
          {session.messages.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-4">
              （尚無代理人輸出，可能辯論未完成或存檔失敗）
            </p>
          )}
        </div>
      )}
    </div>
  );
}
