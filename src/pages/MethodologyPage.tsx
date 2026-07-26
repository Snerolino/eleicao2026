import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_IS_PLACEHOLDER
} from '@/config';
import { usePageMetadata } from '@/hooks/usePageMetadata';

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
    'Metodologia — Portal Transparência Eleitoral RS',
    'Entenda as categorias de fonte, os níveis de confiança e o processo de contestação.'
  );

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Metodologia</h1>

      <div className="mt-8 space-y-9 text-[0.98rem] leading-relaxed">
        <section>
          <h2 className="text-2xl">Como o score de confiança é calculado</h2>
          <p className="mt-2">
            Cada claim recebe um score de 1 a 5 calculado automaticamente com
            base no <strong>tipo</strong> e na <strong>quantidade</strong> de
            fontes independentes que a sustentam. O score nunca é uma opinião
            do modelo de IA — é uma função determinística do conjunto de fontes
            registradas no banco.
          </p>

          <div className="mt-6 space-y-3 rounded-md border border-[var(--color-border-editorial)] bg-white p-5 font-mono text-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-institutional)] text-xs font-bold text-white">
                5
              </span>
              <span className="flex-1">Fonte oficial + ao menos uma fonte independente</span>
            </div>
            <ScoreBar value={5} label="Verificado" color="var(--color-institutional)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-institutional)] text-xs font-bold text-white">
                4
              </span>
              <span className="flex-1">Fonte oficial isolada</span>
            </div>
            <ScoreBar value={4} label="Verificado" color="var(--color-institutional)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-press)] text-xs font-bold text-white">
                3
              </span>
              <span className="flex-1">Duas ou mais fontes de imprensa concordantes</span>
            </div>
            <ScoreBar value={3} label="Parcialmente verificado" color="var(--color-factcheck)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-factcheck)] text-xs font-bold text-white">
                2
              </span>
              <span className="flex-1">Uma fonte de imprensa ou checagem de fatos</span>
            </div>
            <ScoreBar value={2} label="Parcialmente verificado" color="var(--color-factcheck)" />

            <div className="flex items-center gap-3">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--color-unverified)] text-xs font-bold text-white">
                1
              </span>
              <span className="flex-1">Detectado, mas ainda não confirmado</span>
            </div>
            <ScoreBar value={1} label="Não confirmado" color="var(--color-unverified)" />
          </div>
        </section>

        <section>
          <h2 className="text-2xl">Categorias de fonte</h2>
          <p className="mt-2">
            Cada fonte é classificada em uma das categorias abaixo. A cor do
            selo no dossiê identifica visualmente a categoria — é o único
            elemento do layout com cor saturada de propósito.
          </p>

          <dl className="mt-4 space-y-4">
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-white p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-institutional)]">
                ■ Oficial
              </dt>
              <dd className="mt-1">
                Órgãos públicos, Justiça Eleitoral, diários oficiais
                e instituições responsáveis pelo registro original.
                Sempre que disponível, é a referência principal.
              </dd>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-white p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-press)]">
                ■ Imprensa
              </dt>
              <dd className="mt-1">
                Veículos jornalísticos identificados e matérias com
                autoria ou responsabilidade editorial.
              </dd>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-white p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-factcheck)]">
                ■ Checagem de fatos
              </dt>
              <dd className="mt-1">
                Organizações especializadas em verificar declarações
                e evidências (Aos Fatos, Agência Lupa, Comprova).
              </dd>
            </div>
            <div className="rounded-md border border-[var(--color-border-editorial)] bg-white p-4">
              <dt className="font-mono font-semibold uppercase text-[var(--color-unverified)]">
                ■ Outra
              </dt>
              <dd className="mt-1">
                Fontes que não se enquadram nas categorias anteriores
                ou que ainda precisam de confirmação adicional.
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h2 className="text-2xl">Níveis de confiança</h2>
          <p className="mt-2">
            Cada informação recebe uma pontuação de 1 a 5 conforme
            a qualidade, a rastreabilidade e a consistência das
            fontes usadas no processo editorial.
          </p>
          <ul className="mt-4 space-y-2 font-mono text-sm">
            <li>
              <strong>Verificado</strong>: score 4 ou 5
            </li>
            <li>
              <strong>Parcialmente verificado</strong>: score 2 ou 3
            </li>
            <li>
              <strong>Não confirmado</strong>: score 1
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl">
            Confiança da fonte não é verdade absoluta
          </h2>
          <p className="mt-2">
            Uma fonte oficial pode comprovar que uma informação foi
            registrada por determinado órgão, mas isso não substitui
            a análise do contexto. Por isso, o portal mantém o link
            para a origem sempre que ele estiver disponível.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">
            O que aparece no portal
          </h2>
          <p className="mt-2">
            O frontend exibe somente claims com status{' '}
            <code className="font-mono">published</code>. Rascunhos,
            conteúdos em revisão, corrigidos e retratados ficam fora
            das páginas públicas — o que você vê aqui já passou pelo
            processo editorial.
          </p>
        </section>

        <section>
          <h2 className="text-2xl">
            Como contestar uma informação
          </h2>
          <p className="mt-2">
            Uma contestação deve indicar a informação questionada,
            o motivo e, quando possível, uma fonte documental.
          </p>

          {CONTACT_EMAIL_IS_PLACEHOLDER ? (
            <div
              role="note"
              className="mt-4 rounded-md border border-[var(--color-factcheck)] bg-white p-4 font-mono text-sm"
            >
              Canal de contato ainda não configurado. Antes da
              publicação, substitua{' '}
              <code>CONTACT_EMAIL</code> em{' '}
              <code>src/config.ts</code>.
            </div>
          ) : (
            <p className="mt-4 rounded-md border border-[var(--color-border-editorial)] bg-white p-4 font-mono text-sm">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-[var(--color-institutional)] underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
          )}
        </section>
      </div>
    </main>
  );
}