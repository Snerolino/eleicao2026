import type { CandidateWithClaims } from '@/types/election';

/** Gera CSV a partir da lista de candidatos e dispara download */
export function downloadCandidatesCSV(candidates: CandidateWithClaims[]): void {
  const headers = [
    'Nome', 'Partido', 'Número', 'Cargo', 'Total de verificações',
    'Resumo', 'Fonte principal', 'Foto'
  ];

  const sanitizeCSVField = (value: string | number | undefined | null) => {
    if (value === null || value === undefined) return '""';

    let strValue = value.toString();

    // Prevent CSV formula injection by checking leading characters
    if (/^[=+\-@\t\r]/.test(strValue)) {
      strValue = "'" + strValue;
    }

    // Escape double quotes and wrap in double quotes
    return `"${strValue.replace(/"/g, '""')}"`;
  };

  const rows = candidates.map((c) => [
    sanitizeCSVField(c.full_name),
    sanitizeCSVField(c.party),
    sanitizeCSVField(c.ballot_number),
    sanitizeCSVField(c.position_label),
    sanitizeCSVField(c.claims.length),
    sanitizeCSVField(c.claims[0]?.content),
    sanitizeCSVField(c.claims[0]?.source_document?.source_name),
    sanitizeCSVField(c.photo_url),
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
