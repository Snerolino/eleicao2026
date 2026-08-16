#!/usr/bin/env node
/**
 * verify-cli-output.mjs — Mecanismo genérico de verificação de saída de CLI.
 *
 * Princípio: TODA chamada a outro CLI/agente tem sua saída verificada
 * INDEPENDENTEMENTE antes de virar dado entregável. A culpa NÃO é atribuída
 * ao executor (ex: AGY) sem evidência: o relatório descreve exatamente o que
 * falhou e em qual camada (cli / formato / contrato / fonte / confiança).
 *
 * Uso como módulo:
 *   import { verifyCliOutput, AGY_CONTRACT } from './lib/verify-cli-output.mjs';
 *   const { ok, report } = verifyCliOutput(rawText, AGY_CONTRACT);
 *
 * Uso como CLI:
 *   node scripts/verify-agy-output.mjs <arquivo-output> [--json]
 *   Exit 0 = aprovado; 10 = falha de CLI/formato; 20 = contrato; 30 = fonte; 40 = confiança.
 */

/** Camadas de falha — usadas para atribuir responsabilidade por evidência. */
export const LAYER = {
  CLI: 'cli', // CLI nem rodou / travou / vazio
  FORMAT: 'formato', // saída não é o formato esperado (ex: não é JSON)
  CONTRACT: 'contrato', // estrutura da tarefa não atendida (campos faltando)
  SOURCE: 'fonte', // REGRA ABSOLUTA: dado sem fonte
  CONFIDENCE: 'confianca', // score fora da faixa exigida
};

/** Contrato para claims diretas (ex: AGY processando dossiês de senadores). */
export const SENATOR_CLAIMS_CONTRACT = {
  expectArray: true,
  item: (rec) => {
    const errors = [];
    if (
      typeof rec?.candidate_remote_id !== 'string' &&
      typeof rec?.tse_candidate_id !== 'string' &&
      typeof rec?.nome !== 'string'
    ) {
      errors.push({ field: 'candidate_remote_id/tse_candidate_id/nome', reason: 'nenhum identificador de candidato informado', layer: LAYER.CONTRACT });
    }
    if (typeof rec?.category !== 'string' || rec.category.trim() === '') {
      errors.push({ field: 'category', reason: 'category ausente', layer: LAYER.CONTRACT });
    }
    if (typeof rec?.claim !== 'string' || rec.claim.trim().length < 10) {
      errors.push({ field: 'claim', reason: 'conteúdo ausente ou muito curto', layer: LAYER.CONTRACT });
    }
    if (typeof rec?.source !== 'string' || rec.source.trim() === '') {
      errors.push({ field: 'source', reason: 'fonte AUSENTE (regra absoluta)', layer: LAYER.SOURCE });
    }
    const conf = rec?.confidence;
    if (typeof conf !== 'number' || conf < 1 || conf > 5) {
      errors.push({ field: 'confidence', reason: `confiança fora de 1-5 (${conf})`, layer: LAYER.CONFIDENCE });
    }
    return errors;
  },
};

/** Contrato padrão para saída do AGY (enrichment de claims). */
export const AGY_CONTRACT = {
  // Espera-se um array de candidatos.
  expectArray: true,
  // Validação por item.
  item: (rec, ctx) => {
    const errors = [];
    if (typeof rec?.slug !== 'string' || rec.slug.trim() === '') {
      errors.push({ field: 'slug', reason: 'slug ausente ou vazio', layer: LAYER.CONTRACT });
    }
    if (!Array.isArray(rec?.claims)) {
      errors.push({ field: 'claims', reason: 'claims não é array', layer: LAYER.CONTRACT });
      return errors;
    }
    rec.claims.forEach((claim, i) => {
      const where = `claims[${i}]`;
      if (typeof claim?.type !== 'string' || claim.type.trim() === '') {
        errors.push({ field: `${where}.type`, reason: 'type ausente', layer: LAYER.CONTRACT });
      }
      if (typeof claim?.claim !== 'string' || claim.claim.trim().length < 10) {
        errors.push({
          field: `${where}.claim`,
          reason: 'conteúdo ausente ou muito curto (<10 chars)',
          layer: LAYER.CONTRACT,
        });
      }
      // REGRA ABSOLUTA: todo dado precisa de fonte.
      if (typeof claim?.source !== 'string' || claim.source.trim() === '') {
        errors.push({
          field: `${where}.source`,
          reason: 'fonte AUSENTE (regra absoluta: todo dado precisa de fonte)',
          layer: LAYER.SOURCE,
        });
      }
      const conf = claim?.confidence;
      if (typeof conf !== 'number' || conf < 1 || conf > 5) {
        errors.push({
          field: `${where}.confidence`,
          reason: `confiança fora da faixa 1-5 (valor: ${conf})`,
          layer: LAYER.CONFIDENCE,
        });
      }
    });
    return errors;
  },
};

