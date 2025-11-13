# 專案編碼規範

本文件概述了 104tmd-event-api 專案中使用的編碼標準和模式。
## 重要原則
1. 請一律使用繁體中文作為回應與說明語言
2. 修改時請遵循現有的程式碼風格和結構
3. 多數時候應該都不需要另外建立新檔案，若有相關規劃先確認後再執行
4. 除非需求描述足夠完整，否則一律先進行討論待確認後再執行
5. 若沒有特別指名參考的function，各個檔案請在相同module內尋找同檔名的function作為參考，task.py參考task.py，service.py參考service.py等
### 特殊指令
輸入以下指令時代表指定含義
**做功能總結** - 對目前我們在當前對話session中討論的功能做一個總結，包含功能目的、使用的技術、主要流程、注意事項等
**做原則總結** - 對目前我們在當前對話session中收斂出來的執行策略，評估標準是是否建議放入copilot-instructions.md中，同時以適用於copilot-instructions.md的格式來撰寫

## 開發與運行環境
當討論開發、測試、實作或使用工具時，請提供環境可使用的方式
若有使用其他環境的必要，請說明原因，並特別標注出來
### 開發環境
1. 本機使用vscode開發，並以vscode作為運行伺服器的工具
2. 本機運行設定請參考 `.vscode/launch.json`
3. 作業系統：macOS 晶片 apple m3 pro
### 部署環境
1. {xxx}.104dc.com 為預期在內網使用的domain
2. {xxx}.104.com.tw 為預期在內網使用的domain
3. 便是環境會在104或104dc加上環境後綴，如104-dev, 104-staging等
#### lab 測試環境
1. 網路透過waf限制公司辦公環境對外的統一ip可進入達成內網安全性
2. 環境在domain會包含-dev，相關路由都有第一點的waf限制
3. 伺服器都使用aws-ecs fargate部署管理，無法直接進入或用command line操作
4. log可以在cloudwatch查看、同時也有waf, alb, cloudfront等log
5. 可以直接連線資料庫、Redis等資源
#### staging 模擬正式的測試環境
1. 基本同lab,但domain會包含-staging
2. 主要用來給測試人員做正式環境的模擬，資料是正式機資料年度備份，以對正式環境的機敏等級對待
3. 無法直接連線資料庫、Redis等資源
#### production 正式環境
1. 基本同staging,但domain不會有104-dev或104-staging

## API開發結構

### FastAPI 路由模式

1. 使用符合FastAPI規則的路由模式
2. 所有 API 路由應組織在各自模組資料夾中的 `views.py` 檔案中
3. 每個 API 路由都應具有：
   - 使用 `name` 參數的中文描述性名稱
   - 使用 `description` 參數的詳細說明
   - 使用 `SuccessModel[T]` 的適當回應模型，其中 T 是輸出模型
   - 可選參數應使用 `Optional[T]` 類型提示

範例：
```python
@router.get(
    "/{resource_id}",
    name="取得單筆課程資料",
    description="取得單筆課程資料",
    response_model=SuccessModel[CourseDetailOutModel],
)
def get_course(resource_id: str, pid: Optional[int] = None):
```

### 業務邏輯組織

1. `views.py` 中的路由處理應保持精簡，並將業務邏輯委託給 `actions.py`
2. `actions.py`實現邏輯時，務必參考相同檔案裡其他內容，看是否有函式可以引用，另外有時共用的函式可能在相同模組或是其他模組的`service.py`
3. 所有資料庫操作都應在 `actions.py` 中
4. 使用 `@inject_db` 裝飾器處理資料庫會話
5. 使用 `@log_func_args` 裝飾器進行函數參數日誌記錄
6. 其他api錯誤處理使用`components/fastapi/exceptions.py`裡的類別，若是不足請提出建議或增加相應錯誤類別，但處理結構不變

### 傳輸串接資料模型

1. 在 `serializers.py` 中使用 Pydantic 模型：
   - 輸入驗證（使用 InModel 後綴）
   - 輸出序列化（使用 OutModel 後綴）
   - 所有欄位都應使用 `Field(title="...")` 有中文描述性標題
   - 使用適當的欄位預設值和驗證

範例：
```python
class CourseAllInModel(OffsetPageInModel):
    provider_id: int = Field(default=..., title="課程提供者Id")
    pid: int = Field(default=None, title="pid")
    order_type: int = Field(
        default=1, 
        title="排序方式 (1:7日收藏數由多到少, 2:發佈時間由新到舊)，預設為1 "
    )
```
### 資料模型

1. 資料庫模型應定義在 `models.py` 中，放在哪個模組目錄看他跟哪個功能核心最接近或是最不可分割
2. 這邊使用 SQLAlchemy ORM 來定義資料庫模型
3. 要注意這邊定義的資料關聯與索引，用來優化產生的sql語法

### 資料庫查詢

1. 使用 SQLAlchemy 進行資料庫操作
2. 使用 joins 組織複雜查詢
3. 對經常查詢的欄位使用適當的索引
4. 始終處理記錄可能不存在的情況
5. 檢查查詢效率，提出可能的負載風險

範例：
```python
resource_list = (
    db.query(NabiResource, Nabi3rdCourse, ResourceSocialCount)
    .join(Nabi3rdCourse, Nabi3rdCourse.resource_id == NabiResource.resource_id)
    .outerjoin(
        ResourceSocialCount,
        ResourceSocialCount.resource_id == NabiResource.resource_id,
    )
    .filter(NabiResource.disable == 0)
    .order_by(NabiResource.view_count_7.desc())
    .all()
)
```

### 錯誤處理

1. 使用 `components.fastapi.exceptions` 中的適當錯誤類
2. 包含適當的錯誤代碼
3. 始終使用 Pydantic 模型驗證輸入資料

### 快取策略

1. 使用 Redis 快取頻繁訪問的資料
2. 在資料變更時實現快取失效
3. 快取金鑰應遵循專案的命名約定
4. 快取實現細節應在 `services/cache/actions.py` 中

### 認證與授權

1. 使用適當的裝飾器進行認證
2. 始終驗證使用者權限
3. 使用 `pid`（人員 ID）進行使用者身份識別
4. /crm的path需要使用fastapi的Depends`verify_csr`來驗證身份

### 常數和列舉

1. 在每個模組的 `constants.py` 檔案中保存常數
2. 對預定義的值集使用列舉類別
3. 為每個常數/列舉值包含描述性註釋

### 日誌記錄

1. 使用 `@log_func_args` 裝飾器進行函數參數日誌記錄
2. 為重要操作建立適當的日誌訊息
3. 包含適當的日誌級別（INFO、WARNING、ERROR）
4. log有固定pettern，在需要log的檔案中加入 logger = logging.getLogger(__name__)，在需要log的地方使用logger.info/warning/error/debug等
5. 機敏資料不能出現在info以上等級

## 專案特定約定
