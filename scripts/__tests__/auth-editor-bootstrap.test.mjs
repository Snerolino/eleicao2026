// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('auth-editor-bootstrap script', () => {
  it('existe e é um módulo Node válido', async () => {
    const scriptPath = resolve(import.meta.dirname, '../auth-editor-bootstrap.mjs');
    expect(existsSync(scriptPath)).toBe(true);
    try {
      await import(`file://${scriptPath}`);
    } catch (e) {
      // The script executes immediately and requires TTY/env vars. We just want to ensure it parses.
      expect(e.message).toContain('são obrigatórios');
    }
  });
});
