import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from '../ErrorBoundary';

const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Kaboom');
  }
  return <div>Normal Content</div>;
};

describe('ErrorBoundary', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Prevent console.error from polluting test output
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock window.location.reload
    // @ts-ignore - this is a known hack for mocking location
    delete window.location;
    window.location = { ...originalLocation, reload: vi.fn() };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    window.location = originalLocation;
  });

  it('renders children normally when there is no error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content')).toBeInTheDocument();
  });

  it('renders fallback UI when a child throws an error', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Erro inesperado')).toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Kaboom')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recarregar/i })).toBeInTheDocument();
  });

  it('calls window.location.reload when the reload button is clicked', () => {
    render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByRole('button', { name: /recarregar/i });
    fireEvent.click(reloadButton);

    expect(window.location.reload).toHaveBeenCalledTimes(1);
  });
});
