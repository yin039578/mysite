# git-tree-tool / newtree.sh

一支用來自動化管理 git worktree 的小工具。一個指令搞定：建立／刪除 worktree、複製常用檔案與目錄、建立 `logs/`、開啟 VS Code。

## 設計目的

平行開發多個分支時，與其在同一個工作目錄不斷 `git switch` 切來切去（還要 stash、重裝套件），不如用 git worktree 讓每個分支各自有一個獨立資料夾。`newtree.sh` 把「建 worktree → 搬設定檔 → 開編輯器」這串重複動作收斂成一個指令。

所有 worktree 統一放在主專案的平行資料夾底下：

```
你的工作區/
├── my-project/                      ← 主專案（git root，在這裡執行指令）
└── my-project_tree/                 ← 自動建立的 worktree 容器
    ├── feature/NABI-1234/
    └── bugfix/NABI-5678/
```

## 用法

```bash
newtree <branch-name> [base-ref] [-d]
```

| 指令 | 行為 |
|:---|:---|
| `newtree feature/NABI-1234` | 分支存在 → 沿用；不存在 → 從**目前 HEAD** 新建 |
| `newtree feature/NABI-1234 origin/main` | 分支不存在時，從 `origin/main` 新建分支 |
| `newtree feature/NABI-1234 -d` | 刪除該 worktree 與 local 分支 |

> 第二個之後的參數：`-d` 進入刪除模式，其餘字串一律視為新分支的 base ref。位置可互換，例如 `newtree X -d` 與 `newtree X` 都相容舊用法。

## 執行規則

### 前置檢查
- `set -e`：任何指令失敗就立即中止。
- 必須提供分支名稱，否則報錯退出。
- 必須在**主專案 git root** 執行（`pwd` 等於 `git rev-parse --show-toplevel`），否則報錯退出。

### 路徑規則
- 專案名 = git root 的資料夾名稱。
- 目標目錄 = `../{專案名}_tree/{分支名}`。

### 建立模式（預設）
1. 目標目錄已存在 → 不重建，直接跳到開啟 VS Code。
2. 目標目錄不存在 → 建立 worktree：
   - 分支已存在：`git worktree add`（維持原行為）。
   - 分支不存在：`git worktree add -b` 新建分支。有給 base-ref 就從該 ref 開，否則從目前 HEAD 開。
3. 複製以下項目到新 worktree（存在才複製）：
   - `.env`（僅根目錄第一層那一個）
   - `.vscode/`（編輯器設定）
   - `node_modules/`（用 `cp -R`，比重新 `npm install` 快）
4. 建立 `logs/` 目錄。
5. `code <目標目錄>` 開啟 VS Code。

### 刪除模式（`-d`）
1. 目標目錄存在 → `git worktree remove` 移除 worktree，再 `git branch -d` 刪除 local 分支。
2. 目標目錄不存在 → 提示無需移除。
3. 結束（不會開啟 VS Code）。

## 複製項目的取捨與注意事項

| 項目 | 處理方式 | 說明 |
|:---|:---|:---|
| `.env` | 複製 | 僅根目錄第一層，子目錄的 `.env` 不會處理 |
| `.vscode/` | 複製 | 輕量，帶過編輯器設定 |
| `node_modules/` | `cp -R` 複製 | 比 `npm install` 快。若新分支用到原生模組（`.node` 二進位）或 node 版本不同，可能需要 `npm rebuild` |
| Python venv（`.venv` / `venv`） | **不複製** | 虛擬環境內含寫死的絕對路徑，複製後常會壞。請在新 worktree 重新 `python -m venv` + `pip install` |

## 已知行為與限制

- 分支刪除使用 `git branch -d`（安全刪除）：未 merge 的分支會被擋下，不會強制刪除。需要強刪請手動 `git branch -D`。
- 刪除模式不會單獨清 `node_modules`，但 `git worktree remove` 會整個目錄移除，所以沒有殘留問題。
- 只處理 local 分支，不會自動 push 或建立遠端追蹤分支。

## 安裝建議

把指令加進 PATH 或設個 alias 方便呼叫：

```bash
# ~/.zshrc 或 ~/.bashrc
alias newtree="/path/to/tool/git-tree-tool/newtree.sh"
```

確認有執行權限：

```bash
chmod +x /path/to/tool/git-tree-tool/newtree.sh
```
