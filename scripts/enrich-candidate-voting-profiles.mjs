import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { validatePublicCandidateSnapshot } from "./public-candidate-snapshot.mjs";

const ROOT = resolve(import.meta.dirname, "..");

export function loadAllCamaraVotes(root = ROOT) {
  const camaraVotes = [];

  function readJson(p) {
    return JSON.parse(readFileSync(p, "utf8"));
  }

  // Q1
  const q1Dir = resolve(root, "data/legislative-import/camara/collector-2026-q1");
  const q1Files = readdirSync(q1Dir).filter((f) => f.endsWith(".json") && /^\d/.test(f));
  for (const f of q1Files) {
    const content = readJson(join(q1Dir, f));
    if (Array.isArray(content)) camaraVotes.push(...content);
    else if (content.votes) camaraVotes.push(...content.votes);
  }

  // Q2
  const q2Dir = resolve(root, "data/legislative-import/camara/collector-2026-q2/nominal");
  const q2Files = readdirSync(q2Dir).filter((f) => f.endsWith(".json") && /^\d/.test(f));
  for (const f of q2Files) {
    const content = readJson(join(q2Dir, f));
    if (Array.isArray(content)) camaraVotes.push(...content);
    else if (content.votes) camaraVotes.push(...content.votes);
  }

  // Q3
  const q3Dir = resolve(root, "data/legislative-import/camara/collector-2026-q3/nominal");
  const q3Files = readdirSync(q3Dir).filter((f) => f.endsWith(".json") && /^\d/.test(f));
  for (const f of q3Files) {
    const content = readJson(join(q3Dir, f));
    if (Array.isArray(content)) camaraVotes.push(...content);
    else if (content.votes) camaraVotes.push(...content.votes);
  }

  // Q3 Extra
  const q3ExtraDir = resolve(root, "data/legislative-import/camara/collector-2026-q3/nominal-extra");
  const q3ExtraFiles = readdirSync(q3ExtraDir).filter((f) => f.endsWith(".json") && /^\d/.test(f));
  for (const f of q3ExtraFiles) {
    const content = readJson(join(q3ExtraDir, f));
    if (Array.isArray(content)) camaraVotes.push(...content);
    else if (content.votes) camaraVotes.push(...content.votes);
  }

  // Historical
  const histEnvelopePath = resolve(root, "data/legislative-import/camara/historical-resolved-envelope.json");
  const histEnvelope = readJson(histEnvelopePath);
  if (histEnvelope.votes) camaraVotes.push(...histEnvelope.votes);

  return camaraVotes;
}

export function buildDeputyToTseMapping(root = ROOT) {
  function readJson(p) {
    return JSON.parse(readFileSync(p, "utf8"));
  }

  const q1Id = readJson(resolve(root, "data/legislative-import/camara/collector-2026-q1/identity-reconciliation.json")).entries;
  const q2Id = readJson(resolve(root, "data/legislative-import/camara/collector-2026-q2/identity-reconciliation-official.json")).entries;
  const q3Id = readJson(resolve(root, "data/legislative-import/camara/collector-2026-q3/identity-reconciliation-official.json")).entries;
  const q3ExtraId = readJson(resolve(root, "data/legislative-import/camara/collector-2026-q3/identity-reconciliation-extra-official.json")).entries;

  const deputyToTse = new Map();
  for (const e of [...q1Id, ...q2Id, ...q3Id, ...q3ExtraId]) {
    if (e.matches && e.matches.length > 0) {
      deputyToTse.set(String(e.deputy_id), e.matches[0].tse_candidate_id);
      deputyToTse.set(`camara-deputado-${e.deputy_id}`, e.matches[0].tse_candidate_id);
    }
  }

  // Candidatos ao Senado que exerceram mandato de Deputado Federal
  deputyToTse.set("156190", "210002547819"); // Marcel van Hattem
  deputyToTse.set("camara-deputado-156190", "210002547819");
  deputyToTse.set("74400", "210002533584"); // Paulo Pimenta
  deputyToTse.set("camara-deputado-74400", "210002533584");
  deputyToTse.set("204416", "210002547816"); // Sanderson
  deputyToTse.set("camara-deputado-204416", "210002547816");

  return deputyToTse;
}

