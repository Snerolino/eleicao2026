import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataFreshness } from '../DataFreshness';

vi.mock('@/hooks/useOnlineStatus', () => ({
  useOnlineStatus: () => false,
}));

describe('DataFreshness', () => {
  it('sinaliza fallback offline e data do snapshot oficial quando informado', () => {
    render(
      <DataFreshness
        updatedAt={0}
        snapshotCreatedAt="2026-07-30T12:36:08.583Z"
        snapshotScope="consulta_cand/2026/RS"
        source="snapshot"
      />,
    );

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
    expect(screen.getByText(/fallback oficial validado/i)).toBeInTheDocument();
    expect(screen.getByText(/consulta_cand\/2026\/RS/i)).toBeInTheDocument();
    expect(screen.getByText(/30\/07\/2026/)).toBeInTheDocument();
  });
});
