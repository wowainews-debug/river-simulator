
import type { SimConfig } from "../lib/api";
import Tooltip from "./Tooltip";

interface Props {
  config: SimConfig;
  onChange: (key: keyof SimConfig, value: number | boolean) => void;
}

export default function DefenseLine3Panel({ config, onChange }: Props) {
  const totalEquity = config.initial_capital;
  const futuresEnabled = (config.futures_contract || "off") !== "off";
  const futuresReserved = futuresEnabled ? (config.futures_margin_reserved || 0) : 0;
  const optionsReserved = config.options_enabled ? (config.options_margin_reserved || 0) : 0;
  const available = totalEquity - futuresReserved - optionsReserved;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-slate-900">第三道防線：資金防火牆</h3>
      </div>

      {/* 資金總覽 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox
          label="總權益資金" tip="模擬初始資金（TWD），所有佔比% 的計算基準。可在頁面頂部調整。"
          value={`NT$${totalEquity.toLocaleString()}`} color="slate"
        />
        <StatBox
          label="期貨保證金保留" tip="期貨保證金保留額（手動設定於第一道防線）。此金額被凍結不可動用。"
          value={futuresEnabled ? `NT$${futuresReserved.toLocaleString()}` : "未啟用"}
          color={futuresEnabled ? "blue" : "slate"}
        />
        <StatBox
          label="選擇權資金保留" tip="選擇權資金保留額。此金額被凍結不可動用。"
          value={config.options_enabled ? `NT$${optionsReserved.toLocaleString()}` : "未啟用"}
          color={config.options_enabled ? "violet" : "slate"}
        />
        <StatBox
          label="可用交易資金" tip="可用資金 = 總權益 − 期貨保留 − 選擇權保留。此金額為實際可用於開倉的資金。若 < 0 表示資金不足以開啟目前資產組合。"
          value={`NT$${available.toLocaleString()}`}
          color={available >= 0 ? "emerald" : "rose"}
        />
      </div>
    </div>
  );
}

function StatBox({ label, tip, value, color }: { label: string; tip: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-50 border-slate-200",
    blue: "bg-blue-50 border-blue-200",
    violet: "bg-violet-50 border-violet-200",
    emerald: "bg-emerald-50 border-emerald-200",
    rose: "bg-rose-50 border-rose-200",
  };
  return (
    <div className={`p-3 rounded-lg border ${colors[color] || colors.slate}`}>
      <div className="text-xs text-slate-500 mb-1">{label}<Tooltip text={tip} /></div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
