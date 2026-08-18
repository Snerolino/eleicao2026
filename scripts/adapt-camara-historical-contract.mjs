#!/usr/bin/env node
/** Adapta o envelope histórico Câmara ao contrato do planner, fail-closed. */

const SHA256 = /^sha256:[0-9a-f]{64}$/;

function fail(message) {
  throw new Error(message);
}

function parseTitle(title) {
  const match = /^(PEC|PL)\s+(\d+)\/(\d{4})$/i.exec(title?.trim() ?? '');
  if (!match) fail(`proposição sem número/ano oficial: ${title}`);
  return { type: match[1].toLowerCase(), number: Number(match[2]), year: Number(match[3]) };
}

function manifestByUrl(sourceManifest) {
  const map = new Map();
  for (const entry of sourceManifest?.urls ?? []) {
    if (!entry?.url || entry.status !== 200 || !Number.isInteger(entry.bytes) || entry.bytes <= 0 || !SHA256.test(entry.sha256)) {
      fail(`manifesto de fonte inválido: ${JSON.stringify(entry)}`);
    }
    if (map.has(entry.url)) fail(`URL duplicada no manifesto: ${entry.url}`);
    map.set(entry.url, entry);
  }
  return map;
}

function catalogSourceByUrl(sourceCatalog) {
  const map = new Map();
  for (const proposition of sourceCatalog?.propositions ?? []) {
    for (const source of proposition.nominal_vote_sources ?? []) {
      if (!source.url || !Number.isInteger(source.http_status) || !Number.isInteger(source.bytes) || !/^[0-9a-f]{64}$/.test(source.sha256)) {
        fail(`catálogo nominal inválido: ${JSON.stringify(source)}`);
      }
      map.set(source.url, source);
    }
  }
  return map;
}

function verifySources(sourceManifest, sourceCatalog) {
  const manifest = manifestByUrl(sourceManifest);
  const catalog = catalogSourceByUrl(sourceCatalog);
  for (const source of catalog.values()) {
    const recorded = manifest.get(source.url);
    if (!recorded) fail(`fonte oficial não resolvida no manifesto: ${source.url}`);
    if (recorded.status !== source.http_status || recorded.bytes !== source.bytes || recorded.sha256 !== `sha256:${source.sha256}`) {
      fail(`hash oficial divergente: ${source.url}`);
    }
  }
  for (const [url, recorded] of manifest) {
    if (recorded.status !== 200 || recorded.bytes <= 0 || !SHA256.test(recorded.sha256)) fail(`fonte oficial inválida: ${url}`);
  }
  return manifest;
}

function candidateMap(candidateCatalog) {
  const map = new Map(Object.entries(candidateCatalog?.candidateByTse ?? {}).map(([tse, id]) => [String(tse), id]));
  if (map.size === 0) fail('catálogo TSE vazio');
  return map;
}

function adaptVote(vote, candidates) {
  const tse = String(vote.tse_candidate_id ?? '');
  const candidateId = candidates.get(tse);
  if (!candidateId) fail(`tse_candidate_id não resolvido: ${tse}`);
  if (vote.candidate_id && vote.candidate_id !== candidateId) fail(`candidate_id diverge do catálogo TSE: ${tse}`);
  return {
    voting_event_id: vote.voting_event_id,
    deputy_id: `tse-candidate-${tse}`,
    proposition_version_id: vote.proposition_version_id,
    value: vote.value,
    ...(vote.value === 'obstrucao' ? { absence_type: 'obstrucao_coordenada' } : vote.value === 'ausente' ? { absence_type: 'justificada' } : {}),
    recorded_at: vote.recorded_at,
    source: vote.source,
  };
}

export function adaptCamaraHistoricalContract({ envelope, candidateCatalog, sourceManifest, sourceCatalog }) {
  const manifest = verifySources(sourceManifest, sourceCatalog);
  const candidates = candidateMap(candidateCatalog);
  const envelopeSourceUrls = new Set([
    ...(envelope.propositions ?? []).flatMap((proposition) => [proposition.official_url, ...(proposition.versions ?? []).map((version) => version.source)]),
  ].filter(Boolean));
  const expectedSourceCount = (envelope.propositions ?? []).reduce((count, proposition) => count + (proposition.versions ?? []).length, 0) + 1;
  if (manifest.size !== expectedSourceCount) fail(`fonte oficial não resolvida: manifesto incompleto (esperado ${expectedSourceCount}, recebido ${manifest.size})`);
  for (const [url] of manifest) {
    if (url.includes('/proposicoes/')) {
      const propositionId = url.match(/\/proposicoes\/(\d+)/)?.[1];
      if (!propositionId || !(envelope.propositions ?? []).some((proposition) => proposition.external_id.endsWith(`-${propositionId}`))) {
        fail(`fonte oficial não resolvida no envelope: ${url}`);
      }
    } else if (!envelopeSourceUrls.has(url)) {
      fail(`fonte oficial não resolvida no envelope: ${url}`);
    }
  }
  const sourceReferenceByKey = Object.fromEntries([...manifest.keys()].map((url) => [url, null]));
  const officialSourceByUrl = Object.fromEntries([...manifest.entries()].map(([url, entry]) => [url, {
    url, status: entry.status, bytes: entry.bytes, content_hash: entry.sha256,
  }]));
  const propositions = (envelope.propositions ?? []).map((proposition) => {
    const parsed = parseTitle(proposition.title);
    const versions = proposition.versions.map((version) => {
      const source = manifest.get(version.source);
      if (!source) fail(`fonte oficial não resolvida: ${version.source}`);
      return {
        ...version,
        text_hash: source.sha256,
      };
    });
    const apiSource = [...manifest.values()].find((entry) => entry.url.includes(`/proposicoes/${proposition.external_id.replace('camara-proposicao-', '')}`));
    return {
      external_id: proposition.external_id,
      house: proposition.house,
      proposition_type: parsed.type,
      number: parsed.number,
      year: parsed.year,
      title: proposition.title,
      ...(apiSource ? { official_url: apiSource.url } : {}),
      versions,
    };
  });
  const votes = (envelope.votes ?? []).map((vote) => adaptVote(vote, candidates));
  const adapted = { ...envelope, propositions, votes };
  const supportCatalog = {
    legislatorsToCandidateId: Object.fromEntries(votes.map((vote) => [vote.deputy_id, candidates.get(vote.deputy_id.replace('tse-candidate-', ''))])),
    candidateByIdentifier: Object.fromEntries([...candidates.entries()].map(([tse, id]) => [tse.toLowerCase(), id])),
    sourceReferenceByKey,
  };
  return {
    envelope: adapted,
    supportCatalog,
    contract: {
      officialSourceByUrl,
      unresolvedRemoteSourceReferences: [...manifest.keys()].map((url) => `source_references:${url}`),
    },
    totals: {
      propositions: propositions.length,
      versions: propositions.reduce((n, p) => n + p.versions.length, 0),
      events: propositions.reduce((n, p) => n + p.versions.reduce((m, v) => m + v.voting_events.length, 0), 0),
      votes: votes.length,
      candidates: new Set(votes.map((vote) => vote.deputy_id)).size,
      official_sources: manifest.size,
      blocked_exact_records: candidateCatalog.blocked_exact_records ?? 0,
    },
  };
}

if (process.argv[1]?.endsWith('adapt-camara-historical-contract.mjs')) {
  console.error('Use este módulo via teste/importador; nenhuma escrita remota é executada.');
}
