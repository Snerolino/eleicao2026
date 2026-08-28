import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateDeclaredAssetsCard } from '../CandidateDeclaredAssetsCard';
import type { CandidateDeclaredAssets } from '@/types/election';

const mockAssets: CandidateDeclaredAssets = {
  tse_candidate_id: '210002532989',
  ano_recente: 2026,
  total_declarado: 71000,
  declaracoes_por_ano: [
    {
      ano: 2026,
      total: 71000,
      itens_count: 2,
      itens: [
        {
          tipo: 'Veículo automotor',
          categoria: 'Veículos e Automotores',
          descricao: '50% DE UM VEÍCULO DODGE JOURNEY RT 2018.',
          valor: 41000,
        },
        {
          tipo: 'Depósito bancário',
          categoria: 'Aplicações e Depósitos Bancários',
          descricao: 'DEPÓSITO BANCÁRIO EM CONTA CORRENTE NO PAÍS',
          valor: 30000,
        },
      ],
      por_categoria: {
        'Veículos e Automotores': 41000,
        'Aplicações e Depósitos Bancários': 30000,
      },
    },
  ],
};

describe('CandidateDeclaredAssetsCard', () => {
  it('renderiza patrimônio total e composição por categorias', () => {
    render(<CandidateDeclaredAssetsCard assets={mockAssets} candidateName="Candidato Teste" />);

    expect(screen.getByText(/Patrimônio e Bens Declarados/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*71\.000,00/i)).toBeInTheDocument();
    expect(screen.getByText('Veículos e Automotores')).toBeInTheDocument();
    expect(screen.getByText('Aplicações e Depósitos Bancários')).toBeInTheDocument();
  });

  it('expande e oculta a relação detalhada de bens', () => {
    render(<CandidateDeclaredAssetsCard assets={mockAssets} candidateName="Candidato Teste" />);

    const toggleButton = screen.getByRole('button', { name: /Ver relação detalhada dos 2 bens declarados/i });
    expect(screen.queryByText(/50% DE UM VEÍCULO DODGE/i)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText(/50% DE UM VEÍCULO DODGE/i)).toBeInTheDocument();
    expect(screen.getByText(/DEPÓSITO BANCÁRIO EM CONTA CORRENTE/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ocultar relação detalhada/i }));
    expect(screen.queryByText(/50% DE UM VEÍCULO DODGE/i)).not.toBeInTheDocument();
  });

  it('exibe estado vazio quando candidato não possui bens cadastrados', () => {
    render(<CandidateDeclaredAssetsCard assets={null} candidateName="Candidato Sem Bens" />);

    expect(screen.getByText(/Nenhum bem patrimonial individual foi registrado para Candidato Sem Bens/i)).toBeInTheDocument();
  });
});
