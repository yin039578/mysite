// gpt-o3mini-high 2025/4/16
import http from "k6/http";
import { sleep } from "k6";
import { Trend, Rate } from "k6/metrics";
import { SharedArray } from "k6/data";

// —— 統一設定區 —— 
const CONFIG = {
  vus: 70,                          // 併發數
  maxDuration: "10m",               // 最長執行時間
  support_id: "a62321ce-7132-4b69-9974-88deb87ffc94", // 固定支援 ID
};

// —— 動態讀取 CSV header 並產生物件 ——
// signup_list.csv 第一行當成 header，後續每行任意欄位都會被讀取到對應的 key
const csvData = new SharedArray("Users", () => {
  // 讀整個 CSV
  const text = open("signup_list.csv");
  // 拆行並移除空行
  const lines = text.split("\n").filter((l) => l.trim() !== "");
  // 第一行是 header
  const headerLine = lines.shift();
  const headers = headerLine.split(",").map((h) => h.trim());
  // 其餘每行都轉成 { header1: val1, header2: val2, … }
  return lines.map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = cols[i] !== undefined ? cols[i].trim() : "";
    });
    return obj;
  });
});
const totalCSV = csvData.length;
const iterationsPerVU = Math.ceil(totalCSV / CONFIG.vus);

// —— 自訂指標 —— 
const queryTrend  = new Trend("query_api_response_time");
const updateTrend = new Trend("update_api_response_time");
const queryRate   = new Rate("query_api_success_rate");
const updateRate  = new Rate("update_api_success_rate");

function formatTime(d) {
  const y = d.getFullYear();
  const M = (`0${d.getMonth()+1}`).slice(-2);
  const D = (`0${d.getDate()}`).slice(-2);
  const h = (`0${d.getHours()}`).slice(-2);
  const m = (`0${d.getMinutes()}`).slice(-2);
  const s = (`0${d.getSeconds()}`).slice(-2);
  return `${y}${M}${D} ${h}:${m}:${s}`;
}

function validateResponse(res, label) {
  if (res.status !== 200) {
    return { ok: false, error: `${label} HTTP ${res.status}` };
  }
  let json;
  try {
    json = JSON.parse(res.body);
  } catch (e) {
    return { ok: false, error: `${label} invalid JSON` };
  }
  if (!json.success || !json.data || json.data.is_ok !== true || json.data.status !== 1) {
    const msg = json.data && json.data.msg ? json.data.msg : `HTTP ${res.status}`;
    return { ok: false, error: `${label} failed: ${msg}` };
  }
  return { ok: true, error: "" };
}

// —— k6 Options —— 
export const options = {
  scenarios: {
    test: {
      executor: "per-vu-iterations",
      vus: CONFIG.vus,
      iterations: iterationsPerVU,
      maxDuration: CONFIG.maxDuration,
    },
  },
};

// —— 主流程 default() —— 
export default function () {
  if (__ITER >= iterationsPerVU) {
    return;  // 已無更多資料
  }
  const idx = (__VU - 1) * iterationsPerVU + __ITER;
  if (idx >= totalCSV) {
    return;
  }

  const user = csvData[idx];
  const startTime = formatTime(new Date());

  // 1. 呼叫 query API
  const queryPayload = JSON.stringify({
    verify_code_id: user.verify_code_id,
    support_id: CONFIG.support_id,
    enable_check_showup: 1,
  });
  const queryRes = http.post(
    "https://api.meet.104dc-dev.com/api/event/verify_showup",
    queryPayload,
    { headers: { "Content-Type": "application/json" } }
  );
  const t1 = queryRes.timings.duration;
  queryTrend.add(t1);
  const v1 = validateResponse(queryRes, "query API");
  queryRate.add(v1.ok);

  if (!v1.ok) {
    const line = [
      user.email,
      user.nickname,
      user.pid,
      "N/A",             // showup_order
      startTime,
      t1.toFixed(2),
      "N/A",             // updateRespTime
      `"${v1.error}"`    // error
    ].join(",");
    console.log("CSV_LINE:" + line);
    return;
  }

  sleep(1);

  // 2. 呼叫 update API
  const updatePayload = queryPayload; // 同 payload
  const updateRes = http.put(
    "https://api.meet.104dc-dev.com/api/event/verify_showup",
    updatePayload,
    { headers: { "Content-Type": "application/json" } }
  );
  const t2 = updateRes.timings.duration;
  updateTrend.add(t2);
  const v2 = validateResponse(updateRes, "update API");
  updateRate.add(v2.ok);

  let showupOrder = "N/A";
  if (v2.ok) {
    try {
      const json = JSON.parse(updateRes.body);
      const info = json.data.showup_info;
      if (info && info.showup_order !== undefined) {
        showupOrder = info.showup_order;
      }
    } catch (_) {
      // ignore parse error
    }
  }

  const line = [
    user.email,
    user.nickname,
    user.pid,
    showupOrder,
    startTime,
    t1.toFixed(2),
    t2.toFixed(2),
    v2.ok ? "" : `"${v2.error}"`
  ].join(",");

  console.log("CSV_LINE:" + line);
  sleep(1);
}
