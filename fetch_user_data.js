const https = require('https');

// pid 列表
const pidList = [
    '16762957',
    '10567950',
    '4463513',
    '17544281',
    '13467264',
    '11607574',
    '285983',
    '18704663',
    '710142',
    '15965871',
    '8619372',
    '8457408',
    '2606173',
    '7185729',
    '5430659',
    '8819182',
    '17868778',
    '1146153',
    '4750163',
    '5432630',
    '3813819',
    '2623406',
    '2036155',
    '15532995',
    '8510796',
    '15461237',
    '12366454',
    '878368',
    '13044734',
    '16445408',
    '1126907',
    '5636954',
    '8608346',
    '9358020',
    '7257729',
    '3144196',
    '810129',
    '1822833',
    '16909741',
    '9727880',
    '5948413',
    '10382229',
    '14029721',
    '5740384',
    '4383380'
];

function fetchUserData(pid) {
    const url = `https://api.meet.104dc.com/api/user/${pid}`;
    
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';

            // 接收資料
            res.on('data', (chunk) => {
                data += chunk;
            });

            // 資料接收完成
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    
                    if (response.success && response.data) {
                        const pid = response.data.pid;
                        const nickname = response.data.nickname;
                        
                        resolve({ pid, nickname });
                    } else {
                        console.error(`API 回應失敗或無資料 (PID: ${pid})`);
                        resolve({ pid, nickname: 'ERROR' });
                    }
                } catch (error) {
                    console.error(`JSON 解析錯誤 (PID: ${pid}):`, error);
                    resolve({ pid, nickname: 'ERROR' });
                }
            });
        }).on('error', (error) => {
            console.error(`HTTP 請求錯誤 (PID: ${pid}):`, error);
            resolve({ pid, nickname: 'ERROR' });
        });
    });
}

// 延遲函式，避免過於頻繁的請求
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 批次處理函式
async function processPidList() {
    console.log('開始處理 PID 列表...');
    
    for (let i = 0; i < pidList.length; i++) {
        const pid = pidList[i];
        
        try {
            const result = await fetchUserData(pid);
            // 輸出 pid,nickname 格式
            console.log(`${result.pid},${result.nickname}`);
            
            // 每次請求間隔 100ms，避免過於頻繁
            if (i < pidList.length - 1) {
                await delay(100);
            }
        } catch (error) {
            console.log(`${pid},ERROR`);
        }
    }
    
    console.log('處理完成');
}

// 執行批次處理
processPidList();
