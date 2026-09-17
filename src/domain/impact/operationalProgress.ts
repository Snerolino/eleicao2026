export const OPERATIONAL_PROGRESS_SCHEMA_VERSION = '1.0.0' as const;

export type LegislativeHouse = 'alrs' | 'camara' | 'senado';

export type HouseProgress = {
  house: LegislativeHouse;
  events: number | null;
  votes: number | null;
  profiles: number | null;
  error?: string;
};

export type SharedEditorialProgress = {
  pendingDispositions: number | null;
  approvedDispositions: number | null;
  pendingMatrices: number | null;
  approvedMatrices: number | null;
  assessments: number | null;
  publishedClaims: number | null;
};

export type OperationalProgressSnapshot = {
  schema_version: typeof OPERATIONAL_PROGRESS_SCHEMA_VERSION;
  houses: HouseProgress[];
  shared: SharedEditorialProgress;
  observed_at: string;
  source: 'supabase';
  stale_after_seconds: number;
};

export function isOperationalProgressFresh(snapshot: OperationalProgressSnapshot, now = Date.now()) {
  const observed = Date.parse(snapshot.observed_at);
  return Number.isFinite(observed) && now - observed <= snapshot.stale_after_seconds * 1000;
}
