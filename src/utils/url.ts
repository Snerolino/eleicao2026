/**
 * Sanitizes a URL by filtering out potentially dangerous protocols.
 * Allows normal http(s) URLs, relative URLs, mailto, tel, etc.
 * Filters out javascript:, data:, and vbscript: protocols.
 */
export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Remove control characters that could bypass URL parsing in some contexts
  const cleanUrl = trimmed.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

  try {
    // Parse with a dummy base URL so that relative URLs don't throw
    const parsed = new URL(cleanUrl, 'http://fallback.com');
    const protocol = parsed.protocol.toLowerCase();

    if (['javascript:', 'data:', 'vbscript:'].includes(protocol)) {
      return undefined;
    }

    return trimmed;
  } catch {
    // Fallback manual check if URL parsing fails for some reason
    const lower = cleanUrl.toLowerCase();
    if (
      lower.startsWith('javascript:') ||
      lower.startsWith('data:') ||
      lower.startsWith('vbscript:')
    ) {
      return undefined;
    }
    return trimmed;
  }
}
