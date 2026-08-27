// @vitest-environment node

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import {
  loadAllCamaraVotes,
  buildDeputyToTseMapping,
  buildProfilesByTse,
  enrichCandidateList,
} from "../enrich-candidate-voting-profiles.mjs";

const root = resolve(import.meta.dirname, "../..");

describe("enrich-candidate-voting-profiles", () => {
  it("carrega votos da Câmara com sucesso", () => {
    const votes = loadAllCamaraVotes(root);
    expect(votes.length).toBeGreaterThan(0);
  });

  it("mapeia deputados federais e senadores aos seus TSE IDs", () => {
    const mapping = buildDeputyToTseMapping(root);
    expect(mapping.get("156190")).toBe("210002547819"); // Marcel van Hattem
    expect(mapping.get("74400")).toBe("210002533584"); // Paulo Pimenta
    expect(mapping.get("204416")).toBe("210002547816"); // Sanderson
  });

  it("agrega perfis de votação por TSE ID", () => {
    const { alrsProfiles, camaraProfiles } = buildProfilesByTse(root);

    // Frederico Antunes na ALRS
    const frederico = alrsProfiles.get("210002543865");
    expect(frederico).toBeDefined();
    expect(frederico.house).toBe("alrs");
    expect(frederico.total_votes).toBe(628);
    expect(frederico.votos_sim).toBe(617);
    expect(frederico.votos_nao).toBe(11);

    // Marcel van Hattem na Câmara
    const vanHattem = camaraProfiles.get("210002547819");
    expect(vanHattem).toBeDefined();
    expect(vanHattem.house).toBe("camara");
    expect(vanHattem.total_votes).toBe(24);

    // Paulo Pimenta na Câmara
    const pimenta = camaraProfiles.get("210002533584");
    expect(pimenta).toBeDefined();
    expect(pimenta.house).toBe("camara");
    expect(pimenta.total_votes).toBe(23);

    // Sanderson na Câmara
    const sanderson = camaraProfiles.get("210002547816");
    expect(sanderson).toBeDefined();
    expect(sanderson.house).toBe("camara");
    expect(sanderson.total_votes).toBe(23);
  });

  it("enriquece lista de candidatos com perfis de votação para senadores", () => {
    const mockCandidates = [
      {
        id: "cand-1",
        slug: "marcel-van-hattem",
        tse_candidate_id: "210002547819",
        full_name: "MARCEL VAN HATTEM",
        party: "NOVO",
        ballot_number: "300",
        position: "senador",
        position_label: "Senador",
        photo_url: null,
        photo_source_url: null,
        claims: [],
      },
      {
        id: "cand-2",
        slug: "frederico-antunes",
        tse_candidate_id: "210002543865",
        full_name: "FREDERICO CANTORI ANTUNES",
        party: "PSD",
        ballot_number: "555",
        position: "senador",
        position_label: "Senador",
        photo_url: null,
        photo_source_url: null,
        claims: [],
      },
      {
        id: "cand-3",
        slug: "candidato-novo",
        tse_candidate_id: "210002533434",
        full_name: "TANIA MARA SANTORO PERES",
        party: "UP",
        ballot_number: "800",
        position: "senador",
        position_label: "Senador",
        photo_url: null,
        photo_source_url: null,
        claims: [],
      },
    ];

    const enriched = enrichCandidateList(mockCandidates, root);

    expect(enriched[0].voting_profiles).toHaveLength(1);
    expect(enriched[0].voting_profiles[0].house).toBe("camara");
    expect(enriched[0].voting_profiles[0].total_votes).toBe(24);

    expect(enriched[1].voting_profiles).toHaveLength(1);
    expect(enriched[1].voting_profiles[0].house).toBe("alrs");
    expect(enriched[1].voting_profiles[0].total_votes).toBe(628);

    expect(enriched[2].voting_profiles).toEqual([]);
  });
});
