/* =====================================================================
 * Pruebas E2E de la página homeEmpleador.html (panel del empleador)
 * Ejecutar con: npm run test:e2e
 * Usa el Chrome (o Edge) instalado en el equipo mediante playwright-core.
 * ===================================================================== */

import { test, before, after, beforeEach, afterEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import app from '../../backend/server.js';

const RUTA_PANEL = '/frontend/website/homeEmpleador.html';
const RUTA_PUBLICAR = '/frontend/website/publicarOferta.html';

let server;
let baseUrl;
let browser;
let context;
let page;
let erroresConsola;

async function lanzarNavegador() {
  const headless = process.env.HEADED !== '1';
  for (const channel of ['chrome', 'msedge', undefined]) {
    try {
      return await chromium.launch({ channel, headless });
    } catch {
      // probar con el siguiente navegador
    }
  }
  throw new Error('No se encontró Chrome ni Edge instalado para ejecutar las pruebas E2E.');
}

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
  browser = await lanzarNavegador();
});

after(async () => {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
});

beforeEach(async () => {
  // Contexto nuevo = localStorage vacío en cada prueba.
  context = await browser.newContext();
  page = await context.newPage();
  erroresConsola = [];
  page.on('pageerror', error => erroresConsola.push(error.message));
  page.on('console', msg => { if (msg.type() === 'error') erroresConsola.push(msg.text()); });
});

afterEach(async () => {
  await context?.close();
});

// ---------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------

async function abrirPanel() {
  await page.goto(baseUrl + RUTA_PANEL);
  await page.waitForSelector('#active-posts .employer-post-card');
}

/** Títulos de las ofertas visibles, en el orden en que aparecen. */
function titulosVisibles() {
  return page.$$eval('#active-posts .employer-post-card', cards =>
    cards.filter(card => !card.hidden).map(card => card.querySelector('h3').textContent.trim()));
}

function kpiActivas() {
  return page.textContent('#kpi-active-offers').then(t => Number(t.trim()));
}

function tarjeta(titulo) {
  return page.locator('#active-posts .employer-post-card', { has: page.locator('h3', { hasText: titulo }) });
}

async function publicarOferta(datos = {}) {
  const oferta = {
    title: 'Mesero/a para fin de semana',
    location: 'Cochabamba',
    type: 'Por servicio',
    category: 'gastronomia',
    pay: 'Bs. 150 por día',
    description: 'Atención de mesas los sábados y domingos.',
    ...datos
  };
  await page.goto(baseUrl + RUTA_PUBLICAR);
  await page.fill('#offer-title', oferta.title);
  await page.fill('#offer-location', oferta.location);
  await page.selectOption('#offer-type', oferta.type);
  await page.selectOption('#offer-category', oferta.category);
  await page.fill('#offer-pay', oferta.pay);
  await page.fill('#offer-description', oferta.description);
  await Promise.all([
    page.waitForURL(`**${RUTA_PANEL}`),
    page.click('#offer-form button[type="submit"]')
  ]);
  await page.waitForSelector('#active-posts .employer-post-card');
  return oferta;
}

// ---------------------------------------------------------------------
// 1. Carga de la página
// ---------------------------------------------------------------------

describe('Carga de la página', () => {
  test('carga sin errores y muestra el contenido principal', async () => {
    await abrirPanel();
    assert.equal(await page.title(), 'LILA — Panel del empleador');
    assert.equal((await page.textContent('#employer-title')).trim(), 'Encuentra el talento que necesitas');
    assert.equal((await titulosVisibles()).length, 3);
    assert.equal(await page.isVisible('#active-empty'), false);
    assert.deepEqual(erroresConsola, []);
  });

  test('carga el encabezado con la insignia EMPLEADOR y el pie de página', async () => {
    await abrirPanel();
    await page.waitForSelector('#header-placeholder *');
    await page.waitForSelector('#footer-placeholder *');
    const badge = page.locator('#lila-role-badge');
    if (await badge.count()) {
      assert.equal((await badge.textContent()).trim(), 'EMPLEADOR');
    }
  });

  test('el KPI "Ofertas activas" coincide con las ofertas activas listadas', async () => {
    await abrirPanel();
    assert.equal(await kpiActivas(), 3);
  });

  test('las ofertas aparecen por defecto ordenadas de la más reciente a la más antigua', async () => {
    await abrirPanel();
    assert.deepEqual(await titulosVisibles(), [
      'Ayudante de cocina',
      'Diseñador/a para redes sociales',
      'Vendedor/a de tienda'
    ]);
  });
});

// ---------------------------------------------------------------------
// 2. Publicar oferta
// ---------------------------------------------------------------------

describe('Publicar oferta', () => {
  test('el botón "+ Publicar oferta" lleva al formulario', async () => {
    await abrirPanel();
    await Promise.all([
      page.waitForURL(`**${RUTA_PUBLICAR}`),
      page.click('a.home-primary-button')
    ]);
    assert.ok(await page.isVisible('#offer-form'));
  });

  test('una oferta publicada aparece en homeEmpleador, primera y como Activa', async () => {
    const oferta = await publicarOferta();
    const titulos = await titulosVisibles();
    assert.equal(titulos.length, 4);
    assert.equal(titulos[0], oferta.title);

    const card = tarjeta(oferta.title);
    assert.equal((await card.locator('.post-status').textContent()).trim(), 'Activa');
    assert.equal(
      (await card.locator('.employer-post-details').textContent()).trim(),
      'Cochabamba · Por servicio · Bs. 150 por día'
    );
    assert.equal(await kpiActivas(), 4);
    assert.deepEqual(erroresConsola, []);
  });

  test('la oferta publicada sigue apareciendo después de recargar', async () => {
    const oferta = await publicarOferta();
    await page.reload();
    await page.waitForSelector('#active-posts .employer-post-card');
    assert.equal((await titulosVisibles())[0], oferta.title);
  });

  test('se pueden publicar varias ofertas y la última queda primero', async () => {
    await publicarOferta({ title: 'Primera oferta nueva' });
    await publicarOferta({ title: 'Segunda oferta nueva' });
    const titulos = await titulosVisibles();
    assert.equal(titulos.length, 5);
    assert.deepEqual(titulos.slice(0, 2), ['Segunda oferta nueva', 'Primera oferta nueva']);
  });

  test('un formulario incompleto no publica la oferta', async () => {
    await page.goto(baseUrl + RUTA_PUBLICAR);
    await page.fill('#offer-title', 'Oferta incompleta');
    await page.click('#offer-form button[type="submit"]');
    assert.ok(page.url().endsWith(RUTA_PUBLICAR), 'no debe redirigir');
    const guardadas = await page.evaluate(() => localStorage.getItem('lila_ofertas'));
    assert.equal(guardadas, null);
  });

  test('el título se muestra como texto (sin inyección de HTML)', async () => {
    const titulo = '<img src=x onerror="window.__xss=1">Oferta';
    await publicarOferta({ title: titulo });
    assert.equal((await titulosVisibles())[0], titulo);
    assert.equal(await page.evaluate(() => window.__xss), undefined);
    assert.equal(await page.locator('#active-posts img').count(), 0);
  });

  test('una ciudad nueva se agrega al filtro de ciudad y filtra correctamente', async () => {
    await publicarOferta({ title: 'Oferta en La Paz', location: 'La Paz' });
    const opciones = await page.$$eval('#employer-city-filter option', os => os.map(o => o.value));
    assert.ok(opciones.includes('la-paz'));
    await page.selectOption('#employer-city-filter', 'la-paz');
    assert.deepEqual(await titulosVisibles(), ['Oferta en La Paz']);
  });

  test('la categoría de la oferta publicada funciona con el filtro de categoría', async () => {
    await publicarOferta({ title: 'Oferta categoría otros', category: 'otros' });
    await page.selectOption('#employer-category-filter', 'otros');
    assert.deepEqual(await titulosVisibles(), ['Oferta categoría otros']);
  });
});

