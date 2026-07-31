import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { loadPublicCandidateSnapshot } from './public-candidate-snapshot.mjs';

const DEFAULT_URL = 'https://portal-transparencia-rs.pages.dev/';
const SECRET_KEY_PATTERN = /authorization|apikey|token|secret|service[_-]?role|password|raw_content/i;
const JWT_PATTERN = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const TOKEN_ASSIGNMENT_PATTERN = /(token|apikey|authorization|secret)=([^\s&]+)/gi;

function getArg(name) {
  const prefix = `${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  if (value) return value.slice(prefix.length);
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1];
  return undefined;
}

function normalizeUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.toString();
}

function nowCorrelationId() {
  const sha = String(process.env.GITHUB_SHA || process.env.CF_PAGES_COMMIT_SHA || 'local').slice(0, 7);
  const run = process.env.GITHUB_RUN_ID || process.env.CF_PAGES_BRANCH || 'manual';
  return `health-${sha}-${run}-${Date.now()}`;
}

export function redactForLog(value) {
  if (Array.isArray(value)) return value.map((item) => redactForLog(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        SECRET_KEY_PATTERN.test(key) ? '[REDACTED]' : redactForLog(child),
      ]),
    );
  }
  if (typeof value !== 'string') return value;
  return value
    .replace(JWT_PATTERN, '[REDACTED]')
    .replace(TOKEN_ASSIGNMENT_PATTERN, '$1=[REDACTED]')
    .replace(/service_role/gi, '[REDACTED]');
}

function okComponent(extra = {}) {
  return { status: 'ok', ...extra };
}

function failComponent(reason, extra = {}) {
  return { status: 'fail', reason, ...extra };
}

function warnComponent(reason, extra = {}) {
  return { status: 'warn', reason, ...extra };
}

function classifyRls(httpFailures) {
  const rlsFailures = httpFailures.filter((failure) =>
    [401, 403].includes(Number(failure.status)) && /\/rest\/v1\//.test(String(failure.url ?? '')),
  );
  if (rlsFailures.length === 0) return okComponent({ failures: [] });
  const candidateFailures = rlsFailures.filter((failure) => /\/rest\/v1\/candidates/.test(String(failure.url ?? '')));
  return candidateFailures.length > 0
    ? failComponent('RLS bloqueou leitura pública de candidates.', { failures: rlsFailures })
    : warnComponent('RLS/REST bloqueou claims ou relacionamento não crítico.', { failures: rlsFailures });
}

function classifyHttp(httpFailures) {
  const serverFailures = httpFailures.filter((failure) => Number(failure.status) >= 500);
  if (serverFailures.length > 0) {
    return failComponent('HTTP 5xx em app, Cloudflare ou Supabase.', { failures: serverFailures });
  }
  const clientFailures = httpFailures.filter((failure) => Number(failure.status) >= 400);
  return clientFailures.length > 0
    ? warnComponent('HTTP 4xx detectado fora do fluxo principal.', { failures: clientFailures })
    : okComponent({ failures: [] });
}

export function buildHealthReport({
  correlationId = nowCorrelationId(),
  release = null,
  html = {},
  candidates = {},
  claims = {},
  cache = {},
  httpFailures = [],
} = {}) {
  const alerts = [];
  const expectedMinCount = Number(candidates.expectedMinCount ?? 69);
  const candidateCount = Number(candidates.count ?? 0);

  const components = {
    deploy: html.ok ? okComponent() : failComponent(html.reason ?? 'HTML indisponível.'),
    release: release?.release_id ? okComponent({ release_id: release.release_id }) : warnComponent('release.json ausente ou inválido.'),
    candidates: candidateCount >= expectedMinCount
      ? okComponent({ count: candidateCount, expected_min_count: expectedMinCount })
      : failComponent('Home vazia ou abaixo da contagem plausível.', {
          count: candidateCount,
          expected_min_count: expectedMinCount,
        }),
    claims: claims.degraded
      ? warnComponent('Claims/editoria degradadas; lista oficial segue disponível.')
      : okComponent(),
    cache: cache.serviceWorkerReady === false
      ? warnComponent('Service worker/cache não ficou pronto no health check.')
      : okComponent({ service_worker_ready: cache.serviceWorkerReady ?? null }),
    rls: classifyRls(httpFailures),
    http: classifyHttp(httpFailures),
  };

  if (components.deploy.status === 'fail') alerts.push({ code: 'DEPLOY_HTML_UNAVAILABLE', severity: 'critical', runbook: 'docs/runbooks/h6-1-observabilidade.md' });
  if (components.candidates.status === 'fail') alerts.push({ code: 'CANDIDATES_EMPTY', severity: 'critical', runbook: 'docs/runbooks/h6-1-observabilidade.md' });
  if (components.claims.status === 'warn') alerts.push({ code: 'CLAIMS_DEGRADED', severity: 'warning', runbook: 'docs/runbooks/h6-1-observabilidade.md' });
  if (components.release.status === 'warn') alerts.push({ code: 'RELEASE_METADATA_MISSING', severity: 'warning', runbook: 'docs/runbooks/h6-1-observabilidade.md' });
  if (components.rls.status !== 'ok') alerts.push({ code: 'RLS_OR_REST_FAILURE', severity: components.rls.status === 'fail' ? 'critical' : 'warning', runbook: 'docs/runbooks/h6-1-observabilidade.md' });
  if (components.http.status === 'fail') alerts.push({ code: 'HTTP_5XX', severity: 'critical', runbook: 'docs/runbooks/h6-1-observabilidade.md' });
  if (components.cache.status === 'warn') alerts.push({ code: 'CACHE_OR_SW_DEGRADED', severity: 'warning', runbook: 'docs/runbooks/h6-1-observabilidade.md' });

  const blocksRelease = Object.values(components).some((component) => component.status === 'fail');
  const hasWarnings = Object.values(components).some((component) => component.status === 'warn');

  return redactForLog({
    status: blocksRelease ? 'fail' : hasWarnings ? 'warn' : 'ok',
    blocks_release: blocksRelease,
    correlation_id: correlationId,
    release_id: release?.release_id ?? null,
    components,
    alerts,
    http_failures_count: httpFailures.length,
  });
}

async function fetchJson(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function runBrowserProbe({ baseUrl, expectedMinCount }) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const httpFailures = [];
  const requestFailures = [];
  const consoleErrors = [];

  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && !/favicon\.ico|cloudflareinsights\.com\/cdn-cgi\/rum/.test(url)) {
      httpFailures.push({ status, url });
    }
  });
  page.on('requestfailed', (request) => {
    const url = request.url();
    if (!/favicon\.ico|cloudflareinsights\.com\/cdn-cgi\/rum/.test(url)) {
      requestFailures.push({ url, error: request.failure()?.errorText ?? 'request failed' });
    }
  });
  page.on('console', (message) => {
    const text = message.text();
    if (message.type() === 'error' && !/cloudflareinsights\.com\/cdn-cgi\/rum/.test(text)) {
      consoleErrors.push(text);
    }
  });

  try {
    await page.goto(baseUrl, { waitUntil: 'networkidle', timeout: 30_000 });
    const bodyText = await page.locator('body').innerText({ timeout: 10_000 }).catch(() => '');
    const count = await page.locator('main article').count();
    const serviceWorkerReady = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      try {
        await navigator.serviceWorker.ready;
        return Boolean(await navigator.serviceWorker.getRegistration('/'));
      } catch {
        return false;
      }
    });

    return {
      html: { ok: bodyText.includes('Portal Transparência Eleitoral RS') || bodyText.length > 0 },
      candidates: { count, expectedMinCount },
      claims: { degraded: bodyText.includes('Informações editoriais temporariamente indisponíveis') },
      cache: { serviceWorkerReady },
      httpFailures: [...httpFailures, ...requestFailures],
      consoleErrors,
    };
  } catch (error) {
    return {
      html: { ok: false, reason: error.message },
      candidates: { count: 0, expectedMinCount },
      claims: { degraded: false },
      cache: { serviceWorkerReady: false },
      httpFailures: [...httpFailures, ...requestFailures],
      consoleErrors,
    };
  } finally {
    await browser.close().catch(() => undefined);
  }
}

async function main() {
  const baseUrl = normalizeUrl(getArg('--url') ?? process.env.HEALTH_URL ?? process.env.SMOKE_URL ?? DEFAULT_URL);
  const expectedMinCount = Number(getArg('--expected-min-count') ?? process.env.PUBLIC_CANDIDATES_MIN_COUNT ?? 69);
  loadPublicCandidateSnapshot({ minCount: expectedMinCount });
  const release = await fetchJson(new URL('/release.json', baseUrl));
  const probe = await runBrowserProbe({ baseUrl, expectedMinCount });
  const report = buildHealthReport({
    correlationId: getArg('--correlation-id') ?? nowCorrelationId(),
    release,
    ...probe,
  });

  console.log(JSON.stringify(redactForLog(report), null, 2));
  if (report.blocks_release) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(JSON.stringify(redactForLog({ status: 'fail', error: error.message }), null, 2));
    process.exit(1);
  });
}
