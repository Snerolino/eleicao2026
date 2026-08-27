import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import type { VoteCategoryScore } from "@/domain/impact/vote-category-score";
import type { CandidateWithClaims } from "@/types/election";
import { VoteCategoryScoreTableBar } from "../VoteCategoryScoreTableBar";

function makeCandidate(id: string, name: string, party = "PT"): CandidateWithClaims {
  return {
    id,
    slug: `${name.toLowerCase().replace(/\s+/g, "_")}_${id}`,
    tse_candidate_id: id,
    full_name: name,
    party,
    ballot_number: 1234,
    position: "deputado_estadual",
    position_label: "Dep. Estadual",
    photo_url: null,
    photo_source_url: null,
    ballot_name: null,
    state: "RS",
    election_year: 2026,
    registration_status: "registration_requested",
    gender: "FEMININO",
    race: "BRANCA",
    claims: [],
  };
}

const candidates: CandidateWithClaims[] = [
  makeCandidate("cand-1", "Marina C. Bittencourt", "PT"),
  makeCandidate("cand-2", "Roberto A. Salles", "MDB"),
  makeCandidate("cand-3", "Julia Prates Nunes", "NOVO"),
];

const mockScores: VoteCategoryScore[] = [
  // cand-1: +0.62 em Mulheres, +0.40 em Povos Indígenas
  { candidate_id: "cand-1", house: "alrs", group_slug: "mulheres", score: 0.62, evaluated_propositions: 6, eligible_weight: 10, excluded_no_data: 0, contested_assessments: 0 },
  { candidate_id: "cand-1", house: "alrs", group_slug: "povos_indigenas", score: 0.40, evaluated_propositions: 3, eligible_weight: 6, excluded_no_data: 0, contested_assessments: 0 },
  { candidate_id: "cand-1", house: "alrs", group_slug: "lgbtqia", score: 0.74, evaluated_propositions: 5, eligible_weight: 8, excluded_no_data: 0, contested_assessments: 0 },

  // cand-2: -0.18 em Mulheres (contestado), null em Povos Indígenas
  { candidate_id: "cand-2", house: "alrs", group_slug: "mulheres", score: -0.18, evaluated_propositions: 4, eligible_weight: 8, excluded_no_data: 0, contested_assessments: 1 },
  { candidate_id: "cand-2", house: "alrs", group_slug: "povos_indigenas", score: null, evaluated_propositions: 0, eligible_weight: 0, excluded_no_data: 0, contested_assessments: 0 },

  // cand-3: null em Mulheres, -0.60 em Povos Indígenas
  { candidate_id: "cand-3", house: "alrs", group_slug: "mulheres", score: null, evaluated_propositions: 0, eligible_weight: 0, excluded_no_data: 0, contested_assessments: 0 },
  { candidate_id: "cand-3", house: "alrs", group_slug: "povos_indigenas", score: -0.60, evaluated_propositions: 5, eligible_weight: 9, excluded_no_data: 0, contested_assessments: 0 },
];

function renderTable(props = {}) {
  return render(
    <MemoryRouter>
      <VoteCategoryScoreTableBar
        scores={mockScores}
        candidates={candidates}
        initialVisibleCount={2}
        {...props}
      />
    </MemoryRouter>
  );
}

