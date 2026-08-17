const DIRECTION = { sim: 1, nao: -1, abstencao: 0, ausente: 0, obstrucao: 0 };

export function buildVoteProfileRows(votes) {
  const indexRows = [];
  const profileMap = new Map();

  for (const vote of votes) {
    const house = vote.voting_events?.house ?? 'camara';
    const direction = DIRECTION[vote.value] ?? 0;
    indexRows.push({
      candidate_id: vote.candidate_id,
      voting_event_id: vote.voting_event_id,
      direction,
      value: vote.value,
    });

    const profileKey = `${vote.candidate_id}:${house}`;
    const profile = profileMap.get(profileKey) ?? {
      candidate_id: vote.candidate_id,
      house,
      sim: 0,
      nao: 0,
      abstencao: 0,
      ausente: 0,
      obstrucao: 0,
      total: 0,
    };

    profile.total += 1;
    if (vote.value === 'sim') profile.sim += 1;
    else if (vote.value === 'nao') profile.nao += 1;
    else if (vote.value === 'abstencao') profile.abstencao += 1;
    else if (vote.value === 'ausente') profile.ausente += 1;
    else if (vote.value === 'obstrucao') profile.obstrucao += 1;
    profileMap.set(profileKey, profile);
  }

  const profileRows = [...profileMap.values()].map((profile) => {
    const score = profile.total > 0
      ? (profile.sim - profile.nao) / profile.total
      : 0;
    return {
      candidate_id: profile.candidate_id,
      house: profile.house,
      total_votes: profile.total,
      votos_sim: profile.sim,
      votos_nao: profile.nao,
      votos_abstencao: profile.abstencao,
      votos_ausente: profile.ausente,
      votos_obstrucao: profile.obstrucao,
      profile_score: Number(score.toFixed(4)),
    };
  });

  return { indexRows, profileRows };
}
