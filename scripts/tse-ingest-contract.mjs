const SENSITIVE_FIELD_PATTERNS = [
  /cpf/i,
  /email/i,
  /e[_-]?mail/i,
  /titulo/i,
  /t[ií]tulo/i,
  /eleitor/i,
  /nascimento/i,
  /birth/i,
  /telefone/i,
  /phone/i,
  /raw[_-]?content/i,
  /conteudo[_-]?bruto/i,
];

const SENSITIVE_VALUE_PATTERNS = [
  /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/, // CPF
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /\b\d{2}\/\d{2}\/\d{4}\b/,
];

export const TSE_SOURCE_MANIFEST_RELATIVE_PATH = 'data/tse-source-manifest.json';

function assertSha256(value) {
  if (!/^[a-f0-9]{64}$/i.test(String(value ?? ''))) {
    throw new Error('Hash SHA-256 inválido no manifesto TSE');
  }
}

export function buildDatasetSourceManifest({
  datasetKey,
  uf,
  sourceKind,
  sourcePath,
  officialUrl,
  sha256,
  rowCount,
  createdAt = new Date().toISOString(),
}) {
  assertSha256(sha256);
  if (!datasetKey) throw new Error('datasetKey obrigatório');
  if (!uf) throw new Error('uf obrigatório');
  if (!officialUrl) throw new Error('officialUrl obrigatório');

  return {
    dataset_key: datasetKey,
    uf,
    scope: `${datasetKey}/2026/${uf}`,
    source_kind: sourceKind,
    source_path: sourcePath,
    official_url: officialUrl,
    sha256: String(sha256).toLowerCase(),
    row_count: Number(rowCount ?? 0),
    created_at: createdAt,
  };
}

export function validateDatasetSourceManifest(manifest) {
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error('Manifesto de fontes TSE ausente ou vazio');
  }

  for (const [index, entry] of manifest.entries()) {
    const prefix = `Manifesto TSE [${index}]`;
    if (!entry.dataset_key) throw new Error(`${prefix}: dataset_key ausente`);
    if (!entry.uf) throw new Error(`${prefix}: uf ausente`);
    if (!entry.scope) throw new Error(`${prefix}: scope ausente`);
    if (!entry.official_url || !String(entry.official_url).startsWith('https://')) {
      throw new Error(`${prefix}: official_url HTTPS ausente`);
    }
    assertSha256(entry.sha256);
    if (!Number.isInteger(entry.row_count) || entry.row_count < 0) {
      throw new Error(`${prefix}: row_count inválido`);
    }
    if (!entry.created_at || Number.isNaN(Date.parse(entry.created_at))) {
      throw new Error(`${prefix}: created_at inválido`);
    }
  }

  return manifest;
}

export function isDatabaseWriteAllowed({ dryRun, shouldImport, hasServiceRole }) {
  return dryRun === false && shouldImport === true && hasServiceRole === true;
}

function walkSnapshot(value, path = '$') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkSnapshot(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (SENSITIVE_FIELD_PATTERNS.some((pattern) => pattern.test(key))) {
        throw new Error(`Snapshot público contém campo sensível: ${path}.${key}`);
      }
      walkSnapshot(child, `${path}.${key}`);
    }
    return;
  }

  if (typeof value === 'string' && SENSITIVE_VALUE_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new Error(`Snapshot público contém valor sensível em ${path}`);
  }
}

export function assertPublicSnapshotHasNoSensitiveFields(candidates) {
  walkSnapshot(candidates);
  return true;
}
