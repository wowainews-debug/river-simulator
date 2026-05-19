/**
 * 🛡️ 資產總開關面板（第一道防線）
 * ================================
 * v1.2 重構：期貨改為 radio 群組（TX/MXF/TMF/off）+ 手動保證金輸入
 *          個股改為 radio 群組（整張/零股/關閉）
 *          選擇權維持原有 toggle
 */
import type { SimConfig } from "../lib/api";
import Tooltip from "./Tooltip";

interface Props {
  config: SimConfig;
  onChange: (key: keyof SimConfig, value: boolean | number | string) => void;
}

/** 期貨合約選項定義 */
const FUTURES_OPTIONS = [
  {
    value: "TX" as const,
    label: "大台 (TX)",
    desc: "指數 × NT$200/點",
    marginSuggest: 400_000,
    details: "保證金約 NT$358,000/口，每點 NT$200",
  },
  {
    value: "MXF" as const,
    label: "小台 (MXF)",
    desc: "指數 × NT$50/點",
    marginSuggest: 100_000,
    details: "保證金約 NT$89,500/口，每點 NT$50",
  },
  {
    value: "TMF" as const,
    label: "微台 (TMF)",
    desc: "指數 × NT$10/點",
    marginSuggest: 15_000,
    details: "保證金約 NT$10,350/口，每點 NT$10",
  },
  {
    value: "off" as const,
    label: "關閉期貨交易",
    desc: "",
    marginSuggest: 0,
    details: "",
  },
];

/** 個股模式選項定義 */
const STOCK_OPTIONS = [
  {
    value: "full_lot" as const,
    label: "📊 單張模式",
    desc: "1 張 = 1,000 股，允許當沖",
    details: "最低日均量門檻 ≥ 1,000 張",
  },
  {
    value: "odd_lot" as const,
    label: "📊 零股模式",
    desc: "1 股起跳，禁止當沖，強制留倉",
    details: "最低日均股數門檻 ≥ 100,000 股 | 不可當日沖銷 | 中長線價值投資為主",
  },
  {
    value: "off" as const,
    label: "關閉個股交易",
    desc: "",
    details: "",
  },
];

