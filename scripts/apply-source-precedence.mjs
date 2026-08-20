#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resolveOfficialPrecedence } from './lib/source-precedence.mjs';

const input = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const keyField = process.argv.find((arg) => arg.startsWith('--key='))?.split('=')[1] ?? 'id';
const output = process.argv.find((arg) => arg.startsWith('--output='))?.split('=')[1];
if (!input) {
  console.error('Uso: node scripts/apply-source-precedence.mjs <records.json> [--key=id] [--output=resolved.json]');
  process.exit(2);
}
const records = JSON.parse(readFileSync(resolve(input), 'utf8'));
if (!Array.isArray(records)) throw new Error('Entrada deve ser um array de registros');
const result = resolveOfficialPrecedence(records, { keyOf: (record) => record?.[keyField] });
const payload = { schema_version: '1.0.0', precedence: 'official_over_dataset2026', ...result };
if (output) writeFileSync(resolve(output), `${JSON.stringify(payload, null, 2)}\n`);
console.log(JSON.stringify({ resolved: result.resolved.length, discarded: result.discarded.length, output: output ?? null }));
