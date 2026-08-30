#!/usr/bin/env node
/**
 * Reconcile official candidate-authored projects in bounded batches.
 * Dry-run by default; --apply is required to update public-candidates.json.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SNAPSHOT = path.join(ROOT, 'data/public-candidates.json');
const BATCH_SIZE = 20;
const ALLOWED_HOUSES = new Set(['alrs', 'camara', 'senado']);
const ALLOWED_ROLES = new Set(['autor_principal', 'coautor', 'relator']);
const ALLOWED_STATUS = new Set(['tramitando', 'aprovado', 'arquivado', 'vetado', 'transformado_em_lei']);
const GROUPS = new Set([
  'mulheres', 'povos_indigenas', 'comunidades_quilombolas', 'populacao_negra_periferica', 'lgbtqia',
  'pessoas_com_deficiencia', 'populacao_rua', 'populacao_carceraria', 'criancas_adolescentes_vulnerabilidade',
  'pessoas_idosas_dependentes', 'trabalhadores_informais', 'agricultura_familiar_sem_terra', 'povos_de_terreiro',
  'imigrantes_refugiados', 'estudantes', 'trabalhadores_formais', 'servidores_publicos', 'usuarios_sus',
  'pessoas_com_ludopatia', 'candidatos_concursos_publicos', 'pescadores_artesanais_comunidades_pesqueiras',
]);
const SENSITIVE_PATTERNS = [
  [/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[DADO_SENSIVEL_REMOVIDO]'],
  [/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[DADO_SENSIVEL_REMOVIDO]'],
  [/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-. ]\d{4}\b/g, '[DADO_SENSIVEL_REMOVIDO]'],
];

function arg(name) { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : null; }
function sanitize(value) { return String(value ?? '').replace(/\s+/g, ' ').trim().replaceAll(SENSITIVE_PATTERNS[0][0], SENSITIVE_PATTERNS[0][1]).replaceAll(SENSITIVE_PATTERNS[1][0], SENSITIVE_PATTERNS[1][1]).replaceAll(SENSITIVE_PATTERNS[2][0], SENSITIVE_PATTERNS[2][1]); }
function fail(message) { throw new Error(message); }
function validateProject(raw, index) {
  const p = {
    id: sanitize(raw.id), candidate_tse_id: sanitize(raw.candidate_tse_id), house: sanitize(raw.house).toLowerCase(),
    type: sanitize(raw.type).toUpperCase(), number: sanitize(raw.number), year: Number(raw.year), title: sanitize(raw.title),
    role: sanitize(raw.role).toLowerCase(), status: sanitize(raw.status).toLowerCase(), summary_short: sanitize(raw.summary_short),
    summary_expanded: sanitize(raw.summary_expanded), main_topic: sanitize(raw.main_topic).toLowerCase(),
    target_groups: Array.isArray(raw.target_groups) ? raw.target_groups.map(sanitize).map((x) => x.toLowerCase()) : [], official_url: sanitize(raw.official_url),
  };
  if (!p.id || !p.candidate_tse_id || !ALLOWED_HOUSES.has(p.house) || !p.type || !p.number || !Number.isInteger(p.year) || !p.title || !ALLOWED_ROLES.has(p.role) || !ALLOWED_STATUS.has(p.status) || !p.summary_short || !p.summary_expanded || !p.main_topic || !p.official_url) fail(`invalid project at index ${index}`);
  if (!p.target_groups.every((group) => GROUPS.has(group))) fail(`non-canonical target group at index ${index}`);
  const url = new URL(p.official_url); const officialHost = url.hostname === 'dadosabertos.camara.leg.br' || url.hostname.endsWith('.al.rs.gov.br') || url.hostname.endsWith('.senado.leg.br');
  if (url.protocol !== 'https:' || !officialHost) fail(`non-official URL at index ${index}`);
  delete p.candidate_tse_id;
  return p;
}

const inputPath = arg('--input');
if (!inputPath) fail('use --input <official-projects.json>; dry-run is the default');
const raw = JSON.parse(fs.readFileSync(path.resolve(inputPath), 'utf8'));
const records = Array.isArray(raw) ? raw : raw.projects;
if (!Array.isArray(records)) fail('input must be an array or {projects: []}');
const candidates = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const candidateIds = new Set(candidates.map((candidate) => String(candidate.tse_candidate_id ?? '')));
const byCandidate = new Map();
const seen = new Set();
for (let i = 0; i < records.length; i += 1) {
  const project = validateProject(records[i], i); const candidateTse = sanitize(records[i].candidate_tse_id);
  if (!candidateIds.has(candidateTse)) fail(`candidate_tse_id not found in snapshot at index ${i}: ${candidateTse}`);
  const key = `${candidateTse}|${project.id}`; if (seen.has(key)) continue; seen.add(key);
  const list = byCandidate.get(candidateTse) ?? []; list.push(project); byCandidate.set(candidateTse, list);
}
const orderedCandidates = [...byCandidate.keys()].sort();
const batches = []; for (let i = 0; i < orderedCandidates.length; i += BATCH_SIZE) batches.push(orderedCandidates.slice(i, i + BATCH_SIZE));
const report = { schema_version: '1.0.0', packet_type: 'candidate_authored_projects_reconciliation', mode: process.argv.includes('--apply') ? 'apply' : 'dry-run', remote_apply: false, candidates_input: orderedCandidates.length, projects_validated: seen.size, batch_size: BATCH_SIZE, batches: batches.length, sanitized_texts: true, rejected: 0 };
if (process.argv.includes('--apply')) {
  const merged = candidates.map((candidate) => ({ ...candidate, ...(byCandidate.has(String(candidate.tse_candidate_id)) ? { authored_projects: byCandidate.get(String(candidate.tse_candidate_id)) } : {}) }));
  const temp = `${SNAPSHOT}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(merged, null, 2)}\n`); fs.renameSync(temp, SNAPSHOT); report.remote_apply = false; report.snapshot_updated = true;
}
console.log(JSON.stringify(report));
