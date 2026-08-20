const OFFICIAL_HOSTS = [
  'camara.leg.br',
  'dadosabertos.camara.leg.br',
  'senado.leg.br',
  'al.rs.gov.br',
  'transparencia.al.rs.gov.br',
  'tse.jus.br',
  'dadosabertos.tse.jus.br',
  'cdn.tse.jus.br',
];

function hostOf(url) {
  try { return new URL(url).hostname.toLowerCase(); } catch { return ''; }
}

function isOfficialHost(host) {
  return OFFICIAL_HOSTS.some((candidate) => host === candidate || host.endsWith(`.${candidate}`));
}

export function classifySource(record) {
  const sourcePath = String(record?.source_path ?? record?.sourcePath ?? '').toLowerCase();
  const sourceKind = String(record?.source_kind ?? record?.sourceKind ?? '').toLowerCase();
  const url = String(record?.official_url ?? record?.officialUrl ?? record?.source_url ?? record?.url ?? '');
  const host = hostOf(url);

  // Um espelho dataset2026 com URL/hash oficial TSE continua sendo evidência TSE.
  if (isOfficialHost(host) && !sourceKind.includes('dataset')) return { tier: 3, label: 'official' };
  if (sourceKind.includes('official') || sourceKind === 'oficial') return { tier: 3, label: 'official' };
  if (sourcePath.includes('dataset2026') || sourceKind.includes('dataset') || sourceKind.includes('mirror')) {
    return { tier: 1, label: 'dataset2026' };
  }
  return { tier: 0, label: 'unknown' };
}

function comparable(value) {
  return value == null ? null : String(value).trim();
}

export function resolveOfficialPrecedence(records, { keyOf, fields = [] } = {}) {
  if (typeof keyOf !== 'function') throw new Error('keyOf obrigatório');
  const groups = new Map();
  for (const record of records ?? []) {
    const key = keyOf(record);
    if (key == null || key === '') continue;
    const bucket = groups.get(String(key)) ?? [];
    bucket.push(record);
    groups.set(String(key), bucket);
  }

  const resolved = [];
  const discarded = [];
  for (const [key, bucket] of groups) {
    const ranked = bucket.map((record, index) => ({ record, index, source: classifySource(record) }))
      .sort((a, b) => b.source.tier - a.source.tier || a.index - b.index);
    const winner = ranked[0];
    resolved.push(winner.record);
    for (const loser of ranked.slice(1)) {
      const conflictingFields = fields.filter((field) => comparable(winner.record?.[field]) !== comparable(loser.record?.[field]));
      discarded.push({
        key,
        reason: winner.source.tier > loser.source.tier ? 'official_source_wins' : 'duplicate_lower_precedence',
        winner_source: winner.source.label,
        discarded_source: loser.source.label,
        conflicting_fields: conflictingFields,
      });
    }
  }
  return { resolved, discarded };
}
