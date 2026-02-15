const http = require('http');

console.log('Testing connection to Backend (port 3000)...');
const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET',
    timeout: 2000
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    res.on('data', (chunk) => { console.log(`BODY: ${chunk}`); });
});

req.on('error', (e) => {
    console.error(`Backend Connection Error: ${e.message}`);
});

req.on('timeout', () => {
    console.error('Backend Connection Timeout');
    req.destroy();
});

req.end();
