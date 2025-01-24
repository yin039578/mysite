const { performance } = require('perf_hooks')
const fs = require('fs')
const axios = require('axios')

// eslint-disable-next-line prettier/prettier
const url = 'https://blog.104-dev.com.tw/service-jobs/' // 壓測的網址
console.log('url', url)

const numThreads = 10 // 執行序數量
const numRequests = 1000 // 總壓測量
const outputFilePath = './response_data.html' // 回應資料的靜態檔案路徑
const random = false

let successCount = 0
let failureCount = 0
const responseTimes = []
let firstResponseSaved = false
const a = [
    {
        uri: 'https://blog.104-dev.com.tw/service-jobs/',
        percentage: 0.5,
    },
    {
        uri: 'https://blog.104-dev.com.tw/service-jobs/job1',
        percentage: 0.2,
    },
    {
        uri: 'https://blog.104-dev.com.tw/service-jobs/job2',
        percentage: 0.3,
    }
]

const makeRequest = async () => {
    const start = performance.now()
    try {
        const testUri = random ? url + `?keyword=${Math.random()}` : url
        const response = await axios.get(testUri, {
            headers: {
                // eslint-disable-next-line prettier/prettier
                "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
                // 'User-Agent': 'Gigabot',
            },
        })
        const end = performance.now()
        const responseTime = (end - start) / 1000
        responseTimes.push(responseTime)

        if (!firstResponseSaved) {
            fs.writeFileSync(outputFilePath, String(response.data), 'utf8')
            firstResponseSaved = true
        }

        if (response.status === 200) {
            if (response.data.includes('封站')) {
                failureCount++
                console.log(
                    `Response time: ${responseTime.toFixed(2)} seconds, Data length: ${
                        response.data.length
                    } (封站中)`,
                )
            } else {
                successCount++
                console.log(
                    `Response time: ${responseTime.toFixed(2)} seconds, Data length: ${
                        response.data.length
                    }`,
                )
            }
        } else {
            failureCount++
            console.log(
                `Response time: ${responseTime.toFixed(2)} seconds, Data length: ${
                    response.data.length
                } (Non-200 response)`,
            )
        }
    } catch (error) {
        console.log(error)
        const end = performance.now()
        const responseTime = (end - start) / 1000
        responseTimes.push(responseTime)
        failureCount++
        console.log(`Response time: ${responseTime.toFixed(2)} seconds (Error)`)
    }
}

const runLoadTest = async () => {
    const promises = []
    for (let i = 0; i < numRequests; i++) {
        promises.push(makeRequest())
        if (promises.length >= numThreads) {
            await Promise.all(promises)
            promises.length = 0
        }
    }
    await Promise.all(promises)

    responseTimes.sort((a, b) => b - a)
    const totalResponseTime = responseTimes.reduce((acc, time) => acc + time, 0)
    const averageResponseTime = totalResponseTime / responseTimes.length
    const longestResponseTimes = responseTimes.slice(0, 10)

    console.log(`Success count: ${successCount}`)
    console.log(`Failure count: ${failureCount}`)
    console.log(`Average response time: ${averageResponseTime.toFixed(2)} seconds`)
    console.log(
        `Top 10 longest response times: ${longestResponseTimes.map(time => time.toFixed(2))}`,
    )
}

runLoadTest()
