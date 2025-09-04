# Git Worktree 

## 基本概念理解
從原本的Git拉出新的放在特定的位置
語法：git worktree add <path> <branch>
path: 新的工作目錄位置
branch: 分支名稱

## 使用範例 > vs code
### 新增工作目錄
```bash
git worktree add ../feature/NABI-5619 NABI-5619
```
### 查看工作目錄
- 用git語法操作
- 直接用vs code打開該目錄，會自動切換到該分支
- 可以直接用sourcetree等工具，直接開啟該目錄，就可以進行UI操作


### 開發
- 直接用vs code打開該目錄，會自動切換到該分支
- python開發他會自動套用到主目錄的虛擬機，原理不確定
- 在.gitignore內容不會被複製到新的目錄，可能會造成一些問題
- 複製必要的結構與檔(.env, logs目錄等)到新目錄
- 開發～

### 刪除工作目錄
```bash
git worktree remove ../feature/NABI-5619
```

## 小工具
使用說明
1. 在主目錄下建立一個bash檔案，例如 `newtree.sh`
2. 將以下程式碼複製到 `newtree.sh`
3. 執行 `chmod +x newtree` 賦予執行權限
4. 執行 `./newtree feature/NABI-5619`，會自動建立工作目錄並開啟VS Code，但若是已經建立過，則直接開啟VS Code並開啟該分支
5. 若要刪除工作目錄，執行 `./newtree feature/NABI-5619 -d`
``` bash
#!/bin/bash

# newtree <branch-name> [-d]
# 自動建立或刪除 git worktree，複製 .env，建立 logs/ 目錄，開啟 VS Code

set -e  # 遇到錯誤立刻停

BRANCH_NAME="$1"
DELETE_MODE=false

if [[ "$2" == "-d" ]]; then
  DELETE_MODE=true
fi

if [[ -z "$BRANCH_NAME" ]]; then
  echo "❌ 請輸入分支名稱，例如：newtree feature/NABI-1234 [-d]"
  exit 1
fi

# 取得目前路徑與 git root 目錄
CURRENT_DIR="$(pwd)"
GIT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"

# 檢查是否在主專案目錄
if [[ "$CURRENT_DIR" != "$GIT_ROOT" ]]; then
  echo "❌ 請在主專案根目錄執行此指令（目前在 $CURRENT_DIR，但 Git root 是 $GIT_ROOT）"
  exit 1
fi

# 取得專案名稱（目錄名）與目標目錄
PROJECT_NAME="$(basename "$GIT_ROOT")"
TARGET_DIR="../${PROJECT_NAME}_tree/$BRANCH_NAME"

if $DELETE_MODE; then
  if [[ -d "$TARGET_DIR" ]]; then
    echo "🗑️  移除 worktree: $TARGET_DIR"
    git worktree remove "$TARGET_DIR"
    echo "✅ 已移除 $BRANCH_NAME 的 worktree"
  else
    echo "⚠️  目標目錄 $TARGET_DIR 不存在，無需移除。"
  fi
  exit 0
fi

# 檢查目標資料夾是否已存在
if [[ -d "$TARGET_DIR" ]]; then
  echo "⚠️  目標目錄 $TARGET_DIR 已存在，直接開啟 VS Code。"
else
  echo "📁 建立 worktree: $TARGET_DIR"
  git worktree add "$TARGET_DIR" "$BRANCH_NAME"

  # 複製 .env（只複製第一層 .env 檔案）
  if [[ -f ".env" ]]; then
    echo "📄 複製 .env 到 $TARGET_DIR"
    cp .env "$TARGET_DIR/.env"
  fi

  # 建立 logs 目錄
  mkdir -p "$TARGET_DIR/logs"
fi

echo "🚀 開啟 VS Code: $TARGET_DIR"
code "$TARGET_DIR"

echo "✅ newtree $BRANCH_NAME 已完成"


```

### prompt
請給我一個bash
這樣以後我只要在vs code執行類似 newtree branch 
會自動執行以下程式 
1.若是不在主project目錄，則回應錯誤，是否是主project請幫我透過git worktree可能在.git目錄資料內容判斷，這段我沒有概念，請幫我處理 
2.若是在主project，且該分支還沒開出來也還沒建立目錄，就幫我執行 
   1. git worktree add ../{project_name}/{branch} 
   2. 複製.env到../{project_name}/{branch} 
   3. 建立logs目錄 
   4. 複製.env
   5. code ../{project_name}/{branch} 開啟該資料夾
3. 若是已經建立過該目錄，就直接code ../{project_name}/{branch} 開啟該資料夾