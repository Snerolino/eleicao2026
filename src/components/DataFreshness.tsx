import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function DataFreshness({
  updatedAt
}: {
  updatedAt: number;
}) {
  const isOnline = useOnlineStatus();
  const hasTimestamp = updatedAt > 0;

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.7rem] text-[var(--color-muted-ink)]"
    >
      <span>
        {isOnline ? '● online' : '○ offline'}
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

      {!isOnline && (
        <strong className="text-[var(--color-factcheck)]">
          dados não serão atualizados até a conexão voltar
        </strong>
      )}
    </div>
  );
}
