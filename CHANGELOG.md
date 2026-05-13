# 架構更新紀錄 (Changelog) — RIVER 下單模擬器

> 本檔案由 AI 依 `AGENTS.md` 更新規則自動維護。

## 格式範例

### YYYY-MM-DD

#### 變更標題（`影響檔案`）

- **背景**：一句話說明
- **變更內容**：條列式，含精確檔案連結
- **影響範圍**：受影響的檔案清單

---

### 2026-05-12

#### 🏛️ 專案初始化 — 階段一（`全專案`）

- **背景**：RIVER 戰情中樞 v5.2 三層分立架構，simulator 作為獨立下單可視化儀表板。
- **變更內容**：
  1. [`src/App.tsx`](src/App.tsx) — React 19 + 5 頁路由 + 導覽列
  2. [`src/main.tsx`](src/main.tsx) — 入口
  3. [`src/index.css`](src/index.css) — Tailwind v4 樣式
  4. [`server.ts`](server.ts) — Express (Port 3001) + Vite dev server + Supabase B API
  5. [`package.json`](package.json) — 依賴（React 19, Recharts, Tailwind v4）
  6. [`AGENTS.md`](AGENTS.md) — 本專案獨立開發鐵則
  7. [`CHANGELOG.md`](CHANGELOG.md) — 本檔案
- **影響範圍**：全專案（初始化）
