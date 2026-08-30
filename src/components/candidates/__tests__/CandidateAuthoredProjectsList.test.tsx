import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CandidateAuthoredProjectsList } from '../CandidateAuthoredProjectsList';
import type { CandidateAuthoredProject } from '@/types/election';

const projects: CandidateAuthoredProject[] = [
  {
    id: 'camara:pl-4566-2021', house: 'camara', type: 'PL', number: '4566', year: 2021,
    title: 'Proteção do trabalho', role: 'autor_principal', status: 'aprovado',
    summary_short: 'Amplia proteção trabalhista.', summary_expanded: 'Mecanismo detalhado da proposta.',
    main_topic: 'trabalho_renda', target_groups: ['trabalhadores'],
    official_url: 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/1',
  },
  {
    id: 'alrs:pl-120-2023', house: 'alrs', type: 'PL', number: '120', year: 2023,
    title: 'Educação pública', role: 'relator', status: 'tramitando',
    summary_short: 'Organiza política educacional.', summary_expanded: 'Detalhes do mecanismo educacional.',
    main_topic: 'educacao', target_groups: ['estudantes'],
    official_url: 'https://www.al.rs.gov.br/proposicao/120',
  },
];

describe('CandidateAuthoredProjectsList', () => {
  it('renderiza total, cartões recolhidos e expande o resumo detalhado', () => {
    render(<CandidateAuthoredProjectsList projects={projects} />);
    expect(screen.getByRole('heading', { name: /projetos de autoria/i })).toHaveTextContent('2');
    expect(screen.getByText('Amplia proteção trabalhista.')).toBeInTheDocument();
    expect(screen.queryByText('Mecanismo detalhado da proposta.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Proteção do trabalho/i }));
    expect(screen.getByText('Mecanismo detalhado da proposta.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Abrir projeto oficial/i })).toHaveAttribute('href', projects[0].official_url);
  });

  it('filtra por status e busca textual', () => {
    render(<CandidateAuthoredProjectsList projects={projects} />);
    fireEvent.change(screen.getByRole('combobox', { name: /filtrar por status/i }), { target: { value: 'tramitando' } });
    expect(screen.getByText('Educação pública')).toBeInTheDocument();
    expect(screen.queryByText('Proteção do trabalho')).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole('searchbox', { name: /buscar projetos/i }), { target: { value: 'educacional' } });
    expect(screen.getByText('Educação pública')).toBeInTheDocument();
  });

  it('mostra estado vazio sem projetos', () => {
    render(<CandidateAuthoredProjectsList projects={[]} />);
    expect(screen.getByText(/nenhum projeto de autoria registrado/i)).toBeInTheDocument();
  });
});
