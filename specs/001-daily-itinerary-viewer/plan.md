# 實作計畫：[功能名稱]

**分支**: `[###-feature-name]` | **日期**: [日期] | **規格**: [連結]
**輸入**: 功能規格來自 `/specs/[###-feature-name]/spec.md`

**說明**: 此模板由 `/speckit.plan` 指令填寫。執行流程請參閱 `.specify/templates/commands/plan.md`。

## 摘要

[從功能規格擷取：主要需求 + 研究後的技術方案]

## 技術背景

<!--
  注意：請將此章節替換為專案的實際技術細節。
  以下結構為建議格式，可依需求調整。
-->

**語言/版本**: [例如 Python 3.11, Swift 5.9, Rust 1.75 或 待釐清]
**主要依賴**: [例如 FastAPI, UIKit, LLVM 或 待釐清]
**儲存方案**: [若適用，例如 PostgreSQL, CoreData, 檔案系統 或 不適用]
**測試框架**: [例如 pytest, XCTest, cargo test 或 待釐清]
**目標平台**: [例如 Linux 伺服器, iOS 15+, WASM 或 待釐清]
**專案類型**: [單體/網頁/行動 - 決定原始碼結構]
**效能目標**: [領域特定，例如 1000 req/s, 10k lines/sec, 60 fps 或 待釐清]
**限制條件**: [領域特定，例如 <200ms p95, <100MB 記憶體, 離線可用 或 待釐清]
**規模/範圍**: [領域特定，例如 10k 使用者, 1M LOC, 50 畫面 或 待釐清]

## 憲法檢核

*關卡：必須在第 0 階段研究前通過。第 1 階段設計後需重新檢核。*

[根據憲法檔案決定檢核項目]

## 專案結構

### 文件結構（本功能）

```text
specs/[###-feature]/
├── plan.md              # 本檔案（/speckit.plan 指令輸出）
├── research.md          # 第 0 階段輸出（/speckit.plan 指令）
├── data-model.md        # 第 1 階段輸出（/speckit.plan 指令）
├── quickstart.md        # 第 1 階段輸出（/speckit.plan 指令）
├── contracts/           # 第 1 階段輸出（/speckit.plan 指令）
└── tasks.md             # 第 2 階段輸出（/speckit.tasks 指令 - 非由 /speckit.plan 建立）
```

### 原始碼結構（專案根目錄）

<!--
  注意：請將以下佔位符目錄結構替換為本功能的實際配置。
  刪除未使用的選項，並將選定的結構展開為實際路徑
  （例如 apps/admin, packages/something）。最終計畫不應包含選項標籤。
-->

```text
# [若未使用請刪除] 選項 1：單體專案（預設）
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [若未使用請刪除] 選項 2：網頁應用程式（當偵測到「前端」+「後端」）
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [若未使用請刪除] 選項 3：行動應用 + API（當偵測到「iOS/Android」）
api/
└── [同上方後端結構]

ios/ 或 android/
└── [平台特定結構：功能模組、UI 流程、平台測試]
```

**結構決策**: [記錄選定的結構並參照上方實際目錄]

## 複雜度追蹤

> **僅在憲法檢核有違規且需合理化說明時填寫**

| 違規項目 | 為何需要 | 為何拒絕更簡單的替代方案 |
|----------|----------|--------------------------|
| [例如 第 4 個專案] | [當前需求] | [為何 3 個專案不足] |
| [例如 Repository 模式] | [特定問題] | [為何直接存取 DB 不足] |
