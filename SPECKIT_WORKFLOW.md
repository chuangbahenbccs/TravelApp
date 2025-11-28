# Spec-Kit 規格驅動開發流程指南

## 概述

Spec-Kit 是 GitHub 開發的規格驅動開發 (Specification-Driven Development, SDD) 工具。

**核心理念**：
- **規格先行**：規格文件不再服從代碼，而是代碼服從規格
- **規格成為主要工程成果**：代碼則是在特定語言框架中的實踐表現
- **測試優先**：測試必須先於實作，且必須先失敗

---

## 工作流程步驟

### Step 0: `/speckit.constitution` - 建立專案憲法

**目的**: 定義專案的基本原則、技術約束和治理規範

**執行時機**: 專案初始化時，只需執行一次

**產出檔案**: `.speckit/memory/constitution.md`

**內容包括**:
- 專案目標與願景
- 技術棧選擇 (前端/後端/資料庫)
- 程式碼風格規範
- 安全性要求
- 團隊約定與限制

---

### Step 1: `/speckit.specify` - 定義需求規格

**目的**: 將功能需求轉換為清晰的用戶故事和驗收標準

**執行時機**: 開始新功能前（無需完整細節，有新想法即可開始）

**動作**:
- 掃描現有規格以確定下一個特性編號
- 自動產生語義化分支名稱並建立分支
- 套用特性規格模板並客製化需求
- 建立適當的目錄結構（`specs/[branch-name]/`）

**產出檔案**: `specs/<feature-name>/spec.md`

**內容包括**:
- 功能描述
- 用戶故事 (As a... I want... So that...)
- 驗收標準 (Acceptance Criteria)
- 邊界條件與例外處理

**⚠️ 人工審核點**: 確認所有 `[NEEDS CLARIFICATION]` 標記已解決後才進入下一階段

---

### Step 2: `/speckit.plan` - 制定技術計劃

**目的**: 將需求規格轉換為具體的技術實現方案

**執行時機**: 規格中無 `[NEEDS CLARIFICATION]` 標記後執行

**動作**:
- 讀取並理解特性需求、使用者故事、驗收標準
- 驗證是否符合專案憲法原則
- 將商務需求轉換為技術架構

**產出檔案**:
- `specs/<feature-name>/plan.md` - 實作計畫
- `specs/<feature-name>/research.md` - 技術研究（如需要）
- `specs/<feature-name>/data-model.md` - 資料模型（如需要）
- `specs/<feature-name>/contracts/` - API 契約（如需要）

**內容包括**:
- 系統架構設計
- 資料模型設計
- API 設計
- 檔案結構規劃
- 相依性分析

**⚠️ 人工審核點**: 驗證技術決策與憲法相符後才進入下一階段

---

### Step 3: `/speckit.tasks` - 生成任務清單

**目的**: 將技術計劃拆分為可執行的開發任務

**執行時機**: 計畫所有部分都已定義並經過審查

**動作**:
- 讀取 `plan.md`（必需）與其他設計文件
- 將合約、實體、場景轉換為具體任務
- 標記獨立任務為 `[P]`，概述安全的並行分組

**產出檔案**: `specs/<feature-name>/tasks.md`

**內容包括**:
- 任務清單 (含優先順序)
- 每個任務的預估範圍
- 任務之間的相依關係
- 驗證方式
- 並行化機會標記

**⚠️ 人工審核點**: 確認任務粒度適當且獨立性清晰後才開始實作

---

### Step 4: `/speckit.implement` - 執行實作

**目的**: 按照任務清單逐一實作程式碼

**執行時機**: 任務列表已經審查確認

**流程**:
1. 依照 `tasks.md` 順序執行
2. 編寫測試（先失敗）
3. 編寫實作（讓測試通過）
4. 更新任務狀態

**⚠️ 人工審核點**: 驗證測試全部通過

---

## 決策流程圖

```
有新想法？
    ↓
/speckit.specify → 產出 spec.md → [人工審核] → 確認後繼續
    ↓
規格完成且明確？
    ↓
/speckit.plan → 產出 plan.md → [人工審核] → 確認後繼續
    ↓
計畫完整？
    ↓
/speckit.tasks → 產出 tasks.md → [人工審核] → 確認後繼續
    ↓
準備編碼？
    ↓
/speckit.implement → 編寫測試（先失敗）→ 編寫實作
```

---

## 其他輔助指令

| 指令 | 用途 |
|------|------|
| `/speckit.analyze` | 對 spec.md、plan.md、tasks.md 進行跨文件一致性與品質分析 |
| `/speckit.clarify` | 識別規格中的模糊區域，提出澄清問題 |
| `/speckit.checklist` | 根據用戶需求生成自訂檢查清單 |
| `/speckit.taskstoissues` | 將任務轉換為 GitHub Issues |

---

## 目錄結構

```
.speckit/
├── memory/
│   └── constitution.md      # 專案憲法
├── templates/               # 模板檔案
│   ├── spec-template.md
│   ├── plan-template.md
│   └── tasks-template.md

specs/
├── 001-feature-name/
│   ├── spec.md              # 功能規格
│   ├── plan.md              # 技術計劃
│   ├── tasks.md             # 任務清單
│   ├── research.md          # 技術研究（選用）
│   └── contracts/           # API 契約（選用）
└── 002-another-feature/
    └── ...

.claude/
└── commands/                # Claude 斜線指令定義
```

---

## 九條開發憲法（核心原則）

| 條款 | 原則 | 說明 |
|------|------|------|
| I | 所有特性必須先成為獨立函式庫 | 實作計畫結構要求 |
| II | 每個函式庫公開 CLI 介面 | 契約定義強制 |
| III | **零程式碼前測試** | 任務必須先建測試 |
| VII | 最多 3 個專案（簡潔性） | 專注核心價值 |
| VIII | 直接使用框架，勿包裝 | 反過度抽象 |
| IX | 真實整合測試優於模擬 | 契約測試必需 |

---

## 最佳實踐

1. **逐步開始**：按照 constitution → specify → plan → tasks → implement 的順序執行
2. **每階段審核**：在移進下一步前進行人工審核，確保理解一致
3. **版本控制**：每個階段完成後進行 git commit
4. **規格是活文件**：從生產度量和事件更新規格，需求變更時更新對應文件
5. **測試是真理**：測試通過 = 規格已滿足，失敗的測試指向規格問題
6. **保持簡潔**：規格文件應清晰易讀，避免過度複雜

---

## 時間效益

| 傳統方法 | SDD 方法 |
|---------|---------|
| 2-3 小時 PRD | 5 分鐘 specify |
| 2-3 小時設計 | 5 分鐘 plan |
| 30 分鐘結構設定 | 5 分鐘 tasks |
| 3-4 小時規格 | (包含在上述) |
| 2 小時測試計畫 | (包含在上述) |
| **~12 小時總計** | **15 分鐘總計** |

---

## 快速開始範例

```bash
# 1. 初始化專案（如尚未設定）
/speckit.constitution    # 定義專案規範（僅需一次）

# 2. 開始新功能開發
/speckit.specify         # 定義功能需求 → 審核 spec.md
/speckit.plan            # 制定技術計劃 → 審核 plan.md
/speckit.tasks           # 生成任務清單 → 審核 tasks.md
/speckit.implement       # 開始實作
```

---

## 參考資源

- [Spec-Kit GitHub Repository](https://github.com/github/spec-kit)
- [Spec-Driven Development 詳細說明](https://github.com/github/spec-kit/blob/main/spec-driven.md)
