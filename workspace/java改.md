yin039578: 請幫我翻寫Java的API到python專案
1. 翻寫getFavoriteJob, updateJobFavorite
2. 程式放在python專案的api_job模組內
3. 邏輯與基本原則不變，但是語法與邏輯可以優化，命名方式以python慣例為主
4. 優先參考api_job模組內現成函式運作方式作為改寫參考
5. 先幫我逐行爬梳並簡化說明他做的事情有哪些，並說明改寫計劃與我討論

GitHub Copilot: Optimizing tool selection...我要先在 Java 專案（`104learn-nabi-backend`）中尋找與 getFavoriteJob 和 updateJobFavorite 相關的程式，抓出它們的實作以便逐行解析與擬定 Python 改寫計畫。接著會回報我找到的重點、將如何映射到 api_job 模組，以及下一步要做的檔案修改。現在我會搜尋 Java 專案中的相關符號與文字。 

Searched codebase for "getFavoriteJob|updateJobFavorite|favorite job|update favorite job|getFavorite|updateFavorite", 12 results

我要讀出 Java 的 JobFitServiceImpl.java 中 `getFavoriteJob` 與 `updateJobFavorite` 的完整實作，逐行拆解邏輯與行為，再提出 Python 改寫計畫（會對應到 api_job 模組）。接下來我會讀取該檔案的相關範圍。 

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104learn-nabi-backend/src/main/java/com/e104/nabi/service/JobFitServiceImpl.java)

接下來我會讀取 Python 專案中 api_job 模組的 actions.py、`views.py`、`service.py` 和 `serializers.py`，以便依既有風格擬定改寫細節與放置位置。這是為了確保改寫符合專案既有的 patterns。 

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_job/actions.py)

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_job/views.py)

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_job/serializers.py)

我剛讀了 Java 的 JobFitServiceImpl.java（包含 `getFavoriteJob`, `updateJobFavorite`、`transferJobFitModel`、`checkJobApplicable`）和 Python 的 api_job 模組（actions.py, views.py, serializers.py, models.py），有足夠資訊撰寫逐行說明與改寫計畫。下面先列出 Java 兩個 API 的逐行簡化說明，接著提出 Python 改寫計畫（會列出要新增/修改的檔案與函式，並指出已存在的對應功能與替代呼叫）。請確認計畫或提出需求細節（例如 API 路徑/response model 是否要保持完全一致）後我就開始實作。
## 我接下來要做的事
我已經讀過 Java 的 JobFitServiceImpl.java（包含 `getFavoriteJob`、`updateJobFavorite`、`transferJobFitModel`、`checkJobApplicable`），也讀過 Python 專案的 api_job 模組（actions.py、views.py、serializers.py、models.py）。下面先把 Java 兩個 API 做逐行（或逐段）簡化說明，然後提出 Python 改寫計畫與 mapping。請確認改寫計畫後我會直接在 api_job 模組內實作。

---

## Java: getFavoriteJob — 簡化逐段說明
方法簽章: public ApiResult getFavoriteJob(String jsonBody, String actorId)

1. 建立 ApiResult、NabiParam 物件。
2. 檢查輸入 jsonBody 是否為空或不能解析成 JSON。
   - 若錯誤，加入 ApiError 並回傳 result。
3. 將 JSON 轉為 Map，然後用 BeanUtils.populate 填入 NabiParam（這個 param 包含 pid、recFrom、requestLength 等）。
4. 使用 ParamValidateUtil 檢查欄位格式：
   - pid（必填）、recFrom、requestLength、actor_id（可選但格式長度檢查）。
   - 若有錯誤則回傳 result。
5. 設定 recFrom/requestLength 預設值：
   - recFrom 預設 "1"
   - requestLength 預設 "10"
6. 呼叫 AC 服務取得 idno: idnoNum = acApiApimService.getIdnoByPid(pid)
7. 使用 DAO 取得該 pid 收藏總數： totalCount = nabiJobFavoriteDao.queryFavoriteCntByPid(pid)
   - result.addMeta("totalRows", totalCount)
   - result.addMeta("recFrom", recFrom)
8. 如果 totalCount == 0 或 recFrom > totalCount：
   - 回傳空 list，meta: resultRows=0, nextFrom=-1
9. 否則計算 offset、rowCount、nextFrom，呼叫 DAO 查詢分頁收藏資料：
   - favoriteList = nabiJobFavoriteDao.queryByPid(pid, offset, rowCount)
   - 如果 empty => 如上回傳空 list (resultRows=0, nextFrom=-1)
10. 若有資料：
    - resultRows 設為 favoriteList.size()
    - nextFrom 比較 totalCount 決定是否設為 -1 或數字
    - 呼叫 transferJobFitModel(favoriteList) 把 DB model (NabiJobFavorite) 轉成 JobFitModel（取出 resume_fit_json）
    - 呼叫 checkJobApplicable(idnoNum, jobFitList) 來檢查是否已經應徵（會更新 jobFitList 中 isAlreadyApplied flag）
    - result.data = jobFitList
11. 回傳 result。

補充：transferJobFitModel 的主要步驟
- 從 favoriteList 中取 jobno list。
- 呼叫 jobOnSearchService.getJobsByJoblist(jobnoList) 取得現存職缺列表 (Job)。
- 比對 jobno，建立 existJobnoList。
- 對每個 favorite：從 favorite.resumeFitJson 反序列化成 JobFitModel，根據 existJobnoList 設定 offline 欄位，若 offline 狀態改變則呼叫 nabiJobFavoriteDao.updateOfflineStatus(favorite.id, new_offline)。
- 回傳 List<JobFitModel>。

補充：checkJobApplicable 的主要步驟
- 從 jobFitList 篩出 offline==0 的 jobno。
- 如果沒 jobnos，直接 return。
- 呼叫 applyApiService.jobsCheckApplicable(idno, jobnos) 取得各 job 的 applicable 訊息。
- 從結果中找出 applicableStatus == 10108（代表已應徵）的 jobno list。
- 把 jobFitList 中那些 jobno 的 jobFit.setIsAlreadyApplied(true)。

---

## Java: updateJobFavorite — 簡化逐段說明
方法簽章: public ApiResult updateJobFavorite(String jsonBody)

1. 建立 ApiResult、NabiParam 物件。
2. 檢查輸入 jsonBody 是否為空或不能解析成 JSON。
   - 若錯誤，回傳 ApiError。
3. 用 BeanUtils.populate 填充 param。
4. 使用 ParamValidateUtil 驗證輸入欄位：
   - pid（必填）、jobno（必填 int）、favoriteState（必填且為 0/1）。
5. 如果 favoriteState == 1（要新增收藏），先檢查 job 是否存在（呼叫 jobOnSearchService.getJobByJobno(jobno)），若不存在加入 NotExist error。
6. 如果驗證有錯誤，回傳 result。
7. 取得該 pid 之前針對該 jobno 的收藏紀錄：
   - favoriteList = nabiJobFavoriteDao.queryByPid(pid, jobno)
8. 如果 favoriteState == 0（取消收藏）：
   - 如果 favoriteList 非空，對每個 favorite 呼叫 nabiJobFavoriteDao.delete(favorite.id)
9. 如果 favoriteState == 1（新增收藏）：
   - 如果 favoriteList 為空（沒收藏過），則：
     - 取得 idno = acApiApimService.getIdnoByPid(pid)
     - 計算履歷符合度： jobFit = jobFitHandler.getJobFitForLogin(jobno, pid, idno)
     - resumeFitJson = JsonUtil.toJson(jobFit)
     - 建立 NabiJobFavorite 實例 m，設定 pid、jobno、hard_skill_pr、soft_skill_pr、resume_fit_json、inputdate、fit_update_time、offline=0
     - 嘗試 insert；如果 DuplicateKeyException 則忽略（可能同時間多次插入），其它例外發送錯誤信
10. 最後 result.data = {"result":"true"} 並回傳。

---

## 重要行為與副作用總結
- 讀取收藏：有分頁、回傳 totalRows/recFrom/resultRows/nextFrom，資料為 JobFitModel（來源是儲存在 nabi_job_favorite.resume_fit_json），在回傳前會檢查職缺是否仍存在並更新 offline 標記與資料表。
- 檢查可應徵：會呼叫 applyApiService API，並標記 isAlreadyApplied。
- 更新收藏：新增收藏會計算履歷符合度（jobFitHandler），並建立資料表紀錄；刪除會直接 delete 對應紀錄。
- 同時寫入可能會碰到 DuplicateKeyException（Java code 忽略它）。

---

## Python 改寫計畫（mapping 與具體檔案）
我建議把兩個 API 實作放在 actions.py，並在 views.py 裡新增對應的路由（或若專案路由慣例較為集中，也可在 views 做 minimal wrapper），並在 serializers.py 新增 input/output model。

已確認可重用/對應的 Python 功能：
- 取得 idno: 在 actions.py 已有 import get_user_idno_with_cache（components.e104.api.ac.apim_actions.get_user_idno_with_cache）。
- JobOn 的使用：已有 `JobOn` class 在 `components.e104.api.search.jobon.jobon`，並在現有 `get_saved_jobs` 用過 `get_jobs_by_joblist`。
- NabiJobFavorite SQLAlchemy model: models.py 已有 `NabiJobFavorite`。
- 需呼叫 apply API：在 Java 為 `applyApiService.jobsCheckApplicable(idno, jobNos)`，應確認 Python 是否已有對應呼叫（搜尋 workspace）。（如果沒有，我們可以重用 `components.e104.api` 下的 apply API 或自己實作一個簡易 wrapper；我先假設存在一個叫做 `apply_api` 或類似服務；如沒有就須增加一小個 wrapper呼叫 external API — 我會先搜尋或提出選項）
- JSON <-> Pydantic mapping: resume_fit_json 在 DB 已以 Text 存放，Python 需使用 json.loads / pydantic parse。

要修改/新增的檔案（建議）
1. serializers.py
   - 新增 GetFavoriteJobInModel（包含 pid、recFrom、requestLength）
   - 新增 JobFitModel Pydantic（或重用現有若有） - 如果專案已有 JobFitModel，請指出；否則需要一簡版 Pydantic 來序列化 resume_fit_json 的內容（或直接回傳 dicts）。
   - 新增 UpdateJobFavoriteInModel（pid, jobno, favoriteState）
   - 新增 UpdateJobFavoriteOutModel（result: str）或直接回傳 SuccessModel[dict]
2. actions.py
   - 新增 get_favorite_jobs(inputs: GetFavoriteJobInModel, db: Session) — 加上 @inject_db(DBName.READ_ONLY) 或 READ_ONLY/DEFAULT 視 DAO 使用。
     - 功能映射：
       - 驗證輸入（pid 必填、recFrom/requestLength 預設）
       - 使用 SQLAlchemy 去 query totalCount（count by pid）
       - 分頁查詢 favorites（需 DAO 等價：用 db.query(NabiJobFavorite).filter(...).order_by? limit offset）
       - 轉換 favorites -> job_fit_list：從 favorite.resume_fit_json 反序列化（json.loads），並使用 JobOn 客戶端確認 job 是否存在（client.get_jobs_by_joblist），並更新 offline（如果狀態改變，呼叫 update offline → 這需要一個 update query）
       - 呼叫 apply API 檢查是否已應徵（需找或新增 wrapper）
       - 回傳結構包括 meta: totalRows, recFrom, resultRows, nextFrom, data
   - 新增 update_job_favorite(inputs: UpdateJobFavoriteInModel, db: Session) — 需要 DB write（inject_db(DEFAULT) 並可能使用 `@transactions` 裝飾器 if available）
     - 驗證欄位 (pid, jobno, favoriteState 0/1)
     - 如果 favoriteState==1 檢查 job 存在（用 JobOn.get_job_by_jobno 或相近）
     - 查詢現有紀錄： db.query(NabiJobFavorite).filter(pid==..., jobno==...).all()
     - 如果 favoriteState==0： 刪除所有紀錄（db.delete）
     - 如果 favoriteState==1 且沒有紀錄：
       - 取得 idno via get_user_idno_with_cache
       - 計算 job fit（需要 `job_fit_handler.get_job_fit_for_login` 等） — 我需確認 Python 有沒有 `job_fit_handler` 等 service。若沒有，我們可以 call existing Python equivalent 或直接 reuse某 service。若完全沒有，可能需只存入空的 resume_fit_json/null or raise TODO。 我先搜尋 Python 專案是否有 job fit handler。
       - 建立 NabiJobFavorite 並插入；處理重複鍵例外（IntegrityError）忽略；其它例外發郵件（看專案有 mail service wrapper）
     - 回傳 {"result":"true"}

3. views.py
   - 新增路由：
     - POST /getFavoriteJob -> 參考 Java 為 POST body JSON 與 actor_id query param，Python 可沿用 body JSON 和 optional actor_id query param。
     - POST /updateJobFavorite -> 接受 body JSON。

4. 可能需要在 `api_job/service.py` 或 components 裡新增 wrapper：
   - apply_api.jobs_check_applicable(idno, jobnos)
   - job_fit_handler.get_job_fit_for_login(jobno, pid, idno)（如果已存在，可呼叫現成）。
   我會先在 code 中搜尋是否已存在 apply 或 jobfit 服務的 Python wrapper，若找不到會提出兩個選項：a) 寫一 minimal wrapper（呼叫外部 API），或 b) 在初期實作中把 jobFit 計算留空（或返回 None）並標記 TODO。

---

## 具體行為對應（Java -> Python）
- acApiApimService.getIdnoByPid(pid) -> components.e104.api.ac.apim_actions.get_user_idno_with_cache(pid)
- nabiJobFavoriteDao.queryFavoriteCntByPid(pid) -> db.query(NabiJobFavorite).filter(...).count()
- nabiJobFavoriteDao.queryByPid(pid, offset, rowCount) -> db.query(NabiJobFavorite).filter(...).offset(offset).limit(rowCount).all()
- nabiJobFavoriteDao.queryByPid(pid, jobno) -> db.query(...).filter(pid==..., jobno==...).all()
- nabiJobFavoriteDao.delete(id) -> db.query(NabiJobFavorite).filter(NabiJobFavorite.id==id).delete()
- nabiJobFavoriteDao.insert(m) -> db.add(instance); db.commit()
- nabiJobFavoriteDao.updateOfflineStatus(id, new_offline) -> db.query(...).filter(...).update({NabiJobFavorite.offline: new_offline})
- jobOnSearchService.getJobsByJoblist(jobnoList) -> JobOn().get_jobs_by_joblist(jobno_list)（已在 Python actions 使用）
- jobOnSearchService.getJobByJobno(jobno) -> JobOn().get_job(jobno) 或相似（需查實作）
- applyApiService.jobsCheckApplicable(idno, jobNos) -> 需找對應 wrapper或實作

---

## 權衡與假設（需要你確認）
1. job fit 計算（Java 使用 jobFitHandler.getJobFitForLogin）：
   - 我在 Python codebase 尚未找到等價的 jobFitHandler（需要我額外搜尋），若不存在，我需要你同意其中一個選項：A) 實作 minimal placeholder（例如 call external service if available）或 B) 先把 resume_fit_json 存成空的 dict/簡單結構，標注 TODO。
2. applyApiService（jobsCheckApplicable）：
   - 我會先搜尋 Python 是否已有 apply API wrapper；若沒有，需你決定是否允許我新增一個呼叫外部的 wrapper（會需要 API endpoint 資訊）或先略過此功能（但會少了 isAlreadyApplied 標記）。
3. API route 與 response model：
   - Java 返回 ApiResult（含 meta 與 data）。Python 專案多數路由使用 `SuccessModel[T]`。我會維持相同的 meta fields（在 response header body 的 meta 中）以符合現有 pattern（例如使用 ApiOutputModel.serialize_success 包裝）。請確認是否要完全 match Java 的 meta key 名稱（如 totalRows, recFrom, resultRows, nextFrom）。

---

## 下一步（待你確認）
- 請確認上面三個點（特別 jobFit 與 apply API 的可用性與是否要等價實作）。
- 是否需要我直接開始實作（我會先在 actions.py 增加兩個函式並在 serializers.py 新增 input models，然後在 views.py 放 route 並執行本地 lint/typecheck）？
- 若同意，請回覆「開始實作」，或告訴我你希望在 jobFit 或 applyApi 的處理上採哪個選項（A/B）。

---

## 我已完成的閱讀 / 進度摘要
- 讀取並分析 Java JobFitServiceImpl.java（包含 getFavoriteJob, updateJobFavorite, transferJobFitModel, checkJobApplicable）。
- 讀取 Python api_job 的 actions.py, views.py, serializers.py, models.py，確認現有可重用的方法（如 JobOn 客戶端、get_user_idno_with_cache、NabiJobFavorite model）。
- 已擬定改寫計畫與對應 mapping，並列出需要新增/修改的檔案與假設。

等你確認我要採用的選項或直接回覆「開始實作」，我就會開始在 api_job 模組裡編寫對應的 Python 實作並跑基本的檢查（lint/typecheck、簡單單元測試或 smoke test）。

yin039578: 函式命名請幫我在最小改動的情況下符合我的python專案慣性
1.把 Java getJobFit的API內容也納入翻寫範圍，包含共用邏輯的部分也一起翻寫
2.applyApiService 需要新增一個呼叫外部的 wrapper，放在components/e104/api/apply
3.回應model外層請幫我用python的，但內層資料結構要維持

請幫我review上面三個回答是否合適與完整


GitHub Copilot: 我將快速檢查專案中是否已有類似的 external API wrapper 實作風格（components.e104.api 目錄下），以便提出具體的檔案/函式樣板與命名建議；接著回報檢查結果與完整改寫計畫。這會是只做 read-only 的搜尋。 

Searched text for `components.e104.api`, 100 results

我將搜尋專案中是否已有 job fit 的處理（jobFitHandler、job_fit、JobFitModel 等），以及現有 components/e104/api 下的 wrapper 命名慣例，來驗證你的三點需求是否可行並提出實作細節與風險。這是只做 read-only 的搜尋。 

Searched text for `JobFitModel|job_fit|jobFitHandler|getJobFit|get_job_fit|JobFit`, 200 results

Searched text for `jobFit|job_fit|JobFitHandler|get_job_fit|JobFit`, 200 results

我會再確認 Python 專案中是否已經有 job fit 的 handler 或 apply API 的 wrapper，這樣可以決定要不要新增或直接呼叫既有服務。我要做兩個快速、只讀的搜尋：1) 搜尋 job fit 相關符號 2) 搜尋 apply API wrapper 是否存在。結果會告訴我們是否需要新增文件與功能。 

Searched text for `jobfit|JobFit|get_job_fit|job_fit_handler|JobFitModel`, 200 results

我會就你要求的三點（把 Java 的 getJobFit 納入、建立 apply API wrapper、外層使用 Python 回應但內層資料結構不變）做逐項審核回覆，指出我已檢查到的狀態、假設、缺口、風險，以及一個可執行的實作細節/檔案清單和命名建議（以最小改動符合專案慣例）。讀取與搜尋步驟已完成，下面直接報告結果與建議。

## 總結（結論先行）
- 整體方向合適：把 Java 的三個主要功能（getJobFit、getFavoriteJob、updateJobFavorite）翻寫到 api_job 模組是合理的；也應該新增 `components/e104/api/apply` 作為 applyApi wrapper，符合現有 components/e104/api 的實作風格。
- 但有兩個重要缺口需要你確認或補給資訊，否則無法完成等價翻寫：
  1. Python 專案裡沒有發現等價的 jobFitHandler（計算「履歷符合度」的邏輯）。Java 使用 `JobFitHandler` 做大量邏輯與 cache。要忠實還原，有兩個選項：a) 將 Java 的 jobFitHandler 邏輯（與其依賴）移植到 Python（工作量大），或 b) 新增一個外部 API wrapper 呼叫現有 Java service（較小改動）。你要選哪個？
  2. applyApiService（jobsCheckApplicable）的 wrapper 在 Python 專案目前沒有；你要求要新增，這部分沒有障礙，我可以新增 `components/e104/api/apply` wrapper 來呼叫外部 API（需知道實際 endpoint 或依照既有 APIM wrapper 的配置）。
- 對回應 model 的要求可滿足：外層使用專案現有的 SuccessModel/ApiOutputModel 包裝；內層資料保留 Java 的結構（直接回傳從 DB 的 `resume_fit_json` 反序列化為 dict 或用 Pydantic model 映射），兩者都可以達成。我建議在初期直接保留內層為 dict（最少改動且保留原始結構），日後如需更嚴格型別再建立 Pydantic `JobFitModel`。

---

## 我檢查到的現況（關鍵證據）
- Java side:
  - `JobFitServiceImpl` 包含 `getJobFit`, `getFavoriteJob`, `updateJobFavorite`。`updateJobFavorite` 與 `getFavoriteJob` 都會呼叫 `jobFitHandler.getJobFitForLogin` 與 `applyApiService.jobsCheckApplicable`。
  - `jobFitHandler` 與 `JobFitModel` 在 Java codebase 中非常完整（有 cache、組裝 skill fit、NCC/DTT 等邏輯）。
- Python side (你的 repo):
  - models.py 已有 `NabiJobFavorite`（對應 DB table）。
  - actions.py, views.py, serializers.py 已存在某些職缺功能（recommend, saved jobs），並使用 `JobOn` 與 `get_user_idno_with_cache`。但沒有 jobFitHandler 等等價邏輯。
  - 現有 components.e104.api 目錄下有許多 APIM wrapper 的範例（APIM pattern 存在），可參考來建立 `components/e104/api/apply` wrapper。

---

## 具體需求/缺口說明（須你決定）
1. jobFitHandler 的處理（必須決定）：
   - 選項 A（建議短期）：新增一個外部 job-fit wrapper（例如 api.py）呼叫 Java 的 job-fit service（若公司已有該 service）。這最省力、風險低。
   - 選項 B（較長期）：把 Java `JobFitHandler` 的邏輯完整移植成 Python（需翻譯大量業務邏輯、cache、能力匹配等），工作量大且需 extensive testing。
   - 我目前在 repo 沒有找到等價的 Python job fit handler，請告知你偏好 A 或 B，或給我要呼叫的 job-fit API endpoint（若選 A）。
2. apply API wrapper：
   - 我會新增 api.py（或 `components/e104/api/apply/apply_api.py`），並實作 `class ApplyAPI(APIM)` 與 method `jobs_check_applicable(idno: int|None, jobnos: List[int]) -> List[dict]`。需要外部 API path 與權鑰或採用既有 APIM 設定方式（若已有 conventions，我會直接複製 pattern）。
3. 回應 model：
   - 外層用 `SuccessModel[...]`（現有 pattern），內層暫以 dict（從 `resume_fit_json` decode 成字典）回傳以保留 Java 內部結構。若要嚴格 Pydantic mapping，需提供或同意要實作的 JobFit 欄位清單。

---

## 實作計畫（最小改動 + 符合專案慣例）
下面列出我要做的檔案/函式變更（請確認 job-fit 處理選項）。

A. serializers.py (新增 input model & outputs)
- 新增 `GetFavoriteJobInModel(OffsetPageInModel)`：
  - fields: pid: int, recFrom: Optional[int] or string?（Java 用字串，但 Python 專案偏用 int）；為最小改動建議維持 `recFrom: int = Field(default=1)`、`requestLength: int = Field(default=10)`。
- 新增 `UpdateJobFavoriteInModel`：
  - pid: int, jobno: int, favoriteState: int (0/1)
- 對 JobFit 的內層：暫不新增嚴格 Pydantic model，內層維持 dict。若要逐欄型別化，我會再建立 `JobFitModel`。

B. actions.py（主要新增）
- 函式命名（最小改動但 Python 慣例）：
  - Java getJobFit -> Python `get_job_fit`（actions 層），views route wrapper 名稱可保留 `/getJobFit/{jobno}` 路徑（專案中路徑命名不是完全 snake_case）。
  - Java getFavoriteJob -> Python `get_favorite_job`
  - Java updateJobFavorite -> Python `update_job_favorite`
- 注入 DB 與 decorators：
  - `get_favorite_job` : @inject_db(DBName.READ_ONLY) (或 READ_ONLY for queries)，@log_func_args
  - `update_job_favorite` : @inject_db(DBName.DEFAULT) + 如果有 `@transactions` 裝飾器應套上
- 行為 mapping：
  - totalRows: db.query(NabiJobFavorite).filter(NabiJobFavorite.pid == pid).count()
  - page query: query.order_by(NabiJobFavorite.id).offset(offset).limit(limit).all()
  - transferJobFitModel: decode `favorite.resume_fit_json` -> dict, collect jobno list, call `JobOn().get_jobs_by_joblist(jobno_list)` -> exist set, set `offline` accordingly, if offline changed -> DB update: session.query(...).filter(...).update({"offline": new_offline})
  - checkJobApplicable: use apply API wrapper to get applicable list and set `isAlreadyApplied` flag in each job dict
  - update_job_favorite: check job exists via JobOn, query existing favorites, if favoriteState==0: delete rows; if favoriteState==1: if no existing -> get idno via get_user_idno_with_cache and obtain job fit via chosen job-fit method -> create new NabiJobFavorite with resume_fit_json=json.dumps(job_fit_dict) and insert; wrap duplicate key exception handling (SQLAlchemy IntegrityError -> ignore).
- 錯誤處理：用 components 的 exceptions pattern；把 validation errors a la ParamValidateUtil 轉為 Pydantic validation + explicit checks.

C. views.py（新增路由）
- 新增 POST `/getFavoriteJob`，body: `GetFavoriteJobInModel`，optional query `actor_id`（跟 Java 相同），回傳 `SuccessModel[List[dict]]` 或 `SuccessModel[OffsetPageOutModel[dict]]`（依 Java meta 結構）。
- 新增 POST `/updateJobFavorite`，body: `UpdateJobFavoriteInModel`
- 新增 GET `/getJobFit/{jobno}` 已有類似 endpoint 在 Java; Python 端可保持 route `/getJobFit/{jobno}`，views wrapper 調用 `actions.get_job_fit`.

D. components/e104/api/apply (新增)
- 建檔： api.py
- 類似其他 APIM wrappers，class `ApplyAPI(APIM)` 或 `ApplyService`，提供:
  - `def jobs_check_applicable(self, idno: Optional[int], jobnos: List[int]) -> List[dict]:`
  - returns list of dicts like Java `ApplyApiApplicable` (fields: jobno, applicableStatus, ...)
- 再建立一個簡單 actions helper actions.py（如果需要）或直接在 `components.e104.api.apply.api` 用 import。

E. 其他
- logging：在重要步驟（insert/delete/update/offline變更）加 logger。
- 重試或忽略 DuplicateKey：SQLAlchemy 的 IntegrityError 需捕捉並忽略，或用 ON CONFLICT DO NOTHING（如果使用 MySQL 可用 insert ignore）。
- 測試：新增 minimal unit tests 或 smoke test calling these actions with an in-memory/fixture DB row.

---

## 合約（contract） — 每個 API 的輸入/輸出/錯誤
1. get_job_fit
   - 輸入: jobno (path param, int), pid (query, optional), version (default "1"), actor_id (optional)
   - 輸出: SuccessModel[dict] where dict is original JobFit structure (same keys as Java JobFitModel)；meta fields: isFavorite, isAlreadyApplied 等（和 Java 保持一致）
   - 錯誤模式: invalid jobno/pid -> 400 style response via existing components fastapi exception pattern

2. get_favorite_job
   - 輸入: body JSON -> pid, recFrom (default 1), requestLength (default 10); optional actor_id query param
   - 輸出: SuccessModel[List[dict]] (list of JobFit dicts) + meta keys totalRows, recFrom, resultRows, nextFrom
   - 錯誤: invalid pid or invalid pagination -> return validation errors

3. update_job_favorite
   - 輸入: pid, jobno, favoriteState (0/1)
   - 輸出: SuccessModel[dict] e.g. {"result":"true"}
   - 錯誤: invalid pid/jobno/favoriteState, job not exist -> appropriate 4xx errors

---

## 主要邊界 / 風險 / 邊緣情形（我會在實作時覆蓋）
- resume_fit_json 解析失敗或為 null：要容錯（回傳空 dict 或 skip）
- job 不存在（update favorite 時 favoriteState == 1）：Java 會回 NotExist error — 我會複製此行為
- 重複寫入 race condition：在 insert 時捕捉 IntegrityError（或 DuplicateKey），忽略如 Java
- idno 取得失敗或為 null：Java 在登入/未登入會有不同 jobFit 流程；我會依 idno 是否存在分支處理（跟 Java 一致）
- apply API 回傳格式異常：需把 wrapper 實作為堅固的 parser，並處理 empty 回傳
- 性能：transferJobFitModel 會呼叫 `JobOn().get_jobs_by_joblist` 一次（批次），這已在 Python 既有 `get_saved_jobs` 使用過，效能模式可重用

---

## 需要你確認的事項（請回覆）
1. jobFitHandler 的處理要採哪個策略？
   - A) 呼叫現成外部 job-fit service（我會新增 `components/e104/api/job_fit` wrapper） — 我需要該服務的 endpoint 或可參考的 APIM 設定
   - B) 移植 Java 的 JobFitHandler 到 Python（工作量大，需同意並分配時間）
2. apply API 外部 endpoint/授權設定（若有內部 APIM 配置，請提供或允許我參考其他 APIM wrapper 的 config）
3. 內層資料是否允許直接以 dict（從 `resume_fit_json` load）回傳？或你要我先建立 Pydantic `JobFitModel`（需要定義所有欄位）？

---

## 下一步（我準備執行）
- 當你回覆以上三個確認（或選項）後，我會：
  1. 先實作 api.py wrapper（依既有 APIM pattern）。
  2. 在 serializers.py 新增 input models。
  3. 在 actions.py 新增 `get_favorite_job`, `update_job_favorite`, `get_job_fit`（以最小改動命名：get_favorite_job, update_job_favorite, get_job_fit），加入 `@inject_db` 與 `@log_func_args`。
  4. 在 views.py 新增對應 route wrappers（使用現有 ApiOutputModel.serialize_success 風格）。
  5. 跑靜態檢查 / 簡單 smoke test（驗證 import 與語法、DB query 基本流程），回報結果與任何阻礙（例如需要 job-fit service endpoint）。
  6. 若 job-fit 選 A（呼叫外部 service），在 actions 中呼叫該 wrapper 以產生 resume_fit_json。

請回覆你對上面三個須確認項（特別第 1 項 jobFit 策略與第 3 項內層是否用 dict）的選擇，我就開始實作並在完成初步實作後回報修改檔案清單與測試結果。

yin039578: 請幫我翻寫Java的API到python專案
1. 翻寫
/nabi/getSkill
/nabi/updateSkillFavorite
/nabi/getTopSkill
2. 程式放在python專案的api_ability模組內
3. 邏輯與基本原則不變，但是語法與邏輯可以優化，命名方式以python慣例為主
4. 優先參考api_ability模組內現成函式或共用函式運作方式作為改寫參考
5. 先幫我逐行爬梳並簡化說明他做的事情有哪些，並說明改寫計劃與我討論



GitHub Copilot: Optimizing tool selection...我會先建立一個可追蹤的 todo 清單，然後並行讀取 Java 的 AbilityInfoServiceImpl.java 與 Python api_ability 模組的主要檔案（actions.py、views.py、serializers.py、service.py），以便做逐行分析與擬定改寫計畫（預期取得兩邊實作細節與現有 helper 可重用清單）。接著我會回報讀取結果與下一步細節。 

Created 6 todos

我將同時讀取 Java 的 AbilityInfoServiceImpl.java（在 104learn-nabi-backend 專案）與 Python 的 api_ability 模組幾個關鍵檔案，取得完整上下文用以分析與制定改寫計畫。接著會回報讀取結果與下一步。現在我會讀取 Java 檔案的內容。 

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104learn-nabi-backend/src/main/java/com/e104/nabi/service/AbilityInfoServiceImpl.java#1-1), lines 1 to 400

Summarized conversation history

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104learn-nabi-backend/src/main/java/com/e104/nabi/service/AbilityInfoServiceImpl.java#400-400), lines 400 to 611

我會接著讀取專案中 api_ability 模組的主要檔案（actions.py, serializers.py, views.py, models.py）以了解既有慣例與可重用函式，然後回報逐行簡化說明與改寫計畫。接著我會讀取 actions.py。 

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_ability/actions.py)

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_ability/serializers.py)

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_ability/views.py)

我要把接下來的工作拆成 todo list 並標記第一項為 in-progress，以便追蹤；我會寫入 4 個 todo 項目（逐行說明、改寫計畫、實作、測試）。接著我會回報改寫計畫與需要修改的檔案。 

Updated todo list

## 我接下來要做的事（簡短說明）
我已讀取 Java 的 AbilityInfoServiceImpl.java 與 Python 的 api_ability 模組（actions.py, serializers.py, views.py），並建立了工作清單。下一步我會把 Java 三個 API 的實作逐行簡化說明（繁體中文），再提出具體的 Python 改寫計畫（放在 api_ability），之後等你確認我就開始實作。

## Java 檔案已讀取
已閱讀：
- AbilityInfoServiceImpl.java

關鍵 Python 檔案已讀取：
- actions.py
- serializers.py
- views.py

## 簡短發現（快速重點）
- Java `getSkill` (getSkill)：
  - 做了輸入驗證（capabilityId 必要，pid, jobcat 選填）。
  - 以 capabilityId 查 NabiAbility 與 NabiClassroom；不存在時回 404-style error。
  - 組裝 AbilityInfo，包含測驗 meta（呼叫 getTestMetaInfo）、是否已收藏（nabiAbilityFavoriteDao）、隱藏教材（nabiResourceFeedback）、證照相關資訊（nabiAbilityCertify、pastexam、ad 等）、相關技能/工具/證照 (nabiAbilityMappingViewDao)。
  - 最後把組裝好的 AbilityInfo 設入 ApiResult.data 回傳。
- Java `updateSkillFavorite`：
  - 解析 JSON body -> 轉成 NabiParam。
  - 驗證 pid, capabilityId, favoriteState 等欄位格式與範圍。
  - 查詢 classroom 與 capability 是否存在。
  - 根據 favoriteState 做新增或刪除 NabiAbilityFavorite 記錄，並同步更新 NabiClassroom 的 favoriteCount（+1 或 -1，且避免負數）。
  - 若新增第一個收藏（isFirst），會在 result.meta 回傳 isFirst 標記。
  - 官方教室（roomType == 1）會呼叫 pythonApiService.updateSearchIndex 同步索引。
  - 最後回傳 data={"result":"true"}。
- Java `getTopSkill`：
  - 驗證 pid（選填）。
  - 取得熱門技能（以 favoriteCount 排序前 10，並可排除自己追蹤的技能）。
  - 取出 ability 資訊、判斷 pid 是否已收藏、取得該技能的貼文數（postCnt）。
  - 回傳 TopSkillModel 陣列，內含 capabilityId, capability, interactive map (favoriteCount, isFavorite, postCount)。

## Todo 列表（我已建立並把第1項標為 in-progress）
1. 逐行簡化說明 Java 三個 API（in-progress） — 我會產出繁中逐段說明並標註關鍵邏輯與依賴。
2. 提出 Python 改寫計畫（not-started） — 包含要修改/新增的檔案、Pydantic model、DB 操作、是否需新增外部 wrapper（目前看來此三個 API 不需要新的外部 wrapper）。
3. 實作改寫（code changes） — 實作 api_ability 的 actions/views/serializers 更改。
4. 新增最小化測試與檢查 — 寫 1-2 個測試並跑語法檢查。

## 下一步（馬上要做）
我會把 Java 三個 API 逐行簡化說明交給你（繁體中文），並連帶指出每段對應要在 Python 端如何實作（例如：哪些 DAO 查詢對應到 SQLAlchemy query、哪些 helper 可重用、哪些 meta 要一起回傳）。完成後我會等你確認再開始修改程式碼。

如果沒問題我就開始產生逐行簡化說明（下一個回覆會包含該說明 + 改寫計畫要點）。

yin039578: 請開始下一步，詳細處理時要注意他們的快取策略或是查詢優化的部分
尤其是/nabi/getSkill與/nabi/getTopSkill流量較大，需多注意

GitHub Copilot: Optimizing tool selection...我要把 todo 狀態更新：把「逐行簡化說明」標為已完成，並把「提出 Python 改寫計畫」標為 in-progress，這樣方便追蹤接下來要實作的工作。之後我會回報逐行說明與改寫計畫。 

Starting (2/4) *提出 Python 改寫計畫*

我要搜尋 Python 專案中是否已有對應的 Classroom/AbilityFavorite model、以及快取/Cache util 的使用位置，這會幫我把 Java DAO 與 cache 的呼叫對應到現有 Python ORM/快取實作（預期結果：找到相關 model 與快取 helper，方便提出具體改寫與優化建議）。我會同時執行三個檔內字串搜尋。 我要修正 grep 的呼叫格式，改用三個序列呼叫（這些是只讀搜尋，不會修改任何檔案），預期結果：找到 `NabiClassroom` 對應的 Python model、Ability favorite 的 ORM/DAO、以及 cache helper 的實作。 

Searched text for `NabiClassroom`, 20 results

Searched text for `NabiAbilityFavorite`, 20 results

Searched text for `cacheService`, 20 results

我要搜尋 Python 專案中與 Classroom / AbilityFavorite / Classroom favorite count 相關的 ORM model 與 helper（這有助於把 Java DAO 呼叫對應到現有 Python ORM 與快取），我將執行三個查詢：搜尋 `Classroom`、`AbilityFavorite`、與 `favoriteCount`。預期結果：找到對應 model 與現有更新 favoriteCount 的實作或函式。 

Searched text for `Classroom` (`**/feature/NABI-5870/**`), no results

Searched text for `AbilityFavorite` (`**/feature/NABI-5870/**`), no results

Searched text for `favoriteCount` (`**/feature/NABI-5870/**`), no results

我會在整個 Python 專案（feature/NABI-5870）搜索與 classroom、favorite、ability 相關的 model、table 或 DAO 命名，目的是找出現有 ORM/快取支援以便在改寫計畫中重用；這是一次只讀搜尋。預期找到 `api_social.models`、api_classroom、或 api_ability 中的相關模型與快取 helper。 

Searched text for `classroom` (`**/feature/NABI-5870/**`), no results

看起來 Python 專案的 model 命名不是直接用 "classroom" 這個字，我會搜尋專案中 api_ability 以及 api_classroom、api_social 模組的 model 文件，以找到對應的 ORM 類別（例如 `Ability`, `AbilityCertify`, `NabiClassroom` 對應名稱可能在 `api_social.models` 或 `api_classroom.models`）。我將讀 `api_social.models` 與 `api_classroom.models` 檔案。 

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_social/models.py#1-1), lines 1 to 400

Searched text for `nabi_classroom` (`**/feature/NABI-5870/**`), no results

我會搜尋 Python 專案中現有的快取實作位置（像是 services/cache、components/cache 或類似命名），以便建議使用現有快取 helper 與命名慣例；這是只讀搜尋。預期找到可重用的快取 actions 或 redis wrapper。 

Searched text for `services/cache` (`**/feature/NABI-5870/**`), no results

Searched text for `cache` (`**/feature/NABI-5870/**`), no results

下一個步驟：我會讀取 api_classroom 的 models 檔案，找出 Python 端對應的教室 / favorite count 欄位與方法，這樣我能精確對應 Java 的 `NabiClassroom` 與 `nabi_classroom` table。這是只讀操作，預期取得 models.py 的內容或其等價檔案。 

Read [](file:///Users/yochao.yin/Documents/Projects/nabi/104-nabi-classroom-api_tree/feature/NABI-5870/api_classroom/models.py)

我將做一次小型搜尋以找出 Python 專案中可重用的對應 model 與 helper（Ability, AbilityFavorite, Classroom, AbilityCertify, AbilityCertifyPastexam, AbilityMapping, post stats），用來具體對應 Java 的 DAO 呼叫。這是只讀搜尋，預期結果會列出已找到的檔案與位置，方便我在改寫計畫中引用現有類別。 

Searched text for `AbilityCertify|AbilityCertifyPastexam|AbilityMapping|postStatsView|post_stats|postCnt` (`**/feature/NABI-5870/**`), no results

我將搜尋整個 workspace 以找到 Python 專案中現有的 cache helper（例如 actions.py 或 components 的 cache wrapper），以及是否有既有的函式可以更新 Classroom.favorite_count，以便在改寫計畫中重用並提出具體快取失效位置。這會是一次只讀搜尋。 

Searched text for `services/cache/actions.py|get_*cache|save_*cache|saveToCache|Cache|cacheService`, 200 results

我會搜尋 Python 專案中是否有 `NabiResourceFeedback`、`nabi_resource_feedback` 或等價的 model 和測驗紀錄 view（用於 getTestMetaInfo）以確保改寫計畫引用正確的 ORM 類別；這是只讀搜尋。預期結果：找到對應 model 或指出需要新增的 model/查詢。 

Searched text for `ResourceFeedback|nabi_resource_feedback|TestRecordView|nabi_test_record_view|TestRecord` (`**/feature/NABI-5870/**`), no results

現在我已收集到足夠的對照資訊：Java 端的 DAO 與 service 依賴已對應到 Python 專案中多個 model（例如 `Ability`, `AbilityFavorite`, `Classroom`, `AbilityCertify`, `AbilityCertifyPastexam`, `Function01AbilityMapping`），以及一個通用的 cache helper (actions.py)。下一步我會產出「逐行簡化說明」的交付物與「Python 改寫計畫（詳細）」：包含每個 API 對應到的 Python 程式檔案/函式/SQLAlchemy 查詢、cache 使用建議、以及高流量場景的效能/快取策略與優化。我要直接開始撰寫改寫計畫。
## 現在要做的事（直接執行）
我將提供：
1. 對 Java `AbilityInfoServiceImpl` 中三個 API (/nabi/getSkill、/nabi/updateSkillFavorite、/nabi/getTopSkill) 的逐段簡化說明（繁體中文，含重要商業邏輯與依賴）。
2. 依據現有 Python 專案（已讀取 api_ability、`api_social.models`、`api_classroom.models`、actions.py 等），提出具體的 Python 改寫計畫：要改 / 新增哪些檔案、每個 API 的 Python 函式 contract（輸入/輸出）、SQLAlchemy 查詢對應、快取策略（包含高流量注意事項與快取失效點）、邊界情況與例外處理建議。

我會先交出完整的逐段簡化說明與改寫計畫（下個回覆），之後等你確認我再開始程式碼實作（會更新 todo 狀態並且在實作後執行基本 lint/語法檢查與最小測試）。

yin039578: 請繼續

GitHub Copilot: 我會直接提供「詳細的 Python 改寫計畫」，包含每個 API 的行為合約、對應的 Python 檔案/函式/Model、SQLAlchemy 查詢映射、快取/效能建議（針對 /nabi/getSkill 與 /nabi/getTopSkill 的高流量優化）、邊界/錯誤處理與測試建議。之後等你核准我就動手實作（我會在實作前把 todo 狀態更新為 in-progress → 實作中，再進行 code 修改與驗證）。

## 總目標（摘要）
把 Java 的三個 Ability API（getSkill、updateSkillFavorite、getTopSkill）翻寫到 api_ability 模組，保持商業邏輯不變、外層回應採專案慣例（`ApiOutputModel.serialize_success` / `SuccessModel[...]`），但內部資料結構保留原始 shape（必要時用 Pydantic model 或 dict）。高流量路徑（getSkill、getTopSkill）必須使用快取與最小化 DB 負擔；favorite 更新需原子地更新 classroom.favorite_count 並失效對應快取。

---

## 檔案 / 產出物（概覽）
建議修改 / 新增檔案：
- 修改
  - actions.py — 新增三個 action：`get_skill`, `update_skill_favorite`, `get_top_skill`
  - views.py — 加入對應路由（POST/GET），使用現有的 `ApiOutputModel.serialize_success`
  - serializers.py — 新增/擴充 Pydantic models：
    - `AbilityInfoOutModel`（或使用 `Dict` 保留內層結構）、`CertifyInfoOutModel`、`RelativeAbilityOutModel`、`TopSkillOutModel`、`UpdateSkillFavoriteInModel`
- 可能要引用 / 小改
  - actions.py — 已存在，可直接呼叫（如 `get_cache`, `set_cache`, `del_cache_by_pattern` 等）
  - models.py, models.py — 現有 model（`Classroom`, `Ability`, `AbilityFavorite`）會被用到
- 新增（若現有 wrapper 不足）
  - `components/e104/api/python_api.py`（或合適的 components path） — 提供 `update_search_index(update_type: int, update_key: int)` 的 wrapper（Java 用 `pythonApiService.updateSearchIndex`，Python 端若無類似 wrapper，建議建立輕量 wrapper；若已有則直接呼叫）
- 測試
  - `tests/api_ability/test_get_skill.py`（happy path）
  - `tests/api_ability/test_update_skill_favorite.py`（新增/移除、同時模擬重複新增）

---

## API 改寫細節（逐一）

### 1) get_skill (對應 Java: getSkill)
- 路由（views）：
  - GET /nabi/getSkill?capabilityId={capabilityId}&pid={pid}&jobcat={jobcat}
  - response_model: SuccessModel[AbilityInfoOutModel]（或 SuccessModel[dict] 保留內層結構）
- Python action signature（actions.py）：
  - @inject_db(DBName.READ_ONLY)
    @log_func_args
    def get_skill(capability_id: int, pid: Optional[int] = None, jobcat: Optional[int] = None, db: Session) -> AbilityInfoOutModel:
- 行為 mapping（Java → Python）：
  1. 參數驗證：使用 Pydantic in-model or explicit checks (FastAPI Path/Query validation). 若 capability_id 不存在，raise 404-style custom error（project uses `components.fastapi.exceptions`）。
  2. 以 `db.query(Ability).filter(Ability.id==capability_id).first()` 取得 `ability`；以 `db.query(Classroom).filter(Classroom.room_id==capability_id).first()` 取得 `classroom`。如果 classroom 不存在也視為 not-found。
  3. 取得 `test_meta`：把 Java 的 `getTestMetaInfo` 行為對應為 `get_test_meta_info(ability, pid, db)`（private helper），裡面使用 `nabi_test_record_view` 等 view table。如果 Python 沒有 view，建立相對查詢或 service wrapper。
  4. 設定 `AbilityInfo` 結構：
     - `favorite_count` ← `classroom.favorite_count`
     - `testIsAuthorized` ← 從 `test_group_id` 查 `nabi_test_group`（`db.query(NabiTestGroup)...`）
     - `isFavorite` ← 若 `pid` 非空，查 `AbilityFavorite`：SELECT 1 FROM nabi_ability_favorite WHERE pid=:pid AND ability_id=:capability_id LIMIT 1
  5. 隱藏教材（hiddenResourceIdList）：呼叫 `ResourceFeedback` view（若有），收集 `resource_id`；若 Python 未有，先預留空 list 或建立 `ResourceFeedback` model/DAO。
  6. 若 ability.type == 3（證照）：
     - 查 `AbilityCertify`（`api_social.models.AbilityCertify`）
     - 組裝 `certInfo`、`relativeJobcat`（呼叫 `certJobrankDao.queryLastByCertifyNo` 對應到 `cert` 統計查詢）
     - 可能需要 `cacheService.getCertifyJobcatRequiredCache` 對應：在 Python 使用 actions.py 如 `get_cache/ set_cache` 包裝 `getCertifyEnterpriseJobcatRequired` 行為並快取結果（該邏輯偏 heavy，直接移植其 SQL）。
  7. 取得相關技能/工具/證照：查 `nabi_ability_mapping`（`Function01AbilityMapping` / `AbilityMapping`）或 `nabi_ability_mapping_view`，以 mapping_type 分流並把資料轉成 `RelativeAbility`（或簡化成 dict）。
  8. 回傳 `result`（使用 `ApiOutputModel.serialize_success(data)`）。

- SQLAlchemy 實作注意：
  - 只 SELECT 必要欄位（例如 Ability.id, Ability.ability, Ability.type, test_group_id），避免 ORM 載入大量欄位。
  - 在查 mapping view 時使用 `db.query(...).filter(...).all()`；如果 mapping list 可能很大，做 limit 或分頁（Java 直接回所有）。
- 快取 / 效能（重點）：
  - 建議把 Ability 基本資料 + Classroom.favorite_count + CertifyInfo 等重資料快取 1 小時（或 15~60 分鐘依資料變動頻率而定）。使用現有 actions.py：
    - key: f"ability_info:{capability_id}"
    - set_cache(key, data, CACHE_1_HOUR)
  - 若 pid 帶入會影響 `isFavorite` 與 hiddenResourceIdList，建議：
    - 回傳時把 cached 基本資料取出，然後做小量 DB 查詢來填 `isFavorite` 與 `hiddenResourceIdList`（這些查詢是小表且索引良好）。
  - 為避免快取穿透，對不存在的 capability_id 可設短 TTL 的空值 caching。
  - 若 ability.type==3 內部呼叫的「certify jobcat required」是重計算且較重，保持 Java 的 cache pattern（先查 cacheService, 若無再計算並 set cache）。
- 錯誤/邊界：
  - 當 pid 缺失，`isFavorite` 與 `hiddenResourceIdList` 留空/0。
  - 若 `test_group_id` 存在但查不到 group，預設 testIsAuthorized=False。
  - log 例外並回傳統一 error（使用 components.fastapi.exceptions）。

---

### 2) update_skill_favorite (對應 Java: updateSkillFavorite)
- 路由（views）：
  - POST /nabi/updateSkillFavorite
  - input: JSON body with fields { pid, capabilityId, favoriteState (0/1), fromJobno?, fromJobcat?, fromIndcat? }
  - response_model: SuccessModel[Dict[str,str]]（{"result":"true"}）並在 meta 傳 isFirst = "1"/"0"（如 Java）。
- Python action signature（actions.py）：
  - @inject_db(DBName.DEFAULT)  # 寫入
    @log_func_args
    def update_skill_favorite(inputs: UpdateSkillFavoriteInModel, db: Session) -> dict:
- 行為 mapping：
  1. 驗證 body（Pydantic model 做型別檢查）。
  2. 查 ability 與 classroom（same as get_skill）。
  3. 取得現有 `AbilityFavorite` 列表：query ability favorite by pid and ability_id。
  4. If favoriteState == 1:
     - 判斷是否已存在：若不存在則建立 `AbilityFavorite`（使用 `AbilityFavorite(...)`、`db.add()`、`db.flush()`）。
     - 計算是否為「isFirstAddFavorite」：`count = nabiAbilityFavoriteDao.queryFavoriteCntByPid(param.pid)` → SQL: SELECT COUNT(1) FROM nabi_ability_favorite WHERE pid=:pid. 若 count==0 表示第一次為整個 user 的第一個 favorite，否則不是。
     - 更新 classroom.favorite_count：**必須用原子更新**，避免 race condition。實作建議：
       - db.query(Classroom).filter(Classroom.room_id==capability_id).update({Classroom.favorite_count: Classroom.favorite_count + 1})
       - 或使用 raw SQL: UPDATE nabi_classroom SET favorite_count = favorite_count + 1 WHERE room_id = :id
     - commit 後回傳 meta isFirst accordingly。
  5. If favoriteState == 0:
     - 刪除存在的 AbilityFavorite records（可能多筆），使用 `db.query(AbilityFavorite).filter(...).delete(synchronize_session=False)`。
     - 更新 classroom.favorite_count: 用原子 DEC（確保非負，SQL 寫法可是 CASE WHEN favorite_count>0 THEN favorite_count -1 ELSE 0 END）。
  6. 若 classroom.room_type == 1（官方教室），呼叫 Python-side wrapper 更新 search index（Java 的 `pythonApiService.updateSearchIndex(updateType=1, updateKey=room_id)`）：
     - 建議：若 `components.e104.api.python_api.update_search_index` 存在，直接呼叫；若不存在，建立簡單 wrapper 並測試（非 blocker）。
  7. 快取失效：在成功更新後，呼叫 actions.py 中相關 del：
     - `del_cache_by_pattern("activity_*")`、`del_cache_by_pattern("top_skill_*")`、`del_cache_by_pattern("ability_info:{capability_id}")`、或專門 function `del_activity_cache` 若存在。
     - 具體：`services.cache.actions.del_cache_by_pattern(f"activity_list_*")`、`del_cache(key=f"ability_info:{capability_id}")`
- 例外處理：
  - 重複插入（unique constraint）→ 在 SQLAlchemy 中會 raise `IntegrityError`，catch 並忽略（Java 用 try/catch sendErrorMail），同時記 log 並發送 error mail（若 project 有 mail wrapper）。
  - 刪除時若不存在，照樣把 favorite_count 調整但要保護 negative。
- 交易/事務：
  - 使用 `@transactions` 或在 `@inject_db(DBName.DEFAULT)` 的 transaction 上執行（依專案裝飾器規範）。確保在發生錯誤時 rollback。
- 高流量注意：
  - 多個用戶同時按收藏可能造成 favorite_count 非同步，原子 SQL update 解決競爭。避免先 select 再 update 的兩步式更新。
  - 若需更強一致性，可在 DB 層使用 `UPDATE ... WHERE ...` 並檢查行數，不推薦在 app 層做 SELECT+SET。

---

### 3) get_top_skill (對應 Java: getTopSkill)
- 路由（views）：
  - GET /nabi/getTopSkill?pid={pid}&notFollow={true|false}
  - response_model: SuccessModel[List[TopSkillOutModel]]
- Python action signature：
  - @inject_db(DBName.READ_ONLY)
    @log_func_args
    def get_top_skill(pid: Optional[int], not_follow: Optional[bool], db: Session) -> List[TopSkillOutModel]:
- 行為 mapping：
  1. 參數驗證。
  2. 若 notFollow True → 要排除該 pid 已追蹤的技能。實作選項：
     - SQL subquery: SELECT * FROM nabi_classroom WHERE room_id NOT IN (SELECT ability_id FROM nabi_ability_favorite WHERE pid=:pid) ORDER BY favorite_count DESC LIMIT 10
     - 這是效率較高且在 DB 有 index 的情況下可行（`idx02` on ability_id exists），但若該 subquery 慢可以改用 JOIN/exists。
  3. 若 notFollow False → 直接 query top 10 by `Classroom.favorite_count DESC LIMIT 10`
  4. 取得 ability 資訊：SELECT id, ability FROM nabi_ability WHERE id IN (:abilityIds) → 建立 map。
  5. 取得 pid 是否收藏這些 top10：如果 pid 非空，query `AbilityFavorite` for abilityIds（單次 IN 查詢），把結果轉成 set 以提供 `isFavorite`。
  6. 取得每個 ability 的 postCount: Java 呼叫 `postStatsViewDao.queryTopAbilityPostOnWallCnt` → 在 Python 若有類似 view 或 service，呼叫之；若無，先不回傳或建立一個 `services/post/actions.get_top_ability_post_count(ability_ids)`，並建議 cache。
  7. 組裝 `TopSkillOutModel`（包含 capabilityId, capability, interactive map: favoriteCount, isFavorite, postCount）。
- 快取 / 效能（重點）：
  - TopSkill 是熱門資料，建議全局快取（不帶 pid 的情況），例如：
    - key: `top_skill:global:10` TTL = 5 分鐘（CACHE_5_MINUTE）或 15 分鐘視容忍度。
  - 若 notFollow=true（user-specific 排除），若要強制精準（即完全排除 user 的已追蹤），可：
    - 從 global cached list 取得候選（例如 top 20），再在 app 層過濾掉 user 已收藏項目，取前 10；若不足再回 DB 補取。 這能在不建立「每 user 的 top list」下大量減少 DB 壓力。
  - 當 favorite 更新時（update_skill_favorite）需要失效 top_skill 快取（del_cache_by_pattern("top_skill:*") 或 del specific key）。
  - SQL 建議：
    - 使用索引：`nabi_classroom (favorite_count)` 已有列，`nabi_ability_favorite(ability_id)` 也有 index。使用子查詢排除 pid 收藏應快。
  - 減少 join 與 ORM overhead：選擇直接用 `db.query(Classroom.room_id, Classroom.favorite_count, ...)` 而非 load 整個 model 若不需要。
- 邊界：
  - 當 abilityNames 對應不到（DB 异常），跳過該項。
  - 當 pid 為 null，`isFavorite` 項省略或設為 false。

---

## 快取/一致性策略（整體建議）
- 使用現有 actions.py helper（已在 codebase 中），不要重複實作 Redis 輔助程式。
- 建議快取項目與 TTL：
  - `ability_info:{capability_id}` — TTL 1 小時（較長，因能力變動稀少），儲存 ability 基本資料 + certify info 等 heavy data（inner data）。
  - `top_skill:global:10` — TTL 5~15 分鐘（視封流與即時性而定）。
  - 小型查詢（如 pid→idno、user resume）使用短 TTL 或現有 cache functions（已存在）。
- 快取失效時機（必須在 favorite update 發生時）
  - 更新者發生在 `update_skill_favorite` 成功後：
    - del `ability_info:{capability_id}` 或至少更新 cached `favorite_count`
    - del `top_skill:*`（global）或更新 cached entry中的 favoriteCount（若已 cache，可以選擇局部更新：更新 cached list 中對應 entry 的 favoriteCount）
    - del 與 ability 相關的 activity/河道 cache（`activity_list` 等）
- 高流量保護
  - read path 優先使用 cache + 少量 DB 查詢（填 isFavorite）。
  - write path 使用原子 DB update（UPDATE ... SET favorite_count = favorite_count +/- 1），以避免 race condition。
  - 若流量極高且一致性要求可放寬，考慮把 favorite_count 變為 eventually consistent（例如用排程重算），但目前建議保留原子更新。
- 指標與監控（建議）
  - 監控 top_skill cache hit rate 與 DB qps。
  - 監控 favorite 更新成功率與 IntegrityError 次數（觀察是否存在重複 insert）。

---

## 資料模型與 SQLAlchemy 映射（參考現有 model）
- `api_social.models.Ability` → 對應 Java `NabiAbility`
- `api_social.models.AbilityFavorite` → 對應 Java `NabiAbilityFavorite`
- `api_classroom.models.Classroom` → 對應 Java `NabiClassroom`
- `api_social.models.AbilityCertify`、`AbilityCertifyPastexam` → 對應證照資料
- actions.py → 提供 `get_cache`, `set_cache`, `del_cache_by_pattern` 等
- 具體查詢示例：
  - 查 ability:
    - ability = db.query(Ability).filter(Ability.id == capability_id).first()
  - 查 classroom:
    - classroom = db.query(Classroom).filter(Classroom.room_id == capability_id).first()
  - isFavorite:
    - exists = db.query(AbilityFavorite.id).filter(AbilityFavorite.pid == pid, AbilityFavorite.ability_id == capability_id).first() is not None
  - update favorite_count atomically:
    - db.query(Classroom).filter(Classroom.room_id == capability_id).update({Classroom.favorite_count: Classroom.favorite_count + 1})
    - db.commit()
  - top skills excluding pid:
    - subq = db.query(AbilityFavorite.ability_id).filter(AbilityFavorite.pid == pid).subquery()
      top_skills = db.query(Classroom).filter(~Classroom.room_id.in_(subq)).order_by(Classroom.favorite_count.desc()).limit(10).all()

---

## 邊界案例與測試建議
- Edge cases:
  1. capabilityId 不存在 → 回傳 404-style API error（使用 components.fastapi.exceptions.NotFoundError）
  2. pid 為空 → 算作未登入，用戶特定欄位（isFavorite、hiddenResourceIdList）填空
  3. favorite 重複新增（unique constraint）→ 捕獲 IntegrityError，忽略但 log
  4. favorite_count 負數：在 decrement 時要保護（SQL: favorite_count = GREATEST(favorite_count - 1, 0)）
  5. 大量使用者同時更新 favorite → 使用 atomic SQL update
- 單元測試（至少兩個）
  - test_get_skill_happy: mock DB, 有 ability/classroom，檢查回傳結構與 favoriteCount。
  - test_update_skill_favorite_toggle: 模擬 user 新增 favorite 及刪除 favorite，檢查 classroom.favorite_count 的變化與 meta.isFirst 正確。
  - 可選：並行測試模擬兩個 thread 同時新增 favorite，檢查 favorite_count 正常（requires more setup）。

---

## 安全 / 日誌 / 觀察
- 日誌：用 `@log_func_args`（專案慣例）並在 catch Exception 時 `logger.exception`。
- 敏感資訊不要在 info 日誌輸出（pid 可視情況 mask）。
- 若有 mail 發送需求（Java 用 mailService.sendErrorMailForTryCatch），Python 可用已存在 `MailService` 或 components 裡 log-to-mail wrapper（若無，先 log）。

---

## 實作順序建議（最小風險、易回滾）
1. 新增 serializers（Pydantic）以定義 API contract（輸入/輸出）。  
2. 在 actions.py 實作 read-only 的 `get_skill` 與 `get_top_skill`（先不做 cache）；測試通過後加入 cache 層。  
3. 實作 `update_skill_favorite`（DB 寫入），採原子 SQL update。做到後立即加入 cache invalidation。  
4. 若需要外部 wrapper（update_search_index），新增 `components/e104/api/python_api.py` 並用單元測試模擬。  
5. 增加快取策略（cache key 與 TTL），與必要的 del_cache_by_pattern 實作測試。  
6. 撰寫/執行單元測試，run lint/語法檢查（project 用 poetry，請用 pyproject 設定）。

測試 / lint command（建議開發者執行）：
```bash
# 進入專案並安裝（若尚未）
poetry install

# 執行單元測試
poetry run pytest tests/api_ability -q

# 執行語法/型別檢查（若有 flake/ruff/pytest config）
poetry run ruff check .

# 手動測試 API（開發時）
poetry run uvicorn app.main:app --reload
```

---

## 需要你確認的事項（兩個重要決策）
1. inner structure 願不願意用 Pydantic 詳細型別化 `AbilityInfo`/`CertifyInfo` 等？  
   - 建議：對於複雜且穩定的子結構（certInfo、testMeta、relativeSkill）可以建立 Pydantic OutModel，有助於文件與測試；若你要百分百保持 Java 原始 inner JSON，不必建 model，直接回傳 dict 也可。請選一個偏好。
2. `update_search_index` wrapper：repo 有無現成對等 wrapper？  
   - 我可以搜尋並重用（若存在）。若不存在，我會新增一個 `components/e104/api/python_api.py` 的輕量 wrapper（會在實作階段先檢查並復用現有的 wrapper）。

---

## 下一步（我會做的實作步驟，如果你同意）
1. 我會把 serializers.py 新增所需 Pydantic 模型（或選擇 dict 路徑）。  
2. 在 actions.py 新增並實作：
   - `get_skill`（READ，帶 cache 支援）
   - `update_skill_favorite`（WRITE，含原子更新與 cache invalidation）
   - `get_top_skill`（READ，使用 global cache + pid 過濾策略）
3. 在 views.py 新增對應路由並回傳 `ApiOutputModel.serialize_success(...)`。
4. 寫 2 個測試檔（happy path + favorite toggle），執行 pytest。  
5. 對高流量路徑（getSkill/getTopSkill）加入 cache 配置，並在 favorite 更新時失效快取。  
6. 提交變更並在此回報 build/lint/tests 的結果（若有錯誤我會進行最多 3 次針對性修正）。

請回覆：
- a) 要我為 inner structure 建立完整 Pydantic OutModel（更嚴格、測試友善）還是保留 dict 原樣回傳？  
- b) 同意我開始實作上述變更嗎？（我會在同意後開始修改檔案並執行測試）

我會等待你的兩項確認，然後開始實作（之後每步會回報進度與檔案變更清單）。

yin039578: 請先幫我review我這兩個想法
1.再來不會再保留Java服務，所以若python找不到等價且邏輯一致函式，則需要搬移邏輯，不能直接wrapper java service，但其他服務就需要
2.請先幫我檢查這三個服務有沒有共用，或是互相連結的部分，是否需要同時翻寫


GitHub Copilot: Optimizing tool selection...我將檢查 Java 實作中被三個 API 共用或相依的其他函式/DAO（例如 getTestMetaInfo、證照統計、post stats、mapping view 等）在 Python 專案中的對應情況，結果會說明哪些邏輯需要一併搬移。接下來我會讀取 6 個關鍵字在 Python workspace 的出現情形（只讀搜尋）。 

Searched text for `NabiTestRecordView|nabi_test_record_view|test_record_view|TestRecordView` (`**/feature/NABI-5870/**`), no results

Searched text for `postStatsView|post_stats|postCnt|queryTopAbilityPostOnWallCnt|post_on_wall` (`**/feature/NABI-5870/**`), no results

Searched text for `ability_mapping_view|ability_mapping|mapping_view|NabiAbilityMappingView|RelativeAbility` (`**/feature/NABI-5870/**`), no results

Searched text for `CertJobrank|JobcertStatsB|JobcertStatsTotal|getCertifyEnterpriseJobcatRequired|getCertifyJobcatRequiredCache` (`**/feature/NABI-5870/**`), no results

下面針對你提出的兩個想法做檢視與建議，並列出三個 API 之間的共用/相依項目，說明哪些要「同時翻寫」（port）或可「重用 / wrapper」。最後給出建議的實作順序與優先級（含快取與查詢優化要點）。

## 一、你兩個想法的review
1. 「不再保留 Java 服務 → 若 Python 找不到等價且邏輯一致函式，必須搬移（port）邏輯，不能只 wrapper Java service」  
   - 判斷：這個原則合理且清晰。對於內部業務邏輯（例如測驗統計、證照職類統計、mapping 視圖、post count 等）若 Python 專案沒有等價實作，應直接把 Java 邏輯或其等價 SQL/邏輯搬到 Python（避免再依賴 Java 運行時）。  
   - 影響：拿掉 Java wrapper 會增加 Python 端要翻寫的工作量（尤其是較 heavy 的統計/視圖邏輯），但長期可移除跨語言運維負擔與網路呼叫延遲。短期需確認資料來源（是否在同一 DB）與可重用 SQL/DAO，以降低重寫成本。  
   - 建議：遵守此原則；但對明確屬於第三方/外部 API（例如 AC / JobOn /外部 Search）仍用 wrapper 呼叫外部服務。

2. 「先檢查三個服務是否共用 / 互相連結，決定需不需同時翻寫」  
   - 判斷：非常正確的步驟。若三個 API 共用某些 DB view / 計算程式（例如 getTestMetaInfo、certify jobcat 統計、post stats、mapping view），這些 helper 應該一併處理，否則會重複造輪子或造成行為不一致。  
   - 建議：先列出共用依賴、檢查 Python 是否已實作；若缺少則把那些共用元件視為「必須同時翻寫」或至少先實作供三個 API 使用。

---

## 二、三個 API 的共用 / 相依清單（從 Java `AbilityInfoServiceImpl` 摘要）
以下把 Java 裡被三個 API（getSkill, updateSkillFavorite, getTopSkill）共用或相依的重要元件分門別類，並標示目前 Python 專案是否已存在（我在 repo 搜尋過並註明結果）。

- 直接存在且可重用（Python 已有 model / table）：
  - Ability (Java: `NabiAbility`)  -> Python: `api_social.models.Ability`  （可直接使用）
  - AbilityFavorite (Java: `NabiAbilityFavorite`) -> Python: `api_social.models.AbilityFavorite` （可直接使用）
  - Classroom (Java: `NabiClassroom`) -> Python: `api_classroom.models.Classroom` （可直接使用）
  - AbilityCertify / AbilityCertifyPastexam -> Python: `api_social.models.AbilityCertify`、`AbilityCertifyPastexam`（存在）
  - AbilityMapping / Function01AbilityMapping -> Python: `api_classroom.models.Function01AbilityMapping` / `api_social.models.AbilityMapping`（mapping table 存在）
  - actions.py -> Python 有，包含 set_cache/get_cache/del_cache_by_pattern（可直接用）

- Java 有但 Python 專案中「沒有明顯等價實作 / view / wrapper」（需要 port 或新增）：
  - Test record view (Java: `NabiTestRecordViewDao`，用於 getTestMetaInfo，取 pid 的測驗結果、統計人數、通過人數)  
    - Python: 沒有找到 `nabi_test_record_view` 或等價 view；需建立 model 或重寫查詢（port）。
  - Ability mapping view (Java: `NabiAbilityMappingViewDao`) — Java 用 `mappingViewDao.queryByAbilityId(abilityId, pid)` 取得 relative skills/tools/certify  
    - Python: 沒有 mapping view 的直接實作，但 underlying mapping table 存在，可用 join/查詢重建 view 的結果。
  - Post stats view (Java: `PostStatsViewDao` / `queryTopAbilityPostOnWallCnt`) — 用於 getTopSkill 回傳每項技能的貼文數  
    - Python: 沒有找到等價查詢/服務，需新增或簡化（例如先省略 postCount 或建立簡單聚合查詢/快取）。
  - Certify jobcat statistics (Java: `JobcertStatsTotalDao`, `JobcertStatsBDao`) — 用於 `getCertifyEnterpriseJobcatRequired`（較 heavy 的統計）  
    - Python: 未找到等價 DAO，需 port 邏輯與 cache。
  - Resource feedback (Java: `NabiResourceFeedbackDao`, 用於隱藏教室資源)  
    - Python: 沒有發現等價 model（搜尋無結果），若功能需要則需建立 model/DAO。
  - pythonApiService.updateSearchIndex(...) (Java 用於同步官方教室更新索引)  
    - Python: 需要檢查是否已有對應的 components/e104/api wrapper；若無需新增 wrapper 呼叫搜尋系統 API。

- config / utils / external wrappers:
  - DocApiService.getFileUrl(...) 用於組成圖片 URL  
    - Python: 未確認是否已有同名 wrapper，需檢查或新增。

總結：Ability / AbilityFavorite / Classroom / AbilityCertify 等核心資料模型 Python 已有可直接重用；但較多「視圖 / 統計 /聚合」相關的 DAO（test record view、post stats、cert job stats、mapping view 若為 precomputed view、resource feedback）在 Python 尚未發現，需要翻寫。

---

## 三、哪些「必須同時翻寫」？（優先級建議）
若堅守「不再依賴 Java 服務」的原則，以下元件需在翻寫三個 API 前或同時完成，因為它們被多個 API 共同使用或為核心資料來源：

