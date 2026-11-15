import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../backend/server.js';

let server;
let baseUrl;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
});

test('root redirects to the working frontend entrypoint', async () => {
  const response = await fetch(baseUrl, { redirect: 'manual' });

  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/frontend/index.html');
});

test('frontend entrypoint serves the website homepage', async () => {
  const response = await fetch(`${baseUrl}/frontend/index.html`);
  const html = await response.text();

  assert.equal(response.status, 200);
  assert.match(html, /Tu talento merece una oportunidad/);
});
