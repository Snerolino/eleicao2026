export function summarizeSourceCoverage(rows, houseSelector = (row) => (
  row.house ?? row.voting_events?.house ?? row.legislative_propositions?.house ?? 'unknown'
)) {
  const summary = new Map();

  for (const row of rows) {
    const house = houseSelector(row);
    const current = summary.get(house) ?? { total: 0, with_source: 0, without_source: 0 };
    current.total += 1;
    if (row.source_reference_id) current.with_source += 1;
    else current.without_source += 1;
    summary.set(house, current);
  }

  return Object.fromEntries([...summary.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

export function hasSourceGaps(summary) {
  return Object.values(summary).some((entry) => entry.without_source > 0);
}

export function buildRecoveryQueue(rows) {
  const queue = new Map();
  for (const row of rows) {
    if (row.source_reference_id || row.voting_events?.house !== 'alrs') continue;
    const event = row.voting_events;
    const current = queue.get(event.external_id) ?? {
      external_id: event.external_id,
      occurred_at: event.occurred_at,
      missing_votes: 0,
      reason: 'source_evidence_not_linked',
    };
    current.missing_votes += 1;
    queue.set(event.external_id, current);
  }
  return [...queue.values()].sort((left, right) => left.external_id.localeCompare(right.external_id));
}
