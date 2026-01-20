const http = require('http');

const postRequest = (path, data, token = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
};

const runTests = async () => {
    try {
        const uniqueId = Date.now();
        const adminData = JSON.stringify({
            name: "Test Admin Reg",
            email: `admin${uniqueId}@reg.com`,
            password: "password123"
        });

        console.log("1. Registering Admin...");
        const regRes = await postRequest('/api/admin/register', adminData);
        if (regRes.status !== 201) throw new Error("Admin Registration failed: " + JSON.stringify(regRes.body));

        console.log("2. Logging in Admin...");
        // Re-use data for login
        const loginData = JSON.stringify({
            email: `admin${uniqueId}@reg.com`,
            password: "password123"
        });
        const loginRes = await postRequest('/api/admin/login', loginData);
        if (loginRes.status !== 200) throw new Error("Admin Login failed");
        const token = loginRes.body.token;

        console.log("3. Registering User by Admin...");
        const userData = JSON.stringify({
            name: "Test User",
            email: `user${uniqueId}@test.com`,
            phone: "1234567890",
            password: "userpass123",
            courseName: "MERN Stack"
        });

        const userRegRes = await postRequest('/api/admin/register/user', userData, token);
        console.log("User Reg Response:", userRegRes);

        if (userRegRes.status !== 201) throw new Error("User Registration by Admin failed: " + JSON.stringify(userRegRes.body));

        console.log("\nALL TESTS PASSED");

    } catch (error) {
        console.error("\nTEST FAILED:", error.message);
        process.exit(1);
    }
};

setTimeout(runTests, 1000);
