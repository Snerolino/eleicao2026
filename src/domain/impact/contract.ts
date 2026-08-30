/**
 * Contrato executável da Matriz de Impacto Populacional v1.
 * Validação sem AJV em runtime: checks diretos inspirados nos JSON Schemas
 * de schemas/impact-matrix-v1.schema.json e schemas/legislative-votes-v1.schema.json.
 */

export const BENEFICIARY_GROUPS = [
  'povos_indigenas',
  'comunidades_quilombolas',
  'populacao_negra_periferica',
  'mulheres',
  'lgbtqia',
  'pessoas_com_deficiencia',
  'populacao_rua',
  'populacao_carceraria',
  'criancas_adolescentes_vulnerabilidade',
  'pessoas_idosas_dependentes',
  'trabalhadores_informais',
  'agricultura_familiar_sem_terra',
  'povos_de_terreiro',
  'imigrantes_refugiados',
  'estudantes',
  'trabalhadores_formais',
  'servidores_publicos',
  'usuarios_sus',
  'pessoas_com_ludopatia',
  'candidatos_concursos_publicos',
  'pescadores_artesanais_comunidades_pesqueiras',
] as const;

export const IMPACT_DIRECTIONS = ['positive', 'negative', 'mixed', 'unclear'] as const;
export const STRUCTURAL_TYPES = ['structural', 'budgetary', 'symbolic'] as const;
export const REVIEW_STATUSES = ['rascunho', 'pending_review', 'approved', 'contested'] as const;
export const VOTE_VALUES = ['sim', 'nao', 'abstencao', 'ausente', 'obstrucao'] as const;
export const ABSENCE_TYPES = ['estrategica', 'obstrucao_coordenada', 'justificada'] as const;

const SEMVER = /^[0-9]+\.[0-9]+\.[0-9]+$/;
const HTTP_URL = /^https?:\/\/\S+$/i;
const MIN_RATIONALE = 20;

export interface ImpactAssessment {
  group: string;
  impact_direction: string;
  defending_vote?: 'sim' | 'nao' | null;
  textual_defending_vote?: 'sim' | 'nao' | null;
  event_defending_vote?: 'sim' | 'nao' | null;
  score_eligible?: boolean;
  vote_attribution_status?:
    | 'isolated'
    | 'compound_separable'
    | 'compound_non_separable'
    | 'procedural'
    | 'event_binding_missing';
  score_withholding_reason?: string | null;
  confidence: number;
  rationale: string;
  sources: string[];
  reviewed?: Array<{
    reviewer_type: 'curadoria_interna' | 'painel_externo';
    reviewed_at: string;
    reviewer_id: string;
  }>;
}

export interface LegislativeVote {
  deputy_id: string;
  proposition_version_id: string;
  value: string;
  absence_type?: string | null;
  recorded_at: string;
  source: string;
}

export interface ImpactMatrixInput {
  schema_version: string;
  methodology_version: string;
  severity: number;
  structural_type: string;
  assessments: ImpactAssessment[];
  review_status: string;
  votes?: LegislativeVote[];
}

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateAssessment(a: unknown, errors: string[], path: string): void {
  if (!isRecord(a)) {
    errors.push(`${path} deve ser um objeto`);
    return;
  }
  const group = a.group as string;
  const direction = a.impact_direction as string;

  if (typeof group !== 'string' || !BENEFICIARY_GROUPS.includes(group as never)) {
    errors.push(`${path}.group desconhecido: ${String(group)}`);
  }
  if (typeof direction !== 'string' || !IMPACT_DIRECTIONS.includes(direction as never)) {
    errors.push(`${path}.impact_direction inválido: ${String(direction)}`);
  }

  const confidence = a.confidence as number;
  if (typeof confidence !== 'number' || confidence <= 0 || confidence > 1) {
    errors.push(`${path}.confidence fora da faixa (0,1]: ${String(confidence)}`);
  }

  const rationale = a.rationale as string;
  if (typeof rationale !== 'string' || rationale.trim().length < MIN_RATIONALE) {
    errors.push(`${path}.rationale deve ter pelo menos ${MIN_RATIONALE} caracteres`);
  }

  const sources = a.sources;
  if (!Array.isArray(sources) || sources.length === 0) {
    errors.push(`${path}.sources deve ter pelo menos uma fonte`);
  } else {
    for (const [i, s] of sources.entries()) {
      if (typeof s !== 'string' || !HTTP_URL.test(s)) {
        errors.push(`${path}.sources[${i}] inválida: ${String(s)}`);
      }
    }
  }

  const defending = a.defending_vote as 'sim' | 'nao' | null | undefined;
  const scoreEligible = a.score_eligible as boolean | undefined;
  const voteAttributionStatus = a.vote_attribution_status as string | undefined;
  const eventDefending = a.event_defending_vote as 'sim' | 'nao' | null | undefined;

  const isNonScoredCompound =
    scoreEligible === false ||
    voteAttributionStatus === 'compound_non_separable' ||
    eventDefending === null;

  if (direction === 'positive' || direction === 'negative') {
    if (!isNonScoredCompound && defending !== 'sim' && defending !== 'nao') {
      errors.push(`${path}.defending_vote obrigatório (sim|nao) para ${direction}`);
    }
  } else if (direction === 'unclear') {
    if (defending !== null && defending !== undefined) {
      errors.push(`${path}.defending_vote deve ser null para unclear`);
    }
  }

  if (a.reviewed !== undefined) {
    if (!Array.isArray(a.reviewed)) {
      errors.push(`${path}.reviewed deve ser array`);
    } else {
      for (const [i, r] of a.reviewed.entries()) {
        if (!isRecord(r)) {
          errors.push(`${path}.reviewed[${i}] inválido`);
        } else {
          const rt = r.reviewer_type as string;
          if (rt !== 'curadoria_interna' && rt !== 'painel_externo') {
            errors.push(`${path}.reviewed[${i}].reviewer_type inválido: ${String(rt)}`);
          }
          if (typeof r.reviewed_at !== 'string' || Number.isNaN(Date.parse(r.reviewed_at))) {
            errors.push(`${path}.reviewed[${i}].reviewed_at inválido`);
          }
          if (typeof r.reviewer_id !== 'string' || r.reviewer_id.length === 0) {
            errors.push(`${path}.reviewed[${i}].reviewer_id obrigatório`);
          }
        }
      }
    }
  }
}

