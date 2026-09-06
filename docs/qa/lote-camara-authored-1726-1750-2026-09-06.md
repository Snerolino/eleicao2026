# QA — autoria Câmara 1726–1750 — 2026-09-06

## Objetivo
Processar o próximo intervalo sequencial de 25 projetos únicos da fila factual de autoria Câmara, em duas lanes read-only, com cardinalidade/conjunto de IDs exatos e fail-closed.

## Seleção verificada
- Intervalo executado: `1726–1750`; offset `1725`, limit `25`; nunca reutilizado `1701–1725`.
- Seleção: 25 projetos únicos, 75 ocorrências candidato–projeto, 12 candidatos únicos.
- Fonte: índice factual oficial versionado; nenhum texto integral, voto, versão/evento ou efeito foi inferido.

## Lanes e verificação independente
- Causal Antigravity: exit 0 e 25 objetos, porém conjunto de IDs de outro recorte (`camara:pl-2826-2023-2370213` a `camara:pl-2855-2023-2370245`), rejeitado na camada formato/identidade. Não aceito como evidência.
- Red-team free pool: timeout 124 após erro de servidor no primeiro modelo; sem envelope verificável.
- Codex MCP Luna: `401 Unauthorized`, rota Hermes→Codex indisponível; não repetido.
- Gemini legacy: timeout 124; log registrou calibrador 404 e execução negada por política Plan/read-only; sem saída.
- Nenhuma saída externa foi aceita como decisão editorial.

## Resultado fail-closed
- Status: `blocked`.
- 25 `withheld`; 0 `approved`; 0 `pending_review`; 0 `score_eligible`.
- Nenhum authored project, claim, voto, score, matriz, snapshot público, Supabase ou Cloudflare factual foi escrito.
- Motivo: a causal falhou no conjunto exato de IDs e a lane red-team não foi verificável; não há reconciliação entre duas lanes.

## Artefato e checkpoint
- Artefato: `data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1726-1750-reconciled.json`.
- O checkpoint foi atualizado com `projects_analyzed=1750`, `withheld=1750`, `last_batch=1726-1750`, `next_batch=1751-1775`; lote não será repetido.
- Brutos dos executores permanecem somente em `/tmp`; nenhum bruto foi versionado.

## Próximo passo
Iniciar exatamente `1751–1775`, mantendo circuit-breaker, duas lanes read-only, validação independente de cardinalidade/IDs e sem publicar `withheld`.

## Gates locais
- `npm run test -- --passWithNoTests`: PASS — 496 testes/119 arquivos.
- `npx tsc --noEmit`: PASS.
- `node scripts/validate-impact-schema.mjs`: PASS.
- `npm run data:check`: PASS — 1.003 candidaturas, 988 fotos, 1 fonte TSE.
- `npm run build`: PASS — 245 módulos, sitemap 1.003 + 2, release local `1481086-20260906T082407875Z`.
- `npm run smoke:local`: PASS — 1.002 cards, 0 falhas HTTP, 0 erros online, service worker pronto.
- `git diff --check`: PASS.
- `npm run orch:doctor`: FAIL apenas pelo requisito de Node 24 no shell (Node 22.22.2); 4 WARNs operacionais. Nenhum dado factual foi promovido por causa desse FAIL.

## Publicação documental verificada
- Commit do lote: `7363fc511e7e10e74c4a08cd487c855289d14850`, `main -> main` aceito pelo GitHub.
- Backup Cloudflare workflow `334951434`: run `34021884595`, `completed/success`, `headSha` exato do commit.
- Produção: raiz HTTP 200 e `/release.json` HTTP 200; release `0.2.1217`, SHA exato `7363fc511e7e10e74c4a08cd487c855289d14850`, snapshot 1.003.
- O primeiro `curl` teve falha DNS transitória (`HTTP 000`), mas a verificação posterior confirmou HTTP 200 e SHA exato.
