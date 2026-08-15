/**
 * Lê a versão do release a partir de /release.json (gerado no build por
 * scripts/generate-release-metadata.mjs). O arquivo é servido como asset
 * estático e contém { version, short_sha, built_at, snapshot: {...} }.
 */

export interface ReleaseMetadata {
  version: string;
  short_sha: string;
  built_at: string;
  snapshot?: {
    row_count?: number;
    sha256?: string;
    created_at?: string;
  };
}

let cache: ReleaseMetadata | null = null;

export async function loadReleaseMetadata(): Promise<ReleaseMetadata | null> {
  if (cache) return cache;
  try {
    const res = await fetch('release.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as ReleaseMetadata;
    cache = data;
    return data;
  } catch {
    return null;
  }
}

export { loadReleaseMetadata as fetchReleaseMetadata };
