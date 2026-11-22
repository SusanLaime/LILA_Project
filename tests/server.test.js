// Tests server.js: the root address and old links redirect to the right pages, and the website pages and their files are served.
// Prueba server.js: la dirección principal y los enlaces antiguos redirigen a las páginas correctas, y se entregan las páginas del sitio y sus archivos.
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

test('legacy frontend links redirect to their existing pages', async () => {
  const redirects = new Map([
    ['/frontend/website/index.html', '/frontend/index.html'],
    ['/frontend/homeTrabajador.html', '/frontend/website/homeTrabajador.html'],
    ['/frontend/homeEmpleador.html', '/frontend/website/homeEmpleador.html'],
    ['/frontend/website/trabajador/perfil.html', '/frontend/website/perfil.html'],
    ['/frontend/website/perfilEmpleador.html', '/frontend/website/perfil.html']
  ]);

  for (const [path, destination] of redirects) {
    const response = await fetch(`${baseUrl}${path}`, { redirect: 'manual' });

    assert.equal(response.status, 301, `${path} should redirect`);
    assert.equal(response.headers.get('location'), destination);
  }
});

test('canonical website pages and their assets are served', async () => {
  for (const path of [
    '/frontend/website/homeTrabajador.html',
    '/frontend/website/homeEmpleador.html',
    '/frontend/website/publicarOferta.html',
    '/frontend/website/perfil.html',
    '/frontend/assets/css/base/reset.css',
    '/frontend/assets/js/components.js',
    '/frontend/assets/js/perfil.js'
  ]) {
    const response = await fetch(`${baseUrl}${path}`);
    assert.equal(response.status, 200, `${path} should be available`);
  }
});
