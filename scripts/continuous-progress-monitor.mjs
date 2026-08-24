#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const files = [
  'data/legislative-import/alrs/impact-review-queue-v1.json',
  'data/legislative-import/alrs/p2-microbatch-5-editorial-review-pack.json',
  'data/legislative-import/alrs/p2-microbatch-4-editorial-review-pack.json',
  'data/legislative-import/alrs/p2-microbatch-2-editorial-review-pack.json',
];
const digest = createHash('sha256');
for (const file of files) {
  try { digest.update(file); digest.update(readFileSync(resolve(root, file))); } catch { digest.update(`${file}:missing`); }
}
const queue = JSON.parse(readFileSync(resolve(root, files[0]), 'utf8'));
const pending = (queue.items ?? []).filter((item) => item.editorial_disposition === 'pending_review').length;
const totalVotes = (queue.items ?? []).reduce((sum, item) => sum + Number(item.factual_vote_count ?? 0), 0);
console.log(JSON.stringify({ fingerprint: digest.digest('hex'), pending_editorial_items: pending, factual_votes: totalVotes }));