// ---------------------------------------------------------------------
// 3. Filtros, búsqueda y orden
// ---------------------------------------------------------------------

describe('Filtros y búsqueda', () => {
  test('la búsqueda por título no distingue mayúsculas', async () => {
    await abrirPanel();
    await page.fill('#employer-search', 'COCINA');
    assert.deepEqual(await titulosVisibles(), ['Ayudante de cocina']);
  });

  test('la búsqueda acepta texto con acentos y ñ', async () => {
    await abrirPanel();
    await page.fill('#employer-search', 'diseñador');
    assert.deepEqual(await titulosVisibles(), ['Diseñador/a para redes sociales']);
  });

  test('una búsqueda sin resultados muestra el mensaje vacío', async () => {
    await abrirPanel();
    await page.fill('#employer-search', 'xyz inexistente');
    assert.deepEqual(await titulosVisibles(), []);
    assert.ok(await page.isVisible('#active-empty'));
  });

  test('borrar la búsqueda vuelve a mostrar todas las ofertas', async () => {
    await abrirPanel();
    await page.fill('#employer-search', 'cocina');
    await page.fill('#employer-search', '');
    assert.equal((await titulosVisibles()).length, 3);
    assert.equal(await page.isVisible('#active-empty'), false);
  });

  test('filtro de estado: Activa / Pausada / Todos', async () => {
    await abrirPanel();
    await tarjeta('Vendedor/a de tienda').locator('[data-action="pause"]').click();

    await page.selectOption('#employer-status-filter', 'paused');
    assert.deepEqual(await titulosVisibles(), ['Vendedor/a de tienda']);

    await page.selectOption('#employer-status-filter', 'active');
    assert.deepEqual(await titulosVisibles(), ['Ayudante de cocina', 'Diseñador/a para redes sociales']);

    await page.selectOption('#employer-status-filter', 'all');
    assert.equal((await titulosVisibles()).length, 3);
  });

  test('filtro de estado "Pausada" sin ofertas pausadas muestra el mensaje vacío', async () => {
    await abrirPanel();
    await page.selectOption('#employer-status-filter', 'paused');
    assert.deepEqual(await titulosVisibles(), []);
    assert.ok(await page.isVisible('#active-empty'));
  });

  test('filtro de ciudad', async () => {
    await abrirPanel();
    const esperado = {
      cochabamba: ['Ayudante de cocina'],
      remoto: ['Diseñador/a para redes sociales'],
      quillacollo: ['Vendedor/a de tienda']
    };
    for (const [ciudad, titulos] of Object.entries(esperado)) {
      await page.selectOption('#employer-city-filter', ciudad);
      assert.deepEqual(await titulosVisibles(), titulos, `ciudad ${ciudad}`);
    }
    await page.selectOption('#employer-city-filter', 'all');
    assert.equal((await titulosVisibles()).length, 3);
  });

  test('filtro de categoría', async () => {
    await abrirPanel();
    const esperado = {
      gastronomia: ['Ayudante de cocina'],
      marketing: ['Diseñador/a para redes sociales'],
      ventas: ['Vendedor/a de tienda'],
      otros: []
    };
    for (const [categoria, titulos] of Object.entries(esperado)) {
      await page.selectOption('#employer-category-filter', categoria);
      assert.deepEqual(await titulosVisibles(), titulos, `categoría ${categoria}`);
    }
  });

  test('los filtros se combinan entre sí', async () => {
    await abrirPanel();
    await page.selectOption('#employer-city-filter', 'cochabamba');
    await page.selectOption('#employer-category-filter', 'gastronomia');
    assert.deepEqual(await titulosVisibles(), ['Ayudante de cocina']);

    await page.selectOption('#employer-category-filter', 'ventas');
    assert.deepEqual(await titulosVisibles(), []);
    assert.ok(await page.isVisible('#active-empty'));

    await page.selectOption('#employer-category-filter', 'all');
    await page.fill('#employer-search', 'ayudante');
    assert.deepEqual(await titulosVisibles(), ['Ayudante de cocina']);
  });

  test('ordenar de A - Z, de Z - A y por últimas publicadas', async () => {
    await abrirPanel();
    await page.selectOption('#employer-sort', 'az');
    assert.deepEqual(await titulosVisibles(), [
      'Ayudante de cocina', 'Diseñador/a para redes sociales', 'Vendedor/a de tienda'
    ]);
    await page.selectOption('#employer-sort', 'za');
    assert.deepEqual(await titulosVisibles(), [
      'Vendedor/a de tienda', 'Diseñador/a para redes sociales', 'Ayudante de cocina'
    ]);
    await page.selectOption('#employer-sort', 'latest');
    assert.deepEqual(await titulosVisibles(), [
      'Ayudante de cocina', 'Diseñador/a para redes sociales', 'Vendedor/a de tienda'
    ]);
  });

  test('el orden se mantiene al aplicar un filtro', async () => {
    await abrirPanel();
    await page.selectOption('#employer-sort', 'za');
    await page.fill('#employer-search', 'de');
    assert.deepEqual(await titulosVisibles(), [
      'Vendedor/a de tienda', 'Ayudante de cocina'
    ]);
  });
});