/**
 * Verifica a saída bruta de um CLI contra um contrato.
 * @param {string} rawText texto bruto da saída do CLI.
 * @param {object} contract contrato com { expectArray, item }.
 * @returns {{ ok: boolean, code: number, report: object }}
 */
export function verifyCliOutput(rawText, contract = AGY_CONTRACT) {
  const report = {
    layer: null,
    totalItems: 0,
    totalClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    rejections: [],
  };

  if (!rawText || rawText.trim() === '') {
    report.layer = LAYER.CLI;
    report.rejections.push({ reason: 'saída vazia — CLI não devolveu resposta', layer: LAYER.CLI });
    return { ok: false, code: 10, report };
  }

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Tentar extrair JSON entre fences ```json ... ```
    const m = rawText.match(/```json\s*\n?([\s\S]*?)```/);
    if (m) {
      try {
        parsed = JSON.parse(m[1]);
      } catch {
        parsed = null;
      }
    }
  }

  if (parsed === null || parsed === undefined) {
    report.layer = LAYER.FORMAT;
    report.rejections.push({ reason: 'saída não é JSON válido', layer: LAYER.FORMAT });
    return { ok: false, code: 10, report };
  }

  let items = parsed;
  if (contract.expectArray && !Array.isArray(parsed)) {
    // Aceita objeto envoltório { candidates: [...] } ou { data: [...] }.
    items =
      parsed.candidates ||
      parsed.data ||
      parsed.claims ||
      null;
  }

  if (!Array.isArray(items)) {
    report.layer = LAYER.FORMAT;
    report.rejections.push({
      reason: 'saída não é um array de itens (nem {candidates,data,claims})',
      layer: LAYER.FORMAT,
    });
    return { ok: false, code: 10, report };
  }

  report.totalItems = items.length;

  let worstLayer = null;
  for (const [idx, rec] of items.entries()) {
    const itemErrors = contract.item(rec, { index: idx }) || [];
    const claims = Array.isArray(rec?.claims) ? rec.claims : [];
    report.totalClaims += claims.length;
    for (const err of itemErrors) {
      report.rejections.push({ item: idx, ...err });
      if (err.layer === LAYER.SOURCE) report.rejectedClaims++;
      else report.rejectedClaims++; // rejeição estrutural conta como claim inválido
      worstLayer = worseLayer(worstLayer, err.layer);
    }
    // Claims válidas (sem erro de item) contam como aprovadas por item.
    if (itemErrors.length === 0) report.approvedClaims += claims.length;
  }

  report.layer = worstLayer;
  const ok = report.rejections.length === 0;
  const code = ok ? 0 : layerToCode(worstLayer);
  return { ok, code, report };
}

function worseLayer(a, b) {
  const order = [LAYER.CLI, LAYER.FORMAT, LAYER.CONTRACT, LAYER.CONFIDENCE, LAYER.SOURCE];
  if (a == null) return b;
  if (b == null) return a;
  return order.indexOf(b) >= order.indexOf(a) ? b : a;
}

function layerToCode(layer) {
  switch (layer) {
    case LAYER.CLI:
    case LAYER.FORMAT:
      return 10;
    case LAYER.CONTRACT:
      return 20;
    case LAYER.CONFIDENCE:
      return 40;
    case LAYER.SOURCE:
      return 30;
    default:
      return 20;
  }
}

// CLI standalone
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const jsonOnly = args.includes('--json');
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) {
    console.error('Uso: node scripts/verify-agy-output.mjs <arquivo> [--json]');
    process.exit(2);
  }
  const { readFileSync } = await import('node:fs');
  const raw = readFileSync(file, 'utf-8');
  const { ok, code, report } = verifyCliOutput(raw, AGY_CONTRACT);
  if (jsonOnly) {
    console.log(JSON.stringify({ ok, code, report }, null, 2));
  } else {
    console.log(`Verificação de saída de CLI — ${ok ? 'APROVADA' : 'REJEITADA'} (code ${code})`);
    console.log(
      `Itens: ${report.totalItems} | Claims: ${report.totalClaims} | Aprovadas: ${report.approvedClaims} | Rejeitadas: ${report.rejectedClaims}`,
    );
    if (report.rejections.length) {
      console.log('\nRejeições (por evidência, sem culpa atribuída ao executor):');
      for (const r of report.rejections.slice(0, 30)) {
        console.log(`  [${r.layer}] ${r.item != null ? `item ${r.item} · ` : ''}${r.field ?? ''}: ${r.reason}`);
      }
    }
  }
  process.exit(code);
}
