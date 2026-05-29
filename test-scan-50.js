import fetch from 'node-fetch';

async function test() {
  console.time('Scan Time');
  const urls = Array(50).fill('https://google.com');
  urls.push('https://doesnotexist-timeout-test.com');
  const response = await fetch('http://localhost:3001/api/check-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls })
  });
  const data = await response.json();
  console.log('Results length:', data.results.length);
  console.timeEnd('Scan Time');
}

test();
