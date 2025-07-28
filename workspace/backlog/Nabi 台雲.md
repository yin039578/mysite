Nabi 台雲

目前研發那邊有發現可能是爬蟲沒有被啟動，我們要找個方法驗證爬蟲是否有效
目前看起來沒有容易抓到最新資料的方法，從資料判斷可能可行的變數跟排序都無法準確抓出最新資訊
要看看是不是機制本身有一點議題，例如要跑過排序AP才會準確之類的

資料本身內容的新舊程度，但是排序也不準，可以用不條件找到更新日期的資料
https://nudb.aibot.104dc-dev.com/query?source=youtube&start=0&total=10&orderby=post_time
https://nudb.aibot.104dc-dev.com/query?source=web&start=160&total=10&orderby=post_time

看起來是流水號id但又跟post_time或track_time沒有顯著相關，最後一筆也不是最新
https://nudb.aibot.104dc-dev.com/query?source=youtube&start=0&total=10&orderby=_rid
https://nudb.aibot.104dc-dev.com/query?source=web&start=0&total=10&orderby=_rid

track_time看起來跟資料新舊沒有相關，猜測代表他被加入的日期，若是這樣可能可以知道他被放進系統的時間？
但是order看起來不準，有機會透過其他條件找到更新的track_time但這樣排序沒被排在最前面
https://nudb.aibot.104dc-dev.com/query?source=youtube&start=0&total=10&orderby=track_time > 會出錯
https://nudb.aibot.104dc-dev.com/query?source=web&start=0&total=10&orderby=track_time > 