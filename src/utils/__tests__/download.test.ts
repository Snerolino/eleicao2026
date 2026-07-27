import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadCandidatesCSV } from '../download';
import type { CandidateWithClaims } from '@/types/election';

describe('downloadCandidatesCSV', () => {
  let createObjectURLMock: any;
  let revokeObjectURLMock: any;
  let createElementMock: any;
  let anchorMock: any;

  let originalCreateObjectURL: any;
  let originalRevokeObjectURL: any;
  let originalDocument: any;

  beforeEach(() => {
    // Save originals
    originalCreateObjectURL = global.URL.createObjectURL;
    originalRevokeObjectURL = global.URL.revokeObjectURL;
    originalDocument = global.document;

    // Mock URL methods
    createObjectURLMock = vi.fn().mockReturnValue('blob:mock-url');
    revokeObjectURLMock = vi.fn();
    global.URL.createObjectURL = createObjectURLMock;
    global.URL.revokeObjectURL = revokeObjectURLMock;

    // Mock document.createElement
    anchorMock = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    createElementMock = vi.fn().mockImplementation((tagName: string) => {
      if (tagName === 'a') return anchorMock as any;
      return {} as any;
    });

    // Mock global document
    (global as any).document = {
      createElement: createElementMock
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-04T12:00:00Z'));
  });

  afterEach(() => {
    // Restore originals
    global.URL.createObjectURL = originalCreateObjectURL;
    global.URL.revokeObjectURL = originalRevokeObjectURL;

    if (originalDocument === undefined) {
        delete (global as any).document;
    } else {
        global.document = originalDocument;
    }

    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('generates CSV and triggers download for empty list', async () => {
    downloadCandidatesCSV([]);

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURLMock.mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);

    const csvContent = await blobArg.text();
    expect(csvContent).toBe(
      'Nome,Partido,Número,Cargo,Total de verificações,Resumo,Fonte principal,Foto'
    );

    expect(createElementMock).toHaveBeenCalledWith('a');
    expect(anchorMock.href).toBe('blob:mock-url');
    expect(anchorMock.download).toBe('candidatos-rs-2026-2026-10-04.csv');
    expect(anchorMock.click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLMock).toHaveBeenCalledWith('blob:mock-url');
  });

  it('generates CSV and handles missing optional fields and quotes', async () => {
    const mockCandidates: CandidateWithClaims[] = [
      {
        id: '1',
        full_name: 'João "Silva"',
        party: 'PT "do B"',
        ballot_number: 13,
        position: 'governador',
        position_label: 'Governador',
        photo_url: 'http://example.com/photo.jpg',
        photo_source_url: null,
        claims: [
          {
            id: 'c1',
            candidate_id: '1',
            category: 'historico',
            content: 'Foi prefeito "excelente"',
            confidence_score: 5,
            status: 'published',
            source_document_id: 'd1',
            source_document: {
              id: 'd1',
              source_name: 'Jornal "Local"',
              source_category: 'imprensa',
              url: null,
              fetched_at: null,
            }
          }
        ]
      },
      {
        id: '2',
        full_name: 'Maria Santos',
        party: 'PSDB',
        ballot_number: null, // missing ballot number
        position: 'senador',
        position_label: 'Senador',
        photo_url: null, // missing photo
        photo_source_url: null,
        claims: [] // no claims
      }
    ];

    downloadCandidatesCSV(mockCandidates);

    expect(createObjectURLMock).toHaveBeenCalledTimes(1);
    const blobArg = createObjectURLMock.mock.calls[0][0] as Blob;
    const csvContent = await blobArg.text();

    const lines = csvContent.split('\n');
    expect(lines.length).toBe(3);

    // Check headers
    expect(lines[0]).toBe('Nome,Partido,Número,Cargo,Total de verificações,Resumo,Fonte principal,Foto');

    // Check first candidate (quotes properly escaped)
    expect(lines[1]).toBe(
      '"João ""Silva""","PT ""do B""",13,"Governador",1,"Foi prefeito ""excelente""","Jornal ""Local""",http://example.com/photo.jpg'
    );

    // Check second candidate (missing fields handled)
    expect(lines[2]).toBe(
      '"Maria Santos","PSDB",,"Senador",0,"","",'
    );
  });
});
