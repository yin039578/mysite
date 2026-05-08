# 測試建立指南 (test_generation_guide.md)

本文件旨在指導如何在舊版環境 (Python 3.8) 分支上建立全端測試套件，以便稍後遷移至 Python 3.14 新環境進行驗證。

## 1. 測試目標
*   **黑箱測試 (Black-box Testing)**: 測試焦點在 API 輸入/輸出。
*   **全端模擬 (Full-Stack Simulation)**: 測試環境包含 Web Server, MySQL, Redis。
*   **資料隔離 (Isolation)**: 每次測試 (或 Session) 都有乾淨、可預測的資料狀態。

## 2. 基礎建設建置

### Step 1: 建立 `docker-compose.test.yml`
請在專案根目錄建立此檔案，定義測試所需的相依服務。

```yaml
version: '3.8'

services:
  # 被測試的 API 服務
  api:
    build:
      context: .
      dockerfile: docker/Dockerfile
    environment:
      - DATABASE_URL=mysql+pymysql://testuser:testpass@db:3306/testdb
      - REDIS_URL=redis://redis:6379/0
      - APP_ENV=test
    ports:
      - "8081:8080"  # 避免與開發環境衝突
    depends_on:
      - db
      - redis

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: testdb
      MYSQL_USER: testuser
      MYSQL_PASSWORD: testpass
    ports:
      - "3307:3306"

  redis:
    image: redis:6-alpine
```

### Step 2: 準備資料初始化腳本 (`tests/data/init.sql`)
建立 SQL 檔案以定義測試所需的 Table Schema 與基礎資料。

```sql
-- 範例：重置特定 Tables
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100)
);

-- 插入種子資料 (Base Seed Data)
INSERT INTO users (username, email) VALUES ('test_user_1', 'user1@example.com');
```

## 3. 測試程式碼結構 (`tests/`)

```
tests/
├── conftest.py       # 核心 fixture (Docker啟動, DB重置)
├── integration/      # 測試案例
│   └── test_api.py
└── data/
    └── init.sql      # 資料庫初始化腳本
```

## 4. 關鍵 Fixture 實作 (`tests/conftest.py`)

為了達成「每次測試都有乾淨資料」，我們需要在 `pytest` fixture 中執行資料庫重置邏輯。

```python
import pytest
import httpx
import os
import pymysql

# 設定測試環境的 DB 連線資訊
DB_CONFIG = {
    "host": "localhost",
    "port": 3307,  # 對應 docker-compose 的 port
    "user": "testuser",
    "password": "testpass",
    "db": "testdb",
    "autocommit": True
}

API_URL = "http://localhost:8081"

@pytest.fixture(scope="session", autouse=True)
def ensure_docker_env():
    """(選擇性) 可以在這裡檢查 Docker 是否已啟動，或自動執行 docker-compose up"""
    # 建議先手動啟動 docker-compose -f docker-compose.test.yml up -d
    # 這裡只做簡單的健康檢查確保服務活著
    pass

@pytest.fixture(scope="function")
def reset_db():
    """每次測試前重置資料庫"""
    conn = pymysql.connect(**DB_CONFIG)
    cursor = conn.cursor()
    
    # 讀取 SQL 檔執行初始化
    with open("tests/data/init.sql", "r") as f:
        sql_script = f.read()
    
    # 簡單的執行邏輯 (依實際 SQL 複雜度可能需要更嚴謹的解析)
    for statement in sql_script.split(';'):
        if statement.strip():
            cursor.execute(statement)
            
    conn.close()
    yield

@pytest.fixture
async def api_client():
    async with httpx.AsyncClient(base_url=API_URL) as client:
        yield client
```

## 5. 撰寫測試案例

現在您可以撰寫依賴 `reset_db` 的測試，確保資料乾淨。

```python
import pytest

@pytest.mark.asyncio
async def test_get_users(api_client, reset_db):
    # 因為 reset_db 已經執行了 init.sql，我們預期會有 'test_user_1'
    resp = await api_client.get("/users/1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["username"] == "test_user_1"
```

## 6. 執行步驟
1.  啟動測試環境：
    ```bash
    docker-compose -f docker-compose.test.yml up -d --build
    ```
2.  執行測試：
    ```bash
    pytest tests/
    ```
