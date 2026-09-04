export function groupUniqueAuthoredProjects(manifest) {
  const groups = new Map();
  for (const row of manifest.projects ?? []) {
    const current = groups.get(row.id) ?? { ...row, candidate_tse_ids: [], roles: [] };
    if (!current.candidate_tse_ids.includes(row.candidate_tse_id)) current.candidate_tse_ids.push(row.candidate_tse_id);
    current.roles.push({
      candidate_tse_id: row.candidate_tse_id,
      role: row.role,
      authorship_official_id: row.authorship_official_id,
      authorship_source_url: row.authorship_source_url,
    });
    groups.set(row.id, current);
  }
  return [...groups.values()]
    .map((project) => ({ ...project, candidate_occurrences: project.candidate_tse_ids.length }))
    .sort((a, b) => b.candidate_occurrences - a.candidate_occurrences || a.id.localeCompare(b.id));
}

export function selectTopReviewProjects(manifest, { offset = 0, limit = 25 } = {}) {
  return groupUniqueAuthoredProjects(manifest).slice(offset, offset + limit);
}