export default function AssetTogglePanel({ config, onChange }: Props) {
  const futuresContract = config.futures_contract || "off";
  const stockMode = config.stock_mode || "full_lot";

  /** 期貨合約變更時自動調整保證金建議值 */
  function handleFuturesChange(value: string) {
    onChange("futures_contract", value);
    const option = FUTURES_OPTIONS.find((o) => o.value === value);
    if (option && option.marginSuggest > 0) {
      onChange("futures_margin_reserved", option.marginSuggest);
    } else if (value === "off") {
      onChange("futures_margin_reserved", 0);
    }
  }

  function handleStockChange(value: string) {
    onChange("stock_mode", value);
  }

  const selectedFutures = FUTURES_OPTIONS.find((o) => o.value === futuresContract);
  const selectedStock = STOCK_OPTIONS.find((o) => o.value === stockMode);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">第一道防線：資產總開關</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          關閉後該類資產完全靜默，不產出訊號、不浪費 API、AI 也被告知
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 左：個股交易模式 ── */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-800">📊 個股交易</h4>
          <p className="text-xs text-slate-500">個股交易模式（僅可選一項）</p>

          <div className="space-y-2">
            {STOCK_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  stockMode === opt.value
                    ? opt.value === "off"
                      ? "border-slate-300 bg-slate-50"
                      : "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="stock_mode"
                  value={opt.value}
                  checked={stockMode === opt.value}
                  onChange={() => handleStockChange(opt.value)}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">{opt.label}</div>
                  {opt.desc && (
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  )}
                  {opt.details && stockMode === opt.value && (
                    <div className="text-[10px] text-slate-400 mt-1 bg-white/50 rounded px-2 py-1">
                      {opt.details}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* 零股模式警告 */}
          {stockMode === "odd_lot" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-xs font-medium text-amber-800 mb-1">⚠️ 零股模式注意事項</div>
              <ul className="text-[10px] text-amber-700 space-y-0.5 list-disc list-inside">
                <li>不可當日沖銷，所有部位強制留倉至次日</li>
                <li>流動性較低，建議以中長線價值投資策略為主</li>
                <li>買賣價差可能較大，AI 將據此調整進出場策略</li>
              </ul>
            </div>
          )}
        </div>

        {/* ── 右：期貨交易模式 ── */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-800">📈 期貨交易</h4>
          <p className="text-xs text-slate-500">期貨合約模式（僅可選一項）</p>

          <div className="space-y-2">
            {FUTURES_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  futuresContract === opt.value
                    ? opt.value === "off"
                      ? "border-slate-300 bg-slate-50"
                      : "border-amber-300 bg-amber-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="futures_contract"
                  value={opt.value}
                  checked={futuresContract === opt.value}
                  onChange={() => handleFuturesChange(opt.value)}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800">{opt.label}</div>
                  {opt.desc && (
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  )}
                  {opt.details && futuresContract === opt.value && (
                    <div className="text-[10px] text-slate-400 mt-1 bg-white/50 rounded px-2 py-1">
                      {opt.details}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>

          {/* 保證金保留額（手動輸入） */}
          {futuresContract !== "off" && selectedFutures && (
            <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 space-y-2">
              <div>
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  🔒 保證金保留額（手動輸入）
                  <Tooltip text="此金額將從總權益中扣除，用於保證金占用。AI 代理人將據此計算最大可下單口數。" />
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={config.futures_margin_reserved || 0}
                    onChange={(e) =>
                      onChange("futures_margin_reserved", parseFloat(e.target.value) || 0)
                    }
                    title="期貨保證金保留額"
                    className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                  <span className="text-xs text-slate-500">TWD</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                💡 建議：大台 ≧ 400,000 | 小台 ≧ 100,000 | 微台 ≧ 15,000
              </p>
              {/* 可動用資金試算 */}
              <p className="text-xs text-slate-600">
                📊 可動用交易資金：總權益{" "}
                {config.initial_capital.toLocaleString()}
                {" "}− {(config.futures_margin_reserved || 0).toLocaleString()}
                {" "}= {(config.initial_capital - (config.futures_margin_reserved || 0)).toLocaleString()} TWD
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── 選擇權交易（維持原有 toggle 設計） ── */}
      <div className="border-t border-slate-100 pt-5 mt-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div
            className={`p-4 rounded-lg border ${
              config.options_enabled
                ? "bg-violet-50 border-violet-300"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-800">
                📉 選擇權交易
                <Tooltip text="選擇權交易總開關。開啟後從總權益中保留資金，AI 會收到資金保留額及四個策略方向開關資訊。" />
              </span>
              <button
                type="button"
                onClick={() => onChange("options_enabled", !config.options_enabled)}
                className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors ${
                  config.options_enabled ? "bg-violet-600" : "bg-slate-300"
                }`}
                title={config.options_enabled ? "關閉" : "啟用"}
              >
                <span
                  className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    config.options_enabled ? "translate-x-[22px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </div>
            <div className="text-xs text-slate-500 mt-1.5">
              {config.options_enabled
                ? `✅ 啟用中 · 資金保留 NT$${(config.options_margin_reserved || 0).toLocaleString()}`
                : "❌ 已關閉"}
            </div>
          </div>
        </div>

        {/* 選擇權策略細項（僅啟用時顯示） */}
        {config.options_enabled && (
          <div className="bg-violet-50/50 border border-violet-200 rounded-lg p-4 mt-3">
            <h4 className="text-sm font-semibold text-slate-700 mb-1">選擇權策略細項</h4>
            <p className="text-xs text-slate-500 mb-3">
              僅 options_enabled=true 時生效，關閉的方向 AI 不會提出任何建議。
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <OptChip
                label="Call 買方"
                tip="買入買權：看漲策略，最大虧損為權利金"
                checked={config.opt_call_buy_enabled}
                onChange={(v) => onChange("opt_call_buy_enabled", v)}
              />
              <OptChip
                label="Call 賣方"
                tip="賣出買權：收取權利金，需現貨保護（除非允許裸賣）"
                checked={config.opt_call_sell_enabled}
                onChange={(v) => onChange("opt_call_sell_enabled", v)}
              />
              <OptChip
                label="Put 買方"
                tip="買入賣權：看跌策略/避險，最大虧損為權利金"
                checked={config.opt_put_buy_enabled}
                onChange={(v) => onChange("opt_put_buy_enabled", v)}
              />
              <OptChip
                label="Put 賣方"
                tip="賣出賣權：收取權利金，需現貨保護（除非允許裸賣）"
                checked={config.opt_put_sell_enabled}
                onChange={(v) => onChange("opt_put_sell_enabled", v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** 選擇權策略 Chip 元件 */
function OptChip({
  label,
  tip,
  checked,
  onChange,
}: {
  label: string;
  tip: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
      <span className="text-xs text-slate-700">
        {label}
        <Tooltip text={tip} />
      </span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center w-9 h-5 rounded-full transition-colors ${
          checked ? "bg-violet-600" : "bg-slate-300"
        }`}
        title={label}
      >
        <span
          className={`inline-block w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-[16px]" : "translate-x-[2px]"
          }`}
        />
      </button>
    </div>
  );
}
