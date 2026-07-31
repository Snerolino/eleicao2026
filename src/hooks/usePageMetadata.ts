import { useEffect } from 'react';

export function usePageMetadata(
  title: string,
  description?: string,
  meta?: { image?: string; url?: string; canonical?: string }
) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, content: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attr, val] = selector.startsWith('meta[property')
          ? ['property', selector.match(/property="([^"]+)"/)?.[1] ?? '']
          : ['name', selector.match(/name="([^"]+)"/)?.[1] ?? ''];
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.content = content;
    };

    const setCanonical = (href: string) => {
      let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.href = href;
    };

    const pageUrl = meta?.url ?? window.location.href;

    setMeta('meta[name="description"]', description ?? '');
    setCanonical(meta?.canonical ?? pageUrl);

    // Open Graph
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description ?? '');
    setMeta('meta[property="og:image"]', meta?.image ?? '/icon-512.png');
    setMeta('meta[property="og:url"]', pageUrl);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'summary');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description ?? '');
    setMeta('meta[name="twitter:image"]', meta?.image ?? '/icon-512.png');
  }, [description, title, meta?.canonical, meta?.image, meta?.url]);
}
