// @vitest-environment node

import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..', '..');
const scriptPath = resolve(root, 'scripts/build-legislative-source-catalog.mjs');
const sourcesPath = resolve(root, 'data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json');
const senadoSourcesPath = resolve(root, 'data/legislative-import/senado/nominal-source-catalog-input.json');

function runCatalog(args) {
  return execFileSync(process.execPath, [scriptPath, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, NO_COLOR: '1' },
  });
}

describe('build-legislative-source-catalog', () => {
  it('gera catálogo local determinístico sem UUID inventado', () => {
    const output = runCatalog([sourcesPath]);
    const again = runCatalog([sourcesPath]);
    expect(output).toBe(again);

    const catalog = JSON.parse(output);
    expect(catalog.sourceReferences).toHaveLength(4);
    expect(Object.keys(catalog.sourceReferenceByKey).sort()).toEqual(
      catalog.sourceReferences.map((source) => source.key.trim().toLowerCase()).sort(),
    );
    expect(Object.values(catalog.sourceReferenceByKey)).toEqual([null, null, null, null]);
    expect(output).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i);
    expect(output).not.toMatch(/service_role|apikey|Authorization|Bearer/i);
  });

  it('aceita catálogo oficial do Senado sem UUID inventado', () => {
    const catalog = JSON.parse(runCatalog([senadoSourcesPath]));
    expect(catalog.sourceReferences).toHaveLength(6);
    expect(catalog.unresolved).toHaveLength(6);
    expect(Object.values(catalog.sourceReferenceByKey)).toEqual([null, null, null, null, null, null]);
  });

  it('emite SQL revisável para source_references sem executar Supabase', () => {
    const sql = runCatalog(['--emit-sql', sourcesPath]);

    expect(sql).toContain('insert into source_references (source_name, source_category, url, title, content_hash) values');
    expect(sql).toContain('on conflict (content_hash) do update set');
    expect(sql).toContain('returning id, content_hash;');
    expect(sql).toContain('PLP 230/2025');
    expect(sql).not.toMatch(/service_role|apikey|Authorization|Bearer/i);
  });

  it('resolve sourceReferenceByKey a partir de arquivo content_hash -> uuid', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'source-ids-'));
    const resolvedPath = join(tmp, 'ids.json');
    const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'));
    const ids = Object.fromEntries(
      sources.sources.map((source, index) => [
        source.content_hash,
        `00000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`,
      ]),
    );
    writeFileSync(resolvedPath, `${JSON.stringify(ids, null, 2)}\n`);

    const catalog = JSON.parse(runCatalog(['--resolve-from-file', resolvedPath, sourcesPath]));
    for (const source of sources.sources) {
      expect(catalog.sourceReferenceByKey[source.key.trim().toLowerCase()]).toBe(ids[source.content_hash]);
    }
    expect(catalog.unresolved).toEqual([]);
  });

  it('rejeita entrada resolvida com UUID inválido em vez de fabricar fallback', () => {
    const tmp = mkdtempSync(join(tmpdir(), 'source-ids-invalid-'));
    const resolvedPath = join(tmp, 'ids.json');
    writeFileSync(resolvedPath, JSON.stringify({ 'sha256:d7ae8159cf6f0e238f5d1b88ffa438383f8db99fe4380968e81806a317472a25': 'not-a-uuid' }));

    expect(() => runCatalog(['--resolve-from-file', resolvedPath, sourcesPath])).toThrow(/UUID inválido/);
  });
});
