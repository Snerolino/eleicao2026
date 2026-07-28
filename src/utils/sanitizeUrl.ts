export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsedUrl = new URL(url, window.location.origin);

    // Only allow http, https, mailto, tel
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsedUrl.protocol)) {
      // It's safe if it's one of the allowed protocols
      return url;
    }

    // For anything else, return undefined or a safe fallback
    return undefined;
  } catch (e) {
    // If it fails to parse as a URL, it might be a relative path like "/foo"
    // The browser might resolve it differently, but to be absolutely safe against
    // javascript: and data: URIs, we can do a simple prefix check for relative urls

    // Remove leading/trailing whitespaces and control characters
    const trimmedUrl = url.replace(/^[\s\x00-\x1F]+/, '').trim();

    // Check for obvious malicious protocols if it wasn't caught by URL constructor
    // (e.g. if environment doesn't have URL constructor or acts weirdly)
    if (/^(?:javascript|data|vbscript):/i.test(trimmedUrl)) {
      return undefined;
    }

    return trimmedUrl;
  }
}
