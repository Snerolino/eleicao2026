import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SourceReferenceBadge } from '../SourceReferenceBadge';
import type { SourceReference } from '@/types/election';

const documentRef: SourceReference = {
  id: 'source-1',
  source_name: 'TSE Divulgação de Candidaturas',
  source_category: 'oficial',
  url: 'https://divulgacandcontas.tse.jus.br/',
  fetched_at: '2026-07-30T00:00:00Z',
};

describe('SourceReferenceBadge', () => {
  it('renderiza somente um anchor quando a fonte pública tem URL segura', () => {
    const { container } = render(
      <SourceReferenceBadge document={documentRef} confidenceScore={5} />,
    );

    const links = container.querySelectorAll('a');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute('href', documentRef.url);
    expect(links[0].querySelector('a')).toBeNull();
    expect(screen.getByText('TSE Divulgação de Candidaturas')).toBeInTheDocument();
  });

  it('não cria link para protocolo não público', () => {
    const unsafeDocument = {
      ...documentRef,
      url: 'mailto:test@example.com',
    };

    const { container } = render(
      <SourceReferenceBadge document={unsafeDocument} confidenceScore={4} />,
    );

    expect(container.querySelector('a')).toBeNull();
    expect(screen.getByText('TSE Divulgação de Candidaturas')).toBeInTheDocument();
  });
});
