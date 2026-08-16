#!/usr/bin/env node
// Wrapper standalone: valida um arquivo de saída do AGY contra o contrato.
// Delega ao módulo genérico em lib/verify-cli-output.mjs (que já tem CLI embutido).
import { verifyCliOutput, AGY_CONTRACT } from './lib/verify-cli-output.mjs';
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const jsonOnly = args.includes('--json');
const file = args.find((a) => !a.startsWith('--'));
if (!file) {
  console.error('Uso: node scripts/verify-agy-output.mjs <arquivo> [--json]');
  process.exit(2);
}
const raw = readFileSync(file, 'utf-8');
const { ok, code, report } = verifyCliOutput(raw, AGY_CONTRACT);
if (jsonOnly) {
  console.log(JSON.stringify({ ok, code, report }, null, 2));
} else {
  console.log(`Verificação de saída de CLI — ${ok ? 'APROVADA' : 'REJEITADA'} (code ${code})`);
  console.log(`Itens: ${report.totalItems} | Claims: ${report.totalClaims} | Aprovadas: ${report.approvedClaims} | Rejeitadas: ${report.rejectedClaims}`);
  if (report.rejections.length) {
    console.log('\nRejeições (por evidência, sem culpa ao executor):');
    for (const r of report.rejections.slice(0, 30)) {
      console.log(`  [${r.layer}] ${r.item != null ? `item ${r.item} · ` : ''}${r.field ?? ''}: ${r.reason}`);
    }
  }
}
process.exit(code);
