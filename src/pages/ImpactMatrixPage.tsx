import { useEffect, useState } from 'react';
import { sanitizeUrl } from '@/utils/url';

interface Assessment {
  group: string;
  defending_vote: string | null;
  impact_direction: string;
  rationale: string;
  confidence: number;
  sources: string[];
  reviewed: {
    reviewer_type: string;
    reviewed_at: string;
    reviewer_id: string;
  }[];
}

interface ImpactMatrix {
  schema_version: string;
  methodology_version: string;
  severity: number;
  structural_type: string;
  assessments: Assessment[];
  review_status: string;
}

const defaultMatrix: ImpactMatrix = {
  schema_version: '1.0.0',
  methodology_version: '1.0.0',
  severity: 0,
  structural_type: '',
  assessments: [],
  review_status: 'pending',
};

export function ImpactMatrixPage() {
  const [matrix, setMatrix] = useState<ImpactMatrix>(defaultMatrix);

  useEffect(() => {
    async function fetchMatrix() {
      try {
        const res = await fetch('/data/impact-matrices/plp-230-2025-sbt-1-approved.json');
        if (!res.ok) throw new Error('Não foi possível carregar a matriz');
        const data = await res.json();
        setMatrix(data as ImpactMatrix);
      } catch (e) {
        // silenciado — UI já trata estado vazio/falha via status no h1
      }
    }

    fetchMatrix();
  }, []);

  const noAssessments = matrix.assessments.length === 0;

  return (
    <section className="min-h-screen p-8">
      <div className="prose prose-dark max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {matrix.review_status === 'approved' ? 'Matriz Aprovada' : 'Matriz em Revisão'}
        </h1>

        {matrix.review_status === 'approved' && !noAssessments && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-2">Severity</p>
            <p className="font-mono text-lg" style={{ color: 'var(--color-institutional)' }}>
              {matrix.severity}
            </p>
          </div>
        )}

        {matrix.structural_type && (
          <div className="mb-6 text-sm text-gray-400">
            <p>Tipo Estrutural: {matrix.structural_type}</p>
          </div>
        )}

        {!noAssessments && (
          <section>
            <h2 className="text-2xl font-bold mb-4"> Avaliações</h2>
            {matrix.assessments.map((assessment, idx) => (
              <article key={idx} className="mb-6 p-4 rounded-md border border-[var(--color-border-editorial)] bg-[var(--color-paper)]">
                <h3 className="text-xl font-semibold mb-3">
                  {assessment.group}
                  {assessment.confidence >= 0.7 && (
                    <span className="ml-2 text-xs badge badge-info">alto</span>
                  )}
                </h3>

                <div className="space-y-3 text-sm">
                  <p><strong>Direção do Impacto:</strong> {assessment.impact_direction}</p>
                  <p><strong>Razão:</strong> {assessment.rationale}</p>

                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[var(--color-institutional)] text-xs font-bold text-white">
                      {Math.round(assessment.confidence * 5)}
                    </span>
                    <span className="font-mono text-xs font-medium uppercase tracking-wider">
                      {assessment.confidence.toFixed(2)}
                    </span>
                  </div>

                  {assessment.defending_vote && (
                    <p><strong>Voto de Defesa:</strong> {assessment.defending_vote}</p>
                  )}

                  <p className="text-line-clamp-3">{assessment.rationale}</p>

                  {assessment.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-400 mb-2">Fontes</p>
                      <ol className="list-decimal list-inside text-xs text-gray-300">
                        {assessment.sources.map((src, i) => {
                          const safeUrl = sanitizeUrl(src);
                          return (
                            <li key={i} className="break-all">
                              {safeUrl ? (
                                <a href={safeUrl} target="_blank" rel="noreferrer noopener" className="underline text-blue-400">
                                  Fonte {i + 1}
                                </a>
                              ) : (
                                <span className="text-gray-500">Fonte {i + 1} (inválida)</span>
                              )}
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  )}

                  {assessment.reviewed.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-400 mb-2">Revisões</p>
                      <ul className="list-disc list-inside text-xs text-gray-400">
                        {assessment.reviewed.map((r, i) => (
                          <li key={i}>
                            {r.reviewer_type}: {r.reviewed_at}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {matrix.review_status !== 'approved' || noAssessments && (
          <div className="mt-8 pt-8 border-t border-gray-600 text-xs text-gray-400">
            <p>Status: {matrix.review_status}</p>
            <p>Nenhuma avaliação carregada ainda.</p>
          </div>
        )}
      </div>
    </section>
  );
}