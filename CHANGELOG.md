# 架構更新紀錄 (Changelog) — RIVER 下單模擬器

> 本檔案由 AI 依 `AGENTS.md` 更新規則自動維護。

## 格式範例

### YYYY-MM-DD

#### 變更標題（`影響檔案`）

- **背景**：一句話說明
- **變更內容**：條列式，含精確檔案連結
- **影響範圍**：受影響的檔案清單

---

### 2026-05-26

#### 🏗️ AI 模型遷移：DeepSeek → Gemini（無程式碼變更，前端自動適應）

- **背景**：運算中心已完成 DeepSeek→Gemini 全代理人遷移（詳見運算中心 CHANGELOG.md）。模擬中心前端本身無需修改——`model_type` 欄位由運算中心的 `agent_id` 自動決定，辯論日誌 API 回傳的 `model_type` 已從 `deepseek` 變為 `gemini`。
- **變更內容**：無需程式碼變更。前端 `AiDebatePanel.tsx` 的模型標籤渲染自動顯示新的 `model_type` 值。
- **影響範圍**：無（前端自動適應）

---

### 2026-05-22

#### 🔧 修復代理層間歇性 502 Bad Gateway — HTTP Keep-Alive 連線池 + 智慧重試（`server.ts`）

- **背景**：Express `proxyToBackend` 每次請求建立新 TCP 連線（無 keep-alive），疊加 FastAPI 事件迴圈偶發阻塞，導致三層請求鏈（瀏覽器 → :3001 → :8000）在高併發或背景排程執行時拋出 502。
- **變更內容**：
  1. 🔧 [`server.ts`](server.ts:39) — 新增全域 `http.Agent` 連線池，啟用 HTTP Keep-Alive（maxSockets=32、keepAliveMsecs=30s），避免每次代理請求重建 TCP 連線。
  2. 🔧 [`server.ts`](server.ts:47) — `proxyToBackend` 重構：加入 2 次智慧重試（間隔 600ms），GET 冪等安全重試，PUT/POST 僅在後端回 502/503/504 時重試。
  3. 🔧 逾時從 30 秒降至 25 秒（配合 FastAPI 端 25 秒 `_run_in_thread` 逾時，形成防禦梯度）。
- **影響範圍**：`server.ts`

### 2026-05-15

#### 🏗️ 全端頁面架構完整實作 — 12 頁面 + 15 組件（`src/pages/`, `src/components/`）

- **背景**：模擬器從初始骨架擴展為完整功能的前端儀表板，涵蓋交易監控、運算中心、系統狀態、資金管理等全部面向。
- **變更內容**：
  1. 🆕 [`src/pages/Dashboard.tsx`](src/pages/Dashboard.tsx) — 主儀表板：KPI 卡片群 + 權益曲線圖 + 狙擊目標清單 + 今日訊號摘要 + 系統健康狀態，四組 API 平行載入。
  2. 🆕 [`src/pages/Signals.tsx`](src/pages/Signals.tsx) — 訊號總覽頁面。
  3. 🆕 [`src/pages/SignalDetail.tsx`](src/pages/SignalDetail.tsx) — 單檔訊號明細。
  4. 🆕 [`src/pages/Orders.tsx`](src/pages/Orders.tsx) — 委託記錄查詢。
  5. 🆕 [`src/pages/StockPosition.tsx`](src/pages/StockPosition.tsx) — 個股持倉 K 線 + 指標疊加。
  6. 🆕 [`src/pages/Futures.tsx`](src/pages/Futures.tsx) — 台指期監控：即時報價 (60s 輪詢) + K 線圖。
  7. 🆕 [`src/pages/Options.tsx`](src/pages/Options.tsx) — 選擇權監控。
  8. 🆕 [`src/pages/ParamPanel.tsx`](src/pages/ParamPanel.tsx) — 參數調教面板。
  9. 🆕 [`src/pages/Settings.tsx`](src/pages/Settings.tsx) — 模擬設定。
  10. 🆕 [`src/pages/SystemStatus.tsx`](src/pages/SystemStatus.tsx) — 系統狀態儀表板：四大模組健康格 + 即時日誌 (30s 更新)。
  11. 🆕 [`src/pages/ComputeStocks.tsx`](src/pages/ComputeStocks.tsx) — 個股運算中心：回測參數報告。
  12. 🆕 [`src/pages/ComputeFutures.tsx`](src/pages/ComputeFutures.tsx) — 期貨運算中心：TAIEX V1 策略回測面板。
