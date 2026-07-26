import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../url';

describe('sanitizeUrl', () => {
  it('returns undefined for empty, null or undefined input', () => {
    expect(sanitizeUrl(null)).toBeUndefined();
    expect(sanitizeUrl(undefined)).toBeUndefined();
    expect(sanitizeUrl('')).toBeUndefined();
    expect(sanitizeUrl('   ')).toBeUndefined();
  });

  it('allows safe HTTP/HTTPS URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('https://example.com/path?query=1#hash')).toBe('https://example.com/path?query=1#hash');
  });

  it('allows safe relative URLs', () => {
    expect(sanitizeUrl('/relative/path')).toBe('/relative/path');
    expect(sanitizeUrl('relative/path')).toBe('relative/path');
    expect(sanitizeUrl('#hash')).toBe('#hash');
    expect(sanitizeUrl('?query=1')).toBe('?query=1');
  });

  it('allows safe protocols like mailto and tel', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeUrl('tel:1234567890')).toBe('tel:1234567890');
  });

  it('blocks dangerous javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeUndefined();
    expect(sanitizeUrl(' javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('\tjavascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('java\nscript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('java\rscript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('java\tscript:alert(1)')).toBeUndefined();
  });

  it('blocks dangerous data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(sanitizeUrl('DATA:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('blocks dangerous vbscript: URLs', () => {
    expect(sanitizeUrl('vbscript:msgbox("hello")')).toBeUndefined();
  });
});
