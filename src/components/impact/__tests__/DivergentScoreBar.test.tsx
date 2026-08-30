import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DivergentScoreBar } from "../DivergentScoreBar";

describe("DivergentScoreBar component", () => {
  it("REGRA CRÍTICA: score null NUNCA renderiza barra no centro em 0, e sim trilha hachurada com texto não avaliado", () => {
    render(
      <DivergentScoreBar
        score={null}
        evaluatedPropositions={0}
        candidateName="Maria da Silva"
        groupLabel="Mulheres"
      />
    );

    // Trilha hachurada deve existir
    expect(screen.getByTestId("noeval-track")).toBeInTheDocument();

    // Nenhuma barra de preenchimento deve existir
    expect(screen.queryByTestId("bar-fill-positive")).not.toBeInTheDocument();
    expect(screen.queryByTestId("bar-fill-negative")).not.toBeInTheDocument();

    // Texto "não avaliado" deve estar presente
    expect(screen.getByTestId("noeval-label")).toHaveTextContent("não avaliado");

    // Acessibilidade adequada
    const group = screen.getByRole("group");
    expect(group).toHaveAttribute(
      "aria-label",
      "Mulheres para Maria da Silva: não avaliado (ainda não há proposição elegível avaliada)"
    );
  });

  it("renderiza saldo positivo (+0.62) preenchendo da metade para a direita em verde", () => {
    render(
      <DivergentScoreBar
        score={0.62}
        evaluatedPropositions={6}
        candidateName="Marina C. Bittencourt"
        groupLabel="Mulheres"
      />
    );

    const fill = screen.getByTestId("bar-fill-positive");
    expect(fill).toBeInTheDocument();
    expect(fill).toHaveStyle({ left: "50%", width: "31.0%" });

    const val = screen.getByTestId("score-value");
    expect(val).toHaveTextContent("+0,62");
    expect(val).toHaveClass("text-[var(--color-institutional)]");
    expect(screen.getByText(/6 itens/i)).toBeInTheDocument();
  });

  it("renderiza saldo negativo (-0.18) preenchendo da metade para a esquerda em vermelho", () => {
    render(
      <DivergentScoreBar
        score={-0.18}
        evaluatedPropositions={4}
        candidateName="Roberto A. Salles"
        groupLabel="Mulheres"
      />
    );

    const fill = screen.getByTestId("bar-fill-negative");
    expect(fill).toBeInTheDocument();
    expect(fill).toHaveStyle({ left: "41.0%", width: "9.0%" });

    const val = screen.getByTestId("score-value");
    expect(val).toHaveTextContent("-0,18");
    expect(val).toHaveClass("text-[var(--color-negative-vote)]");
    expect(screen.getByText(/4 itens/i)).toBeInTheDocument();
  });

  it("exibe marcador de contestação visível com tooltip quando houver assessments contestados", () => {
    render(
      <DivergentScoreBar
        score={-0.18}
        evaluatedPropositions={4}
        contestedAssessments={1}
        candidateName="Roberto A. Salles"
        groupLabel="Mulheres"
      />
    );

    const marker = screen.getByTestId("contested-marker");
    expect(marker).toBeInTheDocument();
    expect(marker).toHaveTextContent("*");
    expect(marker).toHaveAttribute(
      "title",
      "1 assessment(s) contestado(s) — em revisão"
    );
  });
});
