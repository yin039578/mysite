#!/bin/bash
# Filename: run_k6_extract_csv.sh
# 說明：
# 1. 執行 k6 測試，將所有輸出存入 log 檔中。
# 2. 過濾 log 中包含 "CSV_LINE:" 的行，
#    並利用 sed 提取 "msg" 部分（只取 CSV 部分）。
# 3. 使用 awk 處理每行資料，若 error 欄位不為空則用雙引號包裹，
#    並在最前面新增欄位標頭，最終產生一個 CSV 檔案。

# 設定 k6 測試腳本檔名（請依實際修改）
K6_SCRIPT="signup_v1.js"

# 建立帶有 timestamp 的檔案名稱
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
OUTPUT_LOG="k6_output_${TIMESTAMP}.log"
TEMP_CSV="temp_results_${TIMESTAMP}.txt"
FINAL_CSV="results_${TIMESTAMP}.csv"

echo "執行 k6 測試..."
# 將 k6 測試的所有輸出記錄到 log 檔，同時輸出到 console
k6 run $K6_SCRIPT 2>&1 | tee $OUTPUT_LOG

echo "從輸出中提取 CSV 資料..."
# 使用 sed 提取每行中 msg 部分 CSV 內容
# 語法解釋：
#  - 's/.*msg="CSV_LINE:\(.*\)" source=.*$/\1/p'
#     * 從該行中尋找從 msg="CSV_LINE: 到 " source= 之間的文字，並輸出該部分
grep "CSV_LINE:" $OUTPUT_LOG | sed -n 's/.*msg="CSV_LINE:\(.*\)" source=.*$/\1/p' > $TEMP_CSV

echo "處理 CSV 格式..."
# 預設 CSV 欄位標頭（請依需求修改）
HEADER="email,nickname,pid,event_signup_id,event_signup_form_id,verify_code_id,start_time,addRespTime,queryRespTime,error"

# 利用 awk 對每行處理：
# 假設 CSV 行共10個欄位，error 為第10欄
# 如果第10欄不空，則將其包入雙引號，以防逗號衝突；若空則保持空
awk -F',' -v OFS=',' -v header="$HEADER" 'BEGIN{print header} 
{
  if (NF>=10 && $10 != "") { 
    $10 = "\"" $10 "\""
  }
  print $0
}' $TEMP_CSV > $FINAL_CSV

echo "完成！最終 CSV 結果存於 ${FINAL_CSV}"
