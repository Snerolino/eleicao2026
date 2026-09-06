#!/usr/bin/env node
/** Checkpoint atômico e retomável da análise de autoria Câmara. */
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const file = path.resolve(root, 'data/legislative-import/camara/authored-analysis-progress-v1.json');
const args = process.argv.slice(2);
const value = (name, fallback = null) => {
  const index = args.indexOf(name);
  return index >= 0 ? (args[index + 1] ?? fallback) : fallback;
};

function parseRange(range) {
  const match = String(range ?? '').match(/^(\d+)-(\d+)$/);
  return match ? { start: Number(match[1]), end: Number(match[2]) } : null;
}

function nextRange(range) {
  const parsed = parseRange(range);
  if (!parsed || parsed.end < parsed.start) return null;
  return `${parsed.end + 1}-${parsed.end + (parsed.end - parsed.start + 1)}`;
}

function isAtOrBefore(candidate, completed) {
  const next = parseRange(candidate);
  const done = parseRange(completed);
  return !next || !done || next.start <= done.end;
}

const existing = fs.existsSync(file)
  ? JSON.parse(fs.readFileSync(file, 'utf8'))
  : {
      schema_version: '1.0.0',
      packet_type: 'candidate_authored_analysis_progress',
      project: 'eleicao2026',
      mode: 'durable_checkpoint',
      completed_batches: [],
      blocked_items: [],
      counts: { projects_analyzed: 0, approved: 0, pending_review: 0, withheld: 0 },
      last_batch: null,
      next_batch: '1276-1300',
      heartbeat: null,
    };

const batch = value('--batch');
const status = value('--status');
const requestedNext = value('--next');
const heartbeat = args.includes('--heartbeat');

if (batch && status) {
  existing.completed_batches = existing.completed_batches.filter((item) => item.batch_id !== batch);
  existing.completed_batches.push({ batch_id: batch, status, updated_at: new Date().toISOString() });
  existing.completed_batches.sort((a, b) => a.batch_id.localeCompare(b.batch_id, 'en', { numeric: true }));
  existing.last_batch = batch;
}

const terminalStatus = new Set(['blocked', 'withheld', 'completed']);
const calculatedNext = nextRange(batch);
if (terminalStatus.has(status) && calculatedNext && isAtOrBefore(requestedNext, batch)) {
  existing.next_batch = calculatedNext;
} else if (requestedNext) {
  existing.next_batch = requestedNext;
}

if (heartbeat) existing.heartbeat = { at: new Date().toISOString(), pid: process.pid };
for (const key of ['projects_analyzed', 'approved', 'pending_review', 'withheld']) {
  const current = value(`--${key}`);
  if (current !== null) existing.counts[key] = Number(current);
}

const blocked = value('--blocked');
if (blocked) existing.blocked_items = [...new Set([...existing.blocked_items, ...blocked.split(',').filter(Boolean)])];

const temp = `${file}.tmp-${process.pid}`;
fs.mkdirSync(path.dirname(file), { recursive: true });
fs.writeFileSync(temp, `${JSON.stringify(existing, null, 2)}\n`);
fs.renameSync(temp, file);
console.log(JSON.stringify({
  file,
  last_batch: existing.last_batch,
  next_batch: existing.next_batch,
  counts: existing.counts,
  heartbeat: existing.heartbeat,
  blocked_items: existing.blocked_items.length,
}));
