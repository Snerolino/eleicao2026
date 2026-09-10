# QA — autoria Câmara 2301–2325 — 2026-09-10

## Objetivo
Processar boundedamente o lote seguinte de autoria Câmara com seleção determinística, fonte oficial revalidada, lanes causal/red-team independentes e retenção fail-closed, preservando o artefato ALRS de recuperação de score do tick anterior.

## Seleção e fonte oficial
- Seleção: 25 projetos únicos, `offset=2300`, `limit=25`, ordenação determinística por cobertura de candidatos e ID do projeto.
- Ocorrências candidato–projeto: 50; candidatos únicos: 17.
- Fonte Dados Abertos Câmara: 25/25 endpoints HTTPS oficiais HTTP 200.
- Identidade: 25/25 `official_id` exatamente iguais ao ID numérico da URL.
- Bytes revalidados: 57.398; SHA-256 individual preservado no manifesto `data/legislative-import/camara/authored-project-review-batches/camara-authored-2301-2325-source-manifest.json`.
- Nenhum JSON bruto de resposta foi versionado. URLs de texto integral/evento foram mantidas apenas como evidência de triagem; não foram tratadas como validação de conteúdo.

## Lanes e reconciliação
- Lane causal: 25/25 IDs exatos; todos `withheld`; `content_read=false`.
- Lane red-team: 25/25 IDs exatos; todos `withheld`; `content_read=false`.
- Reconciliação: 25 `withheld`, 0 `pending_review`, 0 `approved`, 0 `score_eligible`; conjuntos de IDs coincidem exatamente.
- `remote_apply=false` nos quatro artefatos; nenhum score, matriz, assessment, claim, voto ou projeto público foi criado.

## Bloqueio real
A fonte oficial revalidada comprova identidade e metadados da proposição, mas não demonstra texto integral validado, evento/versão independente vinculante e voto nominal individual. Autoria/ementa não provam posição legislativa, efeito causal ou score. O lote permanece retido sem escrita factual Supabase/Cloudflare.

## ALRS preservado
- Artefato anterior mantido: `data/legislative-import/alrs/alrs-score-recovery-queue-v1.json`.
- Contagens preservadas: 152 itens; 87 `event_binding_missing`; 65 `compound_non_separable`; `remote_apply=false`.
- Nenhum score ou matriz foi promovido; a fila segue bloqueada até evento oficial independente e separação verificável.

## Checkpoint
- `projects_analyzed=2325`, `withheld=2325`, `approved=0`, `pending_review=0`, `blocked_items=95`.
- Lote fechado: `2301-2325` (`withheld`).
- Próximo lote calculado atomicamente: `2326-2350`.
- Checkpoint: `data/legislative-import/camara/authored-analysis-progress-v1.json`.

## Gates locais — Node 24
- `node -v`: `v24.19.0`.
- `npm run test -- --passWithNoTests`: RC 0 — 499/499 testes em 120 arquivos. O texto diagnóstico `UUID inválido ... not-a-uuid` aparece no output, mas não falhou teste.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — 245 módulos; sitemap 1003 candidatos + 2 estáticas; release local `6f29384-20260910T032102150Z`.
- `git diff --check`: RC 0.

## Segurança e escopo
Lock exclusivo adquirido com `flock` em `.orchestrator/runtime/locks/continuous-progress.lock`; um único writer local. Nenhuma migration, RLS, Auth, Storage ou Edge Function foi alterada. Nenhuma escrita factual Supabase/Cloudflare foi executada.

## Publicação
Artefatos locais e QA prontos para commit/push após a verificação final. Não iniciar o lote seguinte antes do fechamento deste lote.