- **影響範圍**：`src/pages/` (12 檔)。

#### 🧩 前端 UI 組件完整建置（`src/components/`）

- **變更內容**：
  1. [`src/components/TopNavBar.tsx`](src/components/TopNavBar.tsx) — 頂部導覽列（8 主要頁面捷徑 + 台灣時間時鐘 + 狀態燈號）。
  2. 🆕 `KpiDashboard.tsx` / `KpiCard.tsx` — KPI 指標卡片群。
  3. 🆕 `EquityCurveChart.tsx` — 權益曲線圖 (Recharts)。
  4. 🆕 `SniperTargetList.tsx` — 狙擊目標清單。
  5. 🆕 `FuturesChart.tsx` — 台指期 K 線圖 + HMA/EMA 疊加。
  6. 🆕 `TradingViewWidget.tsx` — TradingView 圖表嵌入。
  7. 🆕 `AiDebatePanel.tsx` — AI 辯論委員會投票結果 (折疊式)。
  8. 🆕 `AssetTogglePanel.tsx` / `AssetTabs.tsx` — 資產切換。
  9. 🆕 `SignalSection.tsx` / `SignalTable.tsx` — 訊號展示。
  10. 🆕 `DefenseLine2Panel.tsx` / `DefenseLine3Panel.tsx` — 防護線狀態。
  11. 🆕 `FundCard.tsx` / `FundManager.tsx` — 資金管理。
  12. 🆕 `Tooltip.tsx` — 通用提示元件。
- **影響範圍**：`src/components/` (15 檔)。

#### 📡 API Service Layer 全端點封裝（`src/lib/api.ts`, `server.ts`）

- **背景**：前端需要與 quant-engine (Port 8000) 進行完整的 API 溝通。
- **變更內容**：
  1. [`src/lib/api.ts`](src/lib/api.ts) — 311 行 API 服務層：`fetchPerformance()`、`fetchTargets()`、`fetchTodaySignals()`、`fetchHealth()`、`fetchModules()`、`fetchRecentLogs()`、`fetchFuturesQuote()`、`fetchSimConfig()` 等 10+ 端點封裝。
  2. [`server.ts`](server.ts) — Express (Port 3001) 擴充：Vite 代理轉發至 quant-engine `/api/v1/*` + Supabase B 直接查詢備援。
- **影響範圍**：`src/lib/api.ts`、`server.ts`。

#### 🎨 視覺主題調整（`src/index.css`, 全站）

- **背景**：與戰情室深色主題區隔，模擬器採用明亮企業風格。
- **變更內容**：`slate-50` 淺灰背景 + 白色卡片 + `slate-900` 深色導覽列。
- **影響範圍**：`src/index.css`、全站頁面。

---

### 2026-05-12

#### 🏛️ 專案初始化 — 階段一（`全專案`）

- **背景**：RIVER 戰情中樞 v5.2 三層分立架構，simulator 作為獨立下單可視化儀表板。
- **變更內容**：
  1. [`src/App.tsx`](src/App.tsx) — React 19 + 路由 + 導覽列
  2. [`src/main.tsx`](src/main.tsx) — 入口
  3. [`src/index.css`](src/index.css) — Tailwind v4 樣式
  4. [`server.ts`](server.ts) — Express (Port 3001) + Vite dev server + Supabase B API
  5. [`package.json`](package.json) — 依賴（React 19, Recharts, Tailwind v4）
  6. [`AGENTS.md`](AGENTS.md) — 本專案獨立開發鐵則
  7. [`CHANGELOG.md`](CHANGELOG.md) — 本檔案
- **影響範圍**：全專案（初始化）

### 2026-05-17

#### 📋 跨中心企劃同步 — 模擬器 UI 獨立測試目錄（戰情室 `simulator_ui/`）

