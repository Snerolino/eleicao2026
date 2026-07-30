const CONTROL_CHARS = /[\u0000-\u001F\u007F-\u009F]/g;
const PUBLIC_SOURCE_PROTOCOLS = new Set(['http:', 'https:']);

export function sanitizeUrl(url: string | null | undefined): string | undefined {
  if (url == null) return undefined;

  const cleaned = String(url).replace(CONTROL_CHARS, '').trim();
  if (!cleaned) return undefined;

  try {
    const parsed = new URL(cleaned);
    return PUBLIC_SOURCE_PROTOCOLS.has(parsed.protocol) ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export const getSafeUrl = sanitizeUrl;