// ---------------------------------------------------------------------
// 4. Pausar / reactivar (persistente)
// ---------------------------------------------------------------------

describe('Pausar y reactivar ofertas', () => {
  test('pausar cambia la etiqueta, el botón y el KPI', async () => {
    await abrirPanel();
    const card = tarjeta('Ayudante de cocina');
    await card.locator('[data-action="pause"]').click();

    assert.equal((await card.locator('.post-status').textContent()).trim(), 'Pausada');
    assert.ok(await card.locator('.post-status.paused').count());
    assert.equal((await card.locator('[data-action="reactivate"]').textContent()).trim(), 'Reactivar');
    assert.equal(await card.getAttribute('data-status'), 'paused');
    assert.equal(await kpiActivas(), 2);
  });

  test('la oferta pausada sigue pausada al recargar la página', async () => {
    await abrirPanel();
    await tarjeta('Ayudante de cocina').locator('[data-action="pause"]').click();
    await page.reload();
    await page.waitForSelector('#active-posts .employer-post-card');

    const card = tarjeta('Ayudante de cocina');
    assert.equal((await card.locator('.post-status').textContent()).trim(), 'Pausada');
    assert.equal((await card.locator('[data-action="reactivate"]').textContent()).trim(), 'Reactivar');
    assert.equal(await kpiActivas(), 2);

    // Las demás ofertas no se ven afectadas.
    assert.equal((await tarjeta('Vendedor/a de tienda').locator('.post-status').textContent()).trim(), 'Activa');
  });

  test('la pausa persiste al cerrar y volver a abrir la página', async () => {
    await abrirPanel();
    await tarjeta('Vendedor/a de tienda').locator('[data-action="pause"]').click();
    await page.close();

    page = await context.newPage();
    await abrirPanel();
    assert.equal((await tarjeta('Vendedor/a de tienda').locator('.post-status').textContent()).trim(), 'Pausada');
  });

  test('reactivar una oferta también es persistente', async () => {
    await abrirPanel();
    await tarjeta('Ayudante de cocina').locator('[data-action="pause"]').click();
    await page.reload();
    await page.waitForSelector('#active-posts .employer-post-card');
    await tarjeta('Ayudante de cocina').locator('[data-action="reactivate"]').click();
    await page.reload();
    await page.waitForSelector('#active-posts .employer-post-card');

    const card = tarjeta('Ayudante de cocina');
    assert.equal((await card.locator('.post-status').textContent()).trim(), 'Activa');
    assert.equal((await card.locator('[data-action="pause"]').textContent()).trim(), 'Pausar');
    assert.equal(await kpiActivas(), 3);
  });

  test('el filtro "Pausada" respeta el estado restaurado tras recargar', async () => {
    await abrirPanel();
    await tarjeta('Diseñador/a para redes sociales').locator('[data-action="pause"]').click();
    await page.reload();
    await page.waitForSelector('#active-posts .employer-post-card');
    await page.selectOption('#employer-status-filter', 'paused');
    assert.deepEqual(await titulosVisibles(), ['Diseñador/a para redes sociales']);
  });

  test('pausar una oferta recién publicada también persiste', async () => {
    const oferta = await publicarOferta({ title: 'Oferta nueva para pausar' });
    await tarjeta(oferta.title).locator('[data-action="pause"]').click();
    await page.reload();
    await page.waitForSelector('#active-posts .employer-post-card');
    assert.equal((await tarjeta(oferta.title).locator('.post-status').textContent()).trim(), 'Pausada');
    assert.equal(await kpiActivas(), 3);
  });
});

