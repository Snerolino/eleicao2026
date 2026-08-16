# QA — Lote: Senadores (dossiês → claims via AGY)

Data: 2026-08-16
Autor: Hermes
Status: PUBLICADO (claims pending_review no Supabase)

## Fluxo (uso inteligente de CLIs)
1. `orch:google` (run-antigravity.sh) processou 11 dossiês de senadores RS
   (`dataset2026/relatorios/dossies/dossie_*.md`) em snapshot read-only.
2. O AGY extraiu claims fieis por candidato (historico_politico, plataforma,
   reputacao, votacao_scrutiny), ligando pelo `project_candidate_id_remote` (UUID).
3. **Verificação independente** com `verify-agy-output.mjs --senator-claims`
   (contrato SENATOR_CLAIMS_CONTRACT): 22 itens APROVADOS, 0 rejeições.
   Revisão antes da entrega — sem culpar o AGY sem evidência.
4. `import-senator-dossiers.mjs --apply`: 22 claims inseridas como `pending_review`
   com fonte obrigatória (dossiê oficial) e `generated_by_ai=false`
   (a fonte é o documento, não IA).

## Resultado
- 22 claims de senadores no banco (Tânia Peres, Renato Jaguarão, Ubiratan Sanderson,
  Daniela Maidana, Manuela Davila, Marcel van Hatten, Paulo Pimenta, etc.).
- Todas com `source_text` (dossiê) → regra absoluta de fonte respeitada.
- Candidatos resolvidos por UUID remoto (project_candidate_id_remote) ou TSE.

## Notas
- Dossiês NÃO foram commitados no main (branch de trabalho descartada).
- Votos nominais de senadores (votações do Senado) seguem pendentes: API do Senado
  não respondeu; o importador `import-senator-votes.mjs` está pronto para quando
  houver fonte de votações.
