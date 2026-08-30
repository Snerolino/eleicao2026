import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CandidateDeclaredAssetsCard } from '../CandidateDeclaredAssetsCard';
import type { CandidateDeclaredAssets } from '@/types/election';

const mockAssets: CandidateDeclaredAssets = {
  tse_candidate_id: '210002532989',
  ano_recente: 2026,
  total_declarado: 71000,
  evolucao_nominal: 21000,
  evolucao_percentual: 42.0,
  auditoria_evolucao: {
    ano_base: 2026,
    ano_anterior: 2022,
    total_base: 71000,
    total_anterior: 50000,
    variacao_nominal: 21000,
    variacao_percentual: 42.0,
    ipca_acumulado_periodo: 21.8,
    acima_da_inflacao: true,
    resumo: 'Patrimônio variou +42.0% entre 2022 e 2026 — crescimento superior à inflação.',
  },
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
    {
      ano: 2022,
      total: 50000,
      itens_count: 1,
      itens: [
        {
          tipo: 'Veículo automotor',
          categoria: 'Veículos e Automotores',
          descricao: 'Veículo Ford Fiesta 2015.',
          valor: 50000,
        },
      ],
      por_categoria: {
        'Veículos e Automotores': 50000,
      },
    },
  ],
};

describe('CandidateDeclaredAssetsCard', () => {
  it('renderiza patrimônio total e composição por categorias', () => {
    render(<CandidateDeclaredAssetsCard assets={mockAssets} candidateName="Candidato Teste" />);

    expect(screen.getByText(/Patrimônio e Bens Declarados/i)).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*71\.000,00/i).length).toBeGreaterThan(0);
    expect(screen.getByText('Veículos e Automotores')).toBeInTheDocument();
    expect(screen.getByText('Aplicações e Depósitos Bancários')).toBeInTheDocument();
  });

  it('exibe badge e painel de auditoria de evolução patrimonial histórica', () => {
    render(<CandidateDeclaredAssetsCard assets={mockAssets} candidateName="Candidato Teste" />);

    expect(screen.getByText(/Evolução Patrimonial entre Eleições/i)).toBeInTheDocument();
    expect(screen.getByText(/42\.0% vs 2022/i)).toBeInTheDocument();
    expect(screen.getByText(/Patrimônio variou \+42\.0% entre 2022 e 2026/i)).toBeInTheDocument();
  });

  it('permite alternar entre anos no histórico de declarações', () => {
    render(<CandidateDeclaredAssetsCard assets={mockAssets} candidateName="Candidato Teste" />);

    const button2022 = screen.getByRole('button', { name: /2022/i });
    fireEvent.click(button2022);

    expect(screen.getByText(/Total declarado \(2022\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*50\.000,00/i).length).toBeGreaterThan(0);
  });

  it('expande e oculta a relação detalhada de bens com filtro', () => {
    render(<CandidateDeclaredAssetsCard assets={mockAssets} candidateName="Candidato Teste" />);

    const toggleButton = screen.getByRole('button', { name: /Ver relação detalhada dos 2 bens declarados/i });
    expect(screen.queryByText(/50% DE UM VEÍCULO DODGE/i)).not.toBeInTheDocument();

    fireEvent.click(toggleButton);
    expect(screen.getByText(/50% DE UM VEÍCULO DODGE/i)).toBeInTheDocument();
    expect(screen.getByText(/DEPÓSITO BANCÁRIO EM CONTA CORRENTE/i)).toBeInTheDocument();

    // Filtro de busca
    const searchInput = screen.getByPlaceholderText(/Buscar bem por descrição/i);
    fireEvent.change(searchInput, { target: { value: 'DODGE' } });
    expect(screen.getByText(/50% DE UM VEÍCULO DODGE/i)).toBeInTheDocument();
    expect(screen.queryByText(/DEPÓSITO BANCÁRIO EM CONTA CORRENTE/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ocultar relação detalhada/i }));
    expect(screen.queryByText(/50% DE UM VEÍCULO DODGE/i)).not.toBeInTheDocument();
  });

  it('exibe estado vazio quando candidato não possui bens cadastrados', () => {
    render(<CandidateDeclaredAssetsCard assets={null} candidateName="Candidato Sem Bens" />);

    expect(screen.getByText(/Nenhum bem patrimonial individual foi registrado para Candidato Sem Bens/i)).toBeInTheDocument();
  });
});
