import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildReleaseMetadata } from '../generate-release-metadata.mjs';
import { buildHealthReport, redactForLog } from '../health-check.mjs';

const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
const deployWorkflow = readFileSync(join(process.cwd(), '.github/workflows/deploy.yml'), 'utf8');

const snapshotManifest = [
  {
    scope: 'consulta_cand/2026/RS',
    sha256: '6e3cf96fbde3ab761271350914d92a7afcd34d53ee5ab1a1ddc45232c1378ede',
    row_count: 69,
    created_at: '2026-07-30T12:36:08.583Z',
  },
];

describe('H6.1 release metadata e health-check', () => {
  it('gera metadata de release com SHA, build, versão e snapshot público sem segredos', () => {
    const metadata = buildReleaseMetadata({
      gitSha: 'ef97d7f1234567890abcdef1234567890abcdef',
      builtAt: '2026-07-31T10:00:00.000Z',
      packageVersion: '0.2.0',
      snapshotManifest,
    });

    expect(metadata).toMatchObject({
      release_id: 'ef97d7f-20260731T100000000Z',
      sha: 'ef97d7f1234567890abcdef1234567890abcdef',
      version: '0.2.0',
      built_at: '2026-07-31T10:00:00.000Z',
      snapshot: {
        scope: 'consulta_cand/2026/RS',
        sha256: '6e3cf96fbde3ab761271350914d92a7afcd34d53ee5ab1a1ddc45232c1378ede',
        row_count: 69,
        created_at: '2026-07-30T12:36:08.583Z',
      },
    });
    expect(JSON.stringify(metadata)).not.toMatch(/token|secret|service_role|authorization|apikey/i);
  });

  it('falha candidates/home vazia bloqueando release com correlation id', () => {
    const report = buildHealthReport({
      correlationId: 'health-123',
      release: { release_id: 'rel-1' },
      html: { ok: true },
      candidates: { count: 0, expectedMinCount: 69 },
      claims: { degraded: false },
      httpFailures: [],
    });

    expect(report.status).toBe('fail');
    expect(report.blocks_release).toBe(true);
    expect(report.components.candidates.status).toBe('fail');
    expect(report.alerts).toContainEqual(expect.objectContaining({ code: 'CANDIDATES_EMPTY' }));
    expect(report.correlation_id).toBe('health-123');
  });

  it('release metadata ausente/ilegível gera warning sem derrubar app saudável', () => {
    const report = buildHealthReport({
      correlationId: 'health-release-missing',
      release: null,
      html: { ok: true },
      candidates: { count: 69, expectedMinCount: 69 },
      claims: { degraded: false },
      httpFailures: [],
    });

    expect(report.status).toBe('warn');
    expect(report.blocks_release).toBe(false);
    expect(report.components.release.status).toBe('warn');
    expect(report.alerts).toContainEqual(expect.objectContaining({ code: 'RELEASE_METADATA_MISSING' }));
  });

  it('falha simulada de claims alerta sem considerar app totalmente indisponível', () => {
    const report = buildHealthReport({
      correlationId: 'health-claims',
      release: { release_id: 'rel-claims' },
      html: { ok: true },
      candidates: { count: 69, expectedMinCount: 69 },
      claims: { degraded: true },
      httpFailures: [{ status: 403, url: 'https://example.supabase.co/rest/v1/claims?select=*' }],
    });

    expect(report.status).toBe('warn');
    expect(report.blocks_release).toBe(false);
    expect(report.components.claims.status).toBe('warn');
    expect(report.components.rls.status).toBe('warn');
    expect(report.alerts).toContainEqual(expect.objectContaining({ code: 'CLAIMS_DEGRADED' }));
  });

  it('5xx em app ou Supabase vira falha crítica e bloqueia release', () => {
    const report = buildHealthReport({
      correlationId: 'health-5xx',
      release: { release_id: 'rel-5xx' },
      html: { ok: true },
      candidates: { count: 69, expectedMinCount: 69 },
      claims: { degraded: false },
      httpFailures: [{ status: 503, url: 'https://example.supabase.co/rest/v1/candidates?select=*' }],
    });

    expect(report.status).toBe('fail');
    expect(report.blocks_release).toBe(true);
    expect(report.components.http.status).toBe('fail');
    expect(report.alerts).toContainEqual(expect.objectContaining({ code: 'HTTP_5XX' }));
  });

  it('redige segredos e payload bruto antes de logar diagnóstico', () => {
    const redacted = redactForLog({
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature',
      apikey: 'secret-key-value',
      message: 'service_role should not appear with token=abc123',
      raw_content: '<html>payload bruto</html>',
    });

    expect(JSON.stringify(redacted)).not.toMatch(/eyJhbGci|secret-key-value|payload bruto|abc123/);
    expect(JSON.stringify(redacted)).toMatch(/\[REDACTED\]/);
  });

  it('publica release.json no build e executa health check no deploy', () => {
    expect(packageJson.scripts.build).toContain('generate-release-metadata.mjs');
    expect(packageJson.scripts['health:preview']).toBe('node scripts/health-check.mjs');
    expect(deployWorkflow).toContain('Production health check');
    expect(deployWorkflow).toContain('npm run health:preview');
  });
});
