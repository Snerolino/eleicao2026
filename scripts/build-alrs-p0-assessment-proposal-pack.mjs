#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'data/legislative-import/alrs/impact-assessment-proposal-pack-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/p0-assessment-proposal-pack-v1.json');

const pack = JSON.parse(readFileSync(input, 'utf8').replace(/\\n\s*$/, ''));
const items = (pack.items ?? []).filter((item) => item.priority === 'P0' && item.official_version_confirmed !== false).map((item) => ({ ...item, review_batch: 'P0-official-substantive', human_review_required: true, review_status: 'pending_review', remote_apply: false }));
const result = { ...pack, packet_type: 'alrs_p0_assessment_proposal_pack', totals: { versions: items.length, proposed_assessments: items.reduce((sum, item) => sum + (item.proposed_assessments?.length ?? 0), 0) }, items };
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
