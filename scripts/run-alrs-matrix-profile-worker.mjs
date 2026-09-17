#!/usr/bin/env node
/** Worker autenticado: assessments aprovados -> materialização factual de perfis. */
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const steps = [];

function run(label, script, args) {
  try {
    const output = execFileSync(process.execPath, [resolve(root, script), ...args], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
    });
    steps.push({ label, status: 'ok', output: output.trim().split('\n').at(-1) ?? '' });
    return true;
  } catch (error) {
    steps.push({ label, status: 'blocked', output: String(error.stdout ?? error.stderr ?? error.message).trim().split('\n').at(-1) ?? '' });
    return false;
  }
}

const assessments = run('authenticated_assessments', 'scripts/apply-alrs-p2-assessment-drafts-auth.mjs', ['--apply']);
const profiles = assessments && run('profile_recalculation', 'scripts/build-vote-profile-fast.mjs', ['--apply']);
const result = {
  schema_version: '1.0.0',
  worker: 'alrs-matrix-profile',
  remote_apply: assessments,
  profile_recalculation: profiles,
  status: assessments && profiles ? 'completed' : 'blocked',
  steps,
};
console.log(JSON.stringify(result));
process.exitCode = result.status === 'completed' ? 0 : 1;
