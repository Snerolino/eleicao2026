// Checkpoint Fase 0 — Matriz de Impacto Populacional v1
// Uso: node scripts/validate-impact-schema.mjs [--fixtures]
// Valida um impact_matrix e/ou legislative_votes contra os JSON Schemas v1.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';

const ROOT = resolve(import.meta.dirname, '..');
const schemas = {
  'impact-matrix': resolve(ROOT, 'schemas/impact-matrix-v1.schema.json'),
  'legislative-votes': resolve(ROOT, 'schemas/legislative-votes-v1.schema.json'),
};

function loadSchema(name) {
  const p = schemas[name];
  if (!existsSync(p)) throw new Error(`Schema não encontrado: ${p}`);
  return JSON.parse(readFileSync(p, 'utf8'));
}

function makeAjv() {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  // Formato custom para uri e date-time (zero dependências novas):
  // ajv-formats não está no projeto; os schemas usam format + pattern de fallback.
  ajv.addFormat('uri', { type: 'string', validate: (s) => typeof s === 'string' && /^https?:\/\/\S+$/i.test(s) });
  ajv.addFormat('date-time', {
    type: 'string',
    validate: (s) => typeof s === 'string' && !Number.isNaN(Date.parse(s)),
  });
  return ajv;
}

/** Valida dados contra o schema nomeado. Retorna {ok, errors}. */
export function validate(name, data) {
  const ajv = makeAjv();
  const schema = loadSchema(name);
  const runValidate = ajv.compile(schema);
  const ok = runValidate(data);
  return { ok, errors: ok ? [] : runValidate.errors };
}

/** Converte erros ajv em lista curta "campo: mensagem". */
export function summarizeErrors(errors) {
  return (errors || []).slice(0, 12).map((e) => `${e.instancePath || '(root)'} ${e.message}`);
}

// Modo script: roda os fixtures bom/ruim e reporta o checkpoint.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  const fixtures = {
    'impact-matrix': [
      ['fixtures/impact-matrices/boa-pendente.json', true],
      ['fixtures/impact-matrices/ruim-completa.json', false],
    ],
    'legislative-votes': [
      ['fixtures/legislative-votes/boa-ausente-estrategica.json', true],
      ['fixtures/legislative-votes/ruim-ausente-sem-tipo.json', false],
    ],
  };
  let allOk = true;
  for (const [name, cases] of Object.entries(fixtures)) {
    for (const [rel, expectOk] of cases) {
      const p = resolve(ROOT, rel);
      if (!existsSync(p)) {
        console.log(`❌ [${name}] fixture ausente: ${rel}`);
        allOk = false;
        continue;
      }
      const data = JSON.parse(readFileSync(p, 'utf8'));
      const { ok, errors } = validate(name, data);
      const verdict = ok ? 'ACEPTOU' : 'REJEITOU';
      const pass = ok === expectOk;
      console.log(`${pass ? '✅' : '❌'} [${name}] ${rel} → ${verdict} (esperado: ${expectOk ? 'aceitar' : 'rejeitar'})`);
      if (!ok) console.log('   erros:', summarizeErrors(errors).join(' | '));
      if (!pass) allOk = false;
    }
  }
  console.log(allOk ? '\nCHECKPOINT OK: schema valida o bom e rejeita o ruim.' : '\nCHECKPOINT FALHOU.');
  process.exit(allOk ? 0 : 1);
}