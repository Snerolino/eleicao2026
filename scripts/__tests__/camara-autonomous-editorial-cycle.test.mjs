// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

describe('camara-autonomous-editorial-cycle', () => {
  it('executa ciclo editorial autônomo completo com fan-out determinístico', () => {
    const result = execFileSync(
      process.execPath,
      [resolve(root, 'scripts/run-autonomous-federal-editorial-cycle.mjs'), '--apply'],
      { cwd: root, encoding: 'utf8' }
    );

    const report = JSON.parse(result);
    expect(report.packet_type).toBe('autonomous_federal_editorial_cycle');
    expect(report.house).toBe('camara');
    expect(report.remote_apply).toBe(true);

    const stepLabels = report.steps.map((s) => s.label);
    expect(stepLabels).toContain('build_batch');
    expect(stepLabels).toContain('classifier');
    expect(stepLabels).toContain('reviewer');
    expect(stepLabels).toContain('independent_validation');
    expect(stepLabels).toContain('apply_fanout');

    const batchFile = resolve(root, 'data/legislative-import/camara/impact-editorial-batch-001-v1.json');
    const classifierFile = resolve(root, 'data/legislative-import/camara/impact-editorial-classifier-decisions-v1.json');
    const reviewerFile = resolve(root, 'data/legislative-import/camara/impact-editorial-reviewed-decisions-v1.json');

    expect(existsSync(batchFile)).toBe(true);
    expect(existsSync(classifierFile)).toBe(true);
    expect(existsSync(reviewerFile)).toBe(true);

    const batch = JSON.parse(readFileSync(batchFile, 'utf8'));
    const reviewer = JSON.parse(readFileSync(reviewerFile, 'utf8'));

    expect(batch.items.length).toBe(30);
    expect(reviewer.reviews.length).toBe(30);
    expect(reviewer.summary.approved).toBe(30);
  }, 120_000);
});
