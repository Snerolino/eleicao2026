// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..', '..');
const script = readFileSync(resolve(root, 'scripts/moa-run.mjs'), 'utf8');
const freePoolScript = readFileSync(resolve(root, 'scripts/orchestrator/run-free-pool.sh'), 'utf8');
const opencodeJsonc = readFileSync(resolve(root, 'opencode.jsonc'), 'utf8');
const doc = readFileSync(resolve(root, 'docs/moa-perfil-eleicao2026.md'), 'utf8');
const routing = readFileSync(resolve(root, '.orchestrator/routing.yaml'), 'utf8');
const packageJson = readFileSync(resolve(root, 'package.json'), 'utf8');

const PAID_MODELS = ['openai/gpt-5.5', 'agy:google-ai-pro', 'cloudflare-ai-gateway/openai/gpt-4o-mini'];
const FREE_MODELS = [
  'opencode/deepseek-v4-flash-free',
  'opencode/nemotron-3-ultra-free',
  'opencode/laguna-s-2.1-free',
  'ollama/gpt-oss:20b',
];

describe('MOA do perfil eleicao2026 — fallback com pagos + grátis', () => {
  it('prioriza modelos pagos antes dos gratuitos na cadeia default', () => {
    const firstPaid = PAID_MODELS.map((model) => script.indexOf(model)).filter((i) => i >= 0);
    const firstFree = FREE_MODELS.map((model) => script.indexOf(model)).filter((i) => i >= 0);
    expect(firstPaid.length).toBeGreaterThan(0);
    expect(firstFree.length).toBeGreaterThan(0);
    expect(Math.min(...firstPaid)).toBeLessThan(Math.min(...firstFree));
  });

  it('mantém todos os modelos (nenhum excluído — todos na fallback chain)', () => {
    for (const model of [...PAID_MODELS, ...FREE_MODELS]) {
      expect(script).toContain(model);
    }
  });

  it('fallback grátis sempre disponível (free chain preservada)', () => {
    expect(script).toContain('opencode/deepseek-v4-flash-free');
    expect(script).toContain('opencode/nemotron-3-ultra-free');
    expect(script).toContain('opencode/laguna-s-2.1-free');
    expect(script).toContain('opencode/ling-3.0-tiny-free');
    expect(script).toContain('opencode/mimo-v2.5-free');
    expect(script).toContain('ollama/gpt-oss:20b');
  });

  it('expõe um free pool orquestrado, read-only e baseado em snapshot sanitizado', () => {
    expect(packageJson).toContain('"orch:free"');
    expect(routing).toContain('opencode_free_pool:');
    expect(routing).toContain('scripts/orchestrator/run-free-pool.sh');
    expect(routing).toContain('sequential_failover');
    expect(freePoolScript).toContain('prepare-snapshot.sh');
    expect(freePoolScript).toContain('OPENCODE_DISABLE_MCP=true');
    expect(freePoolScript).toContain('MOA_MODELS="$FREE_MODELS"');
    expect(freePoolScript).toContain('--agent=plan');
  });

  it('mantém o fluxo contínuo com scouts read-only sem quebrar o writer único', () => {
    expect(routing).toContain('continuous_progress: true');
    expect(routing).toContain('idle_between_gates: false');
    expect(routing).toContain('public_data_reconnaissance:');
    expect(routing).toContain('public_data_scout_pool:');
    expect(routing).toContain('scouts_are_read_only: true');
    expect(routing).toContain('single_writer_per_worktree: true');
    expect(routing).toContain('continue_read_only_reconnaissance');
  });

  it('implementa failover: falha fatal pula para o próximo modelo', () => {
    expect(script).toMatch(/FATAL_ERROR_PATTERN/);
    expect(script).toMatch(/rate limit|no payment method|quota|billing|429|timeout|ENOTFOUND|ECONNREFUSED/);
    expect(script).toContain('prosseguindo na cadeia');
  });

  it('oferece override por MOA_MODELS e flag --once', () => {
    expect(script).toContain('process.env.MOA_MODELS');
    expect(script).toContain("'--once'");
  });

  it('doc registra prioridade paga→grátis e não exclui modelos', () => {
    expect(doc).toMatch(/pago|pagos/i);
    expect(doc).toContain('fallback');
    expect(doc).toContain('gratuitos');
  });
});