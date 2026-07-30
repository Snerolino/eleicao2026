import { describe, expect, it } from 'vitest';
import { getSafeUrl } from '../url';

describe('getSafeUrl', () => {
  it('usa a sanitização pública única: apenas http/https', () => {
    expect(getSafeUrl('https://example.com/fonte')).toBe('https://example.com/fonte');
    expect(getSafeUrl('http://example.com/fonte')).toBe('http://example.com/fonte');
    expect(getSafeUrl('mailto:test@example.com')).toBeUndefined();
    expect(getSafeUrl('tel:+5551999999999')).toBeUndefined();
    expect(getSafeUrl('/path/to/resource')).toBeUndefined();
  });

  it('bloqueia payloads de bypass e normaliza inválidos para undefined', () => {
    expect(getSafeUrl('javascript:alert(1)')).toBeUndefined();
    expect(getSafeUrl('  \njavascript:alert(1)')).toBeUndefined();
    expect(getSafeUrl('\u0000java\u0000script:alert(1)')).toBeUndefined();
    expect(getSafeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(getSafeUrl('vbscript:msgbox("test")')).toBeUndefined();
    expect(getSafeUrl('')).toBeUndefined();
    expect(getSafeUrl('   ')).toBeUndefined();
    expect(getSafeUrl(null)).toBeUndefined();
    expect(getSafeUrl(undefined)).toBeUndefined();
  });
});
