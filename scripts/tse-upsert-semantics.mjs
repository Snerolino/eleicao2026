const FIELD_MAP = [
  ['nm_candidato', 'full_name'],
  ['nm_urna_candidato', 'ballot_name'],
  ['sg_partido', 'party'],
  ['nr_candidato', 'ballot_number'],
  ['position', 'position'],
  ['state', 'state'],
  ['registration_status', 'registration_status'],
  ['federation', 'federation'],
  ['coalition', 'coalition'],
];

function comparable(value) {
  return value == null ? '' : String(value).trim();
}

export function classifyTseCandidateDiff({ staging, existing }) {
  if (!existing) {
    return { acao: 'inserted', sq_candidato: staging.sq_candidato };
  }

  const changes = FIELD_MAP
    .map(([sKey, eKey]) => ({
      field: eKey,
      before: existing[eKey] ?? null,
      after: staging[sKey] ?? null,
      changed: comparable(staging[sKey]) !== comparable(existing[eKey]),
    }))
    .filter((change) => change.changed);
  const changed_fields = changes.map((change) => change.field);

  if (changed_fields.length === 0) {
    return { acao: 'unchanged', changed_fields: [], sq_candidato: staging.sq_candidato };
  }

  return {
    acao: 'updated',
    changed_fields,
    sq_candidato: staging.sq_candidato,
    antes: Object.fromEntries(changes.map((change) => [change.field, change.before])),
    depois: Object.fromEntries(changes.map((change) => [change.field, change.after])),
  };
}

export function buildCandidateDiffReport({ uf, stagingRows, existingRows, coverage }) {
  const existingMap = new Map();
  for (const c of existingRows) {
    if (c.tse_candidate_id) existingMap.set(String(c.tse_candidate_id), c);
  }

  const stagingById = new Map();
  const inserted = [];
  const updated = [];
  let unchanged = 0;

  for (const row of stagingRows) {
    const sq = row.sq_candidato;
    if (!sq) continue;
    const id = String(sq);
    stagingById.set(id, row);

    const existing = existingMap.get(id);
    const diff = classifyTseCandidateDiff({ staging: row, existing });

    if (diff.acao === 'inserted') {
      inserted.push(diff);
    } else if (diff.acao === 'updated') {
      updated.push(diff);
    } else {
      unchanged++;
    }
  }

  const needs_review = [];
  const withdrawn_candidate = [];

  for (const [id, existing] of existingMap.entries()) {
    if (!stagingById.has(id)) {
      const reason = coverage.complete
        ? 'missing_from_complete_dataset'
        : 'missing_from_partial_dataset';
      const acao = coverage.complete ? 'withdrawn_candidate' : 'needs_review';
      const item = { acao, reason, tse_candidate_id: id };
      if (coverage.complete) {
        withdrawn_candidate.push(item);
      } else {
        needs_review.push(item);
      }
    }
  }

  return {
    uf,
    coverage,
    created_at: new Date().toISOString(),
    totals: {
      inserted: inserted.length,
      updated: updated.length,
      unchanged,
      withdrawn_candidate: withdrawn_candidate.length,
      needs_review: needs_review.length,
    },
    inserted,
    updated,
    unchanged,
    needs_review,
    withdrawn_candidate,
  };
}
