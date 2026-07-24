import {
  CONTACT_EMAIL,
  CONTACT_EMAIL_IS_PLACEHOLDER
} from '@/config';
import { usePageMetadata } from '@/hooks/usePageMetadata';

export function MethodologyPage() {
  usePageMetadata(
    'Metodologia — Portal Transparência Eleitoral RS',
    'Entenda as categorias de fonte, os níveis de confiança e o processo de contestação.'
  );

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl">Metodologia</h1>

      <div className="mt-8 space-y-9 text-[0.98rem] leading-relaxed">
        <section>
          <h2 className="text-2xl">Níveis de confiança</h2>
          <p className="mt-2">
            Cada informação recebe uma pontuação de 1 a 5 conforme
            a qualidade, a rastreabilidade e a consistência das
            fontes usadas no processo editorial.
          </p>
          <ul className="mt-4 space-y-2 font-mono text-sm">
            <li>
              <strong>Verificado</strong>: pontuação 4 ou 5
            </li>
            <li>
              <strong>Parcialmente verificado</strong>: pontuação 2
              ou 3
            </li>
            <li>
              <strong>Não confirmado</strong>: pontuação 1
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl">Categorias de fonte</h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-mono font-semibold uppercase text-[var(--color-institutional)]">
                Oficial
              </dt>
              <dd>
                Órgãos públicos, Justiça Eleitoral, diários oficiais
                e instituições responsáveis pelo registro original.
              </dd>
            </div>
            <div>
              <dt className="font-mono font-semibold uppercase text-[var(--color-press)]">
                Imprensa
              </dt>
              <dd>
                Veículos jornalísticos identificados e matérias com
                autoria ou responsabilidade editorial.
              </dd>
            </div>
            <div>
              <dt className="font-mono font-semibold uppercase text-[var(--color-factcheck)]">
                Checagem de fatos
              </dt>
              <dd>
                Organizações especializadas em verificar declarações
                e evidências.
              </dd>
            </div>
            <div>
              <dt className="font-mono font-semibold uppercase text-[var(--color-unverified)]">
                Outra
              </dt>
              <dd>
                Fontes que não se enquadram nas categorias anteriores
                ou que ainda precisam de confirmação adicional.
              </dd>
            </div>
          </dl>
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
            das páginas públicas.
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
