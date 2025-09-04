import http from 'k6/http';
import { sleep } from 'k6';

// API configuration
const apiConfig = {
    method: 'POST',            // HTTP method
    path: '/api/apim/course/list/resource_id',      // API endpoint path
    baseURL: 'http://localhost:5000'  // Base URL of your API
};

// Test configuration
const config = {
    // Test parameters array [{query, body}, ...]
    testParams: [
        {
            body: {
                "resource_ids": [
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "00541c20-647d-4075-8763-e39988845df2",
                    "0060ac29-f26f-4087-8d8f-9a8d42ad51d8",
                    "00758a2e-097c-4ecc-ba88-1b331adf92de",
                    "007722ff-3acd-4b1a-9dd7-6670ee3f1608",
                    "007cd840-e5f6-4169-a5b4-383fec842704",
                    "008ecea4-b624-4952-b4a1-083c3d49718e",
                    "00ac69d5-1715-4aa1-883d-674aa22e0d4f",
                    "00ffb4f8-92ca-4fe0-bab3-92e8a0930664",
                    "010ddc0e-1cd6-4671-994a-d857c9583c08",
                    "0110c04a-d8e3-4426-9d8e-c5edfb6681bf",
                    "014ab571-438b-47e6-b3ce-aa41d09059a8",
                    "016c9062-3094-4883-9f46-28e4b3200c18",
                    "016f10b3-9cbd-4bef-b144-79ba1a1fd132",
                    "01a32ccd-60e7-46e0-8341-86df99caa861",
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
            }
        },
        {
            body: {
                "resource_ids": [
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "00541c20-647d-4075-8763-e39988845df2",
                    "0060ac29-f26f-4087-8d8f-9a8d42ad51d8",
                    "014ab571-438b-47e6-b3ce-aa41d09059a8",
                    "016c9062-3094-4883-9f46-28e4b3200c18",
                    "016f10b3-9cbd-4bef-b144-79ba1a1fd132",
                    "01a32ccd-60e7-46e0-8341-86df99caa861",
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
            }
        }, 
        {
            body: {
                "resource_ids": [
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "00541c20-647d-4075-8763-e39988845df2",
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
            }
        }, 
        {
            body: {
                "resource_ids": [
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "0133853e-4486-4982-98c6-fb9c7c950967",
                    "0139e9ef-dd2e-4df5-b9eb-2bcb6afab254",
                ]
            }
        }, 
        {
            body: {
                "resource_ids": [
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
            }
        }, 
        {
            body: {
                "resource_ids": [
                    "01a32ccd-60e7-46e0-8341-86df99caa861"
                ]
            }
        }, 
        {
            body: {
                "resource_ids": [
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "00541c20-647d-4075-8763-e39988845df2",
                    "00758a2e-097c-4ecc-ba88-1b331adf92de",
                    "007cd840-e5f6-4169-a5b4-383fec842704",
                    "008ecea4-b624-4952-b4a1-083c3d49718e",
                    "00f1d85a-2c5d-484b-ab86-2f7f27d81c5e",
                    "00ffb4f8-92ca-4fe0-bab3-92e8a0930664",
                    "0110c04a-d8e3-4426-9d8e-c5edfb6681bf",
                    "0133853e-4486-4982-98c6-fb9c7c950967",
                    "0139e9ef-dd2e-4df5-b9eb-2bcb6afab254",
                    "014ab571-438b-47e6-b3ce-aa41d09059a8",
                    "016f10b3-9cbd-4bef-b144-79ba1a1fd132",
                    "01a32ccd-60e7-46e0-8341-86df99caa861",
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
            }
        }, 
        {
            body: {
                "resource_ids": [
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "007722ff-3acd-4b1a-9dd7-6670ee3f1608",
                    "0110c04a-d8e3-4426-9d8e-c5edfb6681bf",
                    "01252ba0-0550-4898-9b35-ba5328f7c3fe",
                    "01252ba0-0550-4898-9b35-ba5328f7c3fe",
                    "01252ba0-0550-4898-9b35-ba5328f7c3fe",
                    "016c9062-3094-4883-9f46-28e4b3200c18",
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
            }
        },
        {
            body: {
                "resource_ids": [
                    "000a793d-12fe-42dc-b082-33faf16228e7",
                    "016f10b3-9cbd-4bef-b144-79ba1a1fd132",
                    "01a32ccd-60e7-46e0-8341-86df99caa861",
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
            }
        }, 
        {
            body: {
                "resource_ids": [
                    "00541c20-647d-4075-8763-e39988845df2",
                    "0060ac29-f26f-4087-8d8f-9a8d42ad51d8",
                    "00758a2e-097c-4ecc-ba88-1b331adf92de",
                    "007cd840-e5f6-4169-a5b4-383fec842704",
                    "00ac69d5-1715-4aa1-883d-674aa22e0d4f",
                    "00f1d85a-2c5d-484b-ab86-2f7f27d81c5e",
                    "00ffb4f8-92ca-4fe0-bab3-92e8a0930664",
                    "010ddc0e-1cd6-4671-994a-d857c9583c08",
                    "01a32ccd-60e7-46e0-8341-86df99caa861",
                    "01b72535-2c41-4053-937f-728e6cf8fd49"
                ]
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
