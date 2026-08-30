import { useMemo, useState } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Anos disponíveis de declaração
  const availableYears = useMemo(() => {
    if (!assets?.declaracoes_por_ano) return [];
    return assets.declaracoes_por_ano.map((d) => d.ano).sort((a, b) => b - a);
  }, [assets]);

  const activeYear = selectedYear ?? assets?.ano_recente ?? availableYears[0] ?? 2026;

  const currentDeclaration = useMemo(() => {
    if (!assets?.declaracoes_por_ano) return null;
    return (
      assets.declaracoes_por_ano.find((d) => d.ano === activeYear) ??
      assets.declaracoes_por_ano[0] ??
      null
    );
  }, [assets, activeYear]);

  const items = useMemo(() => {
    return currentDeclaration?.itens ?? [];
  }, [currentDeclaration]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const item of items) {
      if (item.categoria) set.add(item.categoria);
    }
    return Array.from(set).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'todas' || item.categoria === selectedCategory;
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.descricao.toLowerCase().includes(term) ||
        item.tipo.toLowerCase().includes(term) ||
        item.categoria.toLowerCase().includes(term);
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchTerm]);

  const categoryTotals = currentDeclaration?.por_categoria ?? {};
  const sortedCategories = useMemo(() => {
    return Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  }, [categoryTotals]);

  // Se o candidato não tiver bens cadastrados ou total for zero
  if (!assets || assets.total_declarado === 0) {
    return (
      <section
        aria-label="Patrimônio declarado"
        className="border-y-[3px] border-double border-[var(--color-border-editorial)] py-6"
      >
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">
          Transparência Financeira · TSE
        </p>
        <h2 className="mt-1 text-2xl font-normal text-[var(--color-ink)]">
          Patrimônio e Bens Declarados
        </h2>
        <div className="mt-4 border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
          <p className="text-sm leading-relaxed text-[var(--color-muted-ink)]">
            Nenhum bem patrimonial individual foi registrado para {candidateName} na
            base oficial de declaração de bens da Justiça Eleitoral ou a candidatura
            declarou não possuir bens a relacionar neste pleito.
          </p>
          <a
            href="https://divulgacandcontas.tse.jus.br"
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1 font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4 hover:opacity-80"
          >
            <span>Consultar no DivulgaCandContas (TSE)</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    );
  }

  const audit = assets.auditoria_evolucao;
  const hasHistory = availableYears.length > 1;
  const maxYearTotal = Math.max(
    ...assets.declaracoes_por_ano.map((d) => d.total),
    1
  );

  return (
    <section
      aria-label="Patrimônio declarado"
      className="border-y-[3px] border-double border-[var(--color-border-editorial)] py-6"
    >
      {/* Cabeçalho com Total e Indicadores */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.14em] text-[var(--color-muted-ink)]">
              Transparência Financeira · TSE ({assets.ano_recente})
            </p>
            {audit && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.65rem] font-semibold uppercase tracking-wider ${
                  audit.variacao_percentual >= 0
                    ? 'border border-[color-mix(in_srgb,var(--color-institutional)_30%,transparent)] bg-[color-mix(in_srgb,var(--color-institutional)_10%,var(--color-paper))] text-[var(--color-institutional)]'
                    : 'border border-[var(--color-border-editorial)] bg-[var(--color-paper)] text-[var(--color-muted-ink)]'
                }`}
                title={audit.resumo}
              >
                <span>
                  {audit.variacao_percentual >= 0 ? '▲' : '▼'}{' '}
                  {Math.abs(audit.variacao_percentual).toFixed(1)}% vs {audit.ano_anterior}
                </span>
              </span>
            )}
          </div>
          <h2 className="mt-1 text-3xl font-normal text-[var(--color-ink)]">
            Patrimônio e Bens Declarados
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[var(--color-muted-ink)]">
            Valores oficiais declarados perante a Justiça Eleitoral na prestação de
            contas e registro de candidatura.
          </p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <span className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--color-muted-ink)]">
            Total declarado ({activeYear})
          </span>
          <p className="mt-1 font-mono text-2xl font-bold text-[var(--color-institutional)]">
            {formatCurrencyBRL(currentDeclaration?.total ?? assets.total_declarado)}
          </p>
        </div>
      </div>

      {/* Painel de Auditoria de Evolução Patrimonial Histórica */}
      {hasHistory && (
        <div className="mt-5 border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Evolução Patrimonial entre Eleições
            </h3>
            {/* Seletor de Ano */}
            <div className="flex items-center gap-1" role="group" aria-label="Selecione o ano da declaração">
              {availableYears.map((ano) => (
                <button
                  key={ano}
                  type="button"
                  onClick={() => setSelectedYear(ano)}
                  aria-pressed={activeYear === ano}
                  className={`cursor-pointer rounded-xs px-2.5 py-1 font-mono text-xs transition-colors ${
                    activeYear === ano
                      ? 'bg-[var(--color-institutional)] text-white font-medium'
                      : 'border border-[var(--color-border-editorial)] bg-[var(--color-paper)] text-[var(--color-muted-ink)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  {ano} {ano === assets.ano_recente ? '(Atual)' : ''}
                </button>
              ))}
            </div>
          </div>

          {/* Gráfico de Barras Comparativo dos Anos Declarados */}
          <div className="mt-4 space-y-2.5 pt-2">
            {assets.declaracoes_por_ano.map((decl) => {
              const barPercentage = (decl.total / maxYearTotal) * 100;
              const isSelected = activeYear === decl.ano;
              return (
                <div key={decl.ano} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-mono font-medium ${isSelected ? 'text-[var(--color-institutional)]' : 'text-[var(--color-ink)]'}`}>
                      {decl.ano} {decl.ano === assets.ano_recente ? '· Eleição Atual' : '· Pleito Anterior'}
                    </span>
                    <span className="font-mono font-semibold text-[var(--color-ink)]">
                      {formatCurrencyBRL(decl.total)} ({decl.itens_count} {decl.itens_count === 1 ? 'bem' : 'bens'})
                    </span>
                  </div>
                  <div className="h-3 w-full overflow-hidden bg-[var(--color-border-editorial)]/30 rounded-xs">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isSelected
                          ? 'bg-[var(--color-institutional)]'
                          : 'bg-[var(--color-muted-ink)]/60'
                      }`}
                      style={{ width: `${Math.max(barPercentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumo de Auditoria Editorial */}
          {audit && (
            <div className="mt-4 rounded-xs border border-[var(--color-border-editorial)] bg-[var(--color-border-editorial)]/10 p-3 text-xs leading-relaxed text-[var(--color-ink)]">
              <span className="font-semibold text-[var(--color-institutional)]">
                Auditoria de Variação Patrimonial:{' '}
              </span>
              <span>{audit.resumo}</span>
            </div>
          )}
        </div>
      )}

      {/* Composição por Categoria de Bens */}
      <div className="mt-5 border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
        <h3 className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
          Composição por Categoria · {activeYear} ({items.length}{' '}
          {items.length === 1 ? 'bem registrado' : 'bens registrados'})
        </h3>

        <div className="mt-4 space-y-3">
          {sortedCategories.map(([categoria, valor]) => {
            const currentTotal = currentDeclaration?.total ?? assets.total_declarado;
            const percentage = currentTotal > 0 ? (valor / currentTotal) * 100 : 0;
            return (
              <div key={categoria} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[var(--color-ink)]">
                    {categoria}
                  </span>
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
                : `▼ Ver relação detalhada dos ${items.length} bens declarados em ${activeYear}`}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-4 space-y-3">
              {/* Filtros da Tabela de Bens */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <input
                  type="text"
                  placeholder="Buscar bem por descrição ou tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xs border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-3 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none sm:w-64"
                />

                {categories.length > 1 && (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="rounded-xs border border-[var(--color-border-editorial)] bg-[var(--color-paper)] px-2.5 py-1.5 text-xs text-[var(--color-ink)] focus:border-[var(--color-institutional)] focus:outline-none"
                    aria-label="Filtrar por categoria de bem"
                  >
                    <option value="todas">Todas as categorias ({items.length})</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Tabela de Itens */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border-editorial)] font-mono text-[0.68rem] text-[var(--color-muted-ink)] uppercase">
                      <th className="py-2 pr-3">Categoria</th>
                      <th className="py-2 px-3">Descrição Registrada no TSE</th>
                      <th className="py-2 pl-3 text-right">Valor Declarado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-editorial)]">
                    {filteredItems.map((item, idx) => (
                      <tr
                        key={`${item.tipo}-${idx}`}
                        className="hover:bg-[var(--color-border-editorial)]/20"
                      >
                        <td className="py-2.5 pr-3 font-medium text-[var(--color-ink)] align-top whitespace-nowrap">
                          <span className="inline-block rounded-xs bg-[var(--color-border-editorial)]/50 px-2 py-0.5 font-mono text-[0.65rem]">
                            {item.categoria}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-[var(--color-ink)] align-top leading-relaxed">
                          <p className="font-medium text-[var(--color-ink)]">{item.descricao || item.tipo}</p>
                          {item.descricao && item.tipo !== item.descricao && (
                            <p className="font-mono text-[0.65rem] text-[var(--color-muted-ink)] mt-0.5">
                              Tipo oficial: {item.tipo}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 pl-3 font-mono font-semibold text-[var(--color-ink)] text-right align-top whitespace-nowrap">
                          {formatCurrencyBRL(item.valor)}
                        </td>
                      </tr>
                    ))}
                    {filteredItems.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-xs text-[var(--color-muted-ink)]">
                          Nenhum bem localizado com os filtros informados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Link de Fonte Oficial */}
      <div className="mt-4">
        <a
          href="https://divulgacandcontas.tse.jus.br"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 font-mono text-xs text-[var(--color-institutional)] underline underline-offset-4 hover:opacity-80"
        >
          <span>Fonte oficial: Tribunal Superior Eleitoral (DivulgaCandContas / TSE)</span>
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
