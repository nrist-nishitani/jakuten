// Simple server test script
const http = require('http');
const { spawn } = require('child_process');

console.log('Starting server...');
const serverProcess = spawn('node', ['bin/index.js'], {
    cwd: __dirname,
    stdio: 'pipe'
});

let output = '';
serverProcess.stdout.on('data', (data) => {
    output += data.toString();
    console.log('Server:', data.toString().trim());
});

serverProcess.stderr.on('data', (data) => {
    console.error('Error:', data.toString().trim());
});

setTimeout(() => {
    console.log('\nTesting HTTP connection...');
    http.get('http://localhost:3000', (res) => {
        console.log('✓ Server responded with status:', res.statusCode);
        serverProcess.kill();
        process.exit(0);
    }).on('error', (err) => {
        console.error('✗ Connection failed:', err.message);
        serverProcess.kill();
        process.exit(1);
    });
}, 2000);

setTimeout(() => {
    console.log('✗ Timeout - server did not start');
    serverProcess.kill();
    process.exit(1);
}, 8000);
