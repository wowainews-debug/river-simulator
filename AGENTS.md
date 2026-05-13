# Agent Rules Standard (AGENTS.md) — RIVER 下單模擬器

> **📝 更新規則**：核心鐵則變更 → 直接修改本檔案。每次功能開發/修復 → 追加寫入 `CHANGELOG.md`。

---

## 1. 核心架構鐵則

1. **🔒 資料庫隔離**
   - 模擬器僅讀取 Supabase B (`river_trading`) 的訊號與模擬資料
   - 不連接戰情室 Supabase（避免資安風險）
   - 寫入僅限 `simulated_*` 系列資料表

2. **🔄 模擬 ↔ 真實切換**
   - 前端開關控制 `simulation_config.is_real_mode`
   - `false` = 模擬模式（委託寫入 `simulated_orders`）
   - `true` = 真實模式（獨立下單電腦讀取 `trade_signals` 執行）
   - 切換時需彈出確認對話框

3. **📡 即時資料串流**
   - 使用 SSE (Server-Sent Events) 訂閱 quant-engine 最新訊號
   - 心跳機制：每 30 秒檢查連線狀態
   - 斷線自動重連（指數退避，最大 60 秒）

4. **🎨 UI 一致性**
   - 與戰情室共用 Tailwind CSS v4 + 深色主題 (slate-950)
   - 組件風格統一：圓角 (`rounded-2xl`)、半透明卡片 (`bg-slate-900/80`)
   - 顏色語意：藍色 = 資訊 / 綠色 = 獲利買入 / 紅色 = 虧損賣出 / 黃色 = 警告

5. **📊 圖表規範**
   - K 線圖使用 Recharts 或 lightweight-charts
   - 技術指標疊加（HMA、EMA、BB）使用不同顏色虛線
   - 進場/出場標記用箭頭圖示

6. **🛡️ 防呆機制**
   - 每個 API 請求強制 `try-catch` + timeout
   - Supabase 不可用時顯示「資料庫連線中斷」提示而非白畫面
   - 模擬帳戶淨值 < 初始資金 50% → 彈出風險警告

---

## 2. 頁面路由表

| 路由 | 頁面 | 優先級 |
|:---|:---|:---:|
| `/` | 模擬持倉總覽 | P0 |
| `/signals` | 訊號監控 | P0 |
| `/signals/:symbol` | 單檔訊號明細（14 組雷達圖） | P1 |
| `/positions/:symbol` | 個股持倉 K 線 + 指標疊加 | P1 |
| `/orders` | 委託記錄 | P1 |
| `/options` | 選擇權監控 | P2 |
| `/futures` | 台指期監控 | P2 |
| `/params/:symbol` | 參數調教面板 | P2 |
| `/settings` | 模擬設定 | P1 |

---

## 3. 不可修改的邊界

- **quant-engine `src/` 目錄**：不可修改（屬於 river-quant-engine 管轄）
- **quant-engine 的計算邏輯**：模擬器只負責展示，不重複實作任何策略計算
- **下單執行**：模擬器不直接呼叫富邦 SDK，下單由獨立電腦負責
