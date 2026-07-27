import { describe, it, expect } from 'vitest';
import { getSafeUrl } from '../url';

describe('getSafeUrl', () => {
  it('allows safe absolute URLs', () => {
    expect(getSafeUrl('https://example.com')).toBe('https://example.com');
    expect(getSafeUrl('http://example.com')).toBe('http://example.com');
    expect(getSafeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
    expect(getSafeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('allows safe relative URLs', () => {
    expect(getSafeUrl('/path/to/resource')).toBe('/path/to/resource');
    expect(getSafeUrl('#section')).toBe('#section');
    expect(getSafeUrl('?query=1')).toBe('?query=1');
  });

  it('blocks javascript: URLs', () => {
    expect(getSafeUrl('javascript:alert(1)')).toBeUndefined();
    expect(getSafeUrl('javascript:alert(1);')).toBeUndefined();
    expect(getSafeUrl('JAVASCRIPT:alert(1)')).toBeUndefined();
    expect(getSafeUrl(' javascript:alert(1)')).toBeUndefined();
  });

  it('blocks data: URLs', () => {
    expect(getSafeUrl('data:text/html,<script>alert(1)</script>')).toBeUndefined();
  });

  it('blocks vbscript: URLs', () => {
    expect(getSafeUrl('vbscript:msgbox("test")')).toBeUndefined();
  });

  it('handles empty or null values', () => {
    expect(getSafeUrl('')).toBeUndefined();
    expect(getSafeUrl(null)).toBeUndefined();
    expect(getSafeUrl(undefined)).toBeUndefined();
  });
});
