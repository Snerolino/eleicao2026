#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadAllCamaraVotes, buildDeputyToTseMapping } from "./enrich-candidate-voting-profiles.mjs";

const ROOT = resolve(import.meta.dirname, "..");
const gabaritoPath = resolve(ROOT, "data/impact-matrices/gabarito-materias-aprovadas.json");
const alrsManifestPath = resolve(ROOT, "data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json");
const outputPath = resolve(ROOT, "data/candidate-nominal-votes.json");

function normalizeTitle(val) {
  return String(val ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/[.;:,]+$/, "");
}

export function buildCandidateNominalVotes(root = ROOT) {
  const gab = JSON.parse(readFileSync(gabaritoPath, "utf8"));
  const approvedProps = gab.propositions || [];

  // Index approved propositions by house:number:year and title
  const approvedByNy = new Map();
  const approvedByTitle = new Map();
  const approvedById = new Map();

  for (const p of approvedProps) {
    const num = Number(p.number);
    const yr = Number(p.year);
    if (num && yr) {
      approvedByNy.set(`${p.house}:${num}:${yr}`, p);
    }
    if (p.title) {
      approvedByTitle.set(normalizeTitle(p.title), p);
    }
    if (p.proposition_id) {
      approvedById.set(p.proposition_id, p);
    }
  }

  const resultByTse = {};

  // 1. Process ALRS votes
  if (existsSync(alrsManifestPath)) {
    const manifest = JSON.parse(readFileSync(alrsManifestPath, "utf8"));
    const exactMatches = new Map();
    for (const c of manifest.catalog || []) {
      if (c.exact_candidate_matches?.length === 1) {
        exactMatches.set(String(c.solicitante_id), c.exact_candidate_matches[0]);
      }
    }

    for (const page of manifest.pages || []) {
      const match = exactMatches.get(String(page.solicitante_id));
      if (!match) continue;
      const tseId = String(match.tse_candidate_id);
      resultByTse[tseId] ||= [];

      for (const item of page.items || []) {
        const num = Number(item.numProposicao);
        const yr = Number(item.anoProposicao);
        const rawType = String(item.tipoProjeto ?? "").trim().toUpperCase();
        const materiaNorm = normalizeTitle(item.materia);

        // Check if matches approved proposition
        const prop = approvedByNy.get(`alrs:${num}:${yr}`) ||
          approvedByTitle.get(materiaNorm) ||
          (materiaNorm.includes("disque 180") ? approvedByNy.get("alrs:43:2019") : null) ||
          (materiaNorm.includes("identidade de genero") || materiaNorm.includes("nome social") ? approvedByNy.get("alrs:27:2024") : null);

        const primaryAssessment = prop?.assessments?.[0];

        resultByTse[tseId].push({
          house: "alrs",
          proposition_id: `alrs-${rawType}-${num}-${yr}`,
          proposition_type: rawType,
          proposition_number: num,
          proposition_year: yr,
          materia: item.materia,
          data_votacao: item.dataVotacao,
          vote_value: ({
            Sim: "sim",
            "Não": "nao",
            "Abstenção": "abstencao",
            Ausente: "ausente",
            "Obstrução": "obstrucao",
          })[String(item.voto).trim()] || "sim",
          resultado_votacao: item.resultadoVotacao,
          source_url: page.url,
          assessment_group: primaryAssessment?.group || null,
          impact_direction: primaryAssessment?.impact_direction || null,
          defending_vote: primaryAssessment?.defending_vote || null,
        });
      }
    }
  }

  // 2. Process Camara votes
  const camaraVotes = loadAllCamaraVotes(root);
  const deputyToTse = buildDeputyToTseMapping(root);

  for (const v of camaraVotes) {
    const depId = String(v.deputy_id || v.legislator_id || "").replace("camara-deputado-", "");
    const tseId = deputyToTse.get(depId);
    if (!tseId) continue;
    resultByTse[tseId] ||= [];

    const evId = String(v.voting_event_id || v.event_id || "");
    
    // Check approved Camara propositions
    let prop = null;
    if (evId.includes("2606313") || evId.includes("2601794")) prop = approvedById.get("camara:plp-41-2024");
    else if (evId.includes("2557414")) prop = approvedById.get("camara:mpv-1313-2025");
    else if (evId.includes("2581700")) prop = approvedById.get("camara:mpv-1323-2025");
    else if (evId.includes("2601522") || evId.includes("2580259")) prop = approvedById.get("camara:plp-230-2025");

    const primaryAssessment = prop?.assessments?.[0];

    resultByTse[tseId].push({
      house: "camara",
      proposition_id: evId,
      proposition_type: "PLP",
      proposition_number: 0,
      proposition_year: 2026,
      materia: prop?.title || `Votação Nominal ${evId}`,
      data_votacao: v.recorded_at || v.data_hora_votacao,
      vote_value: v.value,
      resultado_votacao: "Aprovado",
      source_url: `https://dadosabertos.camara.leg.br/api/v2/votacoes/${evId.replace("voting_events:camara:camara-votacao-", "").replace("voting_events:camara:", "")}/votos`,
      assessment_group: primaryAssessment?.group || null,
      impact_direction: primaryAssessment?.impact_direction || null,
      defending_vote: primaryAssessment?.defending_vote || null,
    });
  }

  writeFileSync(outputPath, JSON.stringify(resultByTse, null, 2) + "\n");
  return resultByTse;
}

if (process.argv[1] && process.argv[1].endsWith("build-candidate-nominal-votes.mjs")) {
  const res = buildCandidateNominalVotes();
  let total = 0;
  let withGroup = 0;
  for (const list of Object.values(res)) {
    total += list.length;
    withGroup += list.filter((v) => v.assessment_group).length;
  }
  console.log(`✅ Fan-out concluído para ${Object.keys(res).length} candidatos.`);
  console.log(`   Total de votos mapeados: ${total}`);
  console.log(`   Total com grupo canônico aprovado: ${withGroup}`);
}
