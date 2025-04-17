import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// 產生 v4 UUID 函式（僅用於產生 event_signup_id，不影響 sessionId）
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0;
    let v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 自訂檢查函式，針對 POST, PUT, DELETE API
function validateResponse(res, label) {
  if (res.status !== 200) {
    console.error(`${label} HTTP status not 200: ${res.status}`);
    return false;
  }
  let json;
  try {
    json = JSON.parse(res.body);
  } catch (e) {
    console.error(`${label} response is not valid JSON: ${res.body}`);
    return false;
  }
  if (json.success !== true || !json.data || json.data.is_ok !== true || json.data.status !== 1) {
    let msg = json.data && json.data.msg ? json.data.msg : "No msg available";
    console.error(`${label} validation failed: msg: ${msg}`);
    return false;
  }
  return true;
}

// 定義各 API 的指標（Trend: 回應時間，Rate: 成功率）
let addTrend    = new Trend("add_api_response_time");
let queryTrend  = new Trend("query_api_response_time");
let auditTrend  = new Trend("audit_api_response_time");
let cancelTrend = new Trend("cancel_api_response_time");

let addRate    = new Rate("add_api_success_rate");
let queryRate  = new Rate("query_api_success_rate");
let auditRate  = new Rate("audit_api_success_rate");
let cancelRate = new Rate("cancel_api_success_rate");

// 全域 User List，每筆資料代表一位使用者
const users = [
  { pid: 270715, nickname: "測試01", email: "batch0001@batch.com.tw" },
  { pid: 276827, nickname: "測試02", email: "batch0002@batch.com.tw" },
  { pid: 271826, nickname: "測試03", email: "batch0003@batch.com.tw" },
  { pid: 271827, nickname: "測試04", email: "batch0004@batch.com.tw" },
  { pid: 271828, nickname: "測試05", email: "batch0005@batch.com.tw" },
  { pid: 271829, nickname: "測試06", email: "batch0006@batch.com.tw" },
  { pid: 271830, nickname: "測試07", email: "batch0007@batch.com.tw" },
  { pid: 271831, nickname: "測試08", email: "batch0008@batch.com.tw" },
  { pid: 271832, nickname: "測試09", email: "batch0009@batch.com.tw" },
  { pid: 271833, nickname: "測試10", email: "batch0010@batch.com.tw" },
];

// 測試設定：使用 3 個 VU，持續執行 600 秒
export let options = {
  vus: 10,
  duration: '60s'
};

const EVENT_ID = "ab8b378a-ae3c-4a7a-aa7f-c4d4eb00bbdc";

// 重試函式：傳入 HTTP 呼叫函式、檢查函式、標籤、對應 Trend 與 Rate 指標
function retryRequest(httpCallFunc, validateFunc, label, trendMetric, rateMetric) {
  let attempt = 0;
  let res;
  while (attempt < 3) {
    res = httpCallFunc();
    trendMetric.add(res.timings.duration);
    let ok = validateFunc(res, label);
    rateMetric.add(ok);
    if (ok) {
      return res;
    }
    console.error(`Thread ${__VU} ${label} attempt ${attempt + 1} failed, response: ${res.body}`);
    attempt++;
    sleep(1);
  }
  console.error(`Thread ${__VU} abandoning thread after ${label} failed 3 times at ${new Date().toISOString()}`);
  return null;
}

