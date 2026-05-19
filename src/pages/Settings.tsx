import { useState, useEffect, useCallback } from "react";
import type { SimConfig } from "../lib/api";
import { fetchSimConfig, updateSimConfig } from "../lib/api";
import AssetTogglePanel from "../components/AssetTogglePanel";
import DefenseLine2Panel from "../components/DefenseLine2Panel";
import DefenseLine3Panel from "../components/DefenseLine3Panel";

export default function SettingsPage() {
  const [config, setConfig] = useState<SimConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    try { setLoading(true); const res = await fetchSimConfig(); setConfig(res.config); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "載入設定失敗"); }
    finally { setLoading(false); }
  }

  const handleChange = useCallback((key: keyof SimConfig, value: boolean | number | string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      // 期貨關閉時歸零保證金
      if (key === "futures_contract" && value === "off") next.futures_margin_reserved = 0;
      if (key === "options_enabled" && !value) next.options_margin_reserved = 0;
      return next;
    });
    setDirty(true);
  }, []);

  async function handleSave() {
    if (!config) return;
    try { setSaving(true); setError(""); setSavedMsg(""); await updateSimConfig(config);
      setSavedMsg("✅ 設定已儲存成功"); setDirty(false); setTimeout(() => setSavedMsg(""), 3000); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "儲存失敗"); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="max-w-6xl mx-auto py-6 px-4"><div className="bg-white border border-slate-200/80 rounded-xl p-8 text-center text-slate-500">載入設定中...</div></div>;
  if (!config) return <div className="max-w-6xl mx-auto py-6 px-4"><div className="bg-white border border-rose-200 rounded-xl p-8 text-center text-rose-500">載入失敗：{error}</div></div>;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 space-y-5">
      <h1 className="text-xl font-bold text-slate-900">🛡️ 三道防線設定</h1>

      {/* 總權益金 */}
      <div className="bg-white border border-blue-200 rounded-xl p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">總權益資金 (TWD) — 所有保證金保留額即時連動</label>
          <input type="number" min={100000} step={10000} value={config.initial_capital}
            onChange={(e) => handleChange("initial_capital", parseFloat(e.target.value) || 1_000_000)}
            className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
            title="總權益資金" />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <button onClick={() => handleChange("is_real_mode", !config.is_real_mode)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${config.is_real_mode ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
            {config.is_real_mode ? "🔴 實單" : "🟢 模擬"}
          </button>
          <span className="text-xs text-slate-400">{dirty ? "⚠ 未儲存" : "✅ 已同步"}</span>
        </div>
      </div>

      {error && <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-lg p-3 text-sm">{error}</div>}
      {savedMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg p-3 text-sm">{savedMsg}</div>}

      <AssetTogglePanel config={config} onChange={handleChange} />
      <DefenseLine2Panel config={config} onChange={handleChange} />
      <DefenseLine3Panel config={config} onChange={handleChange} />

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving || !dirty}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium transition">
          {saving ? "💾 儲存中..." : "💾 儲存全部設定"}
        </button>
      </div>
    </div>
  );
}
