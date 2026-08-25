// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('auth-editor-bootstrap script', () => {
  it('existe e é um módulo Node válido', () => {
    const scriptPath = resolve(import.meta.dirname, '../auth-editor-bootstrap.mjs');
    expect(existsSync(scriptPath)).toBe(true);
    expect(() => import(`file://${scriptPath}`)).not.toThrow();
  });
});