export function buildProfilesByTse(root = ROOT) {
  const alrsReconPath = resolve(root, "data/legislative-import/alrs/alrs-nominal-vote-reconciliation-v1.json");
  const alrsRows = JSON.parse(readFileSync(alrsReconPath, "utf8")).rows;
  const camaraVotes = loadAllCamaraVotes(root);
  const deputyToTse = buildDeputyToTseMapping(root);

  const alrsProfiles = new Map();
  for (const r of alrsRows) {
    if (!r.tse_candidate_id) continue;
    const p = alrsProfiles.get(r.tse_candidate_id) ?? {
      house: "alrs",
      total_votes: 0,
      votos_sim: 0,
      votos_nao: 0,
      votos_abstencao: 0,
      votos_ausente: 0,
      votos_obstrucao: 0,
      nominal_balance: 0,
    };
    p.total_votes += 1;
    const v = (r.value || "").toLowerCase();
    if (v === "sim") p.votos_sim += 1;
    else if (v === "nao") p.votos_nao += 1;
    else if (v === "abstencao") p.votos_abstencao += 1;
    else if (v === "ausente") p.votos_ausente += 1;
    else if (v === "obstrucao") p.votos_obstrucao += 1;
    p.nominal_balance = p.votos_sim - p.votos_nao;
    alrsProfiles.set(r.tse_candidate_id, p);
  }

  const camaraProfiles = new Map();
  for (const v of camaraVotes) {
    const depId = String(v.deputy_id || v.legislator_id || v.legislator_external_id || "");
    const cleanId = depId.replace("camara-deputado-", "").replace("camara:", "");
    const tseId = deputyToTse.get(depId) || deputyToTse.get(cleanId);
    if (!tseId) continue;

    const p = camaraProfiles.get(tseId) ?? {
      house: "camara",
      total_votes: 0,
      votos_sim: 0,
      votos_nao: 0,
      votos_abstencao: 0,
      votos_ausente: 0,
      votos_obstrucao: 0,
      nominal_balance: 0,
    };
    p.total_votes += 1;
    const val = (v.value || "").toLowerCase();
    if (val === "sim") p.votos_sim += 1;
    else if (val === "nao") p.votos_nao += 1;
    else if (val === "abstencao") p.votos_abstencao += 1;
    else if (val === "ausente") p.votos_ausente += 1;
    else if (val === "obstrucao") p.votos_obstrucao += 1;
    p.nominal_balance = p.votos_sim - p.votos_nao;
    camaraProfiles.set(tseId, p);
  }

  return { alrsProfiles, camaraProfiles };
}

export function enrichCandidateList(candidates, root = ROOT) {
  const { alrsProfiles, camaraProfiles } = buildProfilesByTse(root);

  return candidates.map((candidate) => {
    const profiles = [];
    const tseId = candidate.tse_candidate_id;

    if (tseId && alrsProfiles.has(tseId)) {
      profiles.push(alrsProfiles.get(tseId));
    }
    if (tseId && camaraProfiles.has(tseId)) {
      profiles.push(camaraProfiles.get(tseId));
    }

    if (profiles.length > 0) {
      return {
        ...candidate,
        voting_profiles: profiles,
      };
    }

    return {
      ...candidate,
      voting_profiles: [],
    };
  });
}

export function main() {
  const candidatesPath = resolve(ROOT, "data/public-candidates.json");
  const candidates = JSON.parse(readFileSync(candidatesPath, "utf8"));

  const enriched = enrichCandidateList(candidates, ROOT);
  validatePublicCandidateSnapshot(enriched);

  writeFileSync(candidatesPath, `${JSON.stringify(enriched, null, 2)}\n`);

  const enrichedSenators = enriched.filter(
    (c) => c.position === "senador" && (c.voting_profiles ?? []).length > 0
  );

  console.log("✅ Candidatos enriquecidos com voting_profiles com sucesso:");
  console.log(`   Total com perfis: ${enriched.filter((c) => (c.voting_profiles ?? []).length > 0).length}`);
  console.log(`   Senadores com perfis: ${enrichedSenators.length}`);
  for (const s of enrichedSenators) {
    console.log(`   - ${s.full_name} (${s.party}): ${s.voting_profiles.map((p) => `${p.house}=${p.total_votes} votos`).join(", ")}`);
  }
}

if (process.argv[1]?.endsWith("enrich-candidate-voting-profiles.mjs")) {
  main();
}
