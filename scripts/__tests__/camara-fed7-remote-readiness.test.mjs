// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const dir = resolve(root, 'data/legislative-import/camara/fed7-remote-readiness');
const manifest = JSON.parse(readFileSync(resolve(dir, 'manifest.json'), 'utf8'));
const catalog = JSON.parse(readFileSync(resolve(dir, 'source-catalog.json'), 'utf8'));
const sql = readFileSync(resolve(dir, 'source-references.sql'), 'utf8');

describe('FED-7A: prontidão remota Câmara', () => {
  it('mantém os quatro source references sem UUID inventado', () => {
    expect(manifest.source_count).toBe(4);
    expect(manifest.source_ids_resolved).toBe(0);
    expect(catalog.unresolved).toHaveLength(4);
    expect(Object.values(catalog.sourceReferenceByKey).every((id) => id === null)).toBe(true);
  });

  it('bloqueia SQL factual até resolver FKs remotas', () => {
    expect(manifest.factual_sql_generated).toBe(false);
    expect(manifest.remote_apply).toBe(false);
    expect(manifest.candidate_fk_resolution.resolved_remote_candidate_ids).toBe(0);
    expect(manifest.blockers).toEqual(expect.arrayContaining([
      'candidate UUIDs must come from remote lookup by tse_candidate_id',
    ]));
  });

  it('emite somente SQL de source_references e não contém segredos', () => {
    expect(sql).toContain('insert into source_references');
    expect(sql).not.toMatch(/service_role|apikey|Authorization|Bearer/i);
    expect(sql).not.toContain('legislative_votes');
    expect(sql).not.toContain('impact_matrices');
  });
});
