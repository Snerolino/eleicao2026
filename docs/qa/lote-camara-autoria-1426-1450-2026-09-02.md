# QA — Autoria Câmara 1426–1450 — 2026-09-02

## Objetivo
Processar o microbatch seguinte de 25 projetos únicos de autoria da Câmara em duas lanes read-only, sem converter autoria em voto, impacto, score ou claim público.

## Seleção e heartbeat
- Seleção determinística: 25 projetos únicos, 100 ocorrências candidato–projeto e 24 candidatos únicos, offset 1425/limit 25.
- Checkpoint inicial registrado antes das lanes; checkpoint final `blocked`, `projects_analyzed=1450`, `approved=0`, `pending_review=0`, `withheld=1450`, próximo `1451–1475`.
- Nenhuma alteração em snapshot público, authored_projects, Supabase, Cloudflare ou nos três artefatos `impact-editorial-*` pré-existentes.

## Lanes e verificação independente
- Causal / Antigravity: processo `exit=0`; JSON extraído de bloco Markdown e validado com 25/25 IDs, decisões `withheld` e `score_eligible=false`.
- Red-team / Codex read-only: transporte `exit=0`, mas devolveu envelope de executor em vez da lista exigida; cardinalidade/contrato da lane não foi aceito.
- Fallback red-team / Antigravity: processo `exit=0` e 25 objetos, porém falhou no gate de identidade exata: um ID veio como `camara:req-1419-2022-233553` em vez de `camara:req-1419-2022-2335553`. Portanto, a saída foi rejeitada por conjunto de IDs divergente; não houve reconciliação nem promoção.

## Estado dos dados
- Batch `1426–1450`: `blocked` / fail-closed. Não foi criado artefato reconciliado porque as duas lanes independentes não apresentaram contrato simultaneamente válido.
- O conteúdo do manifesto factual permanece somente metadado oficial Câmara (`dadosabertos.camara.leg.br`); não houve leitura/promulgação de texto normativo, versão, evento nominal ou efeito causal.
- Nenhum projeto foi aplicado a `authored_projects`; nenhum voto, score, matriz ou claim foi criado.

## Bloqueios reais
- Codex entregou formato incompatível com a lane (executor report, não array de 25 itens).
- Fallback Antigravity entregou cardinalidade 25, mas um identificador divergente; o verificador rejeitou corretamente para evitar associação errada.
- Mesmo com IDs válidos, os REQs não demonstram a cadeia fonte oficial → texto normativo → versão/evento nominal → efeito; a política permanece `withheld`.

## Próximo passo
Retomar `1451–1475` com heartbeat, seleção determinística e duas lanes read-only; não repetir o output inválido, exigir conjunto exato de IDs e manter fail-closed. O bloqueio deste lote permanece restrito ao item/lane e não autoriza publicação.

## Gates locais
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: RC 0 — sitemap 1003 candidatos + 2 estáticas; `release.json` gerado para o HEAD local.
- `git diff --check`: RC 0.
- `npm run test`: RC 1 — 116/117 arquivos e 490/491 testes; `camara-autonomous-editorial-cycle` excedeu 5000 ms apesar do script direto concluir em RC 0 em 1,97 s. Gate geral permanece vermelho; não houve commit/push/deploy.
- A execução direta de diagnóstico do ciclo existente foi isolada e retornou `remote_apply=true` no relatório, mas não foi tratada como publicação deste lote de autoria; os três artefatos `impact-editorial-*` são alterações pré-existentes/fora do escopo e não foram incluídos em qualquer mutação intencional.
