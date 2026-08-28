import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CandidateNominalVotesList } from "../CandidateNominalVotesList";
import type { CandidateNominalVote } from "@/types/election";

const mockVotes: CandidateNominalVote[] = [
  {
    house: "camara",
    proposition_id: "PLP 41/2024",
    title: "Política Nacional de Prevenção e Enfrentamento da Violência contra Mulheres",
    vote_value: "sim",
    date: "2026-05-10",
    source_url: "https://dadosabertos.camara.leg.br/api/v2/votacoes/2606313-36",
    source_label: "Câmara dos Deputados",
    assessment_group: "mulheres",
    impact_direction: "positive",
  },
  {
    house: "camara",
    proposition_id: "PLP 109",
    title: "Retirada de pauta do PLP 109",
    vote_value: "nao",
    date: "2026-04-12",
    source_url: "https://dadosabertos.camara.leg.br/api/v2/votacoes/2503998-70",
    source_label: "Câmara dos Deputados",
    assessment_group: null,
    impact_direction: null,
  },
];

describe("CandidateNominalVotesList", () => {
  it("renderiza lista de votos nominais com badges e fontes oficiais", () => {
    render(<CandidateNominalVotesList votes={mockVotes} houseLabel="Câmara dos Deputados" />);

    expect(screen.getByText(/Registro Detalhado de Votações · Câmara dos Deputados/i)).toBeInTheDocument();
    expect(screen.getByText("PLP 41/2024")).toBeInTheDocument();
    expect(screen.getByText(/Política Nacional de Prevenção/i)).toBeInTheDocument();
    expect(screen.getByText("Voto: sim")).toBeInTheDocument();
    expect(screen.getByText("Voto: nao")).toBeInTheDocument();
    expect(screen.getByText(/Mulheres · Ampliadora/i)).toBeInTheDocument();
  });

  it("filtra por voto Sim e Não", () => {
    render(<CandidateNominalVotesList votes={mockVotes} houseLabel="Câmara dos Deputados" />);

    const simButton = screen.getByRole("button", { name: /^Sim/i });
    fireEvent.click(simButton);

    expect(screen.getByText("PLP 41/2024")).toBeInTheDocument();
    expect(screen.queryByText("PLP 109")).not.toBeInTheDocument();

    const naoButton = screen.getByRole("button", { name: /^Não/i });
    fireEvent.click(naoButton);

    expect(screen.queryByText("PLP 41/2024")).not.toBeInTheDocument();
    expect(screen.getByText("PLP 109")).toBeInTheDocument();
  });

  it("filtra por termo de busca no input", () => {
    render(<CandidateNominalVotesList votes={mockVotes} houseLabel="Câmara dos Deputados" />);

    const input = screen.getByPlaceholderText(/Buscar por nome da lei/i);
    fireEvent.change(input, { target: { value: "Mulheres" } });

    expect(screen.getByText("PLP 41/2024")).toBeInTheDocument();
    expect(screen.queryByText("PLP 109")).not.toBeInTheDocument();
  });
});
