import { describe, it, expect } from 'vitest';
import { sanitizeUrl } from '../sanitize';

describe('sanitizeUrl', () => {
  it('allows http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('allows mailto URLs', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
  });

  it('allows tel URLs', () => {
    expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('allows relative URLs', () => {
    expect(sanitizeUrl('/path/to/resource')).toBe('/path/to/resource');
    expect(sanitizeUrl('path/to/resource')).toBe('path/to/resource');
    expect(sanitizeUrl('#section')).toBe('#section');
    expect(sanitizeUrl('?query=1')).toBe('?query=1');
  });

  it('blocks javascript URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('  javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('\x01javascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('\njavascript:alert(1)')).toBe('about:blank');
    expect(sanitizeUrl('JaVaScRiPt:alert(1)')).toBe('about:blank');
  });

  it('blocks vbscript URLs', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('about:blank');
  });

  it('blocks data URLs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('about:blank');
  });

  it('handles null and undefined', () => {
    expect(sanitizeUrl(null)).toBeUndefined();
    expect(sanitizeUrl(undefined)).toBeUndefined();
    expect(sanitizeUrl('')).toBeUndefined();
  });
});
