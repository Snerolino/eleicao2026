// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { deriveAlignment } from '../../src/domain/impact/alignment';
import { computeScore } from '../../src/domain/impact/score';
import { BENEFICIARY_GROUPS } from '../../src/domain/impact/contract';

const root = resolve(import.meta.dirname, '../..');
const gabaritoPath = resolve(root, 'data/impact-matrices/gabarito-materias-aprovadas.json');
const quarentenaPath = resolve(root, 'data/impact-matrices/quarentena-regressao-gabarito-2026-08-30.json');

describe('Auditoria e Correção Editorial Profunda — 2026-08-30', () => {
  const gabarito = JSON.parse(readFileSync(gabaritoPath, 'utf8'));
  const quarentena = JSON.parse(readFileSync(quarentenaPath, 'utf8'));

  describe('1. Taxonomia Canônica v1.1 (21 Grupos)', () => {
    it('possui exatamente 21 grupos canônicos no contrato', () => {
      expect(BENEFICIARY_GROUPS.length).toBe(21);
      expect(BENEFICIARY_GROUPS).toContain('estudantes');
      expect(BENEFICIARY_GROUPS).toContain('trabalhadores_formais');
      expect(BENEFICIARY_GROUPS).toContain('servidores_publicos');
      expect(BENEFICIARY_GROUPS).toContain('usuarios_sus');
      expect(BENEFICIARY_GROUPS).toContain('pessoas_com_ludopatia');
      expect(BENEFICIARY_GROUPS).toContain('candidatos_concursos_publicos');
      expect(BENEFICIARY_GROUPS).toContain('pescadores_artesanais_comunidades_pesqueiras');
    });

    it('nenhum assessment no gabarito aprovado usa topic ou slug legado inválido', () => {
      const topicAndLegacySlugs = [
        'meio_ambiente_clima',
        'educacao_estudantes',
        'saude_usuarios_sus',
        'micro_pequenos_empreendedores',
        'agricultores_familiares',
        'idosos',
        'populacao_geral',
      ];

      for (const prop of gabarito.propositions) {
        for (const a of prop.assessments) {
          expect(BENEFICIARY_GROUPS).toContain(a.group);
          expect(topicAndLegacySlugs).not.toContain(a.group);
        }
      }
    });
  });

  describe('2. Defending Vote e Regra de Atribuibilidade / Score', () => {
    it('textual_defending_vote pode existir com event_defending_vote null', () => {
      const alignment = deriveAlignment(
        { value: 'nao' },
        {
          impact_direction: 'positive',
          textual_defending_vote: 'sim',
          event_defending_vote: null,
          score_eligible: false,
          vote_attribution_status: 'compound_non_separable',
        }
      );
      expect(alignment).toBe('nao_avaliavel');
    });

    it('score_eligible = false produz score null em computeScore', () => {
      const alignment = deriveAlignment(
        { value: 'sim' },
        {
          impact_direction: 'positive',
          defending_vote: 'sim',
          score_eligible: false,
        }
      );
      expect(alignment).toBe('nao_avaliavel');

      const result = computeScore(
        [{ alignment, structural_type: 'structural', severity: 3 }],
        '1.1.0'
      );
      expect(result.score).toBeNull();
      expect(result.eligible_weight).toBe(0);
      expect(result.excluded_no_data).toBe(1);
    });

    it('event_defending_vote null não calcula alinhamento a_favor/contra', () => {
      const simAlignment = deriveAlignment(
        { value: 'sim' },
        { impact_direction: 'mixed', event_defending_vote: null }
      );
      const naoAlignment = deriveAlignment(
        { value: 'nao' },
        { impact_direction: 'mixed', event_defending_vote: null }
      );
      expect(simAlignment).toBe('nao_avaliavel');
      expect(naoAlignment).toBe('nao_avaliavel');
    });
  });

  describe('3. Fixtures e Decisões Editoriais Obrigatórias', () => {
    it('PLP 230/2025: estudantes / positive / event_defending_vote: null / severity: 3 / budgetary / score_eligible: false', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'camara:plp-230-2025');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(3);
      expect(prop.structural_type).toBe('budgetary');
      expect(prop.assessments.length).toBe(1);

      const a = prop.assessments[0];
      expect(a.group).toBe('estudantes');
      expect(a.impact_direction).toBe('positive');
      expect(a.textual_defending_vote).toBe('sim');
      expect(a.event_defending_vote).toBeNull();
      expect(a.score_eligible).toBe(false);
      expect(a.vote_attribution_status).toBe('compound_non_separable');
    });

    it('PEC 6/2019: trabalhadores_formais + servidores_publicos / mixed / null / severity: 5 / structural / score_eligible: false', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'camara:pec-6-2019');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(5);
      expect(prop.structural_type).toBe('structural');
      expect(prop.requires_external_review).toBe(true);

      const groups = prop.assessments.map((a) => a.group);
      expect(groups).toContain('trabalhadores_formais');
      expect(groups).toContain('servidores_publicos');

      for (const a of prop.assessments) {
        expect(a.impact_direction).toBe('mixed');
        expect(a.event_defending_vote).toBeNull();
        expect(a.score_eligible).toBe(false);
        expect(a.vote_attribution_status).toBe('compound_non_separable');
      }
    });

    it('PLP 41/2024: mulheres + criancas_adolescentes / positive / sim / severity: 4 / structural / score_eligible: true', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'camara:plp-41-2024');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(4);
      expect(prop.structural_type).toBe('structural');
      expect(prop.requires_external_review).toBe(true);

      const groups = prop.assessments.map((a) => a.group);
      expect(groups).toContain('mulheres');
      expect(groups).toContain('criancas_adolescentes_vulnerabilidade');

      for (const a of prop.assessments) {
        expect(a.impact_direction).toBe('positive');
        expect(a.defending_vote).toBe('sim');
        expect(a.event_defending_vote).toBe('sim');
        expect(a.score_eligible).toBe(true);
      }
    });

    it('PL 490/2007: povos_indigenas / negative / nao / severity: 5 / structural / score_eligible: true', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'camara:pl-490-2007');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(5);
      expect(prop.structural_type).toBe('structural');
      expect(prop.requires_external_review).toBe(true);

      const a = prop.assessments[0];
      expect(a.group).toBe('povos_indigenas');
      expect(a.impact_direction).toBe('negative');
      expect(a.defending_vote).toBe('nao');
      expect(a.event_defending_vote).toBe('nao');
      expect(a.score_eligible).toBe(true);
    });

    it('PL 3626/2023: pessoas_com_ludopatia / mixed / null / severity: 4 / score_eligible: false', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'camara:pl-3626-2023');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(4);
      expect(prop.assessments[0].group).toBe('pessoas_com_ludopatia');
      expect(prop.assessments[0].impact_direction).toBe('mixed');
      expect(prop.assessments[0].event_defending_vote).toBeNull();
      expect(prop.assessments[0].score_eligible).toBe(false);
    });

    it('MPV 1323/2025: pescadores_artesanais / mixed / null / severity: 2 / score_eligible: false', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'camara:mpv-1323-2025');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(2);
      expect(prop.assessments[0].group).toBe('pescadores_artesanais_comunidades_pesqueiras');
      expect(prop.assessments[0].impact_direction).toBe('mixed');
      expect(prop.assessments[0].event_defending_vote).toBeNull();
      expect(prop.assessments[0].score_eligible).toBe(false);
    });

    it('ALRS PL 98/2024: severity: 2, mulheres, positive, sim', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'alrs:pl-98-2024');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(2);
      expect(prop.assessments[0].group).toBe('mulheres');
      expect(prop.assessments[0].impact_direction).toBe('positive');
      expect(prop.assessments[0].defending_vote).toBe('sim');
    });

    it('ALRS PL 361/2025: severity: 3, mulheres, positive, sim', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'alrs:pl-361-2025');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(3);
      expect(prop.assessments[0].group).toBe('mulheres');
      expect(prop.assessments[0].impact_direction).toBe('positive');
      expect(prop.assessments[0].defending_vote).toBe('sim');
    });

    it('ALRS PL 10/2022: severity: 4, criancas_adolescentes, positive, sim, external review required', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'alrs:pl-10-2022');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(4);
      expect(prop.requires_external_review).toBe(true);
      expect(prop.assessments[0].group).toBe('criancas_adolescentes_vulnerabilidade');
    });

    it('ALRS PL 347/2025: contextual / servidores_publicos + estudantes / score_eligible: false', () => {
      const prop = gabarito.propositions.find((p) => p.proposition_id === 'alrs:pl-347-2025');
      expect(prop).toBeDefined();
      expect(prop.severity).toBe(3);
      expect(prop.structural_type).toBe('budgetary');
      expect(prop.assessments.length).toBe(2);

      for (const a of prop.assessments) {
        expect(a.score_eligible).toBe(false);
        expect(a.event_defending_vote).toBeNull();
      }
    });
  });

  describe('4. Quarentena e Proteção contra Regressão', () => {
    it('gabarito aprovado tem 0 placeholders ALRS number=1 year=2026', () => {
      const placeholders = gabarito.propositions.filter(
        (p) => p.house === 'alrs' && p.number === '1' && p.year === 2026
      );
      expect(placeholders.length).toBe(0);
    });

    it('quarentena preservada com 234 itens em quarentena-regressao-gabarito-2026-08-30.json', () => {
      expect(existsSync(quarentenaPath)).toBe(true);
      expect(quarentena.items.length).toBe(234);
      expect(quarentena.policy).toBe('fail_closed');
    });
  });
});
