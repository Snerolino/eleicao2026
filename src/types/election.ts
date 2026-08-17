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

export interface CandidateWithClaims extends Candidate {
  claims: Claim[];
  voting_profiles?: VotingProfile[];
}

export interface VotingProfile {
  house: string;
  total_votes: number;
  votos_sim: number;
  votos_nao: number;
  votos_abstencao: number;
  votos_ausente: number;
  votos_obstrucao: number;
  profile_score: number;
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
