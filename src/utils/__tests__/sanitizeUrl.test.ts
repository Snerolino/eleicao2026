import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../sanitizeUrl';

describe('sanitizeUrl', () => {
  it('allows http and https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('allows mailto and tel URLs', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('allows relative URLs', () => {
    expect(sanitizeUrl('/path/to/resource')).toBe('/path/to/resource');
    expect(sanitizeUrl('path/to/resource')).toBe('path/to/resource');
    expect(sanitizeUrl('?query=param')).toBe('?query=param');
    expect(sanitizeUrl('#hash')).toBe('#hash');
  });

  it('blocks javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('javascript:alert("XSS")')).toBeUndefined();
    expect(sanitizeUrl('JAVASCRIPT:alert(1)')).toBeUndefined();
    expect(sanitizeUrl('  javascript:alert(1)')).toBeUndefined();
  });

  it('blocks data: URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
    expect(sanitizeUrl('DATA:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('blocks vbscript: URLs', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBeUndefined();
  });

  it('handles empty or null values', () => {
    expect(sanitizeUrl('')).toBeUndefined();
    expect(sanitizeUrl(null as any)).toBeUndefined();
    expect(sanitizeUrl(undefined)).toBeUndefined();
  });
});
