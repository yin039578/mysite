import { performance } from 'perf_hooks';
import fs from 'fs';
import axios from 'axios';
import pLimit from 'p-limit';

const testConfig = {
    urls: [
        { uri: 'https://intro.104dc-dev.com/wp-json/wp/v2/posts?per_page=50&page=1&context=embed', percentage: 0.2 },
        { uri: 'https://intro.104dc-dev.com/wp-json/104-cms/v1/elementor/getPostBySlug/do-my-best-director', percentage: 0.16 },
        { uri: 'https://intro.104dc-dev.com/wp-json/104-cms/v1/elementor/getPostBySlug/do-my-best', percentage: 0.16 },
        { uri: 'https://intro.104dc-dev.com/wp-json/104-cms/v1/elementor/getPostBySlug/test-birdie-2025', percentage: 0.16 },
        { uri: 'https://intro.104dc-dev.com/wp-json/104-cms/v1/elementor/getPostBySlug/do-my-best-director', percentage: 0.16 },
        { uri: 'https://intro.104dc-dev.com/wp-json/104-cms/v1/elementor/getPostBySlug/giver-fifth', percentage: 0.16 }
    ],
    settings: {
        numThreads: 10, // 同時執行請求數
        totalRequests: 100, // 總請求數
        delayMs: 50, // 每個執行緒間的請求延遲 (毫秒)
    },
};

const responseTimes = [];
let successCount = 0;
let failureCount = 0;
const errorStatistics = {
    timeout: 0,
    networkError: 0,
    http4xx: 0,
    http5xx: 0,
};
const responseLogs = {}; // 存儲每個 URL 的響應數據（成功與前三筆錯誤）

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

// 單次請求函數
const makeRequest = async (url) => {
    const start = performance.now();
    try {
        const response = await axios.get(url, {
            timeout: 5000, // 設置超時時間
            // headers: {
            //     'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
            // },
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

        successCount++;
    } catch (error) {
        const end = performance.now();
        const responseTime = (end - start) / 1000;
        responseTimes.push(responseTime);
        failureCount++;

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
    }
};

// 主測試函數
const runLoadTest = async (config) => {
    const { urls, settings } = config;
    const { numThreads, totalRequests, delayMs } = settings;
    const urlList = generateUrlList(urls, totalRequests);

    const limit = pLimit(numThreads);

    const tasks = urlList.map((url, index) =>
        limit(async () => {
            // 延遲控制
            await new Promise((resolve) => setTimeout(resolve, delayMs * index));
            console.log(`正在請求: ${url}`);
            await makeRequest(url);
        })
    );

    await Promise.all(tasks);

    // 統計分析
    const totalResponseTime = responseTimes.reduce((acc, time) => acc + time, 0);
    const averageResponseTime = totalResponseTime / responseTimes.length;

    // 儲存測試結果
    saveTestResults(config, {
        successCount,
        failureCount,
        averageResponseTime,
        longestResponseTimes: responseTimes.slice(0, 10),
    });
    saveResponseData();
};

// 保存測試設定與統計數據
const saveTestResults = (config, statistics) => {
    const fileName = `test_results_${testTimestamp}.json`;
    const resultData = {
        testConfig: config,
        statistics,
        errorStatistics,
    };
    fs.writeFileSync(fileName, JSON.stringify(resultData, null, 2), 'utf8');
    console.log(`測試結果保存於: ${fileName}`);
};

// 保存響應數據
const saveResponseData = () => {
    const fileName = `response_logs_${testTimestamp}.json`;
    fs.writeFileSync(fileName, JSON.stringify(responseLogs, null, 2), 'utf8');
    console.log(`響應日誌保存於: ${fileName}`);
};

// 執行壓測
runLoadTest(testConfig);
