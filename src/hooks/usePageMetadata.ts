import { useEffect } from 'react';

export function usePageMetadata(
  title: string,
  description?: string
) {
  useEffect(() => {
    document.title = title;

    if (!description) return;

    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]'
    );

    if (meta) meta.content = description;
  }, [description, title]);
}
