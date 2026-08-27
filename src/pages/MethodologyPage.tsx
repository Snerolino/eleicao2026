import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_IS_PLACEHOLDER
} from '@/config';
import { usePageMetadata } from '@/hooks/usePageMetadata';
import { Link } from 'react-router';
import {
  BENEFICIARY_GROUPS_CANONICAL_ORDER,
  getBeneficiaryGroupLabel,
} from '@/domain/impact/beneficiary-groups';

function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="h-3 rounded-sm transition-all"
        style={{ width: `${value * 20}%`, backgroundColor: color }}
      />
      <span className="font-mono text-xs font-medium uppercase tracking-wider" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

export function MethodologyPage() {
  usePageMetadata(
    'Metodologia e Pontuação das Votações — Portal Transparência Eleitoral RS',
    'Entenda como calculamos o alinhamento das votações nominais, os 14 grupos populacionais, os níveis de confiança e a auditoria de fontes.'
  );

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-10">
      {/* Header editorial */}
      <header className="border-b border-[var(--color-border-editorial)] pb-6">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-wider text-[var(--color-institutional)] underline-offset-4 hover:underline"
        >
          ← Voltar ao início
        </Link>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Metodologia de Transparência &amp; Votações
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[var(--color-muted-ink)] sm:text-lg">
          Como organizamos o histórico público das eleições no Rio Grande do Sul, calculamos o alinhamento das votações legislativas e garantimos a rastreabilidade das fontes oficiais.
        </p>

        {/* Índice de navegação rápida */}
        <nav aria-label="Índice da metodologia" className="mt-6 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-ink)]">
            Navegação rápida
          </p>
          <ul className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
            <li>
              <a href="#como-calculamos" className="text-[var(--color-institutional)] underline-offset-2 hover:underline">
                1. Como calculamos a pontuação das votações
              </a>
            </li>
            <li>
              <a href="#como-funciona" className="text-[var(--color-institutional)] underline-offset-2 hover:underline">
                2. O método em 5 passos
              </a>
            </li>
            <li>
              <a href="#grupos-populacionais" className="text-[var(--color-institutional)] underline-offset-2 hover:underline">
                3. Grupos populacionais contemplados
              </a>
            </li>
            <li>
              <a href="#pesos-e-escala" className="text-[var(--color-institutional)] underline-offset-2 hover:underline">
                4. Relevância do impacto e escala (−1 a +1)
              </a>
            </li>
            <li>
              <a href="#abstencoes-ausencias" className="text-[var(--color-institutional)] underline-offset-2 hover:underline">
                5. Abstenções, ausências e faltas de dados
              </a>
            </li>
            <li>
              <a href="#confianca-fontes" className="text-[var(--color-institutional)] underline-offset-2 hover:underline">
                6. Score de confiança e categorias de fontes
              </a>
            </li>
            <li>
              <a href="#contestacao" className="text-[var(--color-institutional)] underline-offset-2 hover:underline">
                7. Governança e como contestar
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <div className="mt-10 space-y-12 text-[0.98rem] leading-relaxed text-[var(--color-ink)]">

        {/* 1. Visão Geral da Pontuação */}
        <section id="como-calculamos" className="scroll-mt-6 space-y-4">
          <div className="border-l-4 border-[var(--color-institutional)] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Matriz de Impacto Populacional v1
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Como calculamos a pontuação das votações
            </h2>
          </div>

          <p>
            A pontuação das votações mostra <strong>como os votos oficiais registrados de um parlamentar se relacionam com os interesses de grupos populacionais diretamente afetados por cada proposta analisada</strong>.
          </p>

          <p>
            Não damos nota para a pessoa, para o partido ou para a ideologia do candidato. Também não consideramos que votar &ldquo;sim&rdquo; seja automaticamente positivo ou votar &ldquo;não&rdquo; seja automaticamente negativo.
          </p>

          <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--color-institutional)]">
              Versão Curta
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
              Primeiro analisamos <strong>o conteúdo da proposta que foi efetivamente votada</strong>. Depois identificamos quais grupos são diretamente afetados, qual é a direção desse impacto e qual voto, naquela votação específica, protegeria o interesse considerado. Só então cruzamos essa análise com o voto oficial registrado do parlamentar.
            </p>
          </div>

          {/* Destaque do que NÃO é nota do candidato */}
          <div className="rounded-md border border-amber-300 bg-amber-50/50 p-5 dark:border-amber-800 dark:bg-amber-950/20">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              ⚠️ Importante: Não é uma &ldquo;nota do candidato&rdquo;
            </h3>
            <p className="mt-2 text-sm text-[var(--color-ink)]">
              A pontuação não mede:
            </p>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1 text-[var(--color-muted-ink)]">
              <li>honestidade ou caráter;</li>
              <li>competência administrativa;</li>
              <li>qualidade geral do mandato;</li>
              <li>ideologia ou afinidade pessoal;</li>
              <li>nem se alguém &ldquo;merece&rdquo; ou não receber seu voto.</li>
            </ul>
            <p className="mt-3 text-sm text-[var(--color-ink)]">
              Ela mede estritamente <strong>o histórico das votações nominais públicas que puderam ser verificadas</strong>, relacionadas aos grupos definidos pela metodologia.
            </p>
          </div>
        </section>

        {/* 2. O Método em 5 Passos */}
        <section id="como-funciona" className="scroll-mt-6 space-y-6">
          <div className="border-l-4 border-[var(--color-institutional)] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Estrutura Metodológica
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Como funciona o método em 5 passos
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-1">
            {/* Passo 1 */}
            <article className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase text-[var(--color-institutional)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-institutional)] text-white text-[0.65rem]">1</span>
                Começamos pelo que foi realmente votado
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
                Cada análise parte da <strong>versão exata da proposta submetida à votação</strong> (texto integral, substitutivos, emendas ou vetos).
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-ink)]">
                Diferenciamos rigorosamente votações de mérito substantivo de votações procedimentais (como preferência, adiamento ou retirada de pauta). Uma votação procedural não herda automaticamente o mérito da lei.
              </p>
            </article>

            {/* Passo 2 */}
            <article className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase text-[var(--color-institutional)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-institutional)] text-white text-[0.65rem]">2</span>
                Identificamos quem é diretamente afetado
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
                A metodologia opera com uma taxonomia fechada de 14 grupos populacionais canônicos. Uma matéria pode afetar nenhum, um ou mais grupos.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-ink)]">
                Matérias com efeitos orçamentários gerais, tributários difusos ou de organização administrativa sem grupo destinatário direto recebem a marcação <em>sem grupo direto</em> e não afetam a pontuação. Se houver público específico fora dos 14 grupos (ex.: servidores, estudantes), registra-se uma <em>lacuna de taxonomia</em> sem forçar encaixe artificial.
              </p>
            </article>

            {/* Passo 3 */}
            <article className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase text-[var(--color-institutional)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-institutional)] text-white text-[0.65rem]">3</span>
                Avaliamos a direção do impacto
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
                Para cada grupo afetado, a análise documental oficial determina se a proposta:
              </p>
              <ul className="mt-2 list-disc pl-5 text-sm space-y-1 text-[var(--color-muted-ink)]">
                <li><strong>amplia ou protege</strong> direitos, serviços, garantias ou condições materiais;</li>
                <li><strong>restringe ou reduz</strong> esses direitos e condições;</li>
                <li>possui <strong>efeitos mistos</strong> ou inconclusivos (<em>unclear</em>).</li>
              </ul>
            </article>

            {/* Passo 4 */}
            <article className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase text-[var(--color-institutional)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-institutional)] text-white text-[0.65rem]">4</span>
                Determinamos qual voto protege o interesse analisado
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
                &ldquo;Sim&rdquo; não significa automaticamente algo positivo, e &ldquo;Não&rdquo; não significa automaticamente algo negativo.
              </p>
              <div className="mt-3 rounded border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3 text-xs font-mono">
                <p className="text-[var(--color-institutional)]">✓ Proposta protetiva / ampliativa → Voto de defesa: SIM</p>
                <p className="mt-1 text-[var(--color-factcheck)]">✓ Proposta prejudicial / restritiva → Voto de defesa: NÃO (votar contra protege o grupo)</p>
              </div>
            </article>

            {/* Passo 5 */}
            <article className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5">
              <div className="flex items-center gap-2 font-mono text-xs font-semibold uppercase text-[var(--color-institutional)]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-institutional)] text-white text-[0.65rem]">5</span>
                Cruzamos a análise com o voto oficial do parlamentar
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]">
                O voto factual de cada parlamentar é comparado de forma determinística com o voto de defesa apurado:
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full border-collapse text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border-editorial)] text-[var(--color-muted-ink)]">
                      <th className="py-2 pr-3">Voto do Parlamentar</th>
                      <th className="py-2 pr-3">Relação com o Interesse</th>
                      <th className="py-2">Sinal no Cálculo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-editorial)]">
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-[var(--color-institutional)]">Igual ao voto defensor</td>
                      <td className="py-2 pr-3">A favor do grupo</td>
                      <td className="py-2 font-bold text-[var(--color-institutional)]">+1.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-[var(--color-factcheck)]">Contrário ao voto defensor</td>
                      <td className="py-2 pr-3">Contra o grupo</td>
                      <td className="py-2 font-bold text-[var(--color-factcheck)]">−1.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-[var(--color-ink)]">Abstenção formal</td>
                      <td className="py-2 pr-3">Posição neutra declarada</td>
                      <td className="py-2 font-bold">0.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-[var(--color-muted-ink)]">Ausência estratégica</td>
                      <td className="py-2 pr-3">Estratégia comprovada documentalmente</td>
                      <td className="py-2 font-bold">−0.5</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-[var(--color-press)]">Obstrução parlamentar</td>
                      <td className="py-2 pr-3">Obstrução coordenada em plenário</td>
                      <td className="py-2 font-bold">0.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 text-[var(--color-muted-ink)]">Ausente / Sem dado</td>
                      <td className="py-2 pr-3">Sem evidência ou não avaliável</td>
                      <td className="py-2 text-[var(--color-muted-ink)]"><em>Excluído</em></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </div>
        </section>

        {/* 3. Grupos Populacionais Contemplados */}
        <section id="grupos-populacionais" className="scroll-mt-6 space-y-4">
          <div className="border-l-4 border-[var(--color-institutional)] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Taxonomia Metodológica v1
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              14 Grupos Populacionais Contemplados
            </h2>
          </div>

          <p>
            A metodologia trabalha com 14 grupos populacionais historicamente vulnerabilizados ou destinatários de políticas públicas com salvaguardas constitucionais específicas:
          </p>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {BENEFICIARY_GROUPS_CANONICAL_ORDER.map((groupSlug, index) => (
              <div
                key={groupSlug}
                className="flex items-center gap-3 rounded-sm border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-sm bg-[color-mix(in_srgb,var(--color-institutional)_12%,var(--color-paper))] font-mono text-xs font-semibold text-[var(--color-institutional)]">
                  {index + 1}
                </span>
                <span className="font-medium text-sm text-[var(--color-ink)]">
                  {getBeneficiaryGroupLabel(groupSlug)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-sm text-[var(--color-muted-ink)]">
            Uma mesma proposição pode afetar mais de um grupo quando o texto legal tiver efeitos diretos documentados sobre diferentes populações. Nesses casos, o voto contribui separadamente para cada categoria correspondente.
          </p>
        </section>

        {/* 4. Pesos e Escala */}
        <section id="pesos-e-escala" className="scroll-mt-6 space-y-6">
          <div className="border-l-4 border-[var(--color-institutional)] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Ponderação e Interpretação
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Nem todas as votações têm o mesmo peso
            </h2>
          </div>

          <p>
            Uma emenda constitucional ampla não tem o mesmo alcance de uma alteração administrativa pontual ou de uma homenagem comemorativa. Por isso, a metodologia aplica ponderação por <strong>tipo estrutural</strong> e <strong>severidade</strong>:
          </p>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <span className="font-mono text-xs font-bold uppercase text-[var(--color-institutional)]">Peso 1.5× · Estrutural</span>
              <p className="mt-2 text-xs text-[var(--color-muted-ink)]">
                Altera regras normativas gerais, direitos fundamentais, marcos regulatórios ou estruturas legais duradouras.
              </p>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <span className="font-mono text-xs font-bold uppercase text-[var(--color-ink)]">Peso 1.0× · Orçamentário</span>
              <p className="mt-2 text-xs text-[var(--color-muted-ink)]">
                Alocações orçamentárias, incentivos fiscais, fundos estaduais ou diretrizes financeiras.
              </p>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <span className="font-mono text-xs font-bold uppercase text-[var(--color-muted-ink)]">Peso 0.5× · Simbólico</span>
              <p className="mt-2 text-xs text-[var(--color-muted-ink)]">
                Homenagens, datas comemorativas, denominações ou declarações de interesse cultural.
              </p>
            </div>
          </div>

          {/* Escala -1 a +1 */}
          <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-6 space-y-4">
            <h3 className="text-xl font-bold">Como ler a pontuação final (−1 ← 0 → +1)</h3>
            <p className="text-sm text-[var(--color-muted-ink)]">
              A pontuação agregada de cada parlamentar em um grupo varia continuamente entre −1 e +1:
            </p>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded border border-[var(--color-border-editorial)] bg-card p-3">
                <strong className="font-mono text-sm font-semibold text-[var(--color-institutional)]">Próximo de +1 (+0.1 a +1.0)</strong>
                <p className="mt-1 text-xs text-[var(--color-muted-ink)]">
                  Votos predominantemente alinhados à defesa e ampliação de direitos do grupo nas matérias avaliadas.
                </p>
              </div>
              <div className="rounded border border-[var(--color-border-editorial)] bg-card p-3">
                <strong className="font-mono text-sm font-semibold text-[var(--color-ink)]">Próximo de 0 (−0.09 a +0.09)</strong>
                <p className="mt-1 text-xs text-[var(--color-muted-ink)]">
                  Equilíbrio entre posições favoráveis e contrárias, ou histórico composto por posições neutras/abstenções.
                </p>
              </div>
              <div className="rounded border border-[var(--color-border-editorial)] bg-card p-3">
                <strong className="font-mono text-sm font-semibold text-[var(--color-factcheck)]">Próximo de −1 (−1.0 a −0.1)</strong>
                <p className="mt-1 text-xs text-[var(--color-muted-ink)]">
                  Votos predominantemente contrários ao interesse do grupo nas matérias com impacto identificado.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Abstenções, Ausências e Faltas de Dados */}
        <section id="abstencoes-ausencias" className="scroll-mt-6 space-y-4">
          <div className="border-l-4 border-[var(--color-institutional)] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Tratamento Factual
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Abstenções, ausências e o que acontece quando não há dados
            </h2>
          </div>

          <div className="space-y-3">
            <div className="rounded border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <h3 className="font-mono text-xs font-bold uppercase text-[var(--color-ink)]">Abstenções</h3>
              <p className="mt-1 text-sm text-[var(--color-muted-ink)]">
                Registradas como posição neutra declarada no plenário (sinal 0.0).
              </p>
            </div>

            <div className="rounded border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <h3 className="font-mono text-xs font-bold uppercase text-[var(--color-ink)]">Ausências Comuns</h3>
              <p className="mt-1 text-sm text-[var(--color-muted-ink)]">
                Não são tratadas como votos contrários. Na ausência de evidência sobre estratégia de plenário, a votação não entra no cômputo daquele parlamentar.
              </p>
            </div>

            <div className="rounded border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <h3 className="font-mono text-xs font-bold uppercase text-[var(--color-institutional)]">Falta de dado não é zero</h3>
              <p className="mt-1 text-sm text-[var(--color-muted-ink)]">
                Quando uma matéria não possui documentação suficiente ou quando um parlamentar não participou de votações nominais com assessment aprovado, ele é apresentado como <strong>&ldquo;não avaliado&rdquo;</strong>. Isso evita transformar ausência de informação em um juízo político artificial.
              </p>
            </div>
          </div>
        </section>

        {/* 6. Score de Confiança e Categorias de Fontes */}
        <section id="confianca-fontes" className="scroll-mt-6 space-y-6">
          <div className="border-l-4 border-[var(--color-institutional)] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Auditoria de Dossiês
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Score de confiança e categorias de fontes
            </h2>
          </div>

          <p>
            Cada claim (afirmação biográfica ou de histórico) recebe um score determinístico de 1 a 5 baseado no tipo e na pluralidade de fontes documentais:
          </p>

          <div className="space-y-3 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-5 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-institutional)] text-xs font-bold text-white">5</span>
              <span className="flex-1">Fonte oficial + ao menos uma fonte independente</span>
            </div>
            <ScoreBar value={5} label="Verificado" color="var(--color-institutional)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-institutional)] text-xs font-bold text-white">4</span>
              <span className="flex-1">Fonte oficial isolada</span>
            </div>
            <ScoreBar value={4} label="Verificado" color="var(--color-institutional)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-press)] text-xs font-bold text-white">3</span>
              <span className="flex-1">Duas ou mais fontes de imprensa concordantes</span>
            </div>
            <ScoreBar value={3} label="Parcialmente verificado" color="var(--color-factcheck)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-factcheck)] text-xs font-bold text-white">2</span>
              <span className="flex-1">Uma fonte de imprensa ou checagem de fatos</span>
            </div>
            <ScoreBar value={2} label="Parcialmente verificado" color="var(--color-factcheck)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-unverified)] text-xs font-bold text-white">1</span>
              <span className="flex-1">Detectado, mas ainda não confirmado</span>
            </div>
            <ScoreBar value={1} label="Não confirmado" color="var(--color-unverified)" />
          </div>

          <h3 className="text-xl font-bold">Categorias de fontes e lombadas editoriais</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-institutional)]">■ Oficial</dt>
              <dd className="mt-1 text-xs text-[var(--color-muted-ink)]">
                Portais institucionais, diários oficiais, sistemas das casas legislativas (ALRS, Câmara, Senado) e Justiça Eleitoral (TSE).
              </dd>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-press)]">■ Imprensa</dt>
              <dd className="mt-1 text-xs text-[var(--color-muted-ink)]">
                Veículos de jornalismo profissional com autoria e responsabilidade editorial verificável.
              </dd>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-factcheck)]">■ Checagem de fatos</dt>
              <dd className="mt-1 text-xs text-[var(--color-muted-ink)]">
                Agências especializadas em verificação factual com código de princípios públicos (Aos Fatos, Lupa, Comprova).
              </dd>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-unverified)]">■ Outra</dt>
              <dd className="mt-1 text-xs text-[var(--color-muted-ink)]">
                Fontes adicionais ou secundárias que aguardam confirmação por registros primários.
              </dd>
            </div>
          </dl>
        </section>

        {/* 7. Governança e Contestação */}
        <section id="contestacao" className="scroll-mt-6 space-y-4">
          <div className="border-l-4 border-[var(--color-institutional)] pl-4">
            <span className="font-mono text-xs uppercase tracking-widest text-[var(--color-muted-ink)]">
              Auditoria &amp; Governança
            </span>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
              Transparência e como contestar
            </h2>
          </div>

          <p>
            O <strong>Voto Pra Quem?</strong> é uma iniciativa cívica de transparência eleitoral e dados abertos. Todas as fontes oficiais são abertas e verificáveis diretamente nos órgãos de origem.
          </p>

          <p>
            Para contestar uma classificação de votação ou uma afirmação biográfica, envie a indicação do candidato, o link do item questionado e a fonte documental comprobatória:
          </p>

          {CONTACT_EMAIL_IS_PLACEHOLDER ? (
            <div
              role="note"
              className="rounded-md border border-[var(--color-factcheck)] bg-[var(--color-paper)] p-4 font-mono text-sm"
            >
              Canal de contato institucional em configuração.
            </div>
          ) : (
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)] p-4 font-mono text-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[var(--color-institutional)] underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          )}

          {/* Resumo final em callout */}
          <div className="mt-8 rounded-md border-2 border-[var(--color-institutional)] bg-[color-mix(in_srgb,var(--color-institutional)_8%,var(--color-paper))] p-5 text-center">
            <p className="font-[family-name:var(--font-display)] text-base font-semibold text-[var(--color-ink)] sm:text-lg">
              &ldquo;Analisamos o que foi efetivamente votado, identificamos quem é diretamente afetado, determinamos qual posição protege o interesse considerado e cruzamos essa análise com o voto oficial do parlamentar, dando mais peso às decisões de maior alcance.&rdquo;
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
