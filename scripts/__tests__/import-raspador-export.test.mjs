// @vitest-environment node

import { describe, expect, it } from 'vitest';
import {
  buildClaimPayload,
  clampScore,
  contentHash,
  deriveExternalId,
  PROMPT_VERSION,
  serializeClaimContent,
  sourceNameFromUrl,
  sourceToReference,
  validateImport,
} from '../import-raspador-export.mjs';

const claimMandato = {
  category: 'historico_politico',
  confidence_score: 5,
  content: {
    ano: '2022',
    cargo: 'deputado_federal',
    orgao: 'TSE',
    resultado: 'Eleito por QP',
    situacao_tse_original: 'Eleito por QP',
    source_hash: '12c8f14ceaeba78e0a9bb4c17e5f80322462522bb8c58a5d9f130cd10b77c717',
    source_url: 'https://resultados.tse.jus.br/oficial/ele2022/546/dados-simplificados/rs/rs-c0006-e000546-r.json',
  },
  generated_by_ai: false,
  kind: 'mandato',
  published_at: null,
  status: 'pending_review',
  tse_candidate_id: '210002533584',
};

const sourceResultados = {
  sha256: 'dc38f622e268436fb70078ba239064fb5e9e022c6869f5be1ae2b056f4c7b72b',
  source_category: 'oficial',
  url: 'https://resultados.tse.jus.br/oficial/ele2022/546/dados-simplificados/rs/rs-c0006-e000546-r.json',
};

describe('import-raspador-export', () => {
  describe('serialização de conteúdo', () => {
    it('serializa content estruturado em texto legível em PT', () => {
      expect(serializeClaimContent(claimMandato.content)).toBe(
        'Eleito(a) em 2022 para Deputado Federal (TSE), resultado oficial: Eleito por QP.',
      );
    });

    it('usa fallback quando cargo/resultado ausentes', () => {
      expect(serializeClaimContent({ orgao: 'TSE' })).toMatch(/cargo/);
      expect(serializeClaimContent({ cargo: 'senador', resultado: 'Eleito' })).toContain('Senador');
    });

    it('rejeita content não estruturado', () => {
      expect(() => serializeClaimContent('texto puro')).toThrow(/objeto/);
      expect(() => serializeClaimContent(null)).toThrow(/objeto/);
    });
  });

  describe('identidade e idempotência', () => {
    it('gera external_id estável a partir de kind/ano/tse/cargo', () => {
      expect(deriveExternalId(claimMandato)).toBe('raspador:mandato:2022:210002533584:deputado_federal');
    });

    it('content_hash é SHA-256 do conteúdo serializado', () => {
      expect(contentHash(claimMandato)).toMatch(/^[a-f0-9]{64}$/);
      expect(contentHash(claimMandato)).toBe(contentHash({ ...claimMandato, confidence_score: 4 }));
    });
  });

  describe('payload de claim', () => {
    it('monta payload pending_review, nunca publicado, com metadados do coletor', () => {
      const payload = buildClaimPayload({
        claim: claimMandato,
        candidateId: 'cand-uuid',
        sourceDocumentId: 'src-uuid',
      });

      expect(payload).toMatchObject({
        candidate_id: 'cand-uuid',
        category: 'historico_politico',
        source_document_id: 'src-uuid',
        status: 'pending_review',
        confidence_score: 5,
        generated_by_ai: false,
        prompt_version: PROMPT_VERSION,
        external_id: 'raspador:mandato:2022:210002533584:deputado_federal',
      });
      expect(payload.content).toContain('Deputado Federal');
      expect(payload).not.toHaveProperty('published_at');
      expect(payload).not.toHaveProperty('status_published');
    });

    it('sem fonte, source_document_id fica null e score é clampado', () => {
      const payload = buildClaimPayload({ claim: { ...claimMandato, confidence_score: 99 }, candidateId: 'x' });
      expect(payload.source_document_id).toBeNull();
      expect(payload.confidence_score).toBe(5);
      expect(clampScore(-3)).toBe(1);
      expect(clampScore('nao-numero')).toBe(3);
    });
  });

  describe('fontes', () => {
    it('mapeia source do export para source_references dedup por hash', () => {
      const ref = sourceToReference(sourceResultados);
      expect(ref).toMatchObject({
        source_category: 'oficial',
        url: sourceResultados.url,
        title: 'TSE — Resultados Eleitorais 2022',
        content_hash: sourceResultados.sha256,
      });
      expect(ref.source_name).toBeTruthy();
    });

    it('deduz nome legível por URL', () => {
      expect(sourceNameFromUrl('https://cdn.tse.jus.br/.../consulta_cand_2026.zip')).toBe('TSE — Consulta de Candidaturas');
      expect(sourceNameFromUrl('https://api-publica.datajud.cnj.jus.br/_search')).toBe('DataJud — CNJ (TRE-RS)');
      expect(sourceNameFromUrl('')).toBeNull();
    });

    it('exige sha256 válido', () => {
      expect(() => sourceToReference({ url: 'x' })).toThrow(/sha256/);
    });
  });

  describe('validação do export', () => {
    it('aceita export canônico válido', () => {
      const result = validateImport({
        schema_version: '1.0.0',
        candidates: [],
        sources: [sourceResultados],
        claims: [claimMandato],
      });
      expect(result.ok).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.plan).toMatchObject({ claims: 1, sources: 1 });
    });

    it('rejeita claim publicada/nao-pending e source fora de sources[]', () => {
      const result = validateImport({
        schema_version: '1.0.0',
        sources: [sourceResultados],
        claims: [
          { ...claimMandato, status: 'published', published_at: '2026-08-05T00:00:00Z' },
          {
            ...claimMandato,
            tse_candidate_id: 'X',
            content: { ...claimMandato.content, source_url: 'https://fora.example/nao-existe.json' },
          },
        ],
      });
      expect(result.ok).toBe(false);
      expect(result.errors.join(' ')).toMatch(/pending_review/i);
      expect(result.errors.join(' ')).toMatch(/fora de sources\[\]/i);
    });

    it('rejeita source nao oficial e sha256 inválido', () => {
      const result = validateImport({
        schema_version: '1.0.0',
        sources: [{ ...sourceResultados, source_category: 'imprensa', sha256: 'abc' }],
        claims: [],
      });
      expect(result.ok).toBe(false);
      expect(result.errors.join(' ')).toMatch(/oficial/i);
      expect(result.errors.join(' ')).toMatch(/sha256/i);
    });

    it('rejeita schema_version divergente e export vazio', () => {
      expect(validateImport({ schema_version: '2.0.0', claims: [] }).ok).toBe(false);
      expect(validateImport(null).ok).toBe(false);
    });
  });
});