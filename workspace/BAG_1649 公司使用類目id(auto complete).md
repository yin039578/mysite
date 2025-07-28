# Task 【Giver】Giver申請頁學校/公司使用類目id(auto complete)
[Jira](https://104corp.atlassian.net/browse/GIVERFARM-1649)

## 估時
### 初期
- 預估時間
  - 需求釐清與API確認：0.5 天
  - 後端（API調整/驗證、資料欄位確認、測試）：1 天
  - 整合測試與修正：0.5 天
- AI預估時間
  - 需求釐清與API確認：1 天
  - 後端（API調整/驗證、資料欄位確認、測試）：1 天
  - 整合測試與修正：0.5 天
- 實際時間
- AI優化時間
### SA完調整


## 需求&規則
Giver申請頁接學校/公司的auto complete功能，中台存schoolid，custno
人才社群需要相關資料來做排序，所以希望搜集的資料都包含這些欄位
### 問題
- 目前看起來，BAG欄位是少於中台欄位的，在BAG這邊編輯過資料就會變得有缺漏
當前情境是：
1.從產品取得資料
2.編輯後保留產品需要的內容寫入DB
3.把產品編修結果回寫中台
 
建議需要編修的情境：
1.先從中台取資料
2.編輯後保留產品需要的內容寫入DB
3.把中台取回資料加入編修結果回寫中台
  - 代表有編輯到的“類型”的model就要對齊中台，避免資料在我們這邊遺失
- 承上，若是在我們這邊新增的，中台取得的資料會少一點點，如就學期間我們UI沒有地方填寫就不會出現
## 流程

### User在前台Giver申請頁進行申請
GET https://beagiver.104-dev.com.tw/apply/step-[1-3]
  GET https://beagiver.104-dev.com.tw/api/user/applyGiver
  GET https://beagiver.104-dev.com.tw/api/user > 取得學歷與現任職務，學歷是陣列
PUT https://beagiver.104-dev.com.tw/api/user/applyGiver 
### User在前台Giver申請頁進行查看
GET https://beagiver.104-dev.com.tw/apply/step-[1-3]
### 在後台Giver申請頁進行查看
GET https://crm.beagiver.104dc-dev.com/api/apply/{applyId}
### 在後台Giver資料頁進行查看
GET https://crm.beagiver.104dc-dev.com/api/user/S1TVYHxe

 
## 開發範疇
### 後端
#### 後端task1
#### 後端task2

### 前端
#### 前端task1
#### 前端task2

### 上版注意

### 驗收注意

### 延伸議題

#### 意外500error
GET https://crm.beagiver.104dc-dev.com/api/apply/92fbbd6e-b52d-4fa1-995f-d18e72fc75ca 

# prompt

# Log
========================================================
- 5/23
  - 需求釐清與API確認 0.5h
  - 試圖用AI處理，規劃時間 0.5h
- 5/26
  - 釐清當前提出申請流程 預估時間 0.5h
  - 釐清edu同步議題，確認中台運作模式 1.5h
  - 釐清修正log設定與基礎運作 1h
  - 釐清同步超過筆數的學歷議題 1h
- 5/27
  - 修正log設定與基礎運作驗收與筆記 0.5h
  - 釐清同步超過筆數的學歷議題 0.5h
  - 思考整體運作與決定做法並同步給pm1h