import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function DataFreshness({
  updatedAt,
  snapshotCreatedAt,
  snapshotScope,
  source = 'supabase'
}: {
  updatedAt: number;
  snapshotCreatedAt?: string | null;
  snapshotScope?: string | null;
  source?: 'supabase' | 'snapshot';
}) {
  const isOnline = useOnlineStatus();
  const hasTimestamp = updatedAt > 0;
  const hasSnapshotTimestamp = Boolean(snapshotCreatedAt);

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] text-[var(--color-muted-ink)]"
    >
      <span>
        <span aria-hidden="true">{isOnline ? '●' : '○'}</span> {isOnline ? 'online' : 'offline'}
      </span>

      {hasTimestamp && (
        <span>
          dados consultados em{' '}
          {new Intl.DateTimeFormat('pt-BR', {
            dateStyle: 'short',
            timeStyle: 'short'
          }).format(new Date(updatedAt))}
        </span>
      )}

      {source === 'snapshot' && (
        <span>
          fallback oficial validado
          {snapshotScope ? ` (${snapshotScope})` : ''}
          {hasSnapshotTimestamp && (
            <>
              {' '}em{' '}
              {new Intl.DateTimeFormat('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short'
              }).format(new Date(snapshotCreatedAt as string))}
            </>
          )}
        </span>
      )}

      {!isOnline && (
        <strong className="text-[var(--color-factcheck)]">
          dados não serão atualizados até a conexão voltar
        </strong>
      )}
    </div>
  );
}
