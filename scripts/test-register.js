const http = require('http');

const postData = JSON.stringify({
  name: 'OTP Test User',
  email: `testops${Date.now()}@example.com`,
  password: 'password123',
  phone: '1234567890'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('--- Starting OTP Test Registration ---');
console.log('Sending data:', postData);

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  res.on('end', () => {
    console.log('RESPONSE BODY:', body);
    console.log('--- Test Complete ---');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
