import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
            in: vi.fn().mockResolvedValue({ data: claims, error: claimsError }),
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

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('mapCandidate', () => {
  const baseRow = {
    id: 'test-id',
    slug: 'test_candidate_1234',
    tse_candidate_id: '210000000001',
    full_name: 'Test Candidate',
    party: 'NOVO',
    ballot_number: 1234,
    position: 'deputado_federal',
    photo_url: null,
    photo_source_url: null,
  };

  it('maps deputado_federal position correctly', async () => {
    const { mapCandidate } = await import('../candidates');
    const result = mapCandidate(baseRow);
    expect(result.position).toBe('deputado_federal');
    expect(result.position_label).toBe('Deputado Federal');
  });

  it('maps deputado_estadual position correctly', async () => {
    const { mapCandidate } = await import('../candidates');
    const result = mapCandidate({ ...baseRow, position: 'deputado_estadual' });
    expect(result.position).toBe('deputado_estadual');
    expect(result.position_label).toBe('Deputado Estadual');
  });

  it('maps unknown position to outro', async () => {
    const { mapCandidate } = await import('../candidates');
    const result = mapCandidate({ ...baseRow, position: 'prefeito' });
    expect(result.position).toBe('outro');
  });

  it('handles null ballot_number', async () => {
    const { mapCandidate } = await import('../candidates');
    const result = mapCandidate({ ...baseRow, ballot_number: null });
    expect(result.ballot_number).toBeNull();
  });

  it('handles empty position string', async () => {
    const { mapCandidate } = await import('../candidates');
    const result = mapCandidate({ ...baseRow, position: '' });
    expect(result.position).toBe('outro');
  });

  it('preserva slug público e SQ_CANDIDATO no domínio', async () => {
    const { mapCandidate } = await import('../candidates');
    const result = mapCandidate(baseRow);

    expect(result.slug).toBe('test_candidate_210000000001');
    expect(result.tse_candidate_id).toBe('210000000001');
  });
});

describe('mapClaim', () => {
  const baseRow = {
    id: 'claim-1',
    candidate_id: 'candidate-1',
    category: 'historico_politico',
    content: 'Test claim content',
    confidence_score: 5,
    status: 'published',
    source_document_id: 'doc-1',
    source_references: {
      id: 'doc-1',
      source_name: 'TSE',
      source_category: 'oficial',
      url: 'https://example.com',
      fetched_at: '2026-07-30T00:00:00Z',
    },
  };

  it('maps single source_reference correctly', async () => {
    const { mapClaim } = await import('../candidates');
    const result = mapClaim(baseRow);
    expect(result.source_document).toMatchObject({
      id: 'doc-1',
      source_name: 'TSE',
      source_category: 'oficial',
      url: 'https://example.com',
    });
  });

  it('uses first element from source_references array', async () => {
    const { mapClaim } = await import('../candidates');
    const row = {
      ...baseRow,
      source_references: [
        { id: 'first', source_name: 'First', source_category: 'oficial', url: null, fetched_at: null },
        { id: 'second', source_name: 'Second', source_category: 'oficial', url: null, fetched_at: null },
      ],
    };
    const result = mapClaim(row);
    expect(result.source_document?.id).toBe('first');
  });

  it('handles null source_references', async () => {
    const { mapClaim } = await import('../candidates');
    const result = mapClaim({ ...baseRow, source_references: null });
    expect(result.source_document).toBeNull();
  });

  it('handles undefined source_references', async () => {
    const { mapClaim } = await import('../candidates');
    const { source_references, ...rowWithoutSources } = baseRow;
    const result = mapClaim(rowWithoutSources as typeof baseRow);
    expect(result.source_document).toBeNull();
  });

  it('clamps confidence_score to valid range', async () => {
    const { mapClaim } = await import('../candidates');
    const high = mapClaim({ ...baseRow, confidence_score: 10 });
    expect(high.confidence_score).toBe(5);

    const low = mapClaim({ ...baseRow, confidence_score: -1 });
    expect(low.confidence_score).toBe(1);

    const nullScore = mapClaim({ ...baseRow, confidence_score: null });
    expect(nullScore.confidence_score).toBe(1);
  });

  it('normalizes source_category', async () => {
    const { mapClaim } = await import('../candidates');
    const result = mapClaim({
      ...baseRow,
      source_references: { ...baseRow.source_references!, source_category: 'press' },
    });
    expect(result.source_document?.source_category).toBe('imprensa');
  });

  it('falls back to source_document_id when source_references id is null', async () => {
    const { mapClaim } = await import('../candidates');
    const result = mapClaim({
      ...baseRow,
      source_references: { ...baseRow.source_references!, id: null },
    });
    expect(result.source_document?.id).toBe('doc-1');
  });
});

describe('fetchPublishedClaims', () => {
  it('returns empty array for empty candidateIds', async () => {
    const { fetchPublishedClaims } = await import('../candidates');
    const result = await fetchPublishedClaims([]);
    expect(result).toEqual([]);
  });

  it('filters out non-published claims', async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'claims') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({
                data: [
                  { id: 'c1', candidate_id: 'cand-1', category: 'test', content: 'Pub', confidence_score: 3, status: 'published', source_document_id: null },
                  { id: 'c4', candidate_id: 'cand-1', category: 'test', content: 'Corr', confidence_score: 3, status: 'corrected', source_document_id: null },
                  { id: 'c2', candidate_id: 'cand-1', category: 'test', content: 'Draft', confidence_score: 3, status: 'draft', source_document_id: null },
                  { id: 'c3', candidate_id: 'cand-1', category: 'test', content: 'Pending', confidence_score: 3, status: 'pending_review', source_document_id: null },
                ],
                error: null,
              }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { fetchPublishedClaims } = await import('../candidates');
    const result = await fetchPublishedClaims(['cand-1']);
    expect(result.map((claim) => claim.id)).toEqual(['c1', 'c4']);
  });

  it('throws on supabase error', async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'claims') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              in: vi.fn().mockResolvedValue({ data: null, error: { message: 'error', code: 'PGRST200' } }),
            }),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { fetchPublishedClaims } = await import('../candidates');
    await expect(fetchPublishedClaims(['cand-1'])).rejects.toThrow();
  });
});

describe('fetchAllCandidates', () => {
  function staleOfficialRows(count = 69) {
    return Array.from({ length: count }, (_, index) => ({
      id: `stale-db-candidate-${index}`,
      full_name: `Candidata Defasada ${index}`,
      party: 'TSE',
      ballot_number: 1000 + index,
      position: 'deputado federal',
      photo_url: null,
      photo_source_url: null,
      tse_candidate_id: `2100001${String(index).padStart(5, '0')}`,
    }));
  }

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
    expect(
      warnSpy.mock.calls.some((call) =>
        String(call[0]).includes('Informações editoriais temporariamente indisponíveis.'),
      ),
    ).toBe(true);
    warnSpy.mockRestore();
  });

  it('não registra detalhes técnicos da falha de claims em produção', async () => {
    vi.stubEnv('DEV', false);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const claimsError = { code: 'PGRST200', message: 'relationship error' };
    mockSupabase({ claimsError });

    const { fetchAllCandidates, wasLastClaimsFetchDegraded } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result).toHaveLength(1);
    expect(wasLastClaimsFetchDegraded()).toBe(true);
    expect(warnSpy).toHaveBeenCalledWith('Informações editoriais temporariamente indisponíveis.');
    expect(warnSpy).not.toHaveBeenCalledWith(
      'Informações editoriais temporariamente indisponíveis.',
      claimsError
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

  it('usa snapshot quando supabase retorna 500', async () => {
    mockSupabase({ candidatesError: { message: 'Internal Server Error', code: '500' } });

    const {
      fetchAllCandidates,
      getLastCandidatesFetchDiagnostic,
      wasLastCandidatesFetchFromSnapshot,
    } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((c) => c.id === 'db-candidate-1')).toBe(false);
    expect(wasLastCandidatesFetchFromSnapshot()).toBe(true);
    expect(getLastCandidatesFetchDiagnostic()).toMatch(/Internal Server Error/);
  });

  it('usa snapshot quando supabase retorna lista vazia', async () => {
    mockSupabase({ candidates: [] });

    const { fetchAllCandidates } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result.length).toBeGreaterThan(1);
  });

  it('usa snapshot versionado quando Supabase está populado porém defasado frente à fonte oficial', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockSupabase({ candidates: staleOfficialRows(69) });

    const { PUBLIC_CANDIDATES } = await import('../publicCandidates');
    const {
      fetchAllCandidates,
      wasLastCandidatesFetchFromSnapshot,
      getLastCandidatesFetchDiagnostic,
    } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result).toHaveLength(PUBLIC_CANDIDATES.length);
    expect(result.some((candidate) => candidate.tse_candidate_id === '210002533050')).toBe(false);
    expect(result.some((candidate) => candidate.tse_candidate_id === '210002533015')).toBe(true);
    expect(wasLastCandidatesFetchFromSnapshot()).toBe(true);
    expect(getLastCandidatesFetchDiagnostic()).toMatch(/Snapshot oficial mais completo/i);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/Snapshot oficial mais completo/));
    warnSpy.mockRestore();
  });

  it('usa snapshot quando Supabase ainda não tem fotos oficiais TSE', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { PUBLIC_CANDIDATES } = await import('../publicCandidates');
    mockSupabase({ candidates: staleOfficialRows(PUBLIC_CANDIDATES.length) });

    const {
      fetchAllCandidates,
      getLastCandidatesFetchDiagnostic,
      wasLastCandidatesFetchFromSnapshot,
    } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result.length).toBeGreaterThan(1);
    expect(wasLastCandidatesFetchFromSnapshot()).toBe(true);
    expect(getLastCandidatesFetchDiagnostic()).toMatch(/fotos TSE mais completo/i);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/fotos TSE mais/));
    warnSpy.mockRestore();
  });

  it('retorna claims vazias quando endpoint de claims retorna vazio', async () => {
    mockSupabase({ claims: [] });

    const { fetchAllCandidates, wasLastClaimsFetchDegraded } = await import('../candidates');
    const result = await fetchAllCandidates();

    const candidate = result.find((c) => c.id === 'db-candidate-1')!;
    expect(candidate.claims).toEqual([]);
    expect(wasLastClaimsFetchDegraded()).toBe(false);
  });

  it('corrige vice-governador sem reaproveitar summary de governador', async () => {
    mockSupabase({
      candidates: [{
        ...dbCandidates[0],
        id: 'vice-candidate',
        tse_candidate_id: '210002533354',
        full_name: 'NAFTALY PEREIRA DO NASCIMENTO',
        party: 'UP',
        ballot_number: 80,
        position: 'Governador',
      }],
      claims: [{
        id: 'vice-summary',
        candidate_id: 'vice-candidate',
        category: 'summary',
        content: 'Candidato(a) a Governador pelo UP, número 80. Registro de candidatura protocolado na Justiça Eleitoral (fonte: TSE).',
        confidence_score: 5,
        status: 'published',
        source_document_id: 'doc-1',
        source_references: null,
      }],
    });

    const { fetchAllCandidates } = await import('../candidates');
    const [candidate] = await fetchAllCandidates();

    expect(candidate.position).toBe('vice_governador');
    expect(candidate.position_label).toBe('Vice-governador');
    expect(candidate.claims[0]?.content).toContain('Vice-governador pelo UP');
    expect(candidate.claims[0]?.content).not.toContain('a Governador pelo UP');
  });

  it('usa snapshot quando supabase lança exceção de rede', async () => {
    supabaseMock.from.mockImplementation((table: string) => {
      if (table === 'candidates') {
        return {
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockRejectedValue(new Error('Network Error')),
          }),
        };
      }
      throw new Error(`Unexpected table: ${table}`);
    });

    const { fetchAllCandidates } = await import('../candidates');
    const result = await fetchAllCandidates();

    expect(result.length).toBeGreaterThan(1);
  });
});
