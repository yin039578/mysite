import http from 'k6/http';
import { sleep } from 'k6';

// API configuration
const apiConfig = {
    method: 'POST',            // HTTP method
    path: '/api/apim/course/list/ability',      // API endpoint path
    baseURL: 'https://api-clz.nabi.104dc-dev.com'  // Base URL of your API
};

// Test configuration
const config = {
    // Test parameters array [{query, body}, ...]
    testParams: [
        {
            body: {
                "abilities": [61, 10051732, 50],
                "size": 10,
                "provider_id": 1
            }
        },
        {
            body: {
                "abilities": [61, 10051732, 50],
                "size": 9,
                "provider_id": 1
            }
        },
        {
            body: {
                "abilities": [61, 50],
                "size": 10
            }
        },
        {
            body: {
                "abilities": [61, 50],
                "size": 9
            }
        },
        {
            body: {
                "abilities": [61, 50],
                "size": 8
            }
        },
        {
            body: {
                "abilities": [61, 50],
                "size": 7
            }
        },
        {
            body: {
                "abilities": [50],
                "size": 10
            }
        },
        {
            body: {
                "abilities": [50],
                "size": 9
            }
        },
        {
            body: {
                "abilities": [50],
                "size": 8
            }
        },
        {
            body: {
                "abilities": [50],
                "size": 7
            }
        }
    ],
    vus: 20,                // Number of virtual users (threads)
    iterationsPerVU: 1000,    // Number of iterations per VU
    sleepDuration: 100,      // Sleep duration between requests in milliseconds
};

// Shared counter to track which parameter set to use next
let counter = 0;

export const options = {
    scenarios: {
        per_vu_scenario: {
            executor: 'per-vu-iterations',
            vus: config.vus,
            iterations: config.iterationsPerVU,
            maxDuration: '1h',
        },
    },
};

export default function () {
    // Get the next parameter set in a thread-safe way
    const currentIndex = (__VU - 1 + counter++) % config.testParams.length;
    const params = config.testParams[currentIndex];

    // Prepare URL and parameters
    let url = `${apiConfig.baseURL}${apiConfig.path}`;
    const options = {
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Add query parameters if they exist
    if (params.query) {
        const queryString = Object.entries(params.query)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        url = `${url}?${queryString}`;
    }

    // Make the request
    let response;
    if (params.body) {
        options.body = JSON.stringify(params.body);
    }

    switch (apiConfig.method.toUpperCase()) {
        case 'GET':
            response = http.get(url, options);
            break;
        case 'POST':
            response = http.post(url, options.body, options);
            break;
        case 'PUT':
            response = http.put(url, options.body, options);
            break;
        case 'DELETE':
            response = http.del(url, null, options);
            break;
        default:
            throw new Error(`Unsupported HTTP method: ${apiConfig.method}`);
    }

    // Log the response (you can customize this based on your needs)
    console.log(`VU: ${__VU}, Iteration: ${__ITER}, Status: ${response.status}, URL: ${url}`);

    // Sleep between requests
    sleep(config.sleepDuration / 1000);
}
