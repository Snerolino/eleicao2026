#!/usr/bin/env node
/** Regenera inventário e piloto ALRS em sequência, sempre read-only. */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const node = process.execPath;

function run(script) {
  const result = spawnSync(node, [script], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    const detail = (result.stderr || result.stdout || '').trim().split('\n').at(-1) ?? 'sem saída';
    throw new Error(`${script} falhou (${result.status ?? 'sinal'}): ${detail}`);
  }
  return (result.stdout || '').trim().split('\n').at(-1) ?? '';
}

try {
  const inventory = run('scripts/build-alrs-attribution-release-queue.mjs');
  const pilot = run('scripts/select-alrs-attribution-pilot.mjs');
  console.log(JSON.stringify({ inventory, pilot, remote_apply: false, status: 'completed' }));
} catch (error) {
  console.error(`ALRS_PREPARATION_BLOCKED: ${error.message}`);
  process.exit(2);
}
