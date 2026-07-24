import type { CandidateWithClaims } from '@/types/election';

const DEMO_FETCHED_AT = '2026-07-24T00:00:00.000Z';

// Dados estritamente fictícios. O banner persistente identifica o modo de teste.
export const MOCK_CANDIDATES: CandidateWithClaims[] = [
  {
    id: 'demo-gov-1',
    full_name: 'Candidata Exemplo A',
    party: 'PARTIDO A',
    ballot_number: '10',
    position: 'governador',
    position_label: 'Governador',
    photo_url: null,
    photo_source_url: null,
    claims: [
      {
        id: 'demo-claim-summary-1',
        candidate_id: 'demo-gov-1',
        category: 'summary',
        content:
          'Resumo fictício exibido apenas porque o Supabase não está configurado.',
        confidence_score: 4,
        status: 'published',
        source_document_id: 'demo-doc-1',
        source_document: {
          id: 'demo-doc-1',
          source_name: 'Documento fictício de demonstração',
          source_category: 'oficial',
          url: null,
          fetched_at: DEMO_FETCHED_AT
        }
      },
      {
        id: 'demo-claim-history-1',
        candidate_id: 'demo-gov-1',
        category: 'historico_politico',
        content:
          'Conteúdo fictício usado para demonstrar a estrutura do dossiê.',
        confidence_score: 3,
        status: 'published',
        source_document_id: 'demo-doc-2',
        source_document: {
          id: 'demo-doc-2',
          source_name: 'Veículo fictício de demonstração',
          source_category: 'imprensa',
          url: null,
          fetched_at: DEMO_FETCHED_AT
        }
      }
    ]
  },
  {
    id: 'demo-sen-1',
    full_name: 'Candidato Exemplo B',
    party: 'PARTIDO B',
    ballot_number: '200',
    position: 'senador',
    position_label: 'Senador',
    photo_url: null,
    photo_source_url: null,
    claims: []
  },
  {
    id: 'demo-df-1',
    full_name: 'Candidato Exemplo C',
    party: 'PARTIDO C',
    ballot_number: '3000',
    position: 'deputado_federal',
    position_label: 'Deputado Federal',
    photo_url: null,
    photo_source_url: null,
    claims: []
  },
  {
    id: 'demo-de-1',
    full_name: 'Candidata Exemplo D',
    party: 'PARTIDO D',
    ballot_number: '40000',
    position: 'deputado_estadual',
    position_label: 'Deputado Estadual',
    photo_url: null,
    photo_source_url: null,
    claims: []
  }
];
