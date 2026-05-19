import type { SimConfig } from "../lib/api";
import Tooltip from "./Tooltip";

interface Props {
  config: SimConfig;
  onChange: (key: keyof SimConfig, value: number | boolean) => void;
}

export default function DefenseLine2Panel({ config, onChange }: Props) {
  const s = config.stock_short_term_pct;
  const m = config.stock_mid_term_pct;
  const l = config.stock_long_term_pct;
  const total = s + m + l;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-5">
      <h3 className="text-base font-semibold text-slate-900">第二道防線：定量上限</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左：個股 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">📊 個股資金分配</h4>
          <div className={`text-xs font-mono px-2 py-1 rounded ${total === 100 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
            合計 {total}% {total === 100 ? "✅" : "⚠ 建議 100%"}
          </div>
          <SliderRow label="短線 (1-3日)" tip="個股短線資金佔比%（1-3 日當沖），三項合計應 = 100%" value={s} onChange={(v) => onChange("stock_short_term_pct", v)} />
          <SliderRow label="中線 (3-10日)" tip="個股中線資金佔比%（3-10 日波段）" value={m} onChange={(v) => onChange("stock_mid_term_pct", v)} />
          <SliderRow label="長線 (10日+)" tip="個股長線資金佔比%（10 日以上）" value={l} onChange={(v) => onChange("stock_long_term_pct", v)} />

          <h4 className="text-sm font-semibold text-slate-700 mt-4">最大溢價買入限制</h4>
          <div className="grid grid-cols-3 gap-2">
            <NumField label="短線 %" tip="若市價超出 AI 建議買入價 > 此%，不追價等待回調" value={config.max_entry_premium_short_pct} step={0.1} onChange={(v) => onChange("max_entry_premium_short_pct", v)} />
            <NumField label="中線 %" tip="中線溢價容忍上限%" value={config.max_entry_premium_mid_pct} step={0.1} onChange={(v) => onChange("max_entry_premium_mid_pct", v)} />
            <NumField label="長線 %" tip="長線溢價容忍上限%" value={config.max_entry_premium_long_pct} step={0.1} onChange={(v) => onChange("max_entry_premium_long_pct", v)} />
          </div>

          <h4 className="text-sm font-semibold text-slate-700 mt-4">📊 個股限制</h4>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="每日交易上限" tip="個股每日最多交易次數（進+出 = 1 次），超出則不再開新倉" value={config.stock_max_daily_trades ?? 1} step={1} onChange={(v) => onChange("stock_max_daily_trades", v)} />
            <NumField label="最低日均股數" tip="最低日均股數門檻。低於此量零股無法當沖，AI 自動跳過不分析" value={config.min_daily_shares ?? 1000} step={100} onChange={(v) => onChange("min_daily_shares", v)} />
          </div>
          <p className="text-xs text-slate-400">* 低於門檻股數無法當沖，AI 自動跳過</p>
        </div>

        {/* 右：期貨+選擇權+全局 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-700">📈 期貨</h4>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="最大口數" tip="期貨最大口數（大台+小台合計），超出上限 AI 輸出 HOLD" value={config.futures_max_contracts} step={1} onChange={(v) => onChange("futures_max_contracts", v)} />
            <NumField label="每日交易上限" tip="期貨每日最多交易次數（進+出 = 1 次）" value={config.futures_max_daily_trades ?? 1} step={1} onChange={(v) => onChange("futures_max_daily_trades", v)} />
          </div>

          <h4 className="text-sm font-semibold text-slate-700">📉 選擇權</h4>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="買方最大口數" tip="選擇權買方最大口數" value={config.options_max_buy_contracts} step={1} onChange={(v) => onChange("options_max_buy_contracts", v)} />
            <NumField label="賣方最大口數" tip="選擇權賣方最大口數（含 covered call/put）" value={config.options_max_sell_contracts} step={1} onChange={(v) => onChange("options_max_sell_contracts", v)} />
            <NumField label="每日交易上限" tip="選擇權每日最多交易次數" value={config.options_max_daily_trades ?? 1} step={1} onChange={(v) => onChange("options_max_daily_trades", v)} />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={config.options_allow_naked_sell} onChange={(e) => onChange("options_allow_naked_sell", e.target.checked)} />
            允許裸賣選擇權（無現貨保護的賣方）
            <Tooltip text="false=禁止裸賣選擇權，賣方必須有現貨或等值部位保護。true=允許無保護賣出選擇權（風險極高）。" />
          </label>

          <h4 className="text-sm font-semibold text-slate-700 mt-2">🌐 全局限制</h4>
          <div className="grid grid-cols-2 gap-2">
            <NumField label="總持倉 %" tip="單一個股持倉佔總權益上限%。超過上限 AI 輸出 HOLD" value={config.max_position_pct} onChange={(v) => onChange("max_position_pct", v)} />
            <NumField label="日虧熔斷 %" tip="單日最大虧損熔斷%。當日累計虧損達此% → 停止所有新倉，AI 被告知當日不再開倉" value={config.max_daily_loss_pct} step={0.5} onChange={(v) => onChange("max_daily_loss_pct", v)} />
            <NumField label="獲利鎖定 %" tip="當日獲利鎖定%。達標後不再開新倉（0=不啟用）。例如設 5 表示賺 5% 後鎖單" value={config.daily_profit_lock_pct} step={0.5} onChange={(v) => onChange("daily_profit_lock_pct", v)} />
            <NumField label="收盤前禁開(分) 期/權" tip="收盤前 N 分鐘禁止期貨/選擇權開新倉（只允許平倉）。個股不受此限制" value={config.last_entry_minutes_before_close} step={5} onChange={(v) => onChange("last_entry_minutes_before_close", v)} />
          </div>
          <p className="text-xs text-slate-400">* 收盤前禁開倉僅限制期貨與選擇權</p>
        </div>
      </div>
    </div>
  );
}

function SliderRow({ label, tip, value, onChange }: { label: string; tip: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-500 mb-0.5">
        <span>{label}<Tooltip text={tip} /></span>
        <span className="font-mono">{value}%</span>
      </div>
      <input
        type="range" min={0} max={100} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
        title={label}
      />
    </div>
  );
}

function NumField({ label, tip, value, step = 1, onChange }: { label: string; tip: string; value: number; step?: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs text-slate-500">{label}<Tooltip text={tip} /></span>
      <input
        type="number" step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full mt-0.5 px-2 py-1.5 border border-slate-300 rounded text-sm"
        title={label}
      />
    </label>
  );
}
