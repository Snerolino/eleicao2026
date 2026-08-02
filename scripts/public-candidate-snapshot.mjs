import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const SNAPSHOT_RELATIVE_PATH = 'data/public-candidates.json';

const FORBIDDEN_FIELD_PATTERNS = [
  /cpf/i,
  /cnpj/i,
  /email/i,
  /telefone/i,
  /phone/i,
  /celular/i,
  /endereco/i,
  /address/i,
  /raw/i,
  /content_hash/i,
  /password/i,
  /token/i,
  /secret/i,
  /key/i,
];

const ALLOWED_POSITIONS = new Set([
  'presidente',
  'governador',
  'vice_governador',
  'senador',
  'deputado_federal',
  'deputado_estadual',
  'outro',
]);

const REQUIRED_FIELDS = [
  'id',
  'slug',
  'tse_candidate_id',
  'full_name',
  'party',
  'ballot_number',
  'position',
  'position_label',
  'photo_url',
  'photo_source_url',
  'claims',
];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function findForbiddenFields(value, path = '') {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findForbiddenFields(item, `${path}[${index}]`));
  }

  if (!isPlainObject(value)) return [];

  const found = [];
  for (const [key, child] of Object.entries(value)) {
    const childPath = path ? `${path}.${key}` : key;
    if (FORBIDDEN_FIELD_PATTERNS.some((pattern) => pattern.test(key))) {
      found.push(childPath);
    }
    found.push(...findForbiddenFields(child, childPath));
  }
  return found;
}

export function validatePublicCandidateSnapshot(candidates, options = {}) {
  const minCount = Number(options.minCount ?? process.env.PUBLIC_CANDIDATES_MIN_COUNT ?? 69);

  if (!Array.isArray(candidates)) {
    throw new Error('Snapshot público deve ser uma lista de candidaturas.');
  }

  if (candidates.length < minCount) {
    throw new Error(
      `Snapshot público vazio ou abaixo do mínimo: ${candidates.length}/${minCount}.`,
    );
  }

  const forbiddenFields = findForbiddenFields(candidates);
  if (forbiddenFields.length > 0) {
    throw new Error(
      `Snapshot público contém campo proibido: ${forbiddenFields.slice(0, 5).join(', ')}`,
    );
  }

  const ids = new Set();
  const slugs = new Set();
  const tseIds = new Set();

  candidates.forEach((candidate, index) => {
    if (!isPlainObject(candidate)) {
      throw new Error(`Candidatura inválida no índice ${index}.`);
    }

    for (const field of REQUIRED_FIELDS) {
      if (!(field in candidate)) {
        throw new Error(`Candidatura ${index} sem campo obrigatório: ${field}.`);
      }
    }

    if (typeof candidate.id !== 'string' || candidate.id.length < 8) {
      throw new Error(`Candidatura ${index} tem id inválido.`);
    }
    if (ids.has(candidate.id)) {
      throw new Error(`ID duplicado no snapshot público: ${candidate.id}.`);
    }
    ids.add(candidate.id);

    if (typeof candidate.slug !== 'string' || !/^[a-z0-9_]+$/.test(candidate.slug)) {
      throw new Error(`Candidatura ${candidate.id} tem slug inválido.`);
    }
    if (slugs.has(candidate.slug)) {
      throw new Error(`Slug duplicado no snapshot público: ${candidate.slug}.`);
    }
    slugs.add(candidate.slug);

    if (candidate.tse_candidate_id == null || !/^\d+$/.test(String(candidate.tse_candidate_id))) {
      throw new Error(`Candidatura ${candidate.id} sem SQ_CANDIDATO válido.`);
    }
    const tseId = String(candidate.tse_candidate_id);
    if (tseIds.has(tseId)) {
      throw new Error(`SQ_CANDIDATO duplicado no snapshot público: ${tseId}.`);
    }
    tseIds.add(tseId);

    if (typeof candidate.full_name !== 'string' || candidate.full_name.trim().length < 3) {
      throw new Error(`Candidatura ${index} tem nome inválido.`);
    }
    if (typeof candidate.party !== 'string' || candidate.party.trim().length < 2) {
      throw new Error(`Candidatura ${index} tem partido inválido.`);
    }
    if (!ALLOWED_POSITIONS.has(candidate.position)) {
      throw new Error(`Candidatura ${candidate.id} tem cargo inválido: ${candidate.position}.`);
    }
    if (!Array.isArray(candidate.claims)) {
      throw new Error(`Candidatura ${candidate.id} deve ter claims como lista.`);
    }
  });

  return candidates;
}

export function loadPublicCandidateSnapshot(options = {}) {
  const root = options.root ?? process.cwd();
  const snapshotPath = options.path ?? resolve(root, SNAPSHOT_RELATIVE_PATH);

  if (!existsSync(snapshotPath)) {
    throw new Error(`Snapshot público ausente: ${snapshotPath}`);
  }

  const parsed = JSON.parse(readFileSync(snapshotPath, 'utf8'));
  return validatePublicCandidateSnapshot(parsed, options);
}