export default function () {
  // 根據 __VU (從 1 開始) 指定唯一使用者
  const user = users[__VU - 1];
  let headers = { 'Content-Type': 'application/json' };

  // 1. add API: 報名
  const eventSignupId = uuidv4();
  let addPayload = JSON.stringify({
    event_id: EVENT_ID,
    pid: user.pid,
    signup_info_list: [
      {
        nickname: user.nickname,
        email: user.email,
        event_signup_id: eventSignupId,
        signup_session_ids: [ "b0fffba5-5bb6-4ed1-87ac-d36bbc56c7b0" ],
        answer_list: [],
        main_applicant: true
      }
    ]
  });
  let addRes = retryRequest(
    () => http.post("https://api.meet.104dc-dev.com/api/event/query/signup/add", addPayload, { headers }),
    validateResponse,
    "add API",
    addTrend,
    addRate
  );
  if (addRes === null) return;
  sleep(1);

  // 2. query API: 查詢報名結果（僅檢查 HTTP 狀態）
  let queryUrl = `https://api.meet.104dc-dev.com/api/event/query/${EVENT_ID}?pid=${user.pid}`;
  let queryRes = retryRequest(
    () => http.get(queryUrl),
    (r, label) => {
      let ok = r.status === 200;
      if (!ok) {
        console.error(`${label} HTTP status not 200: ${r.status}`);
      }
      return ok;
    },
    "query API",
    queryTrend,
    queryRate
  );
  if (queryRes === null) return;
  let queryData = JSON.parse(queryRes.body);
  let signupFormId = queryData.data.signup_info && queryData.data.signup_info[0] ? queryData.data.signup_info[0].event_signup_form_id : null;
  if (!signupFormId) {
    console.error(`Thread ${__VU} query API did not return a valid signup_form_id, response: ${queryRes.body}`);
    return;
  }
  sleep(1);

  // 3. audit API: 修改報名
  let signupInfo = queryData.data.signup_info[0];
  let auditPayload = JSON.stringify({
    event_id: EVENT_ID,
    pid: user.pid,
    event_signup_form_id: signupFormId,
    signup_list: [
      {
        signup_session_ids: [ "daba40e6-8b37-4ef4-9425-09b6eca2f341" ],
        answer_list: [],
        is_add_user: false,
        nickname: signupInfo.nickname,
        email: signupInfo.email,
        cellphone: signupInfo.cellphone || null,
        birthday: signupInfo.birthday || null,
        address: signupInfo.address || null,
        post_num: signupInfo.post_num || null,
        company_name: signupInfo.company_name || null,
        job_name: signupInfo.job_name || null,
        degree_level: signupInfo.degree_level || null,
        school_id: signupInfo.school_id || null,
        school_name: signupInfo.school_name || null,
        major_id: signupInfo.major_id || null,
        major_name: signupInfo.major_name || null,
        company_invoice: signupInfo.company_invoice || null,
        company_phone: signupInfo.company_phone || null,
        company_mail: signupInfo.company_mail || null,
        employment_status: signupInfo.employment_status || null,
        ind_cat_no: signupInfo.ind_cat_no || null,
        personal_agree_time: "2025-03-13T17:56:12",
        group_agree_time: signupInfo.group_agree_time || null,
        exp_period_years: signupInfo.exp_period_years || null,
        job_cat_no: signupInfo.job_cat_no || null,
        residence_num: signupInfo.residence_num || null,
        cellphone_type: signupInfo.cellphone_type || 1,
        id: signupInfo.id,
        post_num_desc: signupInfo.post_num_desc || "",
        job_cat_no_desc: signupInfo.job_cat_no_desc || "",
        residence_num_desc: signupInfo.residence_num_desc || "",
        ind_cat_no_desc: signupInfo.ind_cat_no_desc || "",
        employment_status_desc: signupInfo.employment_status_desc || null,
        status: signupInfo.status,
        comment: signupInfo.comment || null,
        main_applicant: signupInfo.main_applicant,
        modify_status_date: signupInfo.modify_status_date || null
      }
    ]
  });
  let auditRes = retryRequest(
    () => http.put("https://api.meet.104dc-dev.com/api/event/query/signup/audit", auditPayload, { headers }),
    validateResponse,
    "audit API",
    auditTrend,
    auditRate
  );
  if (auditRes === null) return;
  sleep(1);

  // 4. cancel API: 取消報名
  let cancelPayload = JSON.stringify({
    event_signup_form_id: signupFormId,
    pid: user.pid
  });
  let cancelRes = retryRequest(
    () => http.post("https://api.meet.104dc-dev.com/api/event/query/signup/cancel", cancelPayload, { headers }),
    validateResponse,
    "cancel API",
    cancelTrend,
    cancelRate
  );
  if (cancelRes === null) return;
  sleep(1);
}

// handleSummary：產生報告檔案並同時印出於 console
export function handleSummary(data) {
  const threads = __ENV.THREADS || options.vus;
  const duration = __ENV.DURATION || options.duration;
  const time = new Date().toISOString();
  const fileName = `report_${threads}_${duration}_${time}.json`;

  // 將 summary 內容格式化為較易閱讀的表格式輸出於 console
  const summaryOutput = [];
  summaryOutput.push(`Test Summary Report`);
  summaryOutput.push(`Threads: ${threads}`);
  summaryOutput.push(`Duration: ${duration}`);
  summaryOutput.push(`Timestamp: ${time}`);
  summaryOutput.push(`-------------------------------`);
  summaryOutput.push(`HTTP Requests: ${data.metrics.http_reqs.count}`);
  summaryOutput.push(`Avg Response Time: ${data.metrics.http_req_duration.avg.toFixed(2)} ms`);
  summaryOutput.push(`Success Rate (Overall): ${((data.metrics.checks.passes / data.metrics.checks.count) * 100).toFixed(2)}%`);
  summaryOutput.push(`-------------------------------`);
  summaryOutput.push(`Detailed Metrics:`);
  summaryOutput.push(JSON.stringify(data.metrics, null, 2));
  
  console.log(summaryOutput.join('\n'));

  console.log(`Saving summary report to: ${fileName}`);
  return {
    [fileName]: JSON.stringify(data, null, 2)
  };
}
