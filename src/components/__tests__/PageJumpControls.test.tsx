import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PageJumpControls } from '../PageJumpControls';

describe('PageJumpControls', () => {
  it('oferece atalhos fixos para topo e final da página', () => {
    render(<PageJumpControls />);

    expect(screen.getByRole('link', { name: /voltar ao topo/i })).toHaveAttribute(
      'href',
      '#main-content'
    );
    expect(screen.getByRole('link', { name: /ir ao final/i })).toHaveAttribute(
      'href',
      '#page-end'
    );
  });
});
