# [專案] 建立活動流程優化
[Jira](https://104corp.atlassian.net/browse/EVENT-929)

- [\[專案\] 建立活動流程優化](#專案-建立活動流程優化)
  - [盤點現況](#盤點現況)
    - [建立活動](#建立活動)
    - [編輯活動資訊](#編輯活動資訊)
    - [編輯報名資訊](#編輯報名資訊)
    - [編輯時間與場次](#編輯時間與場次)
  - [需求\&規則](#需求規則)
  - [流程](#流程)
    - [主要 建立主辦](#主要-建立主辦)
      - [資料異動](#資料異動)
      - [UI、流程變化](#ui流程變化)
    - [主要 報名](#主要-報名)
  - [開發範疇](#開發範疇)
    - [後端](#後端)
      - [調整新增活動API \> 3h](#調整新增活動api--3h)
      - [調整編輯活動API \> 1h](#調整編輯活動api--1h)
      - [調整編輯場次API \> 1h](#調整編輯場次api--1h)
      - [上線轉資料 \> 5h](#上線轉資料--5h)
    - [前端](#前端)
      - [\[主辦\]開發建立活動頁面](#主辦開發建立活動頁面)
      - [\[主辦\]調整活動資訊編輯頁面 TODO:規格待補](#主辦調整活動資訊編輯頁面-todo規格待補)
      - [\[主辦\]調整活動場次編輯頁面 TODO:規格待補](#主辦調整活動場次編輯頁面-todo規格待補)
      - [\[前台\]調整報名流程](#前台調整報名流程)
      - [\[後台\]調整外部活動檢視詳細頁  TODO:規格待補](#後台調整外部活動檢視詳細頁--todo規格待補)
      - [編輯器串接](#編輯器串接)
    - [上版注意](#上版注意)
    - [驗收注意](#驗收注意)
    - [延伸議題](#延伸議題)
- [prompt](#prompt)
- [Log](#log)


## 盤點現況
### 建立活動
https://meet.104-dev.com.tw/api/event/tag/list *3種type 
doc api 檔案上傳 > 含https://meet.104-dev.com.tw/api/guanyu/scanUri
https://meet.104-dev.com.tw/api/ac/category/Area 地區類目for場次

action: https://meet.104-dev.com.tw/hostApi/hostcenter/event/add

### 編輯活動資訊
https://meet.104-dev.com.tw/hostApi/hostcenter/event/header
https://meet.104-dev.com.tw/api/event/tag/list *3種type 
https://meet.104-dev.com.tw/hostApi/hostcenter/event/information
https://meet.104-dev.com.tw/hostApi/hostcenter/event/setting

action: https://meet.104-dev.com.tw/hostApi/hostcenter/event/update

### 編輯報名資訊

https://meet.104-dev.com.tw/hostApi/hostcenter/event/header
https://meet.104-dev.com.tw/hostApi/hostcenter/event/information
https://meet.104-dev.com.tw/hostApi/hostcenter/event/setting

action: https://meet.104-dev.com.tw/hostApi/hostcenter/event/setting/update

### 編輯時間與場次
https://meet.104-dev.com.tw/hostApi/hostcenter/event/header
https://meet.104-dev.com.tw/api/ac/category/Area 地區類目for場次
https://meet.104-dev.com.tw/hostApi/hostcenter/event/signup_time
https://meet.104-dev.com.tw/hostApi/hostcenter/event/session

action: https://meet.104-dev.com.tw/hostApi/hostcenter/event/signup_time/update

action: 
https://meet.104-dev.com.tw/hostApi/hostcenter/event/session/check_signup
https://meet.104-dev.com.tw/hostApi/hostcenter/event/session/update


## 需求&規則
1.建立新的建立活動流程
2.建立新的報名頁面流程
 
## 流程
### 主要 建立主辦
#### 資料異動
1. 移除議程、主講人、注意事項、活動圖片欄位:schedule_type,schedule_desc,attach_list/speaker_list/cautions_desc/attach_list
   1. 代表以後建立活動時不會有這些欄位，編輯時欄位也需要調整移除這幾項，舊活動就需要把這些欄位整合，同時跟使用者溝通運作方式，避免呈現出來的資訊如預期。
   2. **議程有圖片/文字兩種格式** 
2. 移除google map位置欄位:location_url
#### UI、流程變化
1. 建立活動過程隨侍可以預覽
   1. 預覽為獨立頁，不是呈現已能呈現的內容，而是有模板，呈現出需編輯的部分
2. 活動大圖增加上傳時裁切功能(已有現成元件)
3. 活動資訊與場次資訊放到同頁編輯
4. 活動資訊部分內容收納起來用push up彈出視窗編輯
5. 新的pushup彈出視窗
6. 在報名資訊頁增加問券設定
7. 編輯場次地址時，就會出現google map > 異動資訊
### 主要 報名
1. UI調整，不跳頁，在單頁元件上完成報名流程
 
## 開發範疇
### 後端
#### 調整新增活動API > 3h
1. 增加內容html安全性檢查
2. 移除不必要的欄位:schedule_type,schedule_desc,attach_list/speaker_list/cautions_desc/attach_list
3. TODO:是否要保留attach_list欄位，至少可以知道檔案與活動的關聯性，但除了知道以外好像沒有其他用途，除非有需要究責之類的
#### 調整編輯活動API > 1h
1. 增加內容html安全性檢查
2. 移除不必要的欄位:schedule_type,schedule_desc,attach_list/speaker_list/cautions_desc/attach_list
#### 調整編輯場次API > 1h
1. 移除不必要的欄位:location_url
#### 上線轉資料 > 5h
1. 開發一隻API指定複數ID，進行資料轉換運作
2. 開發一個TASK，撈出全部活動，有間隔的有間隔的呼叫轉資料API
資料數
prod:798
stg:702
lab:868
**注意事項**
1. 將舊活動的議程、主講人、注意事項、活動圖片欄位資料轉移到活動資訊欄位
2. 舊資料保留一段期間避免資料轉歪可以重轉，指定單筆重轉機制，方便測試與補救
3. 保留attach_list欄位議題

### 前端
#### [主辦]開發建立活動頁面
1. 新增建立活動頁面-活動資訊
2. 新增建立活動頁面-報名資訊
3. 新增建立活動頁面-預覽頁面
4. 注意google map相關串接
#### [主辦]調整活動資訊編輯頁面 TODO:規格待補
1. 調整活動資訊相關欄位、編輯器
#### [主辦]調整活動場次編輯頁面 TODO:規格待補
1. 調整google map相關串接
#### [前台]調整報名流程
1. 注意頁面Keep寫到一半的報名資訊的運作 TODO:規格待補
#### [後台]調整外部活動檢視詳細頁  TODO:規格待補
#### 編輯器串接
1. 注意編輯器可能的資安議題


### 上版注意
1. 要轉資料
2. 要通知用戶格式會有異動

### 驗收注意

### 延伸議題

# prompt

# Log
========================================================