import fetch from 'node-fetch';

async function test() {
  console.time('Scan Time');
  const response = await fetch('http://localhost:3001/api/check-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls: ['https://google.com', 'https://thiswebsitedoesnotexist123456.com', 'https://youtube.com', 'https://twitter.com'] })
  });
  const data = await response.json();
  console.log(data);
  console.timeEnd('Scan Time');
}

test();
