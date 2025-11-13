# Nabi copilot-instructions 編輯優化 


# 新創AI 9/23 落地分享
vscode + copilot-instructions.md

---

## 產出instructions

``` mermaid 
flowchart TD
    A[AI爬梳專案產出instructions] --> B[人工 修改錯誤]
    B --> C[AI 優化instructions ]
    C --> B
    C --> D{無特別改善}
    D -->|換AI模型| C
```

---

## 有幫助的

1. 專注提供產品邏輯
2. AI對話session會比較乾淨，降低閱讀認知負擔
3. 能快速產出會跑可以通過測試的程式碼
4. 可以不斷把規則補進去文件，增加完整性

---

## 能跑不等於完成

1. 程式風格不符合造成閱讀負擔
2. 命名與註解說明的慣用形式不同，顯得格格不入
3. 對產出結果不容易量化評估，instructions優化評價都是體感

---

## 緩慢成長中

1. 試著增加更多細節規範，讓他符合團隊慣例或是方式
2. 決定這份文件與形式的是我們，要自身養成良好習慣與判斷能力

---

## 額外加碼
讓你commit message的AI也能更聰明(?
copilot-commit-message-instructions.md
``` json
vscode:settings.json
    "github.copilot.chat.commitMessageGeneration.instructions": [
        {
            "file": ".github/copilot-commit-message-instructions.md"
        }
    ],
```

---

## 感想

1. 能快速給你一個列表，看到這次異動的內容，但沒有周全
2. 目前還在該功能在copilotc還在實驗階段
3. 給他精確的prompt他未必會遵守

---

# 以上！沒落地分享

---

``````
# 專案編碼規範

本文件概述了 104-nabi-classroom-api 專案中使用的編碼標準和模式。

## 專案概述

104-nabi-classroom-api 是一個提供線上課程、學員管理、金流串接與社群互動功能的教學平台後端 API。其核心業務是為企業和個人提供一個穩定、高效的線上學習環境。在開發時，請時刻考量此業務目標。

## 重要原則
1. 文件、討論與對外說明預設使用繁體中文；程式語法與變數命名一律英文；技術名詞（如 status、error code、HTTP、JWT 等）與日誌訊息可依現有 pattern 使用英文或中英混用，但同一模型/檔案內風格需一致。
2. 修改時請遵循現有的程式碼風格和結構
3. 多數時候應該都不需要另外建立新檔案，若有相關規劃先確認後再執行
4. 除非需求描述足夠完整（包含輸入/輸出模型、業務邏輯流程、錯誤處理案例），否則一律先進行討論待確認後再執行。若描述不足，請提出具體缺失點（如'缺少業務邏輯流程'）後討論。
5. 若沒有特別指名參考的function，各個檔案請在相同module內尋找同檔名的function作為參考，task.py參考task.py，service.py參考service.py等
6. 引用與使用的lib要參考相同module內的檔案優先，若沒有可以參考其他module相同檔名的檔案，例如a module的action.py需要log，可以先去看其他module的action裡log的做法
7. 務必檢查是否存在，避免無效引用
8. 函式呼叫務必指定型別，避免使用dict物件呼叫，造成不易維護與理解
9. 不需要回傳的函式預設使用 return True
10. 函式呼叫時，若是參數數量超過四個，請使用關鍵字參數方式呼叫
11. 組字串使用f""，不要使用format function
12. 函式不用特別用 -> 說明回傳參數

## 版本與相容性前提
- 依據：所有套件版本以 `pyproject.toml` 為唯一權威；以下內容為閱讀便利的快照，實際仍以檔案為準。
- 鎖定：實際執行/部署請以 `poetry.lock` 的鎖定版本為準，避免 caret 範圍升級造成行為差異。
- 相容性：目前採用 Pydantic v1 與 SQLAlchemy 1.4 的 API 風格，不可混用 Pydantic v2 或 SQLAlchemy 2.0 的語法。

### 特殊任務準則
#### Java翻寫
1. 會在描述中提到`java翻寫`，代表要把java的邏輯翻寫成python
2. 參考java專案為104learn-nabi-backend，會被放到同一個workspace裡，若找不到請通知我
3. 我會指定java api endpoint，請先爬梳該專案內容之後，在參考python專案的結構來翻寫，python專案結構請參考copilot-instructions.md
4. 若java邏輯有不合理或是可以優化的地方，可以提出
5. 參數命名盡量維持不變，除非有明確的議題也先提出
6. 翻寫內容不要直接進行優化，避免雖然非必要但是重要的邏輯遺失，尤其是sql與資料整理的部分
7. 若是有map或是依照參數靜態回傳內容，請完全不要修改其內容，轉化成python的語法即可

### 特殊指令
輸入以下指令時代表指定含義
**做功能總結** - 對目前我們在當前對話session中討論的功能做一個總結，包含功能目的、使用的技術、主要流程、注意事項等
**做原則總結** - 對目前我們在當前對話session中收斂出來的執行策略，評估標準是是否建議放入copilot-instructions.md中，同時以適用於copilot-instructions.md的格式來撰寫

## 開發與運行環境
當討論開發、測試、實作或使用工具時，請提供環境可使用的方式
若有使用其他環境的必要，請說明原因，並特別標注出來
### 開發環境
1. 本機使用vscode開發，並以vscode作為運行伺服器的工具。
2. 本機運行設定請參考 `.vscode/launch.json`。
3. 作業系統：macOS 晶片 apple m3 pro。
4. 專案使用 Poetry 進行依賴管理。**所有版本資訊請以 `pyproject.toml` 檔案為唯一依據；實際執行/部署以 `poetry.lock` 鎖定版本為準，以避免細版升級造成差異。**

### 核心技術棧
**請隨時參考 `pyproject.toml` 以獲取最新版本。**
1. **Web框架**: FastAPI 搭配 Uvicorn
2. **資料驗證**: Pydantic
3. **資料庫ORM**: SQLAlchemy
4. **資料庫遷移**: Alembic
5. **非同步任務**: Dramatiq 搭配 Redis
6. **Python版本**: 請參考 `pyproject.toml` 中的 `[tool.poetry.dependencies]`

### 部署環境
1. {xxx}.104dc.com 為預期在內網使用的domain
2. {xxx}.104.com.tw 為預期在對外曝光使用的domain
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

## 核心運作
1. 請求流程：HTTP Request -> views.py 驗證輸入 (Pydantic) -> 呼叫 actions.py -> actions 執行 DB 操作 / 呼叫 service -> 回傳結果給 views -> views 回應 SuccessModel。
2. 非同步任務：主 API 觸發 messages/tasks（如 Dramatiq）放到各模組的 `*/tasks.py`、或 `*/*_tasks.py` 類別。
3. 快取流程：actions 或 service 負責查 Redis；資料變更需同步失效 cache（在 service 或 services/cache/actions.py 實作）
4. 每個 business domain 為一個 package（例如 `api_course/`, `api_user/`）。
5. 共用工具放在 `components/`（utils、auth、exceptions 等）。
6. 外部services 放在 `services/`（像 emails、cache、external adapters）。

## API開發結構

### FastAPI 路由模式

1. 使用符合FastAPI規則的路由模式
2. 所有 API 路由應組織在各自模組資料夾中的 `views.py` 檔案中
3. 每個 API 路由都應具有：
   - 使用 `name` 參數的中文描述性名稱
   - 使用 `description` 參數的詳細說明
   - 使用 `SuccessModel[T]` 的適當回應模型，其中 T 是輸出模型
   - 可選參數應使用 `Optional[T]` 類型提示
4. path使用snake_case
5. 若是查詢單筆資料，為處理查無資料狀態，可用`SuccessModel[Optional[OutModel]]`這樣當action回傳None api會回應null

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


### 非同步任務處理
1. 所有非同步任務使用 Dramatiq 框架
2. 任務定義在各模組的 `tasks.py` 檔案中
3. 使用 `@dramatiq.actor` 裝飾器定義任務
4. 任務呼叫使用 `task_name.send()` 方法
5. 長時間運行的任務應使用 `DISTRIBUTED_MUTEX` 避免重複執行

範例：
```python
import dramatiq
from app.dramatiq_rate_limit import DISTRIBUTED_MUTEX

@dramatiq.actor
def process_long_task(data):
    with DISTRIBUTED_MUTEX.acquire():
        try:
            # 處理任務邏輯
            process_data(data)
        except Exception as ex:
            logger.error("任務處理失敗")
            logger.exception(ex)

# 呼叫任務
process_long_task.send(data)
```

### 業務邏輯組織

1. `views.py` 中的路由處理應保持精簡，並將業務邏輯委託給 `actions.py`
2. `actions.py`實現邏輯時，務必參考相同檔案裡其他內容，看是否有函式可以引用，或是相同的開發 pattern 可以模仿，另外有時共用的函式可能在相同模組或是其他模組的`service.py`。例如，開發`api_course/actions.py` 時可以使用 `api_course/service.py` 或 `api_user/service.py` 的共用函式。
3. 所有資料庫操作都應在 `actions.py` 中
4. 使用 `@inject_db` 裝飾器處理資料庫會話，函式包含寫入時使用 `DBName.DEFAULT`，純查詢時使用 `DBName.READ_ONLY`
5. 使用 `@log_func_args` 裝飾器進行函數參數日誌記錄
6. 其他api錯誤處理使用`components/fastapi/exceptions.py`裡的類別，若是不足請提出建議或增加相應錯誤類別，但處理結構不變
7. `@transactions`裝飾器會建立transaction，並在離開函式時commit，若有exception會rollback
8. 若是有query出來物件要修改，在修改完之後不用呼叫add，直接呼叫commit即可
9. 若是回傳是物件


### 傳輸串接資料模型

1. 在 `serializers.py` 中使用 Pydantic 模型：
   - 輸入驗證（使用 InModel 後綴）
   - 輸出序列化（使用 OutModel 後綴）
   - 預設以繁體中文撰寫 `Field(title="...")` 的描述文字；如屬業界標準技術名詞或跨系統既有欄位，可使用英文，但同一模型內需維持風格一致，必要時可採「英文名詞 + 中文說明」。
   - 使用適當的欄位預設值和驗證
   - 每個API獨立使用一組InModel
   - OutModel則需要另外判斷，要先搜尋是否是需要統一對外結構的內容決定是否共用
2. 不只是對外傳輸，包括若是程式內呼叫要是有明確結構，也都要建立對應的model放在對應的module的serializers.py中，要建立前務必先尋找是否有適用的model可以使用，避免使用dict物件呼叫，造成不易維護與理解
3. 分頁查詢模型: 
   - 列表查詢的輸入使用 `OffsetPageInModel` 作為基底類別
   - 列表輸出使用 `OffsetPageOutModel[具體OutModel]` 格式
   - OffsetPageInModel 包含 offset 和 limit 參數用於分頁控制
4. 欄位描述語系: `Field.title` 預設使用繁中描述；技術名詞/對外既有英文契約可用英文，務必在同一模型內保持一致。
5. 資料驗證: 善用 Pydantic 的驗證功能，包含格式、範圍、必填等驗證
6. 建立欄位時，一律使用關鍵字參數方式指定參數

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
4. 一個table在專案裡只會存在於一個models.py中

### 資料庫查詢

1. 使用 SQLAlchemy 進行資料庫操作
2. 使用 joins 組織複雜查詢
3. 對經常查詢的欄位使用適當的索引
4. 始終處理記錄可能不存在的情況
5. 檢查查詢效率，提出可能的負載風險
6. **裝飾器使用規範**:
   - `@inject_db(DBName.DEFAULT)` 或 `@inject_db(DBName.READ_ONLY)` 用於注入資料庫會話
   - `@transactions` 用於需要事務控制的操作（通常用於寫入操作）
   - `@log_func_args` 用於記錄函式參數到日誌
   - 裝飾器順序: @inject_db -> @transactions -> @log_func_args
7. **分頁查詢**: 使用 `OffsetPaginator` 進行分頁處理，回傳 `OffsetPageOutModel` 格式

範例：
```python
@inject_db(DBName.READ_ONLY)
@log_func_args 
def get_course_list(inputs: CourseListInModel, db: Session):
    query = (
        db.query(NabiResource, Nabi3rdCourse, ResourceSocialCount)
        .join(Nabi3rdCourse, Nabi3rdCourse.resource_id == NabiResource.resource_id)
        .outerjoin(
            ResourceSocialCount,
            ResourceSocialCount.resource_id == NabiResource.resource_id,
        )
        .filter(NabiResource.disable == 0)
        .order_by(NabiResource.view_count_7.desc())
    )
    
    paginator = OffsetPaginator(query)
    return paginator.page(inputs.offset, inputs.limit)
```

### 錯誤處理

1. API 錯誤使用 `components.fastapi.exceptions` 中的適當錯誤類
2. raise error 必須指定 error_code, error_message, loc=locate_error_place()
3. error_code 來自 `app/error_code.py`
4. error_message 必須提供該情境的錯誤描述
5. loc 使用 `components.utils.locate_error_place()` 指定錯誤位置
6. **常用錯誤類別**:
   - `NotFoundError`: 資源不存在 (404)
   - `AlreadyExistsError`: 資源已存在 (409) 
   - `InputValidationError`: 輸入驗證錯誤 (422)
   - `BusinessRuleError`: 業務邏輯錯誤 (400)
   - `UnauthorizedError`: 未授權 (401)
   - `ForbiddenError`: 禁止存取 (403)
7. exception 即使有處理也要印出錯誤與關鍵參數

### 快取運作
1. 實作快取時，注意該情境是否有空值狀態，避免快取穿透，尤其是搜尋之類或需要大量查詢的運作要注意


行為流程錯誤範例：
```python
from app import error_code
from components.utils import locate_error_place
from components.fastapi.exceptions import NotFoundError

if not user:
    raise NotFoundError(
        error_code=error_code.NOT_FOUND,
        error_message="使用者不存在",
        loc=locate_error_place()
    )
```
exception處理範例：
```python
    except Exception as ex:
        logger.error(f"send_bulletin_notify error, bulletin={b}")
        logger.exception(ex)
```

### 快取策略

1. 使用 Redis 快取頻繁訪問的資料
2. 在資料變更時實現快取失效
3. 快取金鑰應遵循專案的命名約定
4. 快取實現細節應在 `services/cache/actions.py` 中
5. **快取模式**:
   - get_xxx_cache() 用於取得快取資料
   - set_xxx_cache() 用於設定快取資料
   - 快取失效通常在相關資料更新的 service 或 actions 中處理
6. **快取命名規則**: 使用模組名稱_功能_cache 格式，如 `room_promote_cache`

範例：
```python
from services.cache.actions import get_room_promote_cache, set_room_promote_cache

# 先嘗試從快取取得
cached_data = get_room_promote_cache(room_id)
if cached_data:
    return cached_data

# 快取不存在時查詢資料庫
data = db.query(...).all()
# 設定快取
set_room_promote_cache(room_id, data)
return data
```

### 認證與授權

1. 使用適當的裝飾器進行認證
2. 始終驗證使用者權限
3. 使用 `pid`（人員 ID）進行使用者身份識別
4. /crm的path需要使用fastapi的Depends`verify_csr`來驗證身份
5. **APIM API**: 需要使用 Basic Authentication 或 Token 驗證
6. **一般用戶API**: 通常透過 pid 參數傳遞用戶身份，但不在後端驗證其身份，只有商務規則查詢時加入條件，避免查到不屬於該用戶可見範圍的資料
7. **CRM管理API**: 必須使用 `Depends(verify_csr)` 進行後台人員驗證

範例：
```python
from fastapi import Depends
from app.auth import verify_csr

@router.post("/admin/data")
def get_admin_data(
    inputs: DataInModel,
    auth_info: dict = Depends(verify_csr)
):
    # 後台管理功能
    pass
```

### 常數和列舉

1. 在每個模組的 `constants.py` 檔案中保存常數
2. 對預定義的值集使用列舉類別
3. 為每個常數/列舉值包含描述性註釋

### 日誌記錄

1. 使用 `@log_func_args` 裝飾器進行函數參數日誌記錄
2. 為重要操作建立適當的日誌訊息
3. 包含適當的日誌級別（INFO、WARNING、ERROR）
4. log有固定pattern，在需要log的檔案中加入 `logger = logging.getLogger(__name__)`，在需要log的地方使用logger.info/warning/error/debug等
5. 機敏資料不能出現在info以上等級
6. **日誌使用規範**:
   - 函式層級: 使用 `@log_func_args` 裝飾器自動記錄輸入參數
   - 手動日誌: 在關鍵邏輯處使用 logger.info/warning/error 記錄
   - 例外處理: 使用 logger.exception(ex) 記錄完整錯誤堆疊
7. 語言：日誌訊息可依現有 pattern 使用英文或中英混用；對外錯誤訊息以中文為主。
範例：
```python
import logging
from components.logging.decorators import log_func_args

logger = logging.getLogger(__name__)

@log_func_args
def process_data(user_id: int):
    logger.info(f"開始處理用戶資料，用戶ID: {user_id}")
    try:
        # 處理邏輯
        result = do_something()
        logger.info("資料處理完成")
        return result
    except Exception as ex:
        logger.error("處理資料時發生錯誤")
        logger.exception(ex)
        raise
```

### 測試規範
目前沒有任何的功能測試被建立，也暫時沒有需求


## 專案特定約定


### 共用的組件
以下是 `components/` 目錄下一些重要的共用模組：
1. **時間工具**: `components/utils/time_utils.py` - 處理時間計算、格式轉換等。
2. **錯誤定位**: `/components/utils/__init__.py` - 用於 `raise ... loc=` 的工具。
3. **輸入驗證**: `components/utils/verify_input.py` - 提供額外的資料驗證函式。
4. **分頁器**: `components/sqlalchemy/paginator.py` - 處理資料庫查詢的分頁邏輯。
5. **認證工具**: `app/auth.py` - 包含 `verify_csr` 等認證相關函式。
6. **例外類別**: `components/fastapi/exceptions.py` - 定義了所有自訂的 API 例外。

### crm
1. 所有ap_crm相關的命名邏輯如下： `api_crm/{module name}/`
2. crm的路由都要加上 operator_info=但是在api件(verify_csr)
``` python
@router.get(
    "/{bulletin_id}",
    name="系統公告-取得系統公告資訊",
    description="取得系統公告資訊",
    response_model=SuccessModel[BulletinOutModel],
)
def get_bulletin(bulletin_id: int = Path(..., title='系統公告編號'), operator_info=Depends(verify_csr)):
    result = actions.get_bulletin(bulletin_id)
    return ApiOutputModel.serialize_success(result)
```

### 信件模組
1. 所有信件相關的邏輯應位於 `api_ap/mail/` 資料夾中
2. 使用 `mail_tasks.py` 處理非同步信件發送
3. 使用 `link_service.py` 處理取得開信連結的規則
4. 信件模板在 `services/emails/templates`
5. 姓名統一使用中台或系統DB內的nickname，內容是完整姓名，不使用ac name作為來源

#### 信件模板html筆記
1. 在微軟outlook無法直接用a tag包table，要放在tr裡面才會生效
* vs code直接複製變數內容出來的html經過換行處理寄信時會有異常，gmail收信版型會爛掉

## 重要開發規範補充

### 命名原則
1. 優先參考相關功能的命名，避免創造新的詞彙
2. 不再使用capabilty這個詞，改用ability
3. 避免使用id作為變數名稱,改用`{entity}_id`，如`user_id`, `course_id`
4. 複數避免使用s結尾，改用`{entity}_list`，如`user_list`, `course_list`

### 模組架構約定
2. **檔案結構標準**:
   - `views.py`: FastAPI 路由定義，保持簡潔，委派給 actions
   - `actions.py`: 業務邏輯實現，資料庫操作的主要入口
   - `serializers.py`: Pydantic 模型定義，包含輸入/輸出驗證
   - `models.py`: SQLAlchemy 資料庫模型定義
   - `constants.py`: 常數和列舉定義
   - `service.py`: 共用業務邏輯和工具函式
   - `tasks.py`: Dramatiq 非同步任務定義
3. **跨模組引用**: 優先使用相同模組內的 service，其次考慮其他模組的 service

### 資料庫連線管理
1. **資料庫選擇**:
   - `DBName.DEFAULT`: 用於寫入操作
   - `DBName.READ_ONLY`: 用於純查詢操作，減少主庫負載
2. **會話管理**: 統一使用 `@inject_db` 裝飾器注入，不手動管理連線
3. **事務控制**: 寫入操作必須使用 `@transactions` 裝飾器

### 效能最佳化指導
1. **查詢優化**:
   - 使用 `joinedload` 或 `selectinload` 預載入關聯資料，避免 N+1 查詢。
   - 適當使用 `outerjoin` 處理可能為空的關聯。
   - 對大量資料查詢考慮分頁處理。
   - 查詢請明確列出所需欄位或使用 options(load_only(...))，避免 ORM 預設載入造成多餘資料造成效能問題
2. **快取使用**:
   - 靜態或變動頻率低的資料應使用 Redis 快取
   - 快取鍵命名應具有業務意義且避免衝突
3. **資料庫索引**: 針對頻繁查詢的欄位確保有適當索引

### 程式碼品質要求
1. **型別標註**: 所有函式參數和回傳值必須有明確型別標註
2. **文件註釋**: 複雜業務邏輯需要適當的中文註釋說明
3. **函式設計**: 單一函式責任明確，避免過長的函式
4. **變數命名**: 使用有意義的英文命名，避免縮寫

### 其他語法規範
1. json dump一率加上ensure_ascii=False

``````

---

感謝Jack協助優化
``````
# Git Commit Message 生成規則

## 輸出格式（嚴格遵守）
```
feat: <單號> <任務名稱>
<變更記錄>
```

## 規則說明

### **單號提取**
- 從分支名稱提取，格式：`分支類型/單號`
- 範例：`feature/NABI-543` → 單號為 `NABI-543`
- 若無法提取則使用 `UNKNOWN`

### **任務名稱**
- 優先使用提供的任務描述
- 若無提供則使用預設格式：`功能開發` 或 `程式修改`

### **變更記錄格式**
```
<序號>. <類型>: <模組> <說明>
```

#### **類型定義**
- `新增`：新建檔案，新的函式，新的API，新的Model
- `修改`：修改現有檔案，修正錯誤，優化邏輯

#### **模組命名規則**
| 路徑範例                    | 模組名稱              |
| --------------------------- | --------------------- |
| `api_ap/ability/*.py`       | `api_ap/ability`      |
| `api_user/*.py`             | `api_user`            |
| `services/notify_v2/*.py`   | `services/notify_v2`  |
| `frontend/components/*.js`  | `frontend/components` |
| `database/migrations/*.sql` | `database/migrations` |

**規則**：取到倒數第二層目錄，去除檔案名稱

#### **說明撰寫**
- 每項不超過 15 字
- 描述功能異動，非技術細節
- 同模組可分多項說明

## 範例輸出

### 範例 1：功能開發
```
feat: NABI-543 新增技能管理功能
1. 新增: api_ap/ability 技能匯入API
2. 修改: ability 增加類型欄位  
3. 修改: ability 資料過濾邏輯
```

### 範例 2：修復問題
```
feat: NABI-789 修正使用者驗證
1. 修改: api_user 修正登入邏輯
2. 修改: services/auth 加強安全驗證
```

### 範例 3：複雜變更
```
feat: NABI-456 優化通知系統
1. 新增: services/notify_v2 建立新通知服務
2. 修改: api_user 整合通知功能
3. 修改: frontend/components 更新通知顯示
4. 修改: database/migrations 新增通知表格
```

## 約束條件
- 必須嚴格按照格式輸出
- 序號從 1 開始遞增
- 每個有變更的模組都必須列出
- 若資訊不足，使用預設值而非跳過
- 變更記錄依模組類型分組排列（新增在前，修改在後）

## 輸出前檢查清單
- □ 格式是否正確
- □ 單號是否正確提取
- □ 所有變更模組是否都已列出  
- □ 說明是否簡潔明瞭（25字內）
- □ 序號是否連續遞增

## 錯誤處理
- 分支名稱格式錯誤 → 使用 `UNKNOWN` 作為單號
- 無任務描述 → 使用 `功能異動` 作為預設
- 無法解析模組 → 使用完整路徑
- 空的變更清單 → 輸出 `無程式異動`
``````