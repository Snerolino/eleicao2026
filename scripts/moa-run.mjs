#!/usr/bin/env node
/**
 * MOA run wrapper — Portal Transparência Eleitoral RS (perfil eleicao2026)
 *
 * Executa uma tarefa no OpenCode tentando, em ordem, a cadeia completa de
 * modelos. Modelos PAGOS vêm primeiro (OpenAI, Google, Cloudflare Workers AI);
 * os Gratuitos/Zen ficam como backup para garantir disponibilidade
 * mesmo se um provedor estiver exaurido/blocked.
 *
 * Se um modelo falhar (rate limit, quota, timeout, auth, billing, 5xx, rede),
 * segue automaticamente para o próximo — o fluxo NUNCA é interrompido.
 *
 * Cadência de fallback (Google AI Pro via Antigravity CLI `agy` read-only):
 *   Pagedos (credenciados)           Gratuitos / backup
 *   1) openai/gpt-5.5                6) opencode/deepseek-v4-flash-free
 *   2) agy google-ai-pro read-only   7) opencode/nemotron-3-ultra-free
 *      (snapshot git archive HEAD)       8) opencode/laguna-s-2.1-free
 *   3) cloudflare-ai-gateway/gpt-4o-mini 9) opencode/ling-3.0-tiny-free
 *                                    10) opencode/mimo-v2.5-free

 *
 * NOTA: `agy` (Antigravity CLI v1.1.12) roda read-only sobre git archive HEAD —
 * falhas dele NÃO param a orquestração (Codex/OpenCode/MCP-Supabase no fallback).
 *
 * Uso:
 *   node scripts/moa-run.mjs "tarefa" [--agent=plan|build] [--files=a.ts,b.ts]
 *   MOA_MODELS="m1,m2" node scripts/moa-run.mjs "tarefa"     # cadeia custom
 *   node scripts/moa-run.mjs "tarefa" --once                   # só o 1º modelo
 */

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OPENCODE_BIN = existsSync(resolve(process.env.HOME, '.opencode/bin/opencode'))
  ? resolve(process.env.HOME, '.opencode/bin/opencode')
  : 'opencode';

const DEFAULT_CHAIN = [
  'openai/gpt-5.5',                              // 1) pago, mais potente (OpenAI Chat)
  'agy:google-ai-pro',                           // 2) Google AI Pro via Antigravity read-only (snapshot)
  'cloudflare-ai-gateway/openai/gpt-4o-mini',    // 3) Cloudflare Workers AI
  'opencode/deepseek-v4-flash-free',             // 4) grátis Zen
  'opencode/nemotron-3-ultra-free',              // 5) grátis Zen
  'opencode/laguna-s-2.1-free',                  // 6) grátis
  'opencode/ling-3.0-tiny-free',                 // 7) grátis, leve/rápido
  'opencode/mimo-v2.5-free',                     // 8) grátis, multimodal

];

function resolveChain() {
  const custom = (process.env.MOA_MODELS || '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  return custom.length > 0 ? custom : DEFAULT_CHAIN;
}

const args = process.argv.slice(2);
const ONLY_FIRST = args.includes('--once');

function argValue(name) {
  const withEquals = args.find((arg) => arg.startsWith(`${name}=`));
  if (withEquals) return withEquals.slice(name.length + 1);
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

const agent = argValue('--agent');
const files = argValue('--files');
const taskText = args.find((arg) => !arg.startsWith('-'));

if (!taskText) {
  console.error('❌ Informe a tarefa: node scripts/moa-run.mjs "tarefa" [--agent=plan] [--files=a,b]');
  process.exit(1);
}

function buildCommand(model) {
  const cmd = ['run', '-m', model];
  if (agent) cmd.push('--agent', agent);
  if (files) {
    for (const file of files.split(',')) {
      cmd.push('--file', resolve(ROOT, file.trim()));
    }
  }
  cmd.push(taskText);
  return cmd;
}

const FATAL_ERROR_PATTERN =
  /rate limit|no payment method|quota|billing|\b429\b|\b401\b|\b402\b|\b403\b|timed out|ENOTFOUND|ECONNREFUSED|exceeds this model's/i;
// "model not found"/"model not available" → fatal mas NÃO fatal de rede: cai na cadeia.

function classifyFailure(text) {
  return { isFatal: FATAL_ERROR_PATTERN.test(text) };
}

function runWithModel(model) {
  try {
    const output = execFileSync(OPENCODE_BIN, buildCommand(model), {
      encoding: 'utf8',
      timeout: 900_000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, model, output };
  } catch (error) {
    const stderr = String(error?.stderr || '');
    const stdout = String(error?.stdout || '');
    const errText = `${stderr}\n${stdout}`.slice(0, 1200);
    return { ok: false, model, error: errText, ...classifyFailure(errText) };
  }
}

async function main() {
  const chain = resolveChain();
  console.log(`🎯 Tarefa: ${taskText.slice(0, 120)}${taskText.length > 120 ? '…' : ''}`);
  console.log(`🔁 Cadeia (${chain.length}): ${chain.join(' → ')}`);

  const models = ONLY_FIRST ? chain.slice(0, 1) : chain;

  for (const model of models) {
    console.log(`\n▸ tentando ${model} …`);
    const result = runWithModel(model);
    if (result.ok) {
      console.log(`✅ ${model} respondeu.`);
      process.stdout.write(`${result.output.trimEnd()}\n`);
      console.log(`\n✅ Concluído com ${model}`);
      process.exit(0);
    }
    console.warn(`⚠️  ${model} falhou: ${result.error.slice(0, 220)}`);
    if (result.isFatal || ONLY_FIRST) {
      console.warn('⛔ Falha definitiva — prosseguindo na cadeia…');
    }
  }
  console.error('❌ Todos os modelos da cadeia falharam.');
  process.exit(1);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});