/**
 * 🃏 代理人輸出卡片
 * ==================
 * 顯示單一 AI 代理人（A~F 或 Z）在辯論中的完整輸出。
 * 支援 R1（獨立分析）、R2（反思辯論）、仲裁官三種模式。
 * Gemini 代理⼈以藍色調顯示，DeepSeek 以紫色調顯示。
 */
import type { DebateMessage } from "../lib/api";

interface Props {
  message: DebateMessage;
  isExpanded: boolean;
  onToggle: () => void;
}

/** 代理人代號 → 角色名稱對照表 */
const ROLE_NAME_MAP: Record<string, string> = {
  A: "地緣政治分析師",
  B: "動能分析師",
  C: "事件驅動分析師",
  D: "地緣政治專家",
  E: "籌碼分析師",
  F: "華爾街定價模型",
  Z: "首席仲裁長",
};

/** 取得代理人模型色系 */
function getModelColors(modelType: string, isArbiter: boolean) {
  if (isArbiter) {
    return {
      border: "border-amber-300",
      bg: "bg-amber-50",
      badge: "bg-amber-100 text-amber-700",
      accent: "text-amber-600",
    };
  }
  if (modelType === "gemini") {
    return {
      border: "border-blue-300",
      bg: "bg-blue-50",
      badge: "bg-blue-100 text-blue-700",
      accent: "text-blue-600",
    };
  }
  return {
    border: "border-purple-300",
    bg: "bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    accent: "text-purple-600",
  };
}

/** 方向標籤顏色 */
function getDirectionColor(direction: string) {
  switch (direction) {
    case "BUY":
      return "text-emerald-600 bg-emerald-50 border-emerald-200";
    case "SELL":
      return "text-rose-600 bg-rose-50 border-rose-200";
    default:
      return "text-slate-500 bg-slate-50 border-slate-200";
  }
}

export default function AgentCard({ message, isExpanded, onToggle }: Props) {
  const isArbiter = message.agent_label === "Z";
  const roundLabel = isArbiter ? "🏛️ 最終裁定" : `Round ${message.round}`;
  const colors = getModelColors(message.model_type, isArbiter);
  const roleDisplay =
    ROLE_NAME_MAP[message.agent_label] || message.role_name || message.agent_id;
  const connectionIcon =
    message.model_type === "gemini" ? "🔗" : "📊";

  return (
    <div
      className={`border rounded-xl transition-all cursor-pointer ${
        colors.border
      } ${isExpanded ? colors.bg : "bg-white hover:bg-slate-50"}`}
      onClick={onToggle}
      title="點擊展開/折疊完整輸出"
    >
      {/* ── 卡片標頭（永遠顯示） ── */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {/* 代號徽章 */}
          <span
            className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${colors.badge}`}
          >
            {message.agent_label}
          </span>
          {/* 角色名稱 */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800 truncate">
                {roleDisplay}
              </span>
              <span className="text-[10px] text-slate-400">{connectionIcon}</span>
            </div>
            {/* 方向 + 信心濃縮 */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-[10px] px-1.5 py-px rounded-full border font-medium ${getDirectionColor(
                  message.direction
                )}`}
              >
                {message.direction}
              </span>
              <span className="text-[10px] text-slate-400">
                {(message.confidence * 100).toFixed(0)}%
              </span>
              {message.opinion_changed && (
                <span className="text-[10px] text-amber-600 font-medium" title="立場改變">
                  ↻ 改變立場
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 右側：Round 標記 + 展開箭頭 */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-slate-400">{roundLabel}</span>
          <span
            className={`text-xs text-slate-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </div>
      </div>

      {/* ── 展開內容 ── */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-2">
          {/* 仲裁官特有：進場/停損/目標 */}
          {isArbiter && message.entry_price != null && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-lg border border-slate-200 p-2 text-center">
                <div className="text-[10px] text-slate-400">進場價</div>
                <div className="text-sm font-mono font-bold text-slate-800">
                  {message.entry_price.toLocaleString()}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-rose-200 p-2 text-center">
                <div className="text-[10px] text-rose-400">停損價</div>
                <div className="text-sm font-mono font-bold text-rose-600">
                  {message.stop_loss?.toLocaleString?.() ?? "--"}
                </div>
              </div>
              <div className="bg-white rounded-lg border border-emerald-200 p-2 text-center">
                <div className="text-[10px] text-emerald-400">目標價</div>
                <div className="text-sm font-mono font-bold text-emerald-600">
                  {message.take_profit?.toLocaleString?.() ?? "--"}
                </div>
              </div>
            </div>
          )}

          {/* 📝 推理理由 */}
          {message.rationale && (
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-0.5">
                📝 推理理由
              </div>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
                {message.rationale}
              </p>
            </div>
          )}

          {/* ⚠️ 風險因子（僅 Round 1） */}
          {message.risk_factor && (
            <div>
              <div className="text-[10px] font-medium text-rose-500 mb-0.5">
                ⚠️ 風險因子
              </div>
              <p className="text-xs text-slate-600 whitespace-pre-wrap">
                {message.risk_factor}
              </p>
            </div>
          )}

          {/* ⏱️ API 延遲 */}
          {message.api_latency_ms != null && (
            <div className="text-[10px] text-slate-400 text-right">
              ⏱️ API 延遲：{(message.api_latency_ms / 1000).toFixed(2)}s
            </div>
          )}
        </div>
      )}
    </div>
  );
}
