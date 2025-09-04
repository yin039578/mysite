# Task [工程] 調整log機制，避免呈現個資於log裡
[Jira](https://104corp.atlassian.net/browse/EVENT-937)

## 需求&規則
原因：
發現log裡包含了個資，為符合公司規定，調整log機制

目標：
meet-web-ecs / meet-api-ecs / meet-crm-ecs / meet-drtq-ecs
以上服務的log都把個資相關資訊移除
短期目標：個資去識別化
長期目標：避免log需要個資資訊



## 盤點
### meet-api-ecs
無
### meet-drtq-ecs
- sqlalchemy.engine.Engine
    官方寄件資料，名碼非個資
- emit_email_notify
  - receiver_name 包含完整姓名
  - content 可能 包含完整姓名
  - to_email 完整 email
  - receiver_email 完整 email
  - cc_email 完整 email
- emit_host_email_notify
  -  receiver_email 完整 email
  - cc_email 完整 email
- emit_sms_notify
  - receiver_cellphone 完整 cellphone
### meet-web-ecs
- reset-csrf-cookie
- api-pass-through 
  - api body: 含完整個資
### meet-crm-ecs


## 開發範疇
### 後端
後端實作方式：
1. 建立一個新的string util function
   1. regexp parse出mail/或手機
   2. 驗證+正規化
   3. 加入前綴
   4. md5編碼並加上類型(em|ph)前綴
   5. 回傳結果
2. 有需要遮蔽的字串把資料丟進去處理，用處理過的資料寫log

### 前端
#### 前端task1
#### 前端task2

### 上版注意

### 驗收注意

### 延伸議題

# prompt

# Log
========================================================