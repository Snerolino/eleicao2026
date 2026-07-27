import { renderHook } from '@testing-library/react';
import { usePageMetadata } from '../usePageMetadata';

describe('usePageMetadata', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Clear document head and title before each test
    document.head.innerHTML = '';
    document.title = '';

    // Mock window.location for testing og:url
    delete (window as any).location;
    window.location = { ...originalLocation, href: 'https://example.com/test' } as any;
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it('updates document title', () => {
    renderHook(() => usePageMetadata('Test Title'));
    expect(document.title).toBe('Test Title');
  });

  it('adds standard meta tags', () => {
    renderHook(() => usePageMetadata('Test Title', 'Test Description'));

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta).toBeInTheDocument();
    expect(descMeta).toHaveAttribute('content', 'Test Description');
  });

  it('adds Open Graph meta tags', () => {
    renderHook(() => usePageMetadata('Test Title', 'Test Description', {
      image: '/test-image.png',
      url: 'https://example.com/custom'
    }));

    const ogTitle = document.querySelector('meta[property="og:title"]');
    expect(ogTitle).toHaveAttribute('content', 'Test Title');

    const ogDesc = document.querySelector('meta[property="og:description"]');
    expect(ogDesc).toHaveAttribute('content', 'Test Description');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).toHaveAttribute('content', '/test-image.png');

    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(ogUrl).toHaveAttribute('content', 'https://example.com/custom');
  });

  it('adds Twitter Card meta tags', () => {
    renderHook(() => usePageMetadata('Test Title', 'Test Description', {
      image: '/test-image.png'
    }));

    const twCard = document.querySelector('meta[name="twitter:card"]');
    expect(twCard).toHaveAttribute('content', 'summary');

    const twTitle = document.querySelector('meta[name="twitter:title"]');
    expect(twTitle).toHaveAttribute('content', 'Test Title');

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    expect(twDesc).toHaveAttribute('content', 'Test Description');

    const twImage = document.querySelector('meta[name="twitter:image"]');
    expect(twImage).toHaveAttribute('content', '/test-image.png');
  });

  it('uses fallback values for missing optional parameters', () => {
    renderHook(() => usePageMetadata('Test Title'));

    const descMeta = document.querySelector('meta[name="description"]');
    expect(descMeta).toHaveAttribute('content', '');

    const ogImage = document.querySelector('meta[property="og:image"]');
    expect(ogImage).toHaveAttribute('content', '/icon-512.png');

    const ogUrl = document.querySelector('meta[property="og:url"]');
    expect(ogUrl).toHaveAttribute('content', 'https://example.com/test');
  });

  it('updates existing meta tags rather than creating new ones', () => {
    const { rerender } = renderHook(
      (props) => usePageMetadata(props.title, props.desc),
      { initialProps: { title: 'Initial Title', desc: 'Initial Desc' } }
    );

    let metaTags = document.querySelectorAll('meta[name="description"]');
    expect(metaTags).toHaveLength(1);
    expect(metaTags[0]).toHaveAttribute('content', 'Initial Desc');

    rerender({ title: 'New Title', desc: 'New Desc' });

    metaTags = document.querySelectorAll('meta[name="description"]');
    expect(metaTags).toHaveLength(1);
    expect(metaTags[0]).toHaveAttribute('content', 'New Desc');
  });
});
