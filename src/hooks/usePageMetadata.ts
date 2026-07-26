import { useEffect } from 'react';

export function usePageMetadata(
  title: string,
  description?: string,
  meta?: { image?: string; url?: string }
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

    setMeta('meta[name="description"]', description ?? '');

    // Open Graph
    setMeta('meta[property="og:title"]', title);
    setMeta('meta[property="og:description"]', description ?? '');
    setMeta('meta[property="og:image"]', meta?.image ?? '/icon-512.png');
    setMeta('meta[property="og:url"]', meta?.url ?? window.location.href);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'summary');
    setMeta('meta[name="twitter:title"]', title);
    setMeta('meta[name="twitter:description"]', description ?? '');
    setMeta('meta[name="twitter:image"]', meta?.image ?? '/icon-512.png');
  }, [description, title, meta?.image, meta?.url]);
}
