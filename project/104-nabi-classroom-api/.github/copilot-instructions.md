# 專案編碼規範

本文件概述了 104-nabi-classroom-api 專案中使用的編碼標準和模式。
## 重要原則
1. 請一律使用繁體中文作為回應與說明語言
2. 修改時請遵循現有的程式碼風格和結構
3. 多數時候應該都不需要另外建立新檔案，若有相關規劃先確認後再執行
4. 除非需求描述足夠完整，否則一律先進行討論待確認後再執行
5. 若沒有特別指名參考的function，各個檔案請在相同module內尋找同檔名的function作為參考，task.py參考task.py，service.py參考service.py等
6. 

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

### 資料模型

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

## 專案特定約定

### 共用的組件
1. 計算時間相關的共用函式`components/utils/time_utils.py`

### 信件模組
1. 所有信件相關的邏輯應位於 `api_ap/mail/` 資料夾中
2. 使用 `mail_tasks.py` 處理非同步信件發送
3. 使用 `link_service.py` 處理取得開信連結的規則
4. 信件模板在 `services/emails/templates`
5. 姓名統一使用中台或系統DB內的nickname，內容是完整姓名，不使用ac name作為來源

#### 信件模板html筆記
1. 在微軟outlook無法直接用a tag包table，要放在tr裡面才會生效
* vs code直接複製變數內容出來的html經過換行處理寄信時會有異常，gmail收信版型會爛掉

### 課程管理

1. 適當處理線上和實體課程
2. 實施適當的課程類型驗證
3. 處理課程提供者的特定要求
4. 始終檢查已停用/非活動的課程和提供者

### 功能標記

1. 使用提供者特定的功能標記（例如 `main_page_switch`）
2. 在功能停用時實施適當的備用方案

### 資源 ID 處理

1. 使用適當的資源 ID 驗證
2. 適當處理課程和提供者資源
3. 實施適當的資源狀態檢查



