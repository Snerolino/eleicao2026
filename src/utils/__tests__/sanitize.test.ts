import { describe, expect, it } from 'vitest';
import { sanitizeUrl } from '../sanitize';

describe('sanitizeUrl legacy export', () => {
  it('aponta para a política pública única: apenas http/https', () => {
    expect(sanitizeUrl('https://example.com/fonte')).toBe('https://example.com/fonte');
    expect(sanitizeUrl('http://example.com/fonte')).toBe('http://example.com/fonte');
    expect(sanitizeUrl('mailto:test@example.com')).toBeUndefined();
    expect(sanitizeUrl('tel:+5551999999999')).toBeUndefined();
    expect(sanitizeUrl('/path/to/resource')).toBeUndefined();
  });

  it('remove controles e bloqueia protocolos executáveis', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('  javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('\x01javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('\njavascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBeUndefined();
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('normaliza vazio/null/undefined para undefined', () => {
    expect(sanitizeUrl(null)).toBeUndefined();
    expect(sanitizeUrl(undefined)).toBeUndefined();
    expect(sanitizeUrl('')).toBeUndefined();
    expect(sanitizeUrl('   ')).toBeUndefined();
  });
});
