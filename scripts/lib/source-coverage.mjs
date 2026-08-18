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
