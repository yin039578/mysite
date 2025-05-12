# K6活動吧測試工具與說明
## 基本說明
1.基於K6工具搭建的測試工具  
2.每次有定版會加一個_v{x}版號
3.隨測試code附上測試資料範本與程式與產生該程式的prompt，模型版本附上在程式的頭
4.測試時會造成lab不穩定，注意不要影響到其他測試
5.測試含寄信的流程時，若在aws上，注意aws的寄信數量是共用的，若要大量測試請洽SRE與通知同aws帳號上的其他產品

### 安裝與執行
#### 安裝
macOS 安裝方式可以用brew安裝
```
    brew install k6
```

#### 編寫測試腳本
需用Js編寫測試腳本，包含執行緒數量，呼叫流程，檢測點等，請參考官方

#### 執行
```
    k6 run script.js
```

#### bash方式執行
基於K6測試的機制，為降低其他因素影響測試，測試期間無法使用io紀錄，且各執行緒間沒有共用變數可以使用
所以這邊為了產生測試報告或是將資料存入csv，讓該資料可以被分析或是用來當成其他測試的輸入，採取了bash方式做後續處理
流程如下：
1.寫測試script時將測試過程產的資料寫在console
2.執行時，將所有console log寫入檔案中
3.整理console log，將需要的資料提取出來，整理成csv格式並寫入檔案中
為了見簡化上述內容，將流程寫入bash script中
執行bash script時，會自動執行k6測試，並將結果寫入log檔案中
執行bash script後方法如下
```
    // 移動到bash script所在目錄
    cd k6/meet/signup
    // 提供bash執行權限
    chmod +x run.sh
    // 執行bash script
    ./run.sh
    // 執行後會產生一個log檔案，並且會將log檔案中的資料整理成csv格式，並寫入results.csv中
```
## 報名+報到
### 報名
1.整理AC_batch.csv，決定報名者數量，有提供AC_batch_origin含5000個lab帳號
2.去建立一個活動，不要填寫任何資料，設定完要進行"發佈"
3.若是要接著測試現場報到，場次設定設定需要qrcode，且需要審核
4.複製event_id,session_id到signup_v1.js
event_id從瀏覽器url取得即可
session_id從瀏覽器network面板取得會比較簡單，功能:時間與場次, api path:https://meet.104-dev.com.tw/hostApi/hostcenter/event/session
5.調整併發數，時間上限
6.執行./run.sh
7.檢查報告

#### 已知現況 2025/4/17
10個上下一點應該是剛好是我們服務的甜蜜點
- 100筆
  - 10 VUs 01m08.4s 0%失敗率
  - 20 VUs 01m11.7s 27%失敗率 > 伺服器繁忙，無法取得正確序號 > 有一點deadlock
  - 30 VUs 01m22.7s 64%失敗 > 伺服器繁忙，無法取得正確序號 18% + 502 46% > 有一點deadlock

### 報到
1.複製從"報名"測試產出的result csv到showup測試資料夾
2.檢查內容、排序、可用資料數量
3.去主辦中心建立掃碼授權權限url
4.進入授權權限url並登入，讓登入者取得掃描權限
5.回到主辦中心重新進入授權管理頁取得support_id
從瀏覽器network面板取得會比較簡單, api path:https://meet.104-dev.com.tw/hostApi/hostcenter/event/auth/support/list?host_id={host_id}1&={event_id}
5.調整併發數，時間上限
6.執行./run.sh
7.檢查報告
#### 已知現況 2025/4/17
30~40個上下一點應該是剛好是我們服務的甜蜜點
- 100筆
  - 10 VUs 26.1s 0%失敗率
  - 20 VUs 15.5s 0%失敗率
  - 30 VUs 13.0s 0%失敗率
  - 50 VUs 12.1s 5%失敗率
- 200筆
  - 70 VUs 21.9s 26%失敗率



## 報名 查詢 修改 刪除 循環測試 2025/3
用相同帳號在同樣活動下無限的重複報名，好處是不用很多帳號就能進行測試
但因為會需要抓出最後報名時間，所以會抓出同一個User報名的全部資料排序
所以隨著測試數量增加，處理的資料量就會增加，造成效能降低
所以這個測試不是很建議，目前QA在Stg是用這個方式測試的
