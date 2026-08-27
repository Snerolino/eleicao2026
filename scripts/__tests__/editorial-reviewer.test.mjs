// @vitest-environment node
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function fixture(customDecisions) {
  const dir = mkdtempSync(join(tmpdir(), 'editorial-review-'));
  const batch = {
    batch_id: 'test-batch',
    items: [
      {
        proposition_version_id: '11111111-1111-1111-1111-111111111111',
        review_key: 'rk-1',
        source_gate: 'green',
        official_event_type: 'merit_confirmed',
        recommended_disposition: 'taxonomy_gap',
      },
    ],
  };
  const hash = createHash('sha256').update(JSON.stringify({ batch_id: batch.batch_id, items: batch.items })).digest('hex');
  const batchFile = join(dir, 'batch.json');
  const decisionsFile = join(dir, 'decisions.json');
  const output = join(dir, 'reviewed.json');
  writeFileSync(batchFile, JSON.stringify(batch));
  const defaultItems = [
    {
      proposition_version_id: batch.items[0].proposition_version_id,
      review_key: 'rk-1',
      decision: 'approved',
      disposition: 'taxonomy_gap',
      rationale: 'Taxonomia v1 não possui grupo direto seguro para a matéria.',
      reviewer_type: 'automatic_classifier',
    },
  ];
  writeFileSync(
    decisionsFile,
    JSON.stringify({
      batch_id: batch.batch_id,
      batch_sha256: hash,
      items: customDecisions ?? defaultItems,
    }),
  );
  return { dir, batchFile, decisionsFile, output };
}

describe('review-editorial-batch', () => {
  it('recalcula o batch original e aceita decisão íntegra', () => {
    const f = fixture();
    execFileSync(process.execPath, ['scripts/review-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.output}`], { cwd: process.cwd() });
    expect(JSON.parse(readFileSync(f.output, 'utf8')).valid).toBe(true);
  });

  it('aceita assessment completo com defending_vote = sim para impacto positivo', () => {
    const f = fixture([
      {
        proposition_version_id: '11111111-1111-1111-1111-111111111111',
        review_key: 'rk-1',
        decision: 'approved',
        disposition: 'assess',
        rationale: 'Medida protetiva com efeito substantivo direto sobre mulheres vítimas de violência.',
        matrix: { severity: 3, structural_type: 'structural' },
        assessments: [
          {
            group_slug: 'mulheres',
            impact_direction: 'positive',
            defending_vote: 'sim',
            confidence: 0.95,
            rationale: 'A versão aprovada cria protocolo estadual protetivo com efeito direto.',
          },
        ],
        reviewer_type: 'automatic_classifier',
      },
    ]);
    execFileSync(process.execPath, ['scripts/review-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.output}`], { cwd: process.cwd() });
    const result = JSON.parse(readFileSync(f.output, 'utf8'));
    expect(result.valid).toBe(true);
    expect(result.summary.assess).toBe(1);
  });

  it('aceita assessment com defending_vote = nao para impacto negativo (voto contra como defensor)', () => {
    const f = fixture([
      {
        proposition_version_id: '11111111-1111-1111-1111-111111111111',
        review_key: 'rk-1',
        decision: 'approved',
        disposition: 'assess',
        rationale: 'Proposta reduz proteção legal e garantias normativas da população LGBTQIA+.',
        matrix: { severity: 3, structural_type: 'structural' },
        assessments: [
          {
            group_slug: 'lgbtqia',
            impact_direction: 'negative',
            defending_vote: 'nao',
            confidence: 0.94,
            rationale: 'A matéria restringe direitos; portanto, o voto defensor do grupo é NÃO.',
          },
        ],
        reviewer_type: 'automatic_classifier',
      },
    ]);
    execFileSync(process.execPath, ['scripts/review-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.output}`], { cwd: process.cwd() });
    const result = JSON.parse(readFileSync(f.output, 'utf8'));
    expect(result.valid).toBe(true);
    expect(result.summary.assess).toBe(1);
  });

  it('rejeita defending_vote inválido para impacto positivo', () => {
    const f = fixture([
      {
        proposition_version_id: '11111111-1111-1111-1111-111111111111',
        review_key: 'rk-1',
        decision: 'approved',
        disposition: 'assess',
        rationale: 'Medida protetiva com efeito substantivo direto sobre mulheres.',
        matrix: { severity: 3, structural_type: 'structural' },
        assessments: [
          {
            group_slug: 'mulheres',
            impact_direction: 'positive',
            defending_vote: 'abstencao',
            confidence: 0.95,
            rationale: 'A versão aprovada cria protocolo estadual protetivo.',
          },
        ],
        reviewer_type: 'automatic_classifier',
      },
    ]);
    expect(() => execFileSync(process.execPath, ['scripts/review-editorial-batch.mjs', f.batchFile, f.decisionsFile, `--output=${f.output}`], { cwd: process.cwd(), stdio: 'pipe' })).toThrow();
    expect(JSON.parse(readFileSync(f.output, 'utf8')).errors).toContain('11111111-1111-1111-1111-111111111111:positive_or_negative_requires_defending_vote_sim_or_nao');
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

