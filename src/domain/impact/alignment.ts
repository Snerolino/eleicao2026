/**
 * Alinhamento como função pura (GUIA §15).
 * deriveAlignment(vote, assessment) → alinhamento do parlamentar com o
 * voto que "defende" o grupo na metodologia.
 *
 * Retornos:
 *   a_favor | contra | neutro_declarado | omissao_estrategica |
 *   omissao_coordenada | sem_dado | nao_avaliavel
 */

export type Alignment =
  | 'a_favor'
  | 'contra'
  | 'neutro_declarado'
  | 'omissao_estrategica'
  | 'omissao_coordenada'
  | 'sem_dado'
  | 'nao_avaliavel';

export interface AlignmentVote {
  value: 'sim' | 'nao' | 'abstencao' | 'ausente' | 'obstrucao';
  absence_type?: 'estrategica' | 'obstrucao_coordenada' | 'justificada' | null;
}

export interface AlignmentAssessment {
  impact_direction: 'positive' | 'negative' | 'mixed' | 'unclear';
  defending_vote?: 'sim' | 'nao' | null;
}

/**
 * Deriva o alinhamento de um voto factual contra a avaliação metodológica.
 * Regras v1:
 * - defending_vote null (unclear/mixed sem saldo) → nao_avaliavel;
 * - ausência justificada → sem_dado (voto não utilizável);
 * - ausência estratégica → omissao_estrategica;
 * - ausência com obstrução coordenada → omissao_coordenada;
 * - abstenção → neutro_declarado;
 * - ausência de voto → sem_dado.
 */
export function deriveAlignment(
  vote: AlignmentVote | null | undefined,
  assessment: AlignmentAssessment,
): Alignment {
  if (!vote) return 'sem_dado';

  const defending = assessment.defending_vote;
  if (defending === null || defending === undefined) {
    return 'nao_avaliavel';
  }

  switch (vote.value) {
    case 'sim':
      return defending === 'sim' ? 'a_favor' : 'contra';
    case 'nao':
      return defending === 'nao' ? 'a_favor' : 'contra';
    case 'abstencao':
      return 'neutro_declarado';
    case 'ausente':
    case 'obstrucao': {
      const absence = vote.absence_type;
      if (absence === 'estrategica') return 'omissao_estrategica';
      if (absence === 'obstrucao_coordenada') return 'omissao_coordenada';
      if (absence === 'justificada') return 'sem_dado';
      return 'sem_dado';
    }
    default:
      return 'sem_dado';
  }
}
