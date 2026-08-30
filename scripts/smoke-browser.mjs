import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { loadPublicCandidateSnapshot } from './public-candidate-snapshot.mjs';

function loadPublicCandidateOverrides() {
  try {
    const overrides = JSON.parse(readFileSync(resolve('data/public-candidate-overrides.json'), 'utf8'));
    return new Set((overrides.excluded_tse_candidate_ids ?? []).map(String));
  } catch {
    return new Set();
  }
}

const DEFAULT_URL = 'http://127.0.0.1:4173/';
const MANIFEST_PATH = 'manifest.webmanifest';
export const SMOKE_VIEWPORTS = [
  { width: 320, height: 640, label: 'mobile-320' },
  { width: 390, height: 844, label: 'mobile-390' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 1280, height: 720, label: 'desktop' },
];

function getArg(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  if (value) return value.slice(prefix.length);
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function fail(message, details) {
  throw new Error(details ? `${message}\n${details}` : message);
}

function normalizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.toString();
}

function isIgnoredExternalNoise(textOrUrl) {
  return (
    /cloudflareinsights\.com\/cdn-cgi\/rum/.test(textOrUrl) ||
    textOrUrl === 'Failed to load resource: net::ERR_FAILED'
  );
}

export async function assertHomeHasCandidates(page, expectedCount) {
  if (typeof page.waitForFunction === 'function') {
    await page.waitForFunction(
      (count) =>
        document.querySelectorAll('main article').length >= count ||
        !document.body.innerText.includes('Carregando lista de candidatos'),
      expectedCount,
      { timeout: 20_000 },
    ).catch(() => {});
  }

  let homeCount = await page.locator('main article').count();
  if (homeCount < expectedCount && typeof page.getByRole === 'function') {
    const browseButtons = page.getByRole('button', { name: /^Todos$/ });
    if (await browseButtons.count()) {
      await browseButtons.first().click();
      for (let iteration = 0; iteration < 20; iteration += 1) {
        const loadMore = page.getByRole('button', { name: /Mostrar mais 60/ });
        if (!(await loadMore.count())) break;
        await loadMore.first().click();
        await page.waitForTimeout(50);
      }
      await page.waitForFunction(
        (count) => document.querySelectorAll('main article').length >= count,
        expectedCount,
        { timeout: 20_000 },
      ).catch(() => {});
      homeCount = await page.locator('main article').count();
    }
  }
  const bodyText = await page.locator('body').innerText();
  const bodyPreview = bodyText.replace(/\s+/g, ' ').trim().slice(0, 500);

  if (bodyText.includes('Nenhum candidato está disponível no momento.') && expectedCount > 0) {
    fail(
      'Home não renderizou articles/candidatos: estado vazio apesar de snapshot com registros.',
      `cards=${homeCount}; esperado >= ${expectedCount}; body="${bodyPreview}"`,
    );
  }

  if (homeCount < expectedCount) {
    fail(
      'Home não renderizou articles/candidatos suficientes.',
      `cards=${homeCount}; esperado >= ${expectedCount}; body="${bodyPreview}"`,
    );
  }

  return { homeCount, bodyText };
}

export async function assertOfflineRender(offlineBody, serviceWorkerReady) {
  const normalizedBody = offlineBody.replace(/\s+/g, ' ').trim();
  if (!serviceWorkerReady) {
    fail('Service worker não ficou pronto antes do teste offline.');
  }
  if (!normalizedBody) {
    fail('Modo offline não renderizou conteúdo previsível.');
  }
  if (
    !normalizedBody.includes('Portal Transparência Eleitoral RS') &&
    !normalizedBody.includes('Transparência Eleitoral RS') &&
    !normalizedBody.includes('Candidatos') &&
    !normalizedBody.includes('offline')
  ) {
    fail('Modo offline renderizou conteúdo inesperado.', `body="${normalizedBody.slice(0, 500)}"`);
  }
}

