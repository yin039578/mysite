const express = require('express');
const app = express();
const bodyParser = require('body-parser');

// 使用 body-parser 來解析 POST 請求的 JSON 內容
app.use(bodyParser.json());

// API 端點
app.post('/emarsys-api/course-list', (req, res) => {
    const { fields, limit, parameters } = req.body;

    // 檢查並解析參數
    let filteredCourses = courses;

    if (parameters && parameters.length > 0) {
        const { pid, tags } = parameters[0];

        // 依據 pid 和 tags 過濾資料
        if (pid) {
            filteredCourses = filteredCourses.filter(course => course.pid === pid);
        }

        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
            filteredCourses = filteredCourses.filter(course => {
                const courseTags = course.tags.split(',');
                return tagList.some(tag => courseTags.includes(tag));
            });
        }
    }

    // 根據 limit 限制數量
    if (limit) {
        filteredCourses = filteredCourses.slice(0, limit);
    }

    // 根據 fields 過濾欄位
    if (fields && fields.length > 0) {
        filteredCourses = filteredCourses.map(course => {
            const filteredCourse = {};
            fields.forEach(field => {
                if (course[field] !== undefined) {
                    filteredCourse[field] = course[field];
                }
            });
            return filteredCourse;
        });
    }
   // 構造符合 Emarsys 要求的回應格式
    const response = {
        content: filteredCourses,
    };

    // 回應過濾後的課程資料
    res.json(response);
});

// 啟動伺服器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// 模擬的課程資料
const courses = [
    {
        id: 1,
        name: 'JavaScript Basics',
        tags: 'programming,frontend',
        desc: 'Learn the basics of JavaScript.',
        pid: '10547150',
    },
    {
        id: 2,
        name: 'Advanced Python',
        tags: 'programming,backend',
        desc: 'Deep dive into Python programming.',
        pid: '10547150,17145996',
    },
    {
        id: 3,
        name: 'React Development',
        tags: 'programming,frontend',
        desc: 'Build web apps using React.',
        pid: '10547150,17145996',
    },
    {
        id: 4,
        name: 'Node.js Mastery',
        tags: 'programming,backend',
        desc: 'Master Node.js development.',
        pid: '10547150,17145996',
    },
    {
        id: 5,
        name: 'UI/UX Design',
        tags: 'design,frontend',
        desc: 'Learn UI/UX principles and tools.',
        pid: '10547150',
    },
    {
        id: 6,
        name: 'Database Design',
        tags: 'database,backend',
        desc: 'Learn relational database design.',
        pid: '10547150,17145996',
    },
    {
        id: 7,
        name: 'Cloud Computing',
        tags: 'cloud,backend',
        desc: 'Introduction to cloud services.',
        pid: '10547150,17145996',
    },
    {
        id: 8,
        name: 'Cybersecurity Basics',
        tags: 'security,backend',
        desc: 'Learn basic cybersecurity principles.',
        pid: '10547150,17145996',
    },
    {
        id: 9,
        name: 'Mobile App Development',
        tags: 'programming,mobile',
        desc: 'Build mobile applications.',
        pid: '10547150,17145996',
    },
    {
        id: 10,
        name: 'Data Analysis with Python',
        tags: 'data,python',
        desc: 'Analyze data using Python.',
        pid: '',
    },
    {
        id: 11,
        name: 'Web Design Fundamentals',
        tags: 'design,frontend',
        desc: 'Learn fundamentals of web design.',
        pid: '10547150,17145996',
    },
    {
        id: 12,
        name: 'Machine Learning',
        tags: 'ai,python',
        desc: 'Introduction to machine learning.',
        pid: '10547150,17145996',
    },
    {
        id: 13,
        name: 'Agile Project Management',
        tags: 'management,agile',
        desc: 'Manage projects with Agile.',
        pid: '',
    },
    {
        id: 14,
        name: 'Docker for DevOps',
        tags: 'devops,container',
        desc: 'Use Docker for deployment.',
        pid: '17145996',
    },
    {
        id: 15,
        name: 'Git & Version Control',
        tags: 'tools,programming',
        desc: 'Learn version control with Git.',
        pid: '10547150',
    },
    {
        id: 16,
        name: 'AWS Cloud Practitioner',
        tags: 'cloud,aws',
        desc: 'Get started with AWS Cloud.',
        pid: '10547150,17145996',
    },
    {
        id: 17,
        name: 'Kubernetes Essentials',
        tags: 'devops,container',
        desc: 'Manage containers with Kubernetes.',
        pid: '10547150,17145996',
    },
    {
        id: 18,
        name: 'AI for Beginners',
        tags: 'ai,basics',
        desc: 'Learn AI fundamentals.',
        pid: '17145996',
    },
    {
        id: 19,
        name: 'SQL for Data Analysis',
        tags: 'database,sql',
        desc: 'Use SQL for analyzing data.',
        pid: '10547150',
    },
    {
        id: 20,
        name: 'DevOps Practices',
        tags: 'devops,practices',
        desc: 'Learn core DevOps practices.',
        pid: '',
    },
];