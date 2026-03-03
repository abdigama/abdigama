const FormData = require('form-data');
const fs = require('fs');
const http = require('http');

const form = new FormData();
form.append('nama_lengkap', 'Test User');
form.append('kewarganegaraan', 'WNI Test');
form.append('keturunan', 'Jawa Test');
form.append('tempat_tinggal', 'Rumah Test');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/applications',
  method: 'POST',
  headers: form.getHeaders()
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('Response:', body));
});

form.pipe(req);
req.on('error', (e) => console.error(e));
