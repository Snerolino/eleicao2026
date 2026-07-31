// @vitest-environment node

import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = 'supabase/migrations/20260730133000_h3_2_upsert_idempotente_retirada_segura.sql';

describe('H3.2 migration upsert idempotente', () => {
  it('classifica ações explicitamente e não usa comparação ampla candidates.*', () => {
    const sql = readFileSync(migration, 'utf8');

    expect(sql).toContain('inserted');
    expect(sql).toContain('updated');
    expect(sql).toContain('unchanged');
    expect(sql).toContain('withdrawn_candidate');
    expect(sql).toContain('needs_review');
    expect(sql).not.toMatch(/candidates\.\*\s+is\s+distinct\s+from/i);
  });

  it('preserva first_seen_at e evita retirada automática sem cobertura completa', () => {
    const sql = readFileSync(migration, 'utf8');

    expect(sql).toMatch(/first_seen_at\s*=\s*public\.candidates\.first_seen_at/i);
    expect(sql).toMatch(/coverage_complete/i);
    expect(sql).toMatch(/missing_from_partial_dataset/i);
    expect(sql).toMatch(/missing_from_complete_dataset/i);
  });
});