- **背景**：為與 river-simulator 主專案解耦測試，在戰情室 workspace 內建立獨立 simulator_ui 目錄供快速原型驗證。
- **變更內容**：戰情室 `simulator_ui/` — 🆕 含 KpiCard/KpiDashboard/SniperTargetList/EquityCurveChart/TradingViewWidget 等組件，與 river-simulator 共用設計規範。
- **影響範圍**：不影響 river-simulator 主專案，僅供原型驗證。

#### 📋 AI 辯論委員會提示詞強化企劃（戰情室 `plans/ai-debate-prompt-upgrade-v2.md`）

- **背景**：運算中心 AI 辯論代理人輸出深度不足，需移植戰情室機構報告級提示詞精華。
- **變更內容**：565 行完整企劃，含六代理人獨立 prompt 規範、反幻覺七層防禦、三維加權評分、風控數學鐵律。後續將直接影響 `AiDebatePanel` 組件展示品質。
- **影響範圍**：`src/components/AiDebatePanel.tsx` 展示內容品質（待運算中心實作後聯動）。

---

### 2026-05-16

#### 🔴 模擬中心三道防線設定存檔卡死 — 第二輪根因確認與修復（`server.ts`）

- **背景**：第一輪修復 (timeout) 後 PUT 請求仍逾時。從 uvicorn 日誌發現 PUT 請求從未到達 FastAPI (Port 8000)。
- **根因分析**：`tsx server.ts` 使用自訂 Express + Vite middlewareMode。`express.json()` 先行解析 body stream 後，Vite 內建 `http-proxy` 無法重新讀取已被消費的 stream → PUT/POST body 丟失 → 請求懸掛。
- **變更內容**：`server.ts` 新增 `proxyToBackend` 中介軟體，攔截未匹配的 `/api/*` 請求，手動 `fetch()` 轉發至 FastAPI。
- **影響範圍**：`server.ts`。

#### 🟡 三道防線設定頁面硬編碼 — 全頁面聯動修復（`Dashboard.tsx`、`Futures.tsx`）

- **背景**：Dashboard 和 Futures 頁面多處硬編碼不聯動 simConfig。
- **變更內容**：
  1. `Dashboard.tsx` — `riskReserve` 從硬編碼 `currentEquity * 0.02` 改聯動 `futures_margin_buffer_pct` + `options_capital_reserve_pct`。
  2. `Futures.tsx` — 新增第五張 KPI 卡「期貨總開關」顯示第一道防線啟用狀態；保證金保留額卡片追加緩衝%。
- **影響範圍**：`src/pages/Dashboard.tsx`、`src/pages/Futures.tsx`。

#### 🛡️ 模擬中心防呆機制強化（`api.ts`、`AssetTogglePanel.tsx`、`ErrorBoundary.tsx`、`App.tsx`）

- **背景**：`fetchApi()` 無 timeout 導致存檔按鈕永久 disabled；`AssetTogglePanel` state 不隨 config 更新；全站無錯誤邊界。
- **變更內容**：
  1. `api.ts` — 新增 AbortController + 15 秒 timeout。
  2. `AssetTogglePanel.tsx` — useEffect 聯動 config 變更。
  3. `ErrorBoundary.tsx` — 🆕 全站錯誤邊界（擷取渲染例外，提供恢復按鈕）。
  4. `App.tsx` — 包裝 `<ErrorBoundary>`。
- **驗證**：`npx tsc --noEmit` 零錯誤。
- **影響範圍**：`src/lib/api.ts`、`src/components/AssetTogglePanel.tsx`、`src/components/ErrorBoundary.tsx`、`src/App.tsx`。

#### 📡 API Service Layer 強化 + server.ts 中介軟體（`api.ts`、`server.ts`）

- **背景**：前端需要與 quant-engine (Port 8000) 進行完整的 API 溝通，含 simConfig 讀寫。
- **變更內容**：
  1. `api.ts` — 311 行 API 服務層，含 `fetchSimConfig()`、`updateSimConfig()` 等 10+ 端點封裝。
  2. `server.ts` — Express 擴充 Vite 代理轉發 + Supabase B 直接查詢備援 + proxyToBackend 中介軟體。
- **影響範圍**：`src/lib/api.ts`、`server.ts`。
