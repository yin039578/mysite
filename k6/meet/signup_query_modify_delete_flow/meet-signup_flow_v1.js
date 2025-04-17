import http from 'k6/http';
import { check, sleep } from 'k6';

// 產生 v4 UUID 函式（僅用於產生 event_signup_id，不影響 sessionId）
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    let r = Math.random() * 16 | 0;
    let v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

// 每個 VU 代表一個完整的活動報名流程
export let options = {
  vus: 3,       // VU 數量與 User List 長度相同
  duration: '600s'
};

const EVENT_ID = "ab8b378a-ae3c-4a7a-aa7f-c4d4eb00bbdc";

export default function () {
  // 根據 __VU (從 1 開始) 指定唯一使用者
  const user = users[__VU - 1];
  let headers = { 'Content-Type': 'application/json' };

  // 1. add API: 報名
  const eventSignupId = uuidv4(); // 自行產生 event_signup_id
  let addPayload = JSON.stringify({
    event_id: EVENT_ID,
    pid: user.pid,
    signup_info_list: [
      {
        nickname: user.nickname,
        email: user.email,
        event_signup_id: eventSignupId,
        signup_session_ids: [ "b0fffba5-5bb6-4ed1-87ac-d36bbc56c7b0" ], // 固定參考範例
        answer_list: [],
        main_applicant: true
      }
    ]
  });

  let addRes = http.post("https://api.meet.104dc-dev.com/api/event/query/signup/add", addPayload, { headers });
  let addSuccess = check(addRes, { "add API status is 200": (r) => r.status === 200 });
  if (!addSuccess) {
    console.error("Unexpected add API response:", addRes.body);
  }
  sleep(1);

  // 2. query API: 查詢報名結果
  let queryUrl = `https://api.meet.104dc-dev.com/api/event/query/${EVENT_ID}?pid=${user.pid}`;
  let queryRes = http.get(queryUrl);
  let querySuccess = check(queryRes, { "query API status is 200": (r) => r.status === 200 });
  if (!querySuccess) {
    console.error("Unexpected query API response:", queryRes.body);
  }
  let queryData = JSON.parse(queryRes.body);
  // 取得 event_signup_form_id，假設存在於 signup_info[0].id
  let signupFormId = queryData.data.signup_info && queryData.data.signup_info[0] ? queryData.data.signup_info[0].event_signup_form_id : null;
  if (!signupFormId) {
    console.error("query API did not return a valid signup_form_id, response:", queryRes.body);
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
        signup_session_ids: [ "daba40e6-8b37-4ef4-9425-09b6eca2f341" ], // 固定參考範例
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

  let auditRes = http.put("https://api.meet.104dc-dev.com/api/event/query/signup/audit", auditPayload, { headers });
  let auditSuccess = check(auditRes, { "audit API status is 200": (r) => r.status === 200 });
  if (!auditSuccess) {
    console.error("Unexpected audit API response:", auditRes.body);
  }
  sleep(1);

  // 4. cancel API: 取消報名
  let cancelPayload = JSON.stringify({
    event_signup_form_id: signupFormId,
    pid: user.pid
  });
  let cancelRes = http.post("https://api.meet.104dc-dev.com/api/event/query/signup/cancel", cancelPayload, { headers });
  let cancelSuccess = check(cancelRes, { "cancel API status is 200": (r) => r.status === 200 });
  if (!cancelSuccess) {
    console.error("Unexpected cancel API response:", cancelRes.body);
  }
  sleep(1);
}
