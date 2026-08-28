import { useState, useMemo } from "react";
import type { CandidateNominalVote } from "@/types/election";
import { getBeneficiaryGroupLabel } from "@/domain/impact/beneficiary-groups";
import { sanitizeUrl } from "@/utils/sanitizeUrl";

export interface CandidateNominalVotesListProps {
  votes: CandidateNominalVote[];
  houseLabel: string;
}

export function CandidateNominalVotesList({
  votes,
  houseLabel,
}: CandidateNominalVotesListProps) {
  const [filterValue, setFilterValue] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredVotes = useMemo(() => {
    return votes.filter((v) => {
      const matchFilter =
        filterValue === "all" ||
        (filterValue === "sim" && v.vote_value.toLowerCase() === "sim") ||
        (filterValue === "nao" && v.vote_value.toLowerCase() === "nao") ||
        (filterValue === "outros" &&
          !["sim", "nao"].includes(v.vote_value.toLowerCase()));

      const matchSearch =
        searchTerm.trim() === "" ||
        v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.proposition_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.assessment_group &&
          v.assessment_group.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchFilter && matchSearch;
    });
  }, [votes, filterValue, searchTerm]);

  if (votes.length === 0) {
    return (
      <p className="font-mono text-xs uppercase tracking-wide text-[var(--color-muted-ink)]">
        Nenhuma votação nominal individual detalhada disponível para exibição nesta casa.
      </p>
    );
  }

  const voteCounts = {
    total: votes.length,
    sim: votes.filter((v) => v.vote_value.toLowerCase() === "sim").length,
    nao: votes.filter((v) => v.vote_value.toLowerCase() === "nao").length,
  };

  return (
    <div className="mt-6 border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-medium text-[var(--color-ink)]">
            Registro Detalhado de Votações · {houseLabel}
          </h3>
          <p className="mt-1 text-xs text-[var(--color-muted-ink)]">
            Mostrando {filteredVotes.length} de {votes.length} matérias catalogadas com fonte oficial.
          </p>
        </div>

        {/* Filtros de Voto */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          <button
            type="button"
            onClick={() => setFilterValue("all")}
            className={`px-2.5 py-1 transition-colors border ${
              filterValue === "all"
                ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                : "bg-transparent text-[var(--color-muted-ink)] border-[var(--color-border-editorial)] hover:text-[var(--color-ink)]"
            }`}
          >
            Todas ({voteCounts.total})
          </button>
          <button
            type="button"
            onClick={() => setFilterValue("sim")}
            className={`px-2.5 py-1 transition-colors border ${
              filterValue === "sim"
                ? "bg-emerald-700 text-white border-emerald-700 dark:bg-emerald-600"
                : "bg-transparent text-emerald-700 dark:text-emerald-400 border-[var(--color-border-editorial)] hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            }`}
          >
            Sim ({voteCounts.sim})
          </button>
          <button
            type="button"
            onClick={() => setFilterValue("nao")}
            className={`px-2.5 py-1 transition-colors border ${
              filterValue === "nao"
                ? "bg-rose-700 text-white border-rose-700 dark:bg-rose-600"
                : "bg-transparent text-rose-700 dark:text-rose-400 border-[var(--color-border-editorial)] hover:bg-rose-50 dark:hover:bg-rose-950/40"
            }`}
          >
            Não ({voteCounts.nao})
          </button>
          {votes.length - voteCounts.sim - voteCounts.nao > 0 && (
            <button
              type="button"
              onClick={() => setFilterValue("outros")}
              className={`px-2.5 py-1 transition-colors border ${
                filterValue === "outros"
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                  : "bg-transparent text-[var(--color-muted-ink)] border-[var(--color-border-editorial)] hover:text-[var(--color-ink)]"
              }`}
            >
              Outros ({votes.length - voteCounts.sim - voteCounts.nao})
            </button>
          )}
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="mt-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nome da lei, tema ou número da matéria..."
          className="w-full border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder-[var(--color-muted-ink)] focus:outline-none focus:ring-1 focus:ring-[var(--color-institutional)]"
        />
      </div>

      {/* Lista de Votações */}
      <div className="mt-4 divide-y divide-[var(--color-border-editorial)] border-t border-[var(--color-border-editorial)]">
        {filteredVotes.length === 0 ? (
          <p className="py-6 text-center font-mono text-xs uppercase tracking-wider text-[var(--color-muted-ink)]">
            Nenhuma votação encontrada com os filtros selecionados.
          </p>
        ) : (
          filteredVotes.map((v, index) => {
            const voteVal = v.vote_value.toLowerCase();
            const safeSourceUrl = sanitizeUrl(v.source_url);

            return (
              <article
                key={`${v.house}-${v.proposition_id}-${index}`}
                className="py-4.5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-[var(--color-muted-ink)]">
                      {v.proposition_id}
                    </span>
                    {v.date && (
                      <span className="font-mono text-[0.68rem] text-[var(--color-muted-ink)]">
                        · {v.date}
                      </span>
                    )}
                    {v.assessment_group && (
                      <span className="inline-flex items-center rounded-sm bg-[var(--color-institutional)]/10 px-2 py-0.5 font-mono text-[0.68rem] font-medium text-[var(--color-institutional)] border border-[var(--color-institutional)]/20">
                        {getBeneficiaryGroupLabel(v.assessment_group)}
                        {v.impact_direction === "positive"
                          ? " · Ampliadora"
                          : v.impact_direction === "negative"
                          ? " · Restritiva"
                          : ""}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-medium leading-snug text-[var(--color-ink)]">
                    {v.title}
                  </h4>

                  {safeSourceUrl && (
                    <a
                      href={safeSourceUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4 hover:opacity-80"
                    >
                      <span>Fonte Oficial ({v.source_label})</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>

                {/* Badge do Voto */}
                <div className="shrink-0 pt-0.5">
                  <span
                    className={`inline-flex items-center px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider rounded-sm border ${
                      voteVal === "sim"
                        ? "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800"
                        : voteVal === "nao"
                        ? "bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800"
                        : "bg-zinc-100 text-zinc-800 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
                    }`}
                  >
                    Voto: {v.vote_value}
                  </span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
