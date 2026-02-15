const http = require('http');

console.log('Fetching Products...');
const req = http.request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/products',
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
}, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log(`Products Count: ${json.data ? json.data.length : 0}`);
            if (json.data && json.data.length > 0) {
                console.log('Sample Product:', json.data[0].name);
            } else {
                console.log('NO PRODUCTS FOUND in DB');
            }
        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw Data:', data.substring(0, 100));
        }
    });
});

req.on('error', (e) => {
    console.error(`Request Error: ${e.message}`);
});

req.end();
