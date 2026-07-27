/**
 * Sanitizes a URL for use in href or src attributes.
 * Prevents XSS attacks via javascript:, vbscript:, data:, etc.
 */
export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  try {
    // Use a dummy base URL to parse relative URLs
    const parsedUrl = new URL(url, 'http://localhost');

    // Allow only safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (safeProtocols.includes(parsedUrl.protocol)) {
      return url;
    }

    // If it's an unsafe protocol, return undefined
    return undefined;
  } catch (e) {
    return undefined;
  }
}
