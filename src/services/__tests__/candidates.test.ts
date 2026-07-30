import { beforeEach, describe, expect, it, vi } from 'vitest';

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    from: vi.fn()
  }
}));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: supabaseMock
}));

const dbCandidates = [
  {
    id: 'db-candidate-1',
    full_name: 'Candidata Oficial',
    party: 'TSE',
    ballot_number: 1234,
    position: 'deputado federal',
    photo_url: null,
    photo_source_url: null
  }
];

function mockSupabase({
  candidates = dbCandidates,
  candidatesError = null,
  claims = [],
  claimsError = null
}: {
  candidates?: unknown[];
  candidatesError?: unknown;
  claims?: unknown[];
  claimsError?: unknown;
}) {
  supabaseMock.from.mockImplementation((table: string) => {
    if (table === 'candidates') {
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: candidates, error: candidatesError })
        })
      };
    }

    if (table === 'claims') {
      return {
        select: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: claims, error: claimsError })
          })
        })
      };
    }

    throw new Error(`Tabela inesperada: ${table}`);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchAllCandidates', () => {
  it('mantém candidatos oficiais quando claims falha', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockSupabase({ claimsError: { code: 'PGRST200', message: 'relationship error' } });

    const { fetchAllCandidates, wasLastClaimsFetchDegraded } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'db-candidate-1',
      full_name: 'Candidata Oficial',
      claims: []
    });
    expect(wasLastClaimsFetchDegraded()).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith(
      'Informações editoriais temporariamente indisponíveis.',
      expect.anything()
    );
    warnSpy.mockRestore();
  });

  it('usa source_references no mapeamento público de claims', async () => {
    mockSupabase({
      claims: [
        {
          id: 'claim-1',
          candidate_id: 'db-candidate-1',
          category: 'historico_politico',
          content: 'Claim publicada',
          confidence_score: 5,
          status: 'published',
          source_document_id: 'source-1',
          source_references: {
            id: 'source-1',
            source_name: 'Fonte pública',
            source_category: 'oficial',
            url: 'https://example.org/fonte',
            fetched_at: '2026-07-30T00:00:00Z'
          }
        }
      ]
    });

    const { fetchAllCandidates, wasLastClaimsFetchDegraded } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result).toHaveLength(1);
    expect(result[0].claims).toHaveLength(1);
    expect(result[0].claims[0].source_document).toMatchObject({
      id: 'source-1',
      source_name: 'Fonte pública',
      source_category: 'oficial'
    });
    expect(wasLastClaimsFetchDegraded()).toBe(false);
  });

  it('usa fallback somente quando candidates falha', async () => {
    mockSupabase({ candidates: [], candidatesError: { message: 'offline' } });

    const { fetchAllCandidates } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result.length).toBeGreaterThan(1);
    expect(result.some((candidate) => candidate.id === 'db-candidate-1')).toBe(false);
  });
});
