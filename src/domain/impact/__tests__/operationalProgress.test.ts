import { describe, expect, it } from 'vitest';
import {
  OPERATIONAL_PROGRESS_SCHEMA_VERSION,
  isOperationalProgressFresh,
} from '../operationalProgress';

describe('operational progress contract', () => {
  it('declares the versioned Supabase snapshot contract', () => {
    expect(OPERATIONAL_PROGRESS_SCHEMA_VERSION).toBe('1.0.0');
  });

  it('marks stale snapshots instead of presenting them as current', () => {
    const snapshot = {
      schema_version: OPERATIONAL_PROGRESS_SCHEMA_VERSION,
      houses: [],
      shared: {
        pendingDispositions: null,
        approvedDispositions: null,
        pendingMatrices: null,
        approvedMatrices: null,
        assessments: null,
        publishedClaims: null,
      },
      observed_at: '2026-09-17T12:00:00.000Z',
      source: 'supabase' as const,
      stale_after_seconds: 300,
    };
    expect(isOperationalProgressFresh(snapshot, Date.parse('2026-09-17T12:04:59.000Z'))).toBe(true);
    expect(isOperationalProgressFresh(snapshot, Date.parse('2026-09-17T12:05:01.000Z'))).toBe(false);
  });
});
