import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';
import { loadPublicCandidateSnapshot } from './public-candidate-snapshot.mjs';

const DEFAULT_URL = 'http://127.0.0.1:4173/';

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
  const homeCount = await page.locator('main article').count();
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

async function main() {
  const baseUrl = normalizeUrl(getArg('--url') ?? process.env.SMOKE_URL ?? DEFAULT_URL);
  const expectedMinCount = Number(
    getArg('--expected-min-count') ?? process.env.PUBLIC_CANDIDATES_MIN_COUNT ?? 69,
  );
  const snapshotCandidates = loadPublicCandidateSnapshot({ minCount: expectedMinCount });
  const snapshotCount = snapshotCandidates.length;
  const [firstSnapshotCandidate] = snapshotCandidates;
  const expectedCount = Math.max(expectedMinCount, snapshotCount);
  const startLocalPreview = hasFlag('--start-preview');

  let previewProcess;
  if (startLocalPreview) {
    previewProcess = startPreview(baseUrl);
    await waitForServer(baseUrl);
  }

  const browser = await chromium.launch({ headless: true });
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
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    const { homeCount } = await assertHomeHasCandidates(page, expectedCount);

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
    await page.locator('main article a[href^="/candidatos/"]').first().click();
    await page.waitForLoadState('networkidle');
    const detailHeading = await page.locator('main h1').first().innerText({ timeout: 10_000 });
    if (!detailHeading.trim()) fail('Detalhe abriu sem h1 de candidato.');
    const detailUrl = page.url();
    if (/\/candidatos\/[0-9a-f-]{36}\/?$/i.test(detailUrl)) {
      fail(`Detalhe abriu URL legada UUID em vez de slug canônico: ${detailUrl}`);
    }

    if (firstSnapshotCandidate?.id && firstSnapshotCandidate?.slug) {
      await page.goto(new URL(`/candidatos/${firstSnapshotCandidate.id}`, baseUrl).toString(), { waitUntil: 'networkidle' });
      const legacyHeading = await page.locator('main h1').first().innerText({ timeout: 10_000 });
      if (!legacyHeading.trim()) fail('Rota legada UUID abriu sem h1 de candidato.');
      const expectedCanonicalPath = `/candidatos/${firstSnapshotCandidate.slug}`;
      if (!new URL(page.url()).pathname.endsWith(expectedCanonicalPath)) {
        fail(`Rota legada UUID não redirecionou para slug canônico: ${page.url()} esperado ${expectedCanonicalPath}`);
      }
    }

    await page.goto(new URL('/comparar', baseUrl).toString(), { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () => document.querySelectorAll('button[aria-pressed]').length >= 2,
      null,
      { timeout: 15_000 },
    );
    const compareButtons = page.locator('button[aria-pressed]');
    if ((await compareButtons.count()) < 2) fail('Comparação abriu com menos de 2 candidatos.');
    await compareButtons.nth(0).click();
    await compareButtons.nth(1).click();
    await page.waitForSelector('table', { timeout: 10_000 });
    const compareText = await page.locator('body').innerText();
    if (!compareText.includes('2 selecionados')) {
      fail('Comparação não registrou 2 candidatos selecionados.');
    }

    if (consoleErrors.length > 0) fail('Console errors durante smoke online.', consoleErrors.join('\n'));
    if (pageErrors.length > 0) fail('Page errors durante smoke online.', pageErrors.join('\n'));
    if (httpFailures.length > 0) fail('Requests HTTP 4xx/5xx durante smoke online.', JSON.stringify(httpFailures, null, 2));
    if (requestFailures.length > 0) fail('Requests falharam durante smoke online.', JSON.stringify(requestFailures, null, 2));

    const serviceWorkerReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        await navigator.serviceWorker.ready;
        return Boolean(navigator.serviceWorker.controller || (await navigator.serviceWorker.getRegistration()));
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
    await context.setOffline(false);
    if (!serviceWorkerReady && !offlineBody) {
      fail('Smoke offline básico não encontrou service worker nem página renderizada.');
    }

    console.log('✅ Smoke browser OK');
    console.log(JSON.stringify({
      url: baseUrl,
      cards: homeCount,
      expectedMinCount: expectedCount,
      searchCards: filteredCount,
      detailHeading,
      canonicalDetailUrl: detailUrl,
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
