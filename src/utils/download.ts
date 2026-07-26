import type { CandidateWithClaims } from '@/types/election';

/** Gera CSV a partir da lista de candidatos e dispara download */
export function downloadCandidatesCSV(candidates: CandidateWithClaims[]): void {
  const headers = [
    'Nome', 'Partido', 'Número', 'Cargo', 'Total de verificações',
    'Resumo', 'Fonte principal', 'Foto'
  ];
  const rows = candidates.map((c) => [
    `"${c.full_name.replace(/"/g, '""')}"`,
    `"${c.party.replace(/"/g, '""')}"`,
    c.ballot_number?.toString() ?? '',
    `"${c.position_label}"`,
    c.claims.length.toString(),
    `"${c.claims[0]?.content?.replace(/"/g, '""') ?? ''}"`,
    `"${c.claims[0]?.source_document?.source_name?.replace(/"/g, '""') ?? ''}"`,
    c.photo_url ?? '',
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `candidatos-rs-2026-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
