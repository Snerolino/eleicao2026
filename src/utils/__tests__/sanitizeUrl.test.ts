import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../sanitizeUrl';
import { getSafeUrl } from '../url';

const safeUrlFunctions = [
  ['sanitizeUrl', sanitizeUrl],
  ['getSafeUrl', getSafeUrl],
] as const;

describe.each(safeUrlFunctions)('%s', (_name, safeUrl) => {
  it('permite apenas URLs públicas http e https', () => {
    expect(safeUrl('https://example.com/fonte?x=1#trecho')).toBe('https://example.com/fonte?x=1#trecho');
    expect(safeUrl('http://example.com/fonte')).toBe('http://example.com/fonte');
  });

  it('bloqueia protocolos não públicos e URLs relativas', () => {
    expect(safeUrl('mailto:test@example.com')).toBeUndefined();
    expect(safeUrl('tel:+5551999999999')).toBeUndefined();
    expect(safeUrl('/path/to/resource')).toBeUndefined();
    expect(safeUrl('path/to/resource')).toBeUndefined();
    expect(safeUrl('?query=param')).toBeUndefined();
    expect(safeUrl('#hash')).toBeUndefined();
    expect(safeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(safeUrl('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('remove caracteres de controle antes do parse e bloqueia bypasses de javascript', () => {
    expect(safeUrl('javascript:alert(1)')).toBeUndefined();
    expect(safeUrl('JAVASCRIPT:alert(1)')).toBeUndefined();
    expect(safeUrl('  \njavascript:alert(1)')).toBeUndefined();
    expect(safeUrl('\u0000java\u0000script:alert(1)')).toBeUndefined();
    expect(safeUrl('https://example.com/\u0000fonte')).toBe('https://example.com/fonte');
  });

  it('normaliza entradas inválidas para undefined', () => {
    expect(safeUrl('')).toBeUndefined();
    expect(safeUrl('   ')).toBeUndefined();
    expect(safeUrl(null)).toBeUndefined();
    expect(safeUrl(undefined)).toBeUndefined();
  });
});
