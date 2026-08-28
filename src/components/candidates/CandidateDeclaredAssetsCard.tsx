import { useState } from 'react';
import type { CandidateDeclaredAssets } from '@/types/election';

export interface CandidateDeclaredAssetsCardProps {
  assets: CandidateDeclaredAssets | null;
  candidateName: string;
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value);
}

export function CandidateDeclaredAssetsCard({
  assets,
  candidateName,
}: CandidateDeclaredAssetsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!assets || assets.total_declarado === 0) {
    return (
      <section
        aria-label="Patrimônio declarado"
        className="border-y-[3px] border-double border-[var(--color-ink)] py-6"
      >
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">
          Transparência Financeira · TSE
        </p>
        <h2 className="mt-1 text-2xl font-normal text-[var(--color-ink)]">
          Patrimônio e Bens Declarados
        </h2>
        <div className="mt-4 border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
          <p className="text-sm text-[var(--color-muted-ink)]">
            Nenhum bem patrimonial individual foi registrado para {candidateName} na base de dados de declaração de bens da Justiça Eleitoral ou o candidato declarou não possuir bens a relacionar.
          </p>
          <a
            href="https://divulgacandcontas.tse.jus.br"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-block font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4 hover:opacity-80"
          >
            Consultar no DivulgaCandContas (TSE) ↗
          </a>
        </div>
      </section>
    );
  }

  const latestDeclaration = assets.declaracoes_por_ano[0];
  const items = latestDeclaration?.itens ?? [];
  const categoryTotals = latestDeclaration?.por_categoria ?? {};
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return (
    <section
      aria-label="Patrimônio declarado"
      className="border-y-[3px] border-double border-[var(--color-ink)] py-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">
            Transparência Financeira · TSE ({assets.ano_recente})
          </p>
          <h2 className="mt-1 text-3xl font-normal text-[var(--color-ink)]">
            Patrimônio e Bens Declarados
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-muted-ink)]">
            Valores oficiais declarados à Justiça Eleitoral na prestação de contas da candidatura.
          </p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <span className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--color-muted-ink)]">
            Total declarado
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-institutional)]">
            {formatCurrencyBRL(assets.total_declarado)}
          </p>
        </div>
      </div>

      {/* Composição por Categoria de Bens */}
      <div className="mt-5 border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
          Composição por Categoria ({items.length} {items.length === 1 ? 'bem' : 'bens'})
        </h3>

        <div className="mt-4 space-y-3">
          {sortedCategories.map(([categoria, valor]) => {
            const percentage = assets.total_declarado > 0 ? (valor / assets.total_declarado) * 100 : 0;
            return (
              <div key={categoria} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--color-ink)]">{categoria}</span>
                  <span className="font-mono text-[var(--color-muted-ink)]">
                    {formatCurrencyBRL(valor)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden bg-[var(--color-border-editorial)]/40 rounded-xs">
                  <div
                    className="h-full bg-[var(--color-institutional)]"
                    style={{ width: `${Math.max(percentage, 1)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão de Expansão / Tabela Detalhada de Bens */}
        <div className="mt-6 border-t border-[var(--color-border-editorial)] pt-4">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-between w-full font-mono text-xs font-semibold text-[var(--color-institutional)] hover:underline focus:outline-none"
          >
            <span>
              {isExpanded
                ? '▲ Ocultar relação detalhada de bens'
                : `▼ Ver relação detalhada dos ${items.length} bens declarados`}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--color-border-editorial)] font-mono text-[0.68rem] text-[var(--color-muted-ink)] uppercase">
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 px-3">Descrição Registrada</th>
                    <th className="py-2 pl-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border-editorial)]">
                  {items.map((item, idx) => (
                    <tr key={`${item.tipo}-${idx}`} className="hover:bg-[var(--color-border-editorial)]/20">
                      <td className="py-2.5 pr-3 font-medium text-[var(--color-ink)] align-top whitespace-nowrap">
                        <span className="inline-block rounded-xs bg-[var(--color-border-editorial)]/50 px-2 py-0.5 font-mono text-[0.65rem]">
                          {item.categoria}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-[var(--color-ink)] align-top leading-relaxed">
                        {item.descricao || item.tipo}
                      </td>
                      <td className="py-2.5 pl-3 font-mono font-semibold text-[var(--color-ink)] text-right align-top whitespace-nowrap">
                        {formatCurrencyBRL(item.valor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <a
          href="https://divulgacandcontas.tse.jus.br"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4 hover:opacity-80"
        >
          <span>Fonte: Tribunal Superior Eleitoral (DivulgaCandContas / TSE)</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
