#!/usr/bin/env node
import fs from 'node:fs';

function parseLooseJsonFile(file) {
  const raw = fs.readFileSync(file, 'utf8').trim();
  try {
    return JSON.parse(raw);
  } catch {
    const end = raw.lastIndexOf('}');
    if (end >= 0) return JSON.parse(raw.slice(0, end + 1));
    throw new Error(`invalid json: ${file}`);
  }
}

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;}
const batchFile = arg('--batch');
const causalFile = arg('--causal');
const redteamFile = arg('--redteam');
const outFile = arg('--out');
if(!batchFile || !causalFile || !redteamFile || !outFile) throw new Error('use --batch --causal --redteam --out');

const batch = parseLooseJsonFile(batchFile);
const causalRaw = parseLooseJsonFile(causalFile);
const redRaw = parseLooseJsonFile(redteamFile);
const expected = batch.items ?? [];
const causal = Array.isArray(causalRaw) ? causalRaw : (causalRaw.items ?? []);
const red = Array.isArray(redRaw) ? redRaw : (redRaw.items ?? []);

const expectedIds = expected.map((item) => item.id);
const causalById = new Map(causal.map((item) => [item.id ?? item.project_id, item]));
const redById = new Map(red.map((item) => [item.id ?? item.project_id, item]));
if (causal.length !== expected.length || red.length !== expected.length) {
  throw new Error(`cardinality mismatch expected=${expected.length} causal=${causal.length} red=${red.length}`);
}
for (const id of expectedIds) {
  if (!causalById.has(id) || !redById.has(id)) throw new Error(`missing review for ${id}`);
}

const items = expected.map((base) => {
  const c = causalById.get(base.id);
  const r = redById.get(base.id);
  const cDecision = c.decision ?? 'withheld';
  const rDecision = r.decision ?? 'withheld';
  const bothPending = cDecision === 'pending_review' && rDecision === 'pending_review';
  const finalDecision = bothPending ? 'pending_review' : 'withheld';
  return {
    ...base,
    causal: {
      decision: cDecision,
      reason: c.reason ?? null,
      risk: c.risk ?? null,
      missing_sources: c.missing_sources ?? [],
      substantive_signal: c.substantive_signal ?? null,
    },
    redteam: {
      decision: rDecision,
      reason: r.reason ?? null,
      risk: r.risk ?? null,
      missing_sources: r.missing_sources ?? [],
      counterargument: r.counterargument ?? null,
    },
    final_decision: finalDecision,
    score_eligible: false,
    reconciliation_reason: bothPending
      ? 'Causal e red-team concordaram que o item já merece revisão editorial aprofundada, sem publicação automática.'
      : 'Retido: causal/red-team não convergiram para pending_review ou ainda faltam gates editoriais.',
  };
});

const result = {
  schema_version: '1.0.0',
  packet_type: 'candidate_authored_revisit_reconciled_review',
  mode: items.some((item) => item.final_decision === 'pending_review') ? 'pending_review' : 'withheld',
  remote_apply: false,
  content_read: true,
  source: 'official_full_text_and_event_urls',
  counts: {
    items: items.length,
    pending_review: items.filter((item) => item.final_decision === 'pending_review').length,
    withheld: items.filter((item) => item.final_decision === 'withheld').length,
    approved: 0,
    score_eligible: 0,
  },
  items,
};

fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ output: outFile, counts: result.counts }));
