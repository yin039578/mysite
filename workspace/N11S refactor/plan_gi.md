# 專案升級計劃 (plan_gi.md)

本文件概述了 `104tmd-notification-v2-api-upgrade` 專案的升級策略，並詳細說明了技術選擇與執行要點。

## 1. 升級目標 (技術規格)
*   **Python**: 升級至 **3.14** (採用最新穩定版)。
*   **FastAPI**: 升級至最新穩定版。
*   **SQLAlchemy**: 升級至 **2.0** (最新穩定版)。
*   **Pydantic**: 升級至 **V2** (最新穩定版)。
*   **SQL Client**: 強制使用 **pymysql** (取代 `mysqlclient`)。
*   **套件管理**: 改用 **uv**。
    *   *關鍵安全要求*: 處理 Package Cloud 等私有來源時，授權 Token **嚴禁**明文寫入 `pyproject.toml` 或 URL 中。必須透過環境變數 (Environment Variables) 注入。

## 2. 現況分析
*   **Python 版本**: 3.8 (舊版)。
*   **依賴項**: 定義於 `requirements.txt`。
*   **測試**: 目前無測試覆蓋 (0%)。
*   **資料庫**: MySQL。

## 3. 執行策略 (雙分支並行)

我們將採用 **雙分支並行 (Dual-Branch Strategy)** 來確保改版前後的功能一致性。

### 分支 A: `legacy-test` (基於 Python 3.8)
*   **目的**: 建立基準測試與可重現的測試環境 (Baseline Environment)。
*   **環境**: 維持 Python 3.8。
*   **行動**:
    1.  **建置全端測試環境 (Full-Stack Test Env)**:
        *   建立 `docker-compose.test.yml`，包含 API Server, MySQL, Redis。
        *   **資料庫管理**: 實作「乾淨資料機制」，確保每次測試都能在已知的資料狀態下執行 (Fresh/Seeded DB)。
    2.  **撰寫黑箱整合測試**:
        *   重點：API 回應狀態碼、Schema、關鍵商業邏輯。
        *   兼容性：測試碼需同時相容 Python 3.8 與 3.14。

### 分支 B: `master` / `upgrade` (目前分支)
*   **目的**: 執行升級工程。
*   **環境**: Python 3.14, `uv`, 新版依賴。
*   **行動**:
    1.  **uv 初始化** (含安全配置)。
    2.  **Dockerfile 更新** (Python 3.14 + uv)。
    3.  **程式碼重構**:
        *   DB 連線 (`pymysql`)。
        *   SQLAlchemy 2.0 (select 語法)。
        *   Pydantic V2。
    4.  **驗證**:
        *   引入分支 A 的 `docker-compose.test.yml` 與測試資料。
        *   執行測試並修復回歸。

## 4. 詳細執行步驟

### 第一階段：準備與基準 (於 Legacy 分支)
請參考另一份文件 `test_generation_guide.md` 進行測試案例與環境的建立。
**重點補充**: 必須包含 MySQL/Redis 容器設定，以及資料庫初始化腳本 (Seed Data)。

### 第二階段：環境升級 (於 Upgrade 分支)
1.  **移除舊檔**: 刪除 `requirements.txt`。
2.  **uv 設定**:
    *   `uv init`
    *   `uv add` 新版套件。
    *   設定私有來源 (Env Vars)。
3.  **Docker 環境**:
    *   撰寫支援 `uv` 的 `Dockerfile`。

### 第三階段：程式碼重構
1.  **SQLAlchemy 2.0**:
    *   全面掃描 `Session.query()` 用法並替換。
    *   處理 `Future` 模式警告。
2.  **Pydantic V2**:
    *   更新模型定義。

### 第四階段：整併與驗證
1.  引入 Legacy 分支的測試環境。
2.  除錯與優化。
3.  效能測試 (回應時間監控)。
