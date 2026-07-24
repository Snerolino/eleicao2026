export type SourceCategory = 'oficial' | 'imprensa' | 'fact_check' | 'outro';

export interface CandidateSummary {
  id: string;
  fullName: string;
  party: string;
  ballotNumber: number | null;
  position: string; // cargo: 'Governador' | 'Senador' | 'Deputado Federal' | ...
  photoUrl: string | null;
  photoSourceUrl: string | null;
}

export interface SourceRef {
  sourceName: string;
  sourceCategory: SourceCategory;
  sourceUrl?: string;
  confidenceScore: number; // 1-5, calculado no backend — nunca editar no frontend
  fetchedAt: string; // ISO date
}

export interface CandidateWithSummary extends CandidateSummary {
  summary?: {
    content: string;
  } & SourceRef;
}
