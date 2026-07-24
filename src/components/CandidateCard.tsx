import { SourceReference } from './SourceReference';
import type { CandidateWithSummary } from '../types';

export function CandidateCard({
  id,
  fullName,
  party,
  ballotNumber,
  photoUrl,
  photoSourceUrl,
  summary,
}: CandidateWithSummary) {
  return (
    <article className="flex flex-col gap-2 rounded-md border border-neutral-200 bg-white p-4">
      <div className="relative">
        <img
          src={photoUrl ?? '/placeholder-candidate.svg'}
          alt={`Foto de ${fullName}`}
          loading="lazy"
          className="h-40 w-full rounded-sm object-cover"
        />
        {photoSourceUrl && (
          <a
            href={photoSourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-1 right-1 rounded-sm bg-black/50 px-1 text-[10px] text-white"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            fonte da foto
          </a>
        )}
      </div>

      <h3 className="text-lg" style={{ fontFamily: 'var(--font-display)' }}>
        {fullName}
      </h3>
      <p className="text-sm text-neutral-600">
        {party}
        {ballotNumber ? ` · nº ${ballotNumber}` : ''}
      </p>

      {summary && (
        <>
          <p className="text-sm">{summary.content}</p>
          <SourceReference {...summary} />
        </>
      )}

      <a
        href={`/candidato/${id}`}
        className="mt-2 text-sm font-medium"
        style={{ color: 'var(--color-institutional)' }}
      >
        Ver dossiê completo →
      </a>
    </article>
  );
}
