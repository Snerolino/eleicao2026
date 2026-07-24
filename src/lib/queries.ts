import { supabase } from './supabase';
import type { CandidateWithSummary, SourceCategory } from '../types';

// Busca todos os candidatos e, de cada um, a claim category='summary' já publicada
// (RLS garante que 'pending_review'/'draft' não vêm com a anon key — ver architecture-v2.md §3).
// Para volume alto de candidatos, considerar depois uma view/materialized view no Postgres
// que já entregue só a claim de resumo mais recente por candidato; para o MVP, filtrar
// no cliente é suficiente e mais simples de auditar.
export async function fetchCandidatesWithSummary(): Promise<CandidateWithSummary[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select(`
      id, full_name, party, ballot_number, position, photo_url, photo_source_url,
      claims (
        category, content, confidence_score, status, published_at,
        raw_documents ( source_name, source_category, url, fetched_at )
      )
    `)
    .order('full_name');

  if (error) throw error;

  return (data ?? []).map((row: any) => {
    const summaryClaim = (row.claims ?? []).find(
      (c: any) => c.category === 'summary' && c.status === 'published'
    );

    return {
      id: row.id,
      fullName: row.full_name,
      party: row.party,
      ballotNumber: row.ballot_number,
      position: row.position,
      photoUrl: row.photo_url,
      photoSourceUrl: row.photo_source_url,
      summary: summaryClaim
        ? {
            content: summaryClaim.content,
            sourceName: summaryClaim.raw_documents?.source_name ?? 'Fonte não informada',
            sourceCategory: (summaryClaim.raw_documents?.source_category ?? 'outro') as SourceCategory,
            sourceUrl: summaryClaim.raw_documents?.url,
            confidenceScore: summaryClaim.confidence_score,
            fetchedAt: summaryClaim.raw_documents?.fetched_at ?? summaryClaim.published_at,
          }
        : undefined,
    };
  });
}

export function groupByCargo(
  candidates: CandidateWithSummary[]
): Record<string, CandidateWithSummary[]> {
  return candidates.reduce((acc, c) => {
    (acc[c.position] ??= []).push(c);
    return acc;
  }, {} as Record<string, CandidateWithSummary[]>);
}
