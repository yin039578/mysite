#!/bin/bash
# Filename: run_k6_extract_csv.sh
# 說明：
# 1. 執行 k6 測試，將所有輸出存入 log 檔中。
# 2. 過濾 log 中包含 "CSV_LINE:" 的行，
#    並利用 sed 提取 "msg" 部分（只取 CSV 部分）。
# 3. 使用 awk 處理每行資料，若 error 欄位不為空則用雙引號包裹，
#    並在最前面新增欄位標頭，最終產生一個 CSV 檔案。

# 設定 k6 測試腳本檔名（請依實際修改）
#K6_SCRIPT="apim_course_by_resourceId.js"
K6_SCRIPT="apim_course_by_ability.js"
#K6_SCRIPT="apim_course_by_ability.js"


# 建立帶有 timestamp 的檔案名稱
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
OUTPUT_LOG="k6_output_${TIMESTAMP}.log"
TEMP_CSV="temp_results_${TIMESTAMP}.txt"

echo "執行 k6 測試..."
# 將 k6 測試的所有輸出記錄到 log 檔，同時輸出到 console
k6 run $K6_SCRIPT 2>&1 | tee $OUTPUT_LOG