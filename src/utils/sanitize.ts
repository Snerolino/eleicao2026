/**
 * Sanitizes a URL for use in href or src attributes.
 * Prevents XSS attacks via javascript:, vbscript:, data:, etc.
 */
export { sanitizeUrl } from './sanitizeUrl';