export async function assertPwaInstallability(page) {
  const manifest = await page.evaluate(async (manifestPath) => {
    const link = document.querySelector('link[rel="manifest"]');
    const href = link?.getAttribute('href');
    if (!href) return { error: 'manifest link ausente' };
    if (!href.endsWith(manifestPath)) return { error: `manifest inesperado: ${href}` };
    const response = await fetch(href);
    if (!response.ok) return { error: `manifest HTTP ${response.status}` };
    return response.json();
  }, MANIFEST_PATH);

  if (manifest.error) fail(`Manifest PWA inválido: ${manifest.error}`);
  if (manifest.start_url !== '/') fail(`Manifest start_url inesperado: ${manifest.start_url}`);
  if (manifest.scope !== '/') fail(`Manifest scope inesperado: ${manifest.scope}`);
  if (manifest.display !== 'standalone') fail(`Manifest display inesperado: ${manifest.display}`);

  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  for (const [size, purpose] of [
    ['192x192', 'any'],
    ['512x512', 'any'],
    ['192x192', 'maskable'],
    ['512x512', 'maskable'],
  ]) {
    if (!icons.some((icon) => icon.sizes === size && icon.purpose === purpose)) {
      fail(`Manifest sem ícone ${size} ${purpose}.`);
    }
  }
}

async function waitForServer(url, timeoutMs = 30_000) {
  const start = Date.now();
  let lastError;
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(500);
  }
  throw new Error(`Preview não respondeu em ${timeoutMs}ms: ${lastError?.message ?? 'timeout'}`);
}

function startPreview(url) {
  const { hostname, port } = new URL(url);
  const child = spawn(
    'npm',
    ['run', 'preview', '--', '--host', hostname, '--port', port || '4173', '--strictPort'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, NODE_ENV: 'development' },
      detached: true,
    },
  );

  child.stdout.on('data', (chunk) => process.stdout.write(`[preview] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`));
  return child;
}

async function gotoApp(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
}

