// @vitest-environment node
import { existsSync, readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'apply-batch-'));
  const batch = {
    batch_id: 'test-batch',
    items: [
      { proposition_version_id: '11111111-1111-1111-1111-111111111111', review_key: 'rk-1', source_gate: 'green', event_type: 'merit_confirmed', title: 'PL Teste' },
      { proposition_version_id: '22222222-2222-2222-2222-222222222222', review_key: 'rk-2', source_gate: 'green', event_type: 'merit_confirmed', title: 'PL Segundo' },
    ],
  };
  const hash = createHash('sha256').update(JSON.stringify({ batch_id: batch.batch_id, items: batch.items })).digest('hex');
  const batchFile = join(dir, 'batch.json');
  const decisionsFile = join(dir, 'decisions.json');
  const outputFile = join(dir, 'out.json');
  writeFileSync(batchFile, JSON.stringify(batch));
  writeFileSync(decisionsFile, JSON.stringify({
    batch_id: batch.batch_id,
    batch_sha256: hash,
    items: [
      { proposition_version_id: batch.items[0].proposition_version_id, review_key: 'rk-1', decision: 'approved', disposition: 'taxonomy_gap', rationale: 'Justificativa de exemplo para a revisão automática.', reviewer_type: 'automatic_classifier' },
      { proposition_version_id: batch.items[1].proposition_version_id, review_key: 'rk-2', decision: 'approved', disposition: 'taxonomy_gap', rationale: 'Justificativa de exemplo para a segunda revisão automática.', reviewer_type: 'automatic_classifier' },
    ],
  }));
  return { dir, batchFile, decisionsFile, outputFile, hash, batch };
}

describe('apply-validated-editorial-batch (sem apply)', () => {
  it('valida dry-run e reporta validated_not_applied quando gates verdes', () => {
    const f = fixture();
    execFileSync(process.execPath, ['scripts/apply-validated-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.outputFile}`], { cwd: resolve(import.meta.dirname, '..', '..') });
    const report = JSON.parse(readFileSync(f.outputFile, 'utf8'));
    expect(report.errors).toHaveLength(0);
    expect(report.mode).toBe('dry-run');
    expect(report.remote_apply).toBe(false);
    expect(report.actions).toHaveLength(2);
    expect(report.actions.every((a) => a.status === 'validated_not_applied')).toBe(true);
  });

  it('rejeita quando batch_sha256 diverge (payload manipulado)', () => {
    const f = fixture();
    const dec = JSON.parse(readFileSync(f.decisionsFile, 'utf8'));
    dec.batch_sha256 = 'payload-alterado';
    writeFileSync(f.decisionsFile, JSON.stringify(dec));
    expect(() => execFileSync(process.execPath, ['scripts/apply-validated-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.outputFile}`], { cwd: resolve(import.meta.dirname, '..', '..'), stdio: 'pipe' })).toThrow();
    const report = JSON.parse(readFileSync(f.outputFile, 'utf8'));
    expect(report.errors).toEqual(expect.arrayContaining(['batch_sha256_mismatch']));
    expect(report.errors).not.toContain('review_key_mismatch');
  });

  it('bloqueia procedural_confirmed em vez de aplicar', () => {
    const f = fixture();
    const batch = JSON.parse(readFileSync(f.batchFile, 'utf8'));
    batch.items[0].event_type = 'procedural_confirmed';
    writeFileSync(f.batchFile, JSON.stringify(batch));
    expect(() => execFileSync(process.execPath, ['scripts/apply-validated-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.outputFile}`], { cwd: resolve(import.meta.dirname, '..', '..'), stdio: 'pipe' })).toThrow();
    const report = JSON.parse(readFileSync(f.outputFile, 'utf8'));
    expect(report.errors).toEqual(expect.arrayContaining([`${batch.items[0].proposition_version_id}:procedural_forbidden`]));
  });
});
