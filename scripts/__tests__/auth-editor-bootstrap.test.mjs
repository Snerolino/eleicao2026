// @vitest-environment node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('auth-editor-bootstrap script', () => {
  it('existe, usa sessão fora do repositório e não contém senha persistida', () => {
    const scriptPath = resolve(import.meta.dirname, '../auth-editor-bootstrap.mjs');
    expect(existsSync(scriptPath)).toBe(true);
    const source = readFileSync(scriptPath, 'utf8');
    expect(source).toContain('supabase-editor-session.json');
    expect(source).toContain('password_persisted: false');
    expect(source).not.toContain('writeFileSync(resolve(root');
  });
});