async function main() {
  const baseUrl = normalizeUrl(getArg('--url') ?? process.env.SMOKE_URL ?? DEFAULT_URL);
  const expectedMinCount = Number(
    getArg('--expected-min-count') ?? process.env.PUBLIC_CANDIDATES_MIN_COUNT ?? 69,
  );
  const excludedTseIds = loadPublicCandidateOverrides();
  const snapshotCandidates = loadPublicCandidateSnapshot({ minCount: expectedMinCount })
    .filter((candidate) => !excludedTseIds.has(String(candidate.tse_candidate_id)));
  const snapshotCount = snapshotCandidates.length;
  const [firstSnapshotCandidate] = snapshotCandidates;
  const expectedCount = Math.max(expectedMinCount, snapshotCount);
  const startLocalPreview = hasFlag('--start-preview');

  let previewProcess;
  if (startLocalPreview) {
    previewProcess = startPreview(baseUrl);
    await waitForServer(baseUrl);
  }

  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
  const browser = await chromium.launch({
    headless: true,
    ...(executablePath ? { executablePath } : {}),
  });
  const context = await browser.newContext({ acceptDownloads: true });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  const httpFailures = [];
  const requestFailures = [];

  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !isIgnoredExternalNoise(text)) consoleErrors.push(text);
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !url.endsWith('/favicon.ico') && !isIgnoredExternalNoise(url)) {
      httpFailures.push({ status, url });
    }
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!url.endsWith('/favicon.ico') && !isIgnoredExternalNoise(url)) {
      requestFailures.push({ url, error: request.failure()?.errorText ?? 'request failed' });
    }
  });

  try {
    await gotoApp(page, baseUrl);
    const { homeCount } = await assertHomeHasCandidates(page, expectedCount);
    await assertPwaInstallability(page);

    for (const viewport of SMOKE_VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await gotoApp(page, baseUrl);
      await assertHomeHasCandidates(page, expectedCount);
    }

    await page.getByRole('searchbox', { name: /buscar candidatos/i }).fill('ADEMAR');
    await page.waitForTimeout(250);
    const filteredCount = await page.locator('main article').count();
    const filteredText = await page.locator('body').innerText();
    if (filteredCount < 1 || !filteredText.includes('ADEMAR')) {
      fail(`Busca ADEMAR não retornou candidato visível; cards=${filteredCount}.`);
    }

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /baixar dados como csv/i }).click();
    const download = await downloadPromise;
    if (!download.suggestedFilename().endsWith('.csv')) {
      fail(`Download CSV com nome inesperado: ${download.suggestedFilename()}`);
    }

    await page.getByRole('searchbox', { name: /buscar candidatos/i }).fill('');
    await page.waitForTimeout(250);
    await page.locator('main article h3').first().dispatchEvent('click');
    await page.waitForLoadState('networkidle');
    const detailHeading = await page.locator('main h1').first().innerText({ timeout: 10_000 });
    if (!detailHeading.trim()) fail('Detalhe abriu sem h1 de candidato.');
    const detailUrl = page.url();
    if (/\/candidatos\/[0-9a-f-]{36}\/?$/i.test(detailUrl)) {
      fail(`Detalhe abriu URL legada UUID em vez de slug canônico: ${detailUrl}`);
    }

    if (firstSnapshotCandidate?.id && firstSnapshotCandidate?.slug) {
      await gotoApp(page, new URL(`/candidatos/${firstSnapshotCandidate.id}`, baseUrl).toString());
      const legacyHeading = await page.locator('main h1').first().innerText({ timeout: 10_000 });
      if (!legacyHeading.trim()) fail('Rota legada UUID abriu sem h1 de candidato.');
      const expectedCanonicalPath = `/candidatos/${firstSnapshotCandidate.slug}`;
      if (!new URL(page.url()).pathname.endsWith(expectedCanonicalPath)) {
        fail(`Rota legada UUID não redirecionou para slug canônico: ${page.url()} esperado ${expectedCanonicalPath}`);
      }
    }

    await gotoApp(page, new URL('/comparar', baseUrl).toString());
    await page.waitForFunction(
      () => document.querySelectorAll('section[aria-label="Lista de candidatos"] button[data-experience-type]').length >= 2,
      null,
      { timeout: 15_000 },
    );
    const compareButtons = page.locator('section[aria-label="Lista de candidatos"] button[data-experience-type]');
    if ((await compareButtons.count()) < 2) fail('Comparação abriu com menos de 2 candidatos.');
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();
    await page.waitForSelector('table', { timeout: 10_000 });
    const compareText = await page.locator('body').innerText();
    if (!compareText.includes('2 selecionados')) {
      fail('Comparação não registrou 2 candidatos selecionados.');
    }
    if (!page.url().includes('candidatos=')) {
      fail(`Comparação não atualizou rota compartilhável: ${page.url()}`);
    }

    const sharedCompareUrl = page.url();
    await gotoApp(page, sharedCompareUrl);
    await page.waitForSelector('table', { timeout: 10_000 });
    const sharedCompareText = await page.locator('body').innerText();
    if (!sharedCompareText.includes('2 selecionados')) {
      fail('Rota compartilhável de comparação não abriu com 2 selecionados.');
    }

    if (consoleErrors.length > 0) fail('Console errors durante smoke online.', consoleErrors.join('\n'));
    if (pageErrors.length > 0) fail('Page errors durante smoke online.', pageErrors.join('\n'));
    if (httpFailures.length > 0) fail('Requests HTTP 4xx/5xx durante smoke online.', JSON.stringify(httpFailures, null, 2));
    if (requestFailures.length > 0) fail('Requests falharam durante smoke online.', JSON.stringify(requestFailures, null, 2));

    const serviceWorkerReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        await navigator.serviceWorker.ready;
        const registration = await navigator.serviceWorker.getRegistration('/');
        return Boolean(navigator.serviceWorker.controller || registration);
      } catch {
        return false;
      }
    });
    consoleErrors.length = 0;
    pageErrors.length = 0;
    httpFailures.length = 0;
    requestFailures.length = 0;

    await context.setOffline(true);
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }).catch(() => null);
    const offlineBody = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
    await page.goto(detailUrl, { waitUntil: 'domcontentloaded' }).catch(() => null);
    const offlineDetailHeading = await page.locator('main h1').first().innerText({ timeout: 10_000 }).catch(() => '');
    await context.setOffline(false);
    await assertOfflineRender(offlineBody, serviceWorkerReady);
    if (!offlineDetailHeading.trim()) {
      fail('Detalhe já visitado não renderizou h1 em modo offline.');
    }

    console.log('✅ Smoke browser OK');
    console.log(JSON.stringify({
      url: baseUrl,
      cards: homeCount,
      expectedMinCount: expectedCount,
      searchCards: filteredCount,
      detailHeading,
      canonicalDetailUrl: detailUrl,
      offlineDetailHeading,
      serviceWorkerReady,
      httpFailures: httpFailures.length,
      onlineConsoleErrors: 0,
      offlineConsoleErrorsIgnored: consoleErrors.length,
    }, null, 2));
  } finally {
    await browser.close().catch(() => undefined);
    if (previewProcess?.pid) {
      try {
        process.kill(-previewProcess.pid, 'SIGTERM');
      } catch {
        previewProcess.kill('SIGTERM');
      }
    }
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('❌ Smoke browser falhou.');
    console.error(error?.stack ?? String(error));
    process.exit(1);
  });
}
