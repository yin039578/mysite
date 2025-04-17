import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";
import { SharedArray } from "k6/data";

// ========= 統一設定區 =========
const CONFIG = {
  event_id: "0037bce4-706d-4dfb-a1a0-eaa9b62dfa2c",
  session_id: "c72c23b9-5a56-4d20-a78c-8a19d5447d2e",  // 固定 session_id
  vus: 10,  // 指定併發數
  maxDuration: "10m",  // 最大執行時間
};

// ========= 讀取 CSV 資料 =========
const csvData = new SharedArray("Users", function () {
  const f = open("AC_batch.csv");
  const lines = f.split("\n").filter(line => line.trim() !== "");
  const headers = lines[0].split(",").map(x => x.trim());
  let data = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(x => x.trim());
    let row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = cols[j];
    }
    data.push(row);
  }
  return data;
});
const totalCSV = csvData.length;

// ========= 每個 VU 應處理的迭代數 =========
const iterationsPerVU = Math.ceil(totalCSV / CONFIG.vus);

// ========= 指標 =========
let addTrend   = new Trend("add_api_response_time");
let queryTrend = new Trend("query_api_response_time");
let addRate    = new Rate("add_api_success_rate");
let queryRate  = new Rate("query_api_success_rate");

// ========= UUID 產生函式 =========
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0;
    let v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ========= 時間格式化函式 =========
function formatTime(d) {
  let year = d.getFullYear();
  let month = ("0" + (d.getMonth() + 1)).slice(-2);
  let day = ("0" + d.getDate()).slice(-2);
  let hours = ("0" + d.getHours()).slice(-2);
  let minutes = ("0" + d.getMinutes()).slice(-2);
  let seconds = ("0" + d.getSeconds()).slice(-2);
  return `${year}${month}${day} ${hours}:${minutes}:${seconds}`;
}

// ========= API 回應驗證 =========
// 針對 add API，檢查 HTTP status 需為 200 且回應 JSON 中 success 為 true, data.is_ok 為 true, data.status 為 1
// 回傳物件 { ok: boolean, error: string }
function validateResponse(res, label) {
  if (res.status !== 200) {
    return { ok: false, error: `${label} HTTP error: ${res.status}` };
  }
  let json;
  try {
    json = JSON.parse(res.body);
  } catch (e) {
    return { ok: false, error: `${label} response invalid JSON: ${res.body}` };
  }
  if (json.success !== true || !json.data || json.data.is_ok !== true || json.data.status !== 1) {
    let msg = (json.data && json.data.msg) ? json.data.msg : `HTTP error: ${res.status}`;
    return { ok: false, error: `${label} validation failed: ${msg}` };
  }
  return { ok: true, error: "" };
}

// ========= k6 Options =========
// 使用 per-vu-iterations executor，每個 VU 執行 iterationsPerVU 次
export let options = {
  scenarios: {
    test: {
      executor: "per-vu-iterations",
      vus: CONFIG.vus,
      iterations: iterationsPerVU,
      maxDuration: CONFIG.maxDuration,
    },
  },
};

// ========= default() 主流程 =========
export default function () {
  // 若本 VU 的局部計數 __ITER 超出 iterationsPerVU 則退出
  if (__ITER >= iterationsPerVU) {
    console.log(`VU ${__VU} reached its iteration limit (${iterationsPerVU}). Exiting.`);
    return;
  }
  
  // 計算全局唯一索引，避免不同 VU 取重複資料
  const globalIdx = (__VU - 1) * iterationsPerVU + __ITER;
  if (globalIdx >= totalCSV) return;
  
  // 取得起始呼叫時間（以本地 Asia/Taipei 時區格式化，不含逗號）
  const startTime = formatTime(new Date());
  
  console.log(`Processing global index: ${globalIdx} of ${totalCSV} at ${startTime}`);
  
  const user = csvData[globalIdx];
  const headers = { "Content-Type": "application/json" };

  // --- 呼叫報名 API (add) ---
  const eventSignupId = uuidv4();
  const addPayload = JSON.stringify({
    event_id: CONFIG.event_id,
    pid: parseInt(user.pid),
    signup_info_list: [
      {
        nickname: user.nickname,
        email: user.email,
        event_signup_id: eventSignupId,
        signup_session_ids: [ CONFIG.session_id ],
        answer_list: [],
        main_applicant: true
      }
    ]
  });
  
  let addRes = http.post("https://api.meet.104dc-dev.com/api/event/query/signup/add", addPayload, { headers });
  let addRespTime = addRes.timings.duration;
  addTrend.add(addRespTime);
  let addValidation = validateResponse(addRes, "add API");
  let addSuccess = addValidation.ok;
  addRate.add(addSuccess);
  
  let csvLine = "";
  if (!addSuccess) {
    csvLine = `${user.email},${user.nickname},${user.pid},${eventSignupId},N/A,${startTime},${addRespTime},N/A,${addValidation.error}`;
    console.log("CSV_LINE:" + csvLine);
    return;
  }
  sleep(1);
  
  // --- 呼叫查詢 API (query) ---
  const queryUrl = `https://api.meet.104dc-dev.com/api/event/query/${CONFIG.event_id}?pid=${user.pid}`;
  let queryRes = http.get(queryUrl);
  let queryRespTime = queryRes.timings.duration;
  queryTrend.add(queryRespTime);
  let querySuccess = (queryRes.status === 200);
  queryRate.add(querySuccess);
  if (!querySuccess) {
    csvLine = `${user.email},${user.nickname},${user.pid},${eventSignupId},N/A,${startTime},${addRespTime},${queryRespTime},query API HTTP error: ${queryRes.status}`;
    console.log("CSV_LINE:" + csvLine);
    return;
  }
  
  let queryData;
  try {
    queryData = JSON.parse(queryRes.body);
  } catch (e) {
    csvLine = `${user.email},${user.nickname},${user.pid},${eventSignupId},N/A,${startTime},${addRespTime},${queryRespTime},query response invalid JSON`;
    console.log("CSV_LINE:" + csvLine);
    return;
  }
  
  // 從 query 回應中解析 event_signup_form_id
  let signupFormId = "N/A";
  if (queryData.data && queryData.data.signup_info && queryData.data.signup_info.length > 0) {
    signupFormId = queryData.data.signup_info[0].event_signup_form_id || "N/A";
  } else {
    csvLine = `${user.email},${user.nickname},${user.pid},${eventSignupId},N/A,${startTime},${addRespTime},${queryRespTime},no signup_info returned`;
    console.log("CSV_LINE:" + csvLine);
    return;
  }
  
  // 從 session_list 找出與 CONFIG.session_id 相同的 session 物件，並抓取 verify_code_id
  let verifyCodeId = "N/A";
  if (queryData.data && queryData.data.session_list && queryData.data.session_list.length > 0) {
    for (let i = 0; i < queryData.data.session_list.length; i++) {
      let sessionObj = queryData.data.session_list[i];
      if (sessionObj.session_id === CONFIG.session_id) {
        verifyCodeId = sessionObj.verify_code_id || "N/A";
        break;
      }
    }
  }
  
  csvLine = `${user.email},${user.nickname},${user.pid},${eventSignupId},${signupFormId},${verifyCodeId},${startTime},${addRespTime},${queryRespTime},`;
  console.log("CSV_LINE:" + csvLine);
  sleep(1);
}
