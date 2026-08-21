# QA — propostas preliminares de assessments ALRS

**Data:** 2026-08-20

## Resultado

- 12 versões;
- 13 propostas de assessment;
- campos factuais/editoriais (`impact_direction`, `defending_vote`, `severity`,
  `structural_type` e `confidence`) permanecem `null`;
- rationale apenas preliminar, sem aprovação;
- todas `proposal_status=needs_human_review`;
- `review_status=pending_review`;
- `remote_apply=false` e `public_approval=false`;
- nenhuma matriz, assessment remoto, voto ou identidade foi criado.

As propostas preservam os dados oficiais existentes e reduzem o trabalho
repetitivo do revisor, mas não transformam o título em fato editorial. Antes de
aprovação, é obrigatório confirmar o texto integral, o tipo do evento, a direção
e o voto defensor em fonte oficial exata.

## Evidência

```text
data/legislative-import/alrs/impact-assessment-proposal-pack-v1.json
scripts/build-alrs-assessment-proposal-pack.mjs
scripts/__tests__/build-alrs-assessment-proposal-pack.test.mjs
npm run impact:alrs:r4:assessment:proposals
npm exec vitest run scripts/__tests__/build-alrs-assessment-proposal-pack.test.mjs
```

Saída verificada: `versions=12`, `proposed_assessments=13`; contrato: 1 teste
aprovado.

## Bloqueios e próximo passo

A classificação editorial continua pendente de revisão humana. Os quatro votos
ALRS residuais de Enio Carlos Terra seguem sem ID oficial e fonte exata; Senado
permanece fail-closed enquanto os hashes divergirem do manifesto; Câmara segue
sem novo lote oficial não vazio. Repetir reconciliação oficial bounded sem aplicar
dados por inferência.
