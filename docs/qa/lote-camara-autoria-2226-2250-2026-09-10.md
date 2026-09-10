# QA — autoria Câmara 2226–2250 — 2026-09-10

## Objetivo
Processar boundedamente o próximo lote de autoria Câmara sob lock exclusivo,
com seleção determinística, revalidação da fonte oficial, lanes causal e
red-team independentes e retenção fail-closed.

## Seleção e fonte oficial
- Seleção determinística: 25 projetos únicos, `offset=2225`, `limit=25`,
  ordenação por projeto único ascendente.
- Ocorrências candidato–projeto: 50; candidatos únicos: 14.
- Fonte Dados Abertos Câmara: 25/25 URLs oficiais HTTP 200.
- Identidade: `dados.id` exatamente igual ao ID informado na URL em 25/25.
- Total revalidado: 46.115 bytes; SHA-256 individual preservado no manifesto
  `data/legislative-import/camara/authored-project-review-batches/camara-authored-2226-2250-source-manifest.json`.
- Nenhum JSON bruto de resposta foi versionado.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos; todos `withheld`.
- Lane red-team: 25/25 IDs exatos; todos `withheld`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0
  `score_eligible`.
- `content_read=false` e `remote_apply=false` em todos os artefatos.
- O manifesto comprova metadados/identidade, não texto integral validado,
  versão/evento independente vinculante nem voto nominal individual.

## Bloqueio real
A autoria e a ementa não provam posição legislativa, mecanismo causal ou score.
Sem a cadeia fonte oficial → texto integral validado → versão/evento independente
→ voto nominal individual, nenhum fato autoral foi promovido a projeto público,
claim, voto, matriz ou score. Nenhuma escrita Supabase/Cloudflare factual ocorreu.

## Checkpoint
- `projects_analyzed=2250`, `withheld=2250`, `approved=0`, `pending_review=0`.
- `blocked_items=92`.
- Último lote: `2226-2250` (`withheld`).
- Próximo lote calculado: `2251-2275`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates locais
- Node: `v24.19.0`.
- `npm run test`: **499/499** testes em **120** arquivos.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **OK**.
- `npm run data:check`: **OK**, 1003 candidaturas / 988 fotos / 1 fonte TSE.
- `npm run build`: **OK**, 245 módulos; sitemap 1003 + 2; release local gerado.
- `git diff --check`: **0**.

## Escopo e segurança
Não foram alteradas migrations, RLS, Auth, Storage ou Edge Functions. Não houve
aplicação factual remota, deploy Cloudflare, score, matriz, claim ou voto.
A worktree já continha alterações não relacionadas em três artefatos de impacto;
foram preservadas e não fazem parte deste lote.

## Próximo passo
Publicar este checkpoint após manter a separação das alterações preexistentes;
no próximo tick, iniciar `2251–2275` mantendo fonte oficial, duas lanes e
retenção fail-closed. Não aplicar fatos sem cadeia completa e gate próprio.
