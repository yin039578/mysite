// gpt-o3mini-high 2025/3
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
  duration: '1800s'
};

const EVENT_ID = "d4284ce3-3c49-4983-9f8b-f5f70b654fb8";

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

export function setup() {
  let headers = { 'Content-Type': 'application/json' };
  let errors = [];
  
  users.forEach(user => {
    // 使用 query API 檢查現有報名資料
    let queryUrl = `https://api.meet.104dc-dev.com/api/event/query/${EVENT_ID}?pid=${user.pid}`;
    let res = http.get(queryUrl);
    if (res.status !== 200) {
      let msg = `Cleanup: GET for user pid ${user.pid} failed with status ${res.status}`;
      console.error(msg);
      errors.push(msg);
      return;
    }
    let data;
    try {
      data = JSON.parse(res.body);
    } catch (e) {
      let msg = `Cleanup: GET for user pid ${user.pid} returned invalid JSON`;
      console.error(msg);
      errors.push(msg);
      return;
    }
    // 若有報名資料，則進行 cancel API 清除
    if (data.data && data.data.signup_info && data.data.signup_info.length > 0) {
      let signupFormId = data.data.signup_info[0].event_signup_form_id;
      if (signupFormId) {
        let cancelPayload = JSON.stringify({
          event_signup_form_id: signupFormId,
          pid: user.pid
        });
        let cancelRes = http.post("https://api.meet.104dc-dev.com/api/event/query/signup/cancel", cancelPayload, { headers });
        if (cancelRes.status !== 200) {
          let msg = `Cleanup: Cancel for user pid ${user.pid} failed with status ${cancelRes.status}`;
          console.error(msg);
          errors.push(msg);
        } else {
          console.log(`Cleanup: Cancel for user pid ${user.pid} succeeded`);
        }
      }
    } else {
      console.log(`Cleanup: No signup info for user pid ${user.pid}`);
    }
  });
  
  if (errors.length > 0) {
    console.error("Cleanup errors encountered:");
    errors.forEach(err => console.error(err));
    // 拋出錯誤阻止後續正式測試執行，錯誤訊息將在 console 中呈現，
    // 報表內容也會只包含正式測試執行的部分，不含 cleanup 資料
    throw new Error("Cleanup failed, aborting test execution");
  } else {
    console.log("Cleanup completed successfully");
  }
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
        signup_session_ids: [ "a3f2b6a6-f03a-4dea-83f0-731d6f193106" ],
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
        signup_session_ids: [ "6a8b4a17-ef59-4c96-87a8-64b60c2c6aec" ],
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

// handleSummary：產生 HTML 報告檔案，同時在 console 印出報告摘要
export function handleSummary(data) {
  const threads = __ENV.THREADS || options.vus;
  const duration = __ENV.DURATION || options.duration;
  const now = new Date();
  // 取得 Asia/Taipei 時區的本地時間
  const localTime = now.toLocaleString("sv-SE", { timeZone: 'Asia/Taipei', hour12: false });
  // 將空白與冒號替換成 "-"，以免檔案命名不合法
  const safeTime = localTime.replace(/[: ]/g, "-");
  const fileName = `report_${threads}_${duration}_${safeTime}.html`;

  // Summary 部分從 values 屬性讀取各指標值
  const avgResponseTime = data.metrics.http_req_duration &&
    data.metrics.http_req_duration.values &&
    data.metrics.http_req_duration.values.avg !== undefined
      ? data.metrics.http_req_duration.values.avg.toFixed(2)
      : "0.00";
  const maxResponseTime = data.metrics.http_req_duration &&
    data.metrics.http_req_duration.values &&
    data.metrics.http_req_duration.values.max !== undefined
      ? data.metrics.http_req_duration.values.max.toFixed(2)
      : "0.00";
  const minResponseTime = data.metrics.http_req_duration &&
    data.metrics.http_req_duration.values &&
    data.metrics.http_req_duration.values.min !== undefined
      ? data.metrics.http_req_duration.values.min.toFixed(2)
      : "0.00";
  const httpReqCount = data.metrics.http_reqs &&
    data.metrics.http_reqs.values &&
    data.metrics.http_reqs.values.count !== undefined
      ? data.metrics.http_reqs.values.count
      : 0;
  const checksCount = data.metrics.checks &&
    data.metrics.checks.values &&
    data.metrics.checks.values.count !== undefined
      ? data.metrics.checks.values.count
      : 0;
  const checksPasses = data.metrics.checks &&
    data.metrics.checks.values &&
    data.metrics.checks.values.passes !== undefined
      ? data.metrics.checks.values.passes
      : 0;
  const overallSuccessRate = checksCount > 0 ? ((checksPasses / checksCount) * 100).toFixed(2) : "0.00";

  // K6 官方標準排序（包含各別 API 與其他整體資料）
  const officialOrder = [
    "add_api_success_rate",
    "add_api_response_time",
    "query_api_success_rate",
    "query_api_response_time",
    "audit_api_success_rate",
    "audit_api_response_time",
    "cancel_api_success_rate",
    "cancel_api_response_time",
    "http_reqs",
    "http_req_duration",
    "http_req_waiting",
    "http_req_blocked",
    "http_req_connecting",
    "http_req_sending",
    "http_req_receiving",
    "http_req_tls_handshaking",
    "http_req_failed",
    "data_sent",
    "data_received",
    "iterations",
    "vus",
    "vus_max",
    "iteration_duration"
  ];
  
  // 分組：官方排序內的 key 以及其他依字母排序的 key
  let officialKeys = [];
  for (const key of officialOrder) {
    if (data.metrics[key]) {
      officialKeys.push(key);
    }
  }
  let remainingKeys = Object.keys(data.metrics).filter(k => !officialOrder.includes(k));
  remainingKeys.sort(); 
  const allKeysOrdered = [...officialKeys, ...remainingKeys];

  // 依照欄位順序：Metric, Type, Count, Passes, Fails, Avg, Med, Min, Max, p(90), p(95), Rate
  function makeRow(metric, mData) {
    const type = mData.type;
    const values = mData.values || {};
    let count = "", passes = "", fails = "", avg = "", med = "", min = "", max = "", p90 = "", p95 = "", rate = "";
    if (type === "trend") {
      avg = values.avg !== undefined ? values.avg.toFixed(2) : "";
      med = values.med !== undefined ? values.med.toFixed(2) : "";
      min = values.min !== undefined ? values.min.toFixed(2) : "";
      max = values.max !== undefined ? values.max.toFixed(2) : "";
      p90 = values["p(90)"] !== undefined ? values["p(90)"].toFixed(2) : "";
      p95 = values["p(95)"] !== undefined ? values["p(95)"].toFixed(2) : "";
    } else if (type === "counter") {
      count = values.count !== undefined ? values.count : "";
      rate = values.rate !== undefined ? values.rate.toFixed(2) : "";
    } else if (type === "rate") {
      passes = values.passes !== undefined ? values.passes : "";
      fails = values.fails !== undefined ? values.fails : "";
      rate = values.rate !== undefined ? values.rate.toFixed(2) : "";
    } else if (type === "gauge") {
      avg = values.value !== undefined ? values.value : "";
      min = values.min !== undefined ? values.min : "";
      max = values.max !== undefined ? values.max : "";
    } else {
      avg = JSON.stringify(values);
    }
    return `<tr>
      <td>${metric}</td>
      <td>${type}</td>
      <td>${count}</td>
      <td>${passes}</td>
      <td>${fails}</td>
      <td>${avg}</td>
      <td>${med}</td>
      <td>${min}</td>
      <td>${max}</td>
      <td>${p90}</td>
      <td>${p95}</td>
      <td>${rate}</td>
    </tr>`;
  }
  
  let detailedRows = "";
  allKeysOrdered.forEach(key => {
    detailedRows += makeRow(key, data.metrics[key]);
  });

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>k6 Test Report</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; }
      h1, h2 { color: #333; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
      th { background-color: #f2f2f2; }
    </style>
  </head>
  <body>
    <h1>k6 Test Report</h1>
    <p><strong>Threads:</strong> ${threads}</p>
    <p><strong>Duration:</strong> ${duration}</p>
    <p><strong>Timestamp:</strong> ${localTime} (Asia/Taipei)</p>
    <h2>Summary</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
      <tr>
        <td>HTTP Requests</td>
        <td>${httpReqCount}</td>
      </tr>
      <tr>
        <td>Avg Response Time (ms)</td>
        <td>${avgResponseTime}</td>
      </tr>
      <tr>
        <td>Max Response Time (ms)</td>
        <td>${maxResponseTime}</td>
      </tr>
      <tr>
        <td>Min Response Time (ms)</td>
        <td>${minResponseTime}</td>
      </tr>
      <tr>
        <td>Total Checks</td>
        <td>${checksCount}</td>
      </tr>
      <tr>
        <td>Checks Passed</td>
        <td>${checksPasses}</td>
      </tr>
      <tr>
        <td>Success Rate</td>
        <td>${overallSuccessRate}%</td>
      </tr>
    </table>
    <h2>Detailed Metrics</h2>
    <table>
      <tr>
        <th>Metric</th>
        <th>Type</th>
        <th>Count</th>
        <th>Passes</th>
        <th>Fails</th>
        <th>Avg</th>
        <th>Med</th>
        <th>Min</th>
        <th>Max</th>
        <th>p(90)</th>
        <th>p(95)</th>
        <th>Rate</th>
      </tr>
      ${detailedRows}
    </table>
  </body>
  </html>
  `;

  console.log("========== Test Report ==========");
  console.log(`Threads: ${threads}`);
  console.log(`Duration: ${duration}`);
  console.log(`Timestamp: ${localTime} (Asia/Taipei)`);
  console.log(`HTTP Requests: ${httpReqCount}`);
  console.log(`Avg Response Time (ms): ${avgResponseTime}`);
  console.log(`Max Response Time (ms): ${maxResponseTime}`);
  console.log(`Min Response Time (ms): ${minResponseTime}`);
  console.log(`Total Checks: ${checksCount}`);
  console.log(`Checks Passed: ${checksPasses}`);
  console.log(`Success Rate: ${overallSuccessRate}%`);
  console.log("=================================");
  console.log(`Saving HTML report to: ${fileName}`);

  return { [fileName]: html };
}
