#!/usr/bin/env node
/** Supervisor local no-stop: checkpoint, regeneração e retomada por lane. */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const stateDir = resolve(root, '.orchestrator/runtime/no-stop');
const stateFile = resolve(stateDir, 'state.json');
const args = process.argv.slice(2);
const batch = args.find((arg) => arg.startsWith('--batch='))?.slice(8) ?? null;
const processNext = args.includes('--process-next');
const focus = args.find((arg) => arg.startsWith('--focus='))?.slice(8) ?? process.env.NO_STOP_FOCUS ?? 'all';
const maxRetries = 3;
const timeoutMs = 8 * 60 * 1000;
let child = null;
let currentLane = null;

mkdirSync(stateDir, { recursive: true });
const readState = () => (existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')) : { schema_version: '1.0.0', lanes: {} });
const writeState = (state) => {
  const temp = `${stateFile}.tmp-${process.pid}`;
  writeFileSync(temp, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(temp, stateFile);
};
const state = readState();
state.schema_version = '1.0.0';
state.last_start = new Date().toISOString();
state.pid = process.pid;
state.status = 'running';
state.resume_from = Object.entries(state.lanes).find(([, value]) => value.status === 'running' || value.status === 'interrupted')?.[0] ?? null;
writeState(state);

const lanes = [
  { name: 'alrs_queue_regeneration', command: 'node', args: ['scripts/build-alrs-exclusive-editorial-lane.mjs'], enabled: focus === 'alrs-editorial' },
  ...Array.from({ length: Number(process.env.NO_STOP_WORKERS ?? 4) }, (_, worker) => ({ name: `alrs_editorial_worker_${worker}`, command: 'node', args: ['scripts/run-alrs-editorial-triage-worker.mjs', `--worker=${worker}`, `--workers=${Number(process.env.NO_STOP_WORKERS ?? 4)}`], enabled: focus === 'alrs-editorial' })),
  { name: 'official_reconnaissance', command: 'node', args: ['scripts/process-camara-authored-batch.mjs', ...(batch ? [`--start=${batch.split('-')[0]}`, `--limit=${Number(batch.split('-')[1]) - Number(batch.split('-')[0]) + 1}`] : [])], enabled: focus !== 'alrs-editorial' && Boolean(processNext && batch) },
  { name: 'candidate_reconciliation', command: 'node', args: ['scripts/continuous-progress-monitor.mjs'], enabled: focus !== 'alrs-editorial' },
  { name: 'editorial_causal', command: 'node', args: ['scripts/continuous-progress-monitor.mjs'], enabled: focus !== 'alrs-editorial' },
  { name: 'editorial_redteam', command: 'node', args: ['scripts/continuous-progress-monitor.mjs'], enabled: focus !== 'alrs-editorial' },
  { name: 'factual_apply', command: 'node', args: ['-e', "console.log(JSON.stringify({status:'gated',remote_apply:false,reason:'aplicação factual exige Auth/RPC e gate próprio'}))"], enabled: focus !== 'alrs-editorial' },
  { name: 'matrix_score', command: 'node', args: ['-e', "console.log(JSON.stringify({status:'gated',score_eligible:false,reason:'sem assessment/evento vinculante não há score'}))"], enabled: focus !== 'alrs-editorial' },
  { name: 'publication_verification', command: 'node', args: ['scripts/continuous-progress-monitor.mjs'], enabled: focus !== 'alrs-editorial' },
];

function onSignal(signal) {
  if (!currentLane) process.exitCode = 75;
  state.status = 'interrupted';
  state.interrupted_at = new Date().toISOString();
  state.resume_from = currentLane;
  if (currentLane) state.lanes[currentLane] = { ...(state.lanes[currentLane] ?? {}), status: 'interrupted', interrupted_at: state.interrupted_at };
  writeState(state);
  if (child) child.kill(signal);
  else process.exit(75);
}
process.on('SIGTERM', () => onSignal('SIGTERM'));
process.on('SIGINT', () => onSignal('SIGINT'));

function runLane(lane) {
  return new Promise((resolveLane) => {
    let attempt = 0;
    const retry = () => {
      attempt += 1;
      state.lanes[lane.name] = { ...(state.lanes[lane.name] ?? {}), status: 'running', attempt, started_at: new Date().toISOString() };
      writeState(state);
      child = spawn(lane.command, lane.args, { cwd: root, stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
      let output = '';
      let error = '';
      child.stdout.on('data', (chunk) => { output += chunk; });
      child.stderr.on('data', (chunk) => { error += chunk; });
      const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs);
      child.on('close', (code, signal) => {
        clearTimeout(timer);
        child = null;
        if (code === 0) {
          state.lanes[lane.name] = { status: 'completed', attempt, completed_at: new Date().toISOString(), output: output.trim().split('\n').at(-1) ?? '' };
          writeState(state);
          resolveLane(true);
        } else if (attempt < maxRetries) {
          state.lanes[lane.name] = { status: 'retrying', attempt, code, signal, error: error.trim().slice(-1000) };
          writeState(state);
          retry();
        } else {
          state.lanes[lane.name] = { status: 'blocked', attempt, code, signal, error: error.trim().slice(-1000) };
          state.resume_from = lane.name;
          writeState(state);
          resolveLane(false);
        }
      });
    };
    retry();
  });
}

const ordered = lanes.filter((lane) => lane.enabled);
const resumeIndex = state.resume_from ? Math.max(0, ordered.findIndex((lane) => lane.name === state.resume_from)) : 0;
let allOk = true;
const remaining = ordered.slice(resumeIndex);
for (let index = 0; index < remaining.length;) {
  const lane = remaining[index];
  if (lane.name.startsWith('alrs_editorial_worker_')) {
    const workers = [];
    while (index < remaining.length && remaining[index].name.startsWith('alrs_editorial_worker_')) workers.push(remaining[index++]);
    currentLane = 'alrs_editorial_workers';
    const results = await Promise.all(workers.map((workerLane) => runLane(workerLane)));
    if (results.some((ok) => !ok)) { allOk = false; break; }
    continue;
  }
  index += 1;
  currentLane = lane.name;
  const ok = await runLane(lane);
  if (!ok) { allOk = false; break; }
}
currentLane = null;
state.status = allOk ? 'completed' : 'blocked';
state.resume_from = allOk ? null : state.resume_from;
state.last_end = new Date().toISOString();
writeState(state);
console.log(JSON.stringify({ status: state.status, resumed_from: state.resume_from, lanes: state.lanes }));
process.exitCode = allOk ? 0 : 1;
