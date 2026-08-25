import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'editorial-review-'));
  const batch = { batch_id: 'test-batch', items: [{ proposition_version_id: '11111111-1111-1111-1111-111111111111', review_key: 'rk-1', source_gate: 'green', official_event_type: 'merit_confirmed', recommended_disposition: 'taxonomy_gap' }] };
  const hash = createHash('sha256').update(JSON.stringify({ batch_id: batch.batch_id, items: batch.items })).digest('hex');
  const batchFile = join(dir, 'batch.json');
  const decisionsFile = join(dir, 'decisions.json');
  const output = join(dir, 'reviewed.json');
  writeFileSync(batchFile, JSON.stringify(batch));
  writeFileSync(decisionsFile, JSON.stringify({ batch_id: batch.batch_id, batch_sha256: hash, items: [{ proposition_version_id: batch.items[0].proposition_version_id, review_key: 'rk-1', decision: 'approved', disposition: 'taxonomy_gap', rationale: 'Taxonomia v1 não possui grupo direto seguro para a matéria.', reviewer_type: 'automatic_classifier' }] }));
  return { dir, batchFile, decisionsFile, output };
}

describe('review-editorial-batch', () => {
  it('recalcula o batch original e aceita decisão íntegra', () => {
    const f = fixture();
    execFileSync(process.execPath, ['scripts/review-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.output}`], { cwd: process.cwd() });
    expect(JSON.parse(readFileSync(f.output, 'utf8')).valid).toBe(true);
  });

  it('rejeita hash divergente', () => {
    const f = fixture();
    const decisions = JSON.parse(readFileSync(f.decisionsFile, 'utf8'));
    decisions.batch_sha256 = 'stale';
    writeFileSync(f.decisionsFile, JSON.stringify(decisions));
    expect(() => execFileSync(process.execPath, ['scripts/review-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.output}`], { cwd: process.cwd(), stdio: 'pipe' })).toThrow();
    expect(JSON.parse(readFileSync(f.output, 'utf8')).errors).toContain('batch_sha256_mismatch');
  });
});
