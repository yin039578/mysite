import { performance } from 'perf_hooks';
import fs from 'fs';
import axios from 'axios';
import pLimit from 'p-limit';

const testConfig = {
    urls: [
        { uri: 'https://api.meet.104dc-staging.com/api/event/query/07e88225-0fc5-470d-bf26-506ce6b7e8f5?pid=18404647', percentage: 1 },
    ],
    settings: {
        numThreads: 10, // 提高併發數
        totalRequests: 1000, // 總請求數
        maxRequestsPerMinute: 1000, // 每分鐘最大呼叫量
        maxRequestsPerHour: 1000, // 每小時最大呼叫量
    },
};

const responseTimes = [];
const responseDetails = []; // 儲存響應詳細資訊
let successCount = 0;
let failureCount = 0;
const errorStatistics = {
    timeout: 0,
    networkError: 0,
    http4xx: 0,
    http5xx: 0,
};
const responseLogs = {}; // 存儲每個 URL 的響應數據（成功與前三筆錯誤）
let startTime;
let endTime;

// 初始化每個 URL 的響應日誌
testConfig.urls.forEach(({ uri }) => {
    responseLogs[uri] = {
        success: null, // 第一個成功響應內容
        errors: [], // 最多保存前三筆錯誤響應內容
    };
});

// 生成測試時間戳
const testTimestamp = new Date().toISOString().replace(/[:.]/g, '-');

// 根據百分比生成 URL 清單
const generateUrlList = (urls, totalRequests) => {
    const urlList = [];
    for (const { uri, percentage } of urls) {
        const count = Math.round(totalRequests * percentage);
        for (let i = 0; i < count; i++) {
            urlList.push(uri);
        }
    }
    return urlList.sort(() => Math.random() - 0.5);
};

// 動態計算延遲以滿足每分鐘和每小時的最大呼叫量
let requestsThisMinute = 0;
let requestsThisHour = 0;
let lastMinuteStartTime = Date.now();
let lastHourStartTime = Date.now();

const calculateDelay = (settings) => {
    const now = Date.now();

    // 每分鐘限制
    if (now - lastMinuteStartTime >= 60000) {
        lastMinuteStartTime = now;
        requestsThisMinute = 0;
    }

    // 每小時限制
    if (now - lastHourStartTime >= 3600000) {
        lastHourStartTime = now;
        requestsThisHour = 0;
    }

    if (requestsThisMinute >= settings.maxRequestsPerMinute) {
        return Math.max(60000 - (now - lastMinuteStartTime), 0); // 等待至下一分鐘
    }

    if (requestsThisHour >= settings.maxRequestsPerHour) {
        return Math.max(3600000 - (now - lastHourStartTime), 0); // 等待至下一小時
    }

    return 0; // 無需延遲
};

// 單次請求函數
const makeRequest = async (url, settings) => {
    const delay = calculateDelay(settings);
    if (delay > 0) {
        console.log(`Rate limit reached. Waiting ${Math.ceil(delay / 1000)} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const start = performance.now();
    try {
        const response = await axios.get(url, {
            timeout: 5000, // 設置超時時間
            headers: {
                // 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            },
        });
        const end = performance.now();
        const responseTime = (end - start) / 1000;
        responseTimes.push(responseTime);

        // 保存第一個成功的響應內容
        if (!responseLogs[url].success) {
            responseLogs[url].success = {
                headers: response.headers,
                data: response.data,
            };
        }

        // 儲存詳細資訊
        responseDetails.push({
            url,
            responseTime,
            status: response.status,
            timestamp: new Date().toISOString(),
        });

        successCount++;
        requestsThisMinute++;
        requestsThisHour++;
        console.log(`Success: ${url} - Response time: ${responseTime.toFixed(2)} seconds`);
    } catch (error) {
        const end = performance.now();
        const responseTime = (end - start) / 1000;
        responseTimes.push(responseTime);

        failureCount++;
        requestsThisMinute++;
        requestsThisHour++;

        // 分類錯誤
        if (error.code === 'ECONNABORTED') {
            errorStatistics.timeout++;
        } else if (error.response) {
            if (error.response.status >= 400 && error.response.status < 500) {
                errorStatistics.http4xx++;
            } else if (error.response.status >= 500) {
                errorStatistics.http5xx++;
            }
        } else {
            errorStatistics.networkError++;
        }

        // 保存前三筆錯誤的響應內容
        if (responseLogs[url].errors.length < 3 && error.response) {
            responseLogs[url].errors.push({
                headers: error.response.headers,
                data: error.response.data,
                status: error.response.status,
            });
        }

        // 儲存詳細資訊
        responseDetails.push({
            url,
            responseTime,
            status: error.response ? error.response.status : 'N/A',
            timestamp: new Date().toISOString(),
        });

        console.error(`Error: ${url} - ${error.message}`);
    }
};

// 主測試函數
const runLoadTest = async (config) => {
    const { urls, settings } = config;
    const { numThreads, totalRequests } = settings;
    const urlList = generateUrlList(urls, totalRequests);

    startTime = new Date();
    const limit = pLimit(numThreads);

    const tasks = urlList.map((url) =>
        limit(async () => {
            console.log(`正在請求: ${url}`);
            await makeRequest(url, settings);
        })
    );

    await Promise.all(tasks);
    endTime = new Date();

    // 統計分析
    const totalResponseTime = responseTimes.reduce((acc, time) => acc + time, 0);
    const averageResponseTime = totalResponseTime / responseTimes.length;

    // 儲存測試結果
    await saveTestResults(config, {
        successCount,
        failureCount,
        averageResponseTime,
        totalTime: `${(endTime - startTime) / 1000} seconds`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        longestResponseTimes: responseDetails
            .sort((a, b) => b.responseTime - a.responseTime)
            .slice(0, 10),
    });
    await saveResponseData();
};

// 保存測試設定與統計數據
const saveTestResults = async (config, statistics) => {
    const fileName = `test_results_${testTimestamp}.json`;
    const resultData = {
        testConfig: config,
        statistics,
        errorStatistics,
    };
    await fs.promises.writeFile(fileName, JSON.stringify(resultData, null, 2), 'utf8');
    console.log(`測試結果保存於: ${fileName}`);
};

// 保存響應數據
const saveResponseData = async () => {
    const fileName = `response_logs_${testTimestamp}.json`;
    await fs.promises.writeFile(fileName, JSON.stringify(responseLogs, null, 2), 'utf8');
    console.log(`響應日誌保存於: ${fileName}`);
};

// 執行壓測
runLoadTest(testConfig);
