/**
 * Resolução de FKs de apoio para o importer legislativo (Fase 2, Task 8).
 *
 * O planner emite referências lógicas `{ logical_ref: 'legislators:deputy-rs-001' }`
 * para tabelas que não têm FK direta no núcleo legislativo:
 *  - `legislators`  → resolve para `candidates.id` por `tse_candidate_id`/slug;
 *  - `candidates`   → já é a PK de `candidates`;
 *  - `source_references` → resolve para `source_references.id` por `content_hash`/url.
 *
 * Este módulo é PURO: recebe catálogos em memória (ex.: snapshots públicos
 * versionados) e devolve os UUIDs reais. Nenhuma consulta de rede, nenhum
 * acesso a `.env*` ou service role. Em produção, os catálogos vêm do
 * `data/public-candidates.json` (anon) e de um índice de `source_references`
 * público — fora deste módulo.
 *
 * REGRAS:
 *  - Determinístico: mesma entrada → mesmo mapa.
 *  - Se a referência não resolver, retorna `null` (não fabrica UUID).
 *  - Nunca lança; erros de formato viram `unresolved`.
 */
export interface SupportCatalogs {
  /** deputy_id (string lógica) → candidates.id (uuid real). */
  legislatorsToCandidateId?: Record<string, string>;
  /** tse_candidate_id ou slug → candidates.id (uuid real). */
  candidateByIdentifier?: Record<string, string>;
  /** url ou content_hash → source_references.id (uuid real). */
  sourceReferenceByKey?: Record<string, string>;
}

export interface ResolutionResult {
  resolved: Record<string, string | null>;
  unresolved: string[];
}

function normKey(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Resolve um conjunto de referências lógicas contra os catálogos.
 * `refs` é a lista de `logical_ref` extraída do plano.
 */
export function resolveSupportRefs(refs: string[], catalogs: SupportCatalogs): ResolutionResult {
  const resolved: Record<string, string | null> = {};
  const unresolved: string[] = [];
  for (const ref of refs) {
    const parts = ref.split(':');
    const table = parts[0];
    const key = parts.slice(1).join(':');
    let found: string | null = null;
    switch (table) {
      case 'legislators': {
        found = catalogs.legislatorsToCandidateId?.[key] ?? null;
        break;
      }
      case 'candidates': {
        found = catalogs.candidateByIdentifier?.[normKey(key)] ?? null;
        break;
      }
      case 'source_references': {
        found = catalogs.sourceReferenceByKey?.[normKey(key)] ?? null;
        break;
      }
      default:
        found = null;
    }
    resolved[ref] = found;
    if (found === null) unresolved.push(ref);
  }
  return { resolved, unresolved };
}

/** Extrai todas as referências lógicas de apoio de um plano. */
export function collectSupportRefs(plan: {
  operations: Array<{ payload: Record<string, unknown> }>;
}): string[] {
  const refs: string[] = [];
  for (const op of plan.operations) {
    for (const value of Object.values(op.payload)) {
      if (value && typeof value === 'object' && 'logical_ref' in (value as Record<string, unknown>)) {
        const r = (value as { logical_ref: string }).logical_ref;
        const table = r.split(':')[0];
        if (table === 'legislators' || table === 'candidates' || table === 'source_references') {
          refs.push(r);
        }
      }
    }
  }
  return [...new Set(refs)];
}
