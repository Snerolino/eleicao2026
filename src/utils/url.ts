export function getSafeUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return url;
    }
    return undefined;
  } catch {
    // Fallback for relative URLs if necessary, though document sources should be absolute.
    if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
      return url;
    }
    return undefined;
  }
}