function validateVote(v: unknown, errors: string[], path: string): void {
  if (!isRecord(v)) {
    errors.push(`${path} deve ser um objeto`);
    return;
  }
  const value = v.value as string;
  if (typeof value !== 'string' || !VOTE_VALUES.includes(value as never)) {
    errors.push(`${path}.value inválido: ${String(value)}`);
    return;
  }
  const absence = v.absence_type as string | null | undefined;
  if (value === 'sim' || value === 'nao' || value === 'abstencao') {
    if (absence !== null && absence !== undefined) {
      errors.push(`${path}.absence_type deve ser null para value=${value}`);
    }
  } else if (value === 'ausente' || value === 'obstrucao') {
    if (typeof absence !== 'string' || !ABSENCE_TYPES.includes(absence as never)) {
      errors.push(`${path}.absence_type obrigatório (${ABSENCE_TYPES.join('|')}) para value=${value}`);
    }
  }
  if (typeof v.deputy_id !== 'string' || v.deputy_id.length < 3) {
    errors.push(`${path}.deputy_id inválido`);
  }
  if (typeof v.proposition_version_id !== 'string' || v.proposition_version_id.length < 3) {
    errors.push(`${path}.proposition_version_id inválido`);
  }
  if (typeof v.recorded_at !== 'string' || Number.isNaN(Date.parse(v.recorded_at))) {
    errors.push(`${path}.recorded_at inválido`);
  }
  if (typeof v.source !== 'string' || !HTTP_URL.test(v.source)) {
    errors.push(`${path}.source inválida`);
  }
}

export function validateImpactContract(input: unknown): ValidationResult {
  const errors: string[] = [];
  if (!isRecord(input)) {
    return { ok: false, errors: ['impact_matrix deve ser um objeto'] };
  }

  const { schema_version, methodology_version, severity, structural_type, assessments, review_status } =
    input as unknown as ImpactMatrixInput;

  if (typeof schema_version !== 'string' || !SEMVER.test(schema_version)) {
    errors.push(`schema_version deve ser semver (x.y.z): ${String(schema_version)}`);
  }
  if (typeof methodology_version !== 'string' || !SEMVER.test(methodology_version)) {
    errors.push(`methodology_version obrigatória no formato semver: ${String(methodology_version)}`);
  }
  if (typeof severity !== 'number' || severity < 1 || severity > 5) {
    errors.push(`severity fora da faixa 1..5: ${String(severity)}`);
  }
  if (typeof structural_type !== 'string' || !STRUCTURAL_TYPES.includes(structural_type as never)) {
    errors.push(`structural_type inválido: ${String(structural_type)}`);
  }
  if (typeof review_status !== 'string' || !REVIEW_STATUSES.includes(review_status as never)) {
    errors.push(`review_status inválido: ${String(review_status)}`);
  }
  if (!Array.isArray(assessments)) {
    errors.push('assessments deve ser array');
  } else {
    const seen = new Set<string>();
    for (const [i, a] of assessments.entries()) {
      const path = `assessments[${i}]`;
      validateAssessment(a, errors, path);
      if (isRecord(a)) {
        const g = a.group as string;
        if (seen.has(g)) errors.push(`${path}.group duplicado: ${g}`);
        seen.add(g);
      }
    }
  }

  const votes = (input as unknown as ImpactMatrixInput).votes;
  if (votes !== undefined) {
    if (!Array.isArray(votes)) {
      errors.push('votes deve ser array');
    } else {
      for (const [i, v] of votes.entries()) validateVote(v, errors, `votes[${i}]`);
    }
  }

  return { ok: errors.length === 0, errors };
}
