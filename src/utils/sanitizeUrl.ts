export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];

    if (allowedProtocols.includes(parsed.protocol)) {
      return parsed.href;
    }
  } catch (e) {
    // URL parsing failed, assume unsafe or invalid
  }

  return null;
}