// ---------------------------------------------------------------------
// 5. Otros elementos interactivos
// ---------------------------------------------------------------------

describe('Otros elementos interactivos', () => {
  test('el botón del historial oculta y muestra las publicaciones anteriores', async () => {
    await abrirPanel();
    const toggle = page.locator('#past-posts-toggle');
    assert.ok(await page.isVisible('#past-posts-content'));

    await toggle.click();
    assert.equal(await page.isVisible('#past-posts-content'), false);
    assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
    assert.equal(await toggle.getAttribute('aria-label'), 'Mostrar publicaciones anteriores');

    await toggle.click();
    assert.ok(await page.isVisible('#past-posts-content'));
    assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
  });

  test('"Ver postulantes" marca la tarjeta como seleccionada', async () => {
    await abrirPanel();
    const card = tarjeta('Ayudante de cocina');
    await card.locator('[data-action="applicants"]').click();
    assert.match(await card.getAttribute('class'), /is-selected/);
  });

  test('el botón "Volver arriba" aparece al hacer scroll y regresa al inicio', async () => {
    await page.setViewportSize({ width: 1280, height: 600 });
    await abrirPanel();
    const boton = page.locator('.back-to-top');
    assert.doesNotMatch(await boton.getAttribute('class'), /is-visible/);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForFunction(() => document.querySelector('.back-to-top').classList.contains('is-visible'));
    await boton.click();
    await page.waitForFunction(() => window.scrollY === 0);
  });

  test('los enlaces "Publica una nueva oferta" y "Ver ofertas" apuntan a destinos válidos', async () => {
    await abrirPanel();
    const href = await page.getAttribute('#active-empty a', 'href');
    const respuesta = await page.request.get(baseUrl + href);
    assert.equal(respuesta.status(), 200);
    assert.equal(await page.getAttribute('.employer-side-heading a', 'href'), '#recent-posts-title');
  });
});

// ---------------------------------------------------------------------
// 6. Robustez y diseño responsive
// ---------------------------------------------------------------------

describe('Robustez y responsive', () => {
  test('datos corruptos en localStorage no rompen la página', async () => {
    await abrirPanel();
    await page.evaluate(() => {
      localStorage.setItem('lila_ofertas', '{no es json');
      localStorage.setItem('lila_estados_ofertas', '[1,2,3]');
    });
    await page.reload();
    await page.waitForSelector('#active-posts .employer-post-card');
    assert.equal((await titulosVisibles()).length, 3);
    assert.deepEqual(erroresConsola, []);
  });

  test('en un celular (375px) no hay scroll horizontal', async () => {
    await page.setViewportSize({ width: 375, height: 812 });
    await abrirPanel();
    const desborde = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(desborde <= 1, `la página desborda ${desborde}px en horizontal`);
  });
});
