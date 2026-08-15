import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { VersionBadge } from '../VersionBadge';

vi.mock('@/utils/releaseVersion', () => ({
  fetchReleaseMetadata: vi.fn(),
}));

import { fetchReleaseMetadata } from '@/utils/releaseVersion';

describe('VersionBadge', () => {
  it('mostra "Versão xx.xxx" a partir do release.json', async () => {
    vi.mocked(fetchReleaseMetadata).mockResolvedValue({
      version: '0.2.297',
      short_sha: 'aa0adfe',
      built_at: '2026-08-15T05:08:00.000Z',
    });

    render(<VersionBadge />);

    await waitFor(() => {
      expect(screen.getByText(/Versão 0\.2\.297/)).toBeInTheDocument();
    });
  });

  it('não renderiza nada quando release.json falha', async () => {
    vi.mocked(fetchReleaseMetadata).mockResolvedValue(null);

    const { container } = render(<VersionBadge />);
    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
