#!/bin/bash

# newtree <branch-name> [base-ref] [-d]
# 自動建立或刪除 git worktree，複製 .env / .vscode / node_modules，建立 logs/ 目錄，開啟 VS Code
#
# 範例：
#   newtree feature/NABI-1234              # 分支存在則沿用，不存在則從目前 HEAD 新建
#   newtree feature/NABI-1234 origin/main  # 分支不存在時，從 origin/main 新建
#   newtree feature/NABI-1234 -d           # 刪除 worktree 與 local 分支

set -e  # 遇到錯誤立刻停

BRANCH_NAME="$1"
DELETE_MODE=false
BASE_REF=""

# 解析第二個之後的參數：-d 進刪除模式，其餘視為新分支的 base ref
shift || true
for arg in "$@"; do
  if [[ "$arg" == "-d" ]]; then
    DELETE_MODE=true
  else
    BASE_REF="$arg"
  fi
done

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
    echo "🧹 移除 local branch: $BRANCH_NAME"
    git branch -d "$BRANCH_NAME"
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

  if git show-ref --verify --quiet "refs/heads/$BRANCH_NAME"; then
    # 分支已存在，維持原行為
    git worktree add "$TARGET_DIR" "$BRANCH_NAME"
  else
    # 分支不存在，新建分支
    if [[ -n "$BASE_REF" ]]; then
      echo "🌱 分支不存在，從 $BASE_REF 新建分支：$BRANCH_NAME"
      git worktree add -b "$BRANCH_NAME" "$TARGET_DIR" "$BASE_REF"
    else
      echo "🌱 分支不存在，從目前 HEAD 新建分支：$BRANCH_NAME"
      git worktree add -b "$BRANCH_NAME" "$TARGET_DIR"
    fi
  fi

  # 複製 .env（只複製第一層 .env 檔案）
  if [[ -f ".env" ]]; then
    echo "📄 複製 .env 到 $TARGET_DIR"
    cp .env "$TARGET_DIR/.env"
  fi

  # 複製 .vscode 編輯器設定
  if [[ -d ".vscode" ]]; then
    echo "📄 複製 .vscode 到 $TARGET_DIR"
    cp -R ".vscode" "$TARGET_DIR/.vscode"
  fi

  # 複製 node_modules（cp 比重新 npm install 快）
  if [[ -d "node_modules" ]]; then
    echo "📦 複製 node_modules 到 $TARGET_DIR（可能需要一點時間）"
    cp -R "node_modules" "$TARGET_DIR/node_modules"
  fi

  # 建立 logs 目錄
  mkdir -p "$TARGET_DIR/logs"
fi

echo "🚀 開啟 VS Code: $TARGET_DIR"
code "$TARGET_DIR"

echo "✅ newtree $BRANCH_NAME 已完成"
