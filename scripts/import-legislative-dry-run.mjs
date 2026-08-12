#!/usr/bin/env node
/**
 * Script: import-legislative-dry-run
 *
 * CLI de dry-run do importer legislativo da Matriz de Impacto Populacional v1.
 * Lê um envelope JSON público (`schema_version 1.0.0`), valida contra o
 * contrato operacional e imprime o plano ordenado de operações para as quatro
 * tabelas factuais — sem nenhuma escrita, rede ou acesso a credenciais.
 *
 * Regras (Fase 2, Tasks 4 e 7):
 *  - Somente dry-run: nenhum caminho de `--apply`, nenhuma mutação remota.
 *  - `--emit-sql` gera o SQL idempotente correspondente (também sem executar).
 *  - Não acessa `.env*`, Supabase, service role, raw documents ou PII.
 *  - Saída determinística: mesma entrada → mesma saída (sem timestamps).
 *  - Campos derivados (score/alignment/impact) são rejeitados na validação.
 *
 * Uso:
 *   node scripts/import-legislative-dry-run.mjs <envelope.json>
 *   node scripts/import-legislative-dry-run.mjs --emit-sql <envelope.json>
 */
import { readFileSync, existsSync } from 'node:fs';
import { planLegislativeImport } from '../src/domain/impact/legislative-importer.ts';
import { planToSql } from '../src/domain/impact/legislative-sql-generator.ts';

const REDACT = /(apikey|Authorization|Bearer|service_role|token)=?\s*[^\s,}]+/gi;

const EMPTY_PLAN = {
  schema_version: '1.0.0',
  mode: 'dry-run',
  counts: { legislative_propositions: 0, proposition_versions: 0, voting_events: 0, legislative_votes: 0 },
  operations: [],
};

/** Imprime o plano de forma legível e determinística. */
export function renderPlan(plan) {
  const lines = ['Modo: DRY-RUN'];
  lines.push(`schema_version: ${plan.schema_version}`);
  lines.push('Operações planejadas por tabela:');
  for (const [table, count] of Object.entries(plan.counts)) {
    lines.push(`  ${table}: ${count}`);
  }
  for (const op of plan.operations) {
    const key = Object.entries(op.key)
      .map(([k, v]) => `${k}=${v}`)
      .join(', ');
    lines.push(`  ${op.action} ${op.table} (${key})`);
  }
  lines.push('Nenhuma escrita realizada. Use um futuro --apply autorizado para persistir.');
  return lines.join('\n');
}

/** Gera o bloco SQL (string) a partir do plano. */
export function renderSql(plan) {
  return planToSql(plan ?? EMPTY_PLAN);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Uso: node scripts/import-legislative-dry-run.mjs [--emit-sql] <envelope.json>');
    process.exit(1);
  }
  const emitSql = args.includes('--emit-sql');
  const positional = args.filter((arg) => !arg.startsWith('--'));
  const flag = args.find((arg) => arg.startsWith('--') && arg !== '--emit-sql');
  if (flag) {
    console.error(`❌ Flag não suportada: ${flag}. Este CLI é somente dry-run (sem --apply).`);
    process.exit(1);
  }
  if (positional.length !== 1) {
    console.error('Uso: node scripts/import-legislative-dry-run.mjs [--emit-sql] <envelope.json>');
    process.exit(1);
  }
  const input = positional[0];
  if (!existsSync(input)) {
    console.error(`❌ Arquivo não encontrado: ${input}`);
    process.exit(1);
  }

  let envelope;
  try {
    envelope = JSON.parse(readFileSync(input, 'utf-8'));
  } catch (error) {
    console.error(`❌ JSON inválido: ${String(error?.message ?? error)}`);
    process.exit(1);
  }

  const result = planLegislativeImport(envelope);
  if (!result.ok || !result.plan) {
    console.error(`❌ Validação do envelope falhou (${result.errors.length}):`);
    for (const err of result.errors.slice(0, 30)) console.error(`  - ${err}`);
    process.exit(1);
  }

  if (emitSql) {
    process.stdout.write(renderSql(result.plan));
    return;
  }
  console.log(renderPlan(result.plan));
}

// Só roda main quando executado diretamente (testes importam as funções puras).
const isDirectRun = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isDirectRun) {
  main().catch((error) => {
    console.error(String(error?.message ?? error).replace(REDACT, '$1=[REDACTED]'));
    process.exit(1);
  });
}
