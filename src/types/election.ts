export type Position =
  | 'presidente'
  | 'governador'
  | 'vice_governador'
  | 'senador'
  | 'deputado_federal'
  | 'deputado_estadual'
  | 'outro';

export type SourceCategory = 'oficial' | 'imprensa' | 'fact_check' | 'outro';

export type ClaimStatus =
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'corrected'
  | 'retracted';

export type ConfidenceLevel =
  | 'verificado'
  | 'parcialmente_verificado'
  | 'nao_confirmado';

export interface SourceReference {
  id: string | null;
  source_name: string;
  source_category: SourceCategory;
  url: string | null;
  fetched_at: string | null;
}

export interface Claim {
  id: string;
  candidate_id: string;
  category: string;
  content: string;
  confidence_score: 1 | 2 | 3 | 4 | 5;
  status: ClaimStatus;
  source_document_id: string | null;
  source_document: SourceReference | null;
  source_text?: string | null;
  source_url?: string | null;
  published_at?: string | null;
}

export interface Candidate {
  id: string;
  slug?: string | null;
  full_name: string;
  party: string;
  ballot_number: string | number | null;
  position: Position;
  position_label: string;
  photo_url: string | null;
  photo_source_url: string | null;
  ballot_name?: string | null;
  tse_candidate_id?: string | null;
  state?: string | null;
  election_year?: number;
  registration_status?: string | null;
  gender?: string | null;
  race?: string | null;
  indigenous_ethnicity?: string | null;
}

export interface CandidateNominalVote {
  house: 'alrs' | 'camara' | 'senado' | string;
  proposition_id: string;
  title: string;
  vote_value: 'sim' | 'nao' | 'abstencao' | 'ausente' | 'obstrucao' | string;
  date: string;
  source_url: string;
  source_label: string;
  assessment_group?: string | null;
  impact_direction?: 'positive' | 'negative' | 'mixed' | 'unclear' | null;
  defending_vote?: 'sim' | 'nao' | null;
  textual_defending_vote?: 'sim' | 'nao' | null;
  event_defending_vote?: 'sim' | 'nao' | null;
  score_eligible?: boolean;
  vote_attribution_status?: string | null;
  score_withholding_reason?: string | null;
  severity?: number;
  structural_type?: 'structural' | 'budgetary' | 'symbolic';
  confidence?: number;
}

export interface DeclaredAssetItem {
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
}

export interface AssetYearDeclaration {
  ano: number;
  total: number;
  itens_count: number;
  itens: DeclaredAssetItem[];
  por_categoria: Record<string, number>;
}

export interface AssetEvolutionAudit {
  ano_base: number;
  ano_anterior: number;
  total_base: number;
  total_anterior: number;
  variacao_nominal: number;
  variacao_percentual: number;
  ipca_acumulado_periodo?: number;
  acima_da_inflacao?: boolean;
  resumo: string;
}

export interface CandidateDeclaredAssets {
  tse_candidate_id: string;
  ano_recente: number;
  total_declarado: number;
  declaracoes_por_ano: AssetYearDeclaration[];
  evolucao_percentual?: number | null;
  evolucao_nominal?: number | null;
  auditoria_evolucao?: AssetEvolutionAudit | null;
}

export interface CandidateCategoryScoreSnapshot {
  group: string;
  score: number;
  evaluated_propositions_count: number;
  divergences_count?: number;
  favorable_votes?: number;
  unfavorable_votes?: number;
}

export interface CandidateWithClaims extends Candidate {
  claims: Claim[];
  voting_profiles?: VotingProfile[];
  nominal_votes?: CandidateNominalVote[];
  declared_assets?: CandidateDeclaredAssets | null;
  category_scores?: CandidateCategoryScoreSnapshot[];
}

export interface VotingProfile {
  house: string;
  total_votes: number;
  votos_sim: number;
  votos_nao: number;
  votos_abstencao: number;
  votos_ausente: number;
  votos_obstrucao: number;
  /** Saldo descritivo das escolhas nominais; não é score de impacto. */
  nominal_balance: number;
}

export interface VotingHouseMetadata {
  label: string;
  sourceLabel: string;
  sourceUrl: string | null;
}

export const VOTING_HOUSE_METADATA: Record<string, VotingHouseMetadata> = {
  camara: {
    label: 'Câmara dos Deputados',
    sourceLabel: 'Câmara dos Deputados · Votações nominais',
    sourceUrl: 'https://www.camara.leg.br/deputados',
  },
  alrs: {
    label: 'Assembleia Legislativa do RS',
    sourceLabel: 'Portal da Transparência ALRS · Votos em Plenário',
    sourceUrl: 'https://transparencia.al.rs.gov.br/parlamentares/votos-plenario',
  },
  senado: {
    label: 'Senado Federal',
    sourceLabel: 'Senado Federal · Votações nominais',
    sourceUrl: 'https://www25.senado.leg.br/web/atividade/votacoes-nominais',
  },
  camara_municipal: {
    label: 'Câmara Municipal',
    sourceLabel: 'Fonte institucional da Câmara Municipal',
    sourceUrl: null,
  },
};

export function votingHouseMetadata(house: string): VotingHouseMetadata {
  return VOTING_HOUSE_METADATA[house] ?? {
    label: house,
    sourceLabel: `Fonte institucional · ${house}`,
    sourceUrl: null,
  };
}

export const POSITION_ORDER: Position[] = [
  'presidente',
  'governador',
  'vice_governador',
  'senador',
  'deputado_federal',
  'deputado_estadual'
];

export const POSITION_LABEL: Record<Position, string> = {
  presidente: 'Presidente',
  governador: 'Governador',
  vice_governador: 'Vice-governador',
  senador: 'Senador',
  deputado_federal: 'Deputado Federal',
  deputado_estadual: 'Deputado Estadual',
  outro: 'Outros cargos'
};

export const DOSSIER_SECTIONS = [
  {
    key: 'historico_politico',
    label: 'Histórico político',
    categoryMatchers: [
      'historico_politico',
      'historico',
      'history',
      'political_history'
    ],
    categoryMatchersSet: new Set([
      'historico_politico',
      'historico',
      'history',
      'political_history'
    ])
  },
  {
    key: 'plataforma',
    label: 'Plataforma',
    categoryMatchers: [
      'plataforma',
      'platform',
      'propostas',
      'proposals'
    ],
    categoryMatchersSet: new Set([
      'plataforma',
      'platform',
      'propostas',
      'proposals'
    ])
  },
  {
    key: 'reputacao',
    label: 'Reputação e escrutínio',
    categoryMatchers: [
      'reputacao',
      'reputation',
      'escrutinio',
      'scrutiny',
      'reputacao_escrutinio'
    ],
    categoryMatchersSet: new Set([
      'reputacao',
      'reputation',
      'escrutinio',
      'scrutiny',
      'reputacao_escrutinio'
    ])
  }
] as const;
