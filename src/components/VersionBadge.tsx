import { fetchReleaseMetadata } from '@/utils/releaseVersion';
import type { ReleaseMetadata } from '@/utils/releaseVersion';
import { useEffect, useState } from 'react';

export function VersionBadge() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    void fetchReleaseMetadata().then((meta: ReleaseMetadata | null) => {
      if (meta?.version) setVersion(`Versão ${meta.version}`);
    });
  }, []);

  if (!version) return null;

  return (
    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-[var(--color-muted-ink)]/60">
      {version}
    </span>
  );
}