describe("VoteCategoryScoreTableBar component", () => {
  it("REGRA ANTI-RANKING: preserva estritamente a ordem das colunas dos candidatos sem reordenação por score", () => {
    renderTable();

    const headers = screen.getAllByRole("columnheader");
    // headers[0] = Grupo Populacional
    expect(headers[0]).toHaveTextContent(/grupo populacional/i);
    // headers[1..3] = candidatos na ordem de seleção
    expect(headers[1]).toHaveTextContent("Marina C. Bittencourt");
    expect(headers[2]).toHaveTextContent("Roberto A. Salles");
    expect(headers[3]).toHaveTextContent("Julia Prates Nunes");
  });

  it("exibe rótulos operacionais oficiais da metodologia v1", () => {
    renderTable();

    expect(screen.getByText("Mulheres")).toBeInTheDocument();
    expect(screen.getByText("Povos indígenas")).toBeInTheDocument();
  });

  it("exibe o disclaimer metodológico e a legenda visual", () => {
    renderTable();

    expect(
      screen.getByText(/não são recomendação, nota ou ranking eleitoral/i)
    ).toBeInTheDocument();

    const legend = screen.getByLabelText(/legenda dos gráficos de votação/i);
    expect(within(legend).getByText(/saldo a favor do grupo/i)).toBeInTheDocument();
    expect(within(legend).getByText(/saldo contrário/i)).toBeInTheDocument();
    expect(within(legend).getByText(/não avaliado \(não é zero\)/i)).toBeInTheDocument();
  });

  it("permite expandir e recolher grupos quando exceder o limite inicial", () => {
    renderTable({ initialVisibleCount: 2 });

    // Inicialmente mostrando 2 grupos
    expect(screen.getByText("Mulheres")).toBeInTheDocument();
    expect(screen.getByText("Povos indígenas")).toBeInTheDocument();
    expect(screen.queryByText("Pessoas LGBTQIA+")).not.toBeInTheDocument();

    const expandBtn = screen.getByRole("button", { name: /expandir/i });
    fireEvent.click(expandBtn);

    // Após expandir, o terceiro grupo deve aparecer
    expect(screen.getByText("Pessoas LGBTQIA+")).toBeInTheDocument();

    const collapseBtn = screen.getByRole("button", { name: /recolher/i });
    fireEvent.click(collapseBtn);

    expect(screen.queryByText("Pessoas LGBTQIA+")).not.toBeInTheDocument();
  });

  it("renderiza os grupos canônicos com não avaliado quando os candidatos ainda não têm scores", () => {
    render(
      <MemoryRouter>
        <VoteCategoryScoreTableBar scores={[]} candidates={candidates} />
      </MemoryRouter>
    );

    expect(screen.getByText("Mulheres")).toBeInTheDocument();
    expect(screen.getAllByText("não avaliado").length).toBeGreaterThan(0);
  });

  it("exibe mensagem quando a lista de candidatos for vazia", () => {
    render(
      <MemoryRouter>
        <VoteCategoryScoreTableBar scores={[]} candidates={[]} />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/selecione candidatos para visualizar a comparação/i)
    ).toBeInTheDocument();
  });

  it("NÃO duplica categorias quando candidatos pertencem a casas diferentes (ex: Câmara vs ALRS vs Senado)", () => {
    const multiHouseScores: VoteCategoryScore[] = [
      // Candidato ao Senado / ex-deputado federal (Câmara)
      { candidate_id: "cand-1", house: "camara", group_slug: "mulheres", score: 0.80, evaluated_propositions: 4, eligible_weight: 8, excluded_no_data: 0, contested_assessments: 0 },
      { candidate_id: "cand-1", house: "camara", group_slug: "povos_indigenas", score: 0.50, evaluated_propositions: 2, eligible_weight: 4, excluded_no_data: 0, contested_assessments: 0 },
      // Candidato a deputado estadual (ALRS)
      { candidate_id: "cand-2", house: "alrs", group_slug: "mulheres", score: -0.30, evaluated_propositions: 6, eligible_weight: 10, excluded_no_data: 0, contested_assessments: 0 },
      { candidate_id: "cand-2", house: "alrs", group_slug: "povos_indigenas", score: 0.20, evaluated_propositions: 3, eligible_weight: 5, excluded_no_data: 0, contested_assessments: 0 },
      // Candidato a senador (Senado)
      { candidate_id: "cand-3", house: "senado", group_slug: "mulheres", score: 0.10, evaluated_propositions: 1, eligible_weight: 2, excluded_no_data: 0, contested_assessments: 0 },
    ];

    render(
      <MemoryRouter>
        <VoteCategoryScoreTableBar
          scores={multiHouseScores}
          candidates={candidates}
          initialVisibleCount={14}
        />
      </MemoryRouter>
    );

    // Deve conter exatamente 1 ocorrência do rótulo "Mulheres" na tabela
    const mulheresHeaders = screen.getAllByRole("rowheader", { name: /^mulheres$/i });
    expect(mulheresHeaders).toHaveLength(1);

    // Deve conter exatamente 1 ocorrência do rótulo "Povos indígenas"
    const povosHeaders = screen.getAllByRole("rowheader", { name: /^povos indígenas$/i });
    expect(povosHeaders).toHaveLength(1);

    // Na linha de Mulheres, cand-1 deve ter +0,80, cand-2 deve ter -0,30, cand-3 deve ter +0,10
    const rowMulheres = mulheresHeaders[0].closest("tr")!;
    expect(within(rowMulheres).getByText("+0,80")).toBeInTheDocument();
    expect(within(rowMulheres).getByText("-0,30")).toBeInTheDocument();
    expect(within(rowMulheres).getByText("+0,10")).toBeInTheDocument();
  });
});