高優先（請先同時翻寫）：
1. getTestMetaInfo 的支援 (Test record view / 查詢)  
   - 為 getSkill 必需，用來取得 user 的測驗層級與統計（next level 人數/通過率）。
   - 若沒有，getSkill 會缺少重要 testMeta 欄位，或要回傳空值，影響功能與前端顯示。
2. mapping view 或等價查詢（取得 relativeSkill / relativeTool / relativeCertify）  
   - 可用 `nabi_ability_mapping` + join `nabi_ability` 實作。若 mapping view 在 Java 做了額外邏輯（權重、排序），要一併移植。
3. post stats / 貼文數聚合查詢（TopSkill 需要）  
   - 若要回傳 postCount，需在 Python 建一個聚合查詢或 service（可先做簡化：回傳0或不回postCount，後續再補）。

中等優先（視使用頻率/業務影響決定）：
4. getCertifyEnterpriseJobcatRequired 的統計 + cache（證照職類需求Top）  
   - 較 heavy，牽涉到 jobcert stats table 與 cache；若 getSkill 的證照相關區塊需要，則需移；否則可先回傳較簡化內容並排期完善。
5. ResourceFeedback（hiddenResourceIdList）  
   - 若需要隱藏教材功能，否則可先回空 list，再補實作。

低優先（可稍後或用 wrapper）：
6. pythonApiService.updateSearchIndex wrapper（如果 Python 已有相同 search API，直接呼叫；否則新增 wrapper）  
   - 不直接阻斷主要資料讀取，但 updateSkillFavorite 需要呼叫同步索引以保持搜尋一致性。

---

## 四、推薦的實作策略（步驟與時間序）
為降低風險與快速交付，建議分階段實作：

階段 A（快速可用，最小改動）
- 實作 `update_skill_favorite`（WRITE）：
  - 使用現有 models (`AbilityFavorite`, `Classroom`) 做原子 update（UPDATE classroom.favorite_count = favorite_count +/- 1）。  
  - 實作 cache invalidation（del top_skill cache / ability_info cache）。  
  - 若 `pythonApiService.updateSearchIndex` wrapper 不在，先記 log 並 noop（或新增輕量 wrapper）。  
  - 優點：能快速恢復收藏功能並保護 favorite_count 一致性。此功能依賴已存在的 model，風險低。

階段 B（read API，需補少量支援）
- 實作 `get_top_skill`（READ）：
  - 先用 DB 查詢 classroom top 10（order_by favorite_count），再用 single IN 查詢取得 Ability names、再 single IN 查詢取得 pid favorites（若 pid 有），組裝結果。  
  - postCount：若尚未有 post stats service，先回傳不含 postCount 或回 0；同時建立 TODO 以便後續增加聚合查詢/快取。  
  - 加 global cache（top_skill:global:10）TTL 5~15 分鐘與「用 cache list 過濾 pid 的策略」。

階段 C（完整 getSkill）
- 實作 `get_skill`（READ，較複雜）：
  - 若要完整回傳 testMeta、certInfo、relativeSkill、hiddenResource 等，需先完成 A/B 中未包含的共用元件（尤其 getTestMetaInfo 與 mapping view、cert stats）。  
  - 可先提供「簡化版」getSkill：回傳 ability 基本資料、favorite_count、isFavorite（若 pid），其餘 heavy fields 暫時空或慢查後返回。  
  - 最終再把 getTestMetaInfo、getCertifyEnterpriseJobcatRequired 與 resource feedback 等邏輯移植完成並加入快取。

階段 D（補足 & 優化）
- 將剩下的 view/統計 port 完成（test record view、post stats、cert job stats)，並把 heavy computation 加入 actions.py 快取策略（TTL 與失效機制）。  
- 撰寫單元/整合測試，驗證一致性。

---

## 五、查詢優化 / 快取重點（針對你要求特別注意 getSkill / getTopSkill 高流量）
- Read path 優先使用 cache（ability_info、top_skill），並用小寫查詢補充 pid 專屬欄位（isFavorite 等）。  
- 使用原子 SQL 更新 classroom.favorite_count（避免 SELECT 再 UPDATE 的兩步式 race）。  
- topSkill notFollow=true 的場景：先從 global cached topN（例如 top20）做 client-side 過濾，再回 DB 補足，避免每個 request 做 subquery 排除大量 rows。  
- 對 heavy 統計（certify jobcat statistics、post counts）採用定時 job / precompute 或短 TTL cache（避免在高流量時做即時計算）。

---

## 六、結論與請求你的決策
- 我同意並支援你的原則（第1點）：若 Python 沒有等價函式就直接 port Java 邏輯，不再 wrapper Java。這能長期減少依賴與運維負擔，但短期工作量較大（尤其是 view/統計類）。  
- 我已經檢查三個 API 的共用點，並列出哪些元件 Python 已有、哪些缺少需要 port（見上方清單）。總結：核心模型（Ability / AbilityFavorite / Classroom / AbilityCertify 等）可直接重用，但 view/統計/聚合相關（TestRecordView、PostStats、Cert job stats、ResourceFeedback、mapping view 的 precomputed 表）需要你決定是否要我現在一併翻寫（高優先項目建議同時處理）。

請回覆以下兩項決策以便我開始實作：
1. 「接受分階段策略」？（推薦先做 updateSkillFavorite → getTopSkill → getSkill）或你要我一次把 getSkill 相關的共用 view/統計也一併完成？  
2. 對 `getSkill` 是否要先給「簡化版（先回 core fields，heavy fields later）」還是一次做完整版（會需要更多時間去 port test-record view、cert stats、resource feedback、doc API）？

我收到你的回覆後會：
- 若同意分階段：先把 `update_skill_favorite` 與相應 cache invalidation 實作（因為依賴最少且風險低），並提供 PR patch（或直接 apply patch），同時跑 minimal tests。  
- 若要一次完成 getSkill 的完整版：我會把需要同時翻寫的共用元件（列在「高優先」項）標記為要一併實作，並開始同時移植它們（我會先在本地跑快測試並回報進度）。

你想怎麼走？

yin039578: 我先確認～所以這三個API有共用邏輯嗎？看起來應該是沒有對嗎

GitHub Copilot: Optimizing tool selection...結論（簡短）：三個 API 在「業務流程/演算法層面」並不共用同一段核心邏輯——它們各自做不同的工作（getSkill：組裝能力詳細＋測驗/證照/相關技能；updateSkillFavorite：新增/刪除收藏並更新計數；getTopSkill：取熱門技能排名）。但它們「共用資料表與輔助元件」（共享資料源/快取/統計），所以在實作時要注意資料一致性與快取失效。換句話說：沒有單一「共用業務函式」必須一次搬完才能用，但有多個共用資源要同步處理。

細節（哪些是共用 / 會互相影響）
- 共用資料模型（都會讀/寫）
  - `Ability`（技能主檔） → 被三個 API 都會讀到（名稱、type 等）。
  - `AbilityFavorite`（技能收藏） → updateSkillFavorite 寫，getSkill/getTopSkill 讀（判斷 isFavorite）。
  - `Classroom`（教室 / favorite_count） → updateSkillFavorite 寫 favorite_count，getSkill/getTopSkill 讀 favorite_count。
- 共用/交互的行為或資源（會影響彼此結果）
  - favorite_count 的一致性：updateSkillFavorite 必須用原子 DB 更新（避免 race），否則會造成 getTopSkill 與 getSkill 讀到錯誤的數字。
  - 快取（actions.py）：getSkill、getTopSkill 應使用快取以降低 DB；updateSkillFavorite 必須失效或更新相關快取（top_skill cache、ability_info cache、activity/河道 cache 等），否則讀到舊資料。
- 只被單一 API 使用（非共用）
  - getTestMetaInfo（測驗結果與統計）：主要是 getSkill 用到，其他兩個 API 不依賴。
  - getCertifyEnterpriseJobcatRequired（證照職類統計）：主要是 getSkill（證照型技能）使用。
  - post stats（技能貼文數）：主要為 getTopSkill 使用（若要回傳 postCount）。
  - ResourceFeedback（隱藏教材）: 只有 getSkill 會檢查。

風險 / 注意點
- 若先實作 updateSkillFavorite（推薦先做），務必：
  - 使用原子 DB 更新 classroom.favorite_count（UPDATE favorite_count = favorite_count +/- 1），不要先 SELECT 再 UPDATE。
  - 成功後立即失效或更新快取（top_skill, ability_info, activity list 等）。
  - 處理重複 insert 的 IntegrityError（捕捉並忽略或 log + mail），避免整個 transaction fail 導致 count 不一致。
- getTopSkill 可藉由 global cache（top_skill:global）大量減少 DB 壓力。對 notFollow=true 的情況，建議從 cached topN 候選過濾而非每次跑大型子查詢。
- getSkill 若要完整等價（含測驗、證照、mapping、hidden resources），需要把 Java 的 view/統計（TestRecordView、mapping view、post stats、cert job stats、resource feedback）同時移植或重寫；否則可先做簡化版（只回 core fields + isFavorite/favorite_count），逐步補完 heavy parts。

建議的執行順序（依風險與可交付性）
1. implement updateSkillFavorite（先）  
   - 原子更新 favorite_count + cache invalidation + basic error handling。這一步依賴最少且能立即保障系統一致性。  
2. implement getTopSkill（next）  
   - 用 DB + global cache；先可不回傳 postCount（或回 0），之後再加 post stats。  
3. implement getSkill（最後）  
   - 若要完整對應 Java，需同時實作/port：TestRecordView、mapping view、cert stats、resource feedback；若優先交付，可先做簡化版再補 heavy components。

要我怎麼做下一步？
- 我建議先從 `updateSkillFavorite` 開始（最小風險、能保護其他讀 API 的一致性）。如果你同意，我就把 actions.py 加上 `update_skill_favorite`（包含 atomic update 與 cache invalidation），並提交變更與最少測試；之後再按上述順序處理 `getTopSkill`、`getSkill`（或按你指定的優先順序）。

yin039578: 那我們先從update_skill_favorite開始就好，後續討論就專注在這隻就好
先幫我列我需要補充哪一些資訊

GitHub Copilot: Summarizing conversation history...