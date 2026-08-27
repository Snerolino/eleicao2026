#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const args = process.argv.slice(2);
const apply = args.includes('--apply');

const report = {
  schema_version: '1.0.0',
  packet_type: 'autonomous_federal_editorial_cycle',
  house: 'camara',
  remote_apply: apply,
  started_at: new Date().toISOString(),
  steps: [],
};

function run(label, script, extra = [], allowFailure = false) {
  try {
    const output = execFileSync(process.execPath, [resolve(root, script), ...extra], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
    report.steps.push({ label, status: 'ok', output: output.trim().split('\n').at(-1) ?? '' });
    return true;
  } catch (error) {
    report.steps.push({
      label,
      status: allowFailure ? 'blocked_non_terminal' : 'error',
      output: String(error.stdout ?? error.stderr ?? error.message).trim().split('\n').at(-1) ?? '',
    });
    if (!allowFailure) throw error;
    return false;
  }
}

// 1. Constrói lote de proposições federais
run('build_batch', 'scripts/build-camara-impact-batch-proposals.mjs');

const batchFile = resolve(root, 'data/legislative-import/camara/impact-editorial-batch-001-v1.json');
const classifierFile = resolve(root, 'data/legislative-import/camara/impact-editorial-classifier-decisions-v1.json');
const reviewerFile = resolve(root, 'data/legislative-import/camara/impact-editorial-reviewed-decisions-v1.json');

if (existsSync(batchFile)) {
  const batch = JSON.parse(readFileSync(batchFile, 'utf8'));

  if (Array.isArray(batch.items) && batch.items.length > 0) {
    // 2. Classificação com suporte a Verossimilhança Intercasas
    run('classifier', 'scripts/classify-camara-editorial-batch.mjs', [batchFile]);

    // 3. Revisão Editorial Independente (Auto-Aprovação / Isolamento)
    run('reviewer', 'scripts/review-camara-editorial-batch.mjs', [batchFile, classifierFile]);

    // 4. Validação Independente Fail-Closed
    run('independent_validation', 'scripts/validate-camara-editorial-batch-decisions.mjs', [
      batchFile,
      reviewerFile,
      '/tmp/autonomous-federal-editorial-validation.json',
    ]);

    if (apply) {
      // 5. Arquivamento do batch para auditoria
      const archiveDir = resolve(root, '.orchestrator/runtime/editorial-batches', batch.batch_id);
      mkdirSync(archiveDir, { recursive: true });
      for (const file of [batchFile, classifierFile, reviewerFile]) {
        if (existsSync(file)) {
          copyFileSync(file, resolve(archiveDir, file.split('/').at(-1)));
        }
      }

      // 6. Aplicação e Fan-Out Nominal
      run('apply_fanout', 'scripts/apply-validated-camara-editorial-batch.mjs', [
        batchFile,
        reviewerFile,
        '--apply',
        '--output=/tmp/autonomous-federal-editorial-apply.json',
      ]);
    }
  } else {
    report.steps.push({ label: 'classifier_reviewer_apply', status: 'idle_no_matter' });
  }
}

report.completed_at = new Date().toISOString();
console.log(JSON.stringify(report, null, 2));
