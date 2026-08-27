// @vitest-environment node

import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import {
  loadAllCamaraVotes,
  buildDeputyToTseMapping,
  buildProfilesByTse,
  enrichCandidateList,
} from "../enrich-candidate-voting-profiles.mjs";

const root = resolve(import.meta.dirname, "../..");

describe("enrich-candidate-voting-profiles", () => {
  it("carrega votos da Câmara com sucesso se diretórios existirem", () => {
    const votes = loadAllCamaraVotes(root);
    expect(Array.isArray(votes)).toBe(true);
  });

  it("mapeia deputados federais e senadores aos seus TSE IDs", () => {
    const mapping = buildDeputyToTseMapping(root);
    expect(mapping.get("156190")).toBe("210002547819"); // Marcel van Hattem
    expect(mapping.get("74400")).toBe("210002533584"); // Paulo Pimenta
    expect(mapping.get("204416")).toBe("210002547816"); // Sanderson
  });

  it("agrega perfis de votação por TSE ID", () => {
    const { alrsProfiles, camaraProfiles } = buildProfilesByTse(root);

    // Marcel van Hattem na Câmara
    const vanHattem = camaraProfiles.get("210002547819");
    if (vanHattem) {
      expect(vanHattem.house).toBe("camara");
      expect(vanHattem.total_votes).toBeGreaterThan(0);
    }

    // Frederico Antunes na ALRS (se base presente)
    const frederico = alrsProfiles.get("210002543865");
    if (frederico) {
      expect(frederico.house).toBe("alrs");
      expect(frederico.total_votes).toBe(628);
    }
  });

  it("enriquece lista de candidatos com perfis de votação preservando contratos", () => {
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
    expect(Array.isArray(enriched)).toBe(true);
    expect(enriched[0].slug).toBe("marcel-van-hattem");
  });
});
