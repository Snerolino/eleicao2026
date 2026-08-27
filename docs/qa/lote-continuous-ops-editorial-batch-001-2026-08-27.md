# QA — continuous ops: primeiro batch editorial ALRS — 2026-08-27

## Objetivo
Registrar a reconciliação nominal ALRS e a preparação do primeiro lote editorial factual, mantendo fontes oficiais obrigatórias e sem promoção editorial automática.

## Entregue e verificado
- Reconciliação nominal: `25.616` linhas de fonte, `25.456` versões resolvidas/já presentes, `0` missing seguro, `0` conflitos, `0` ambiguidades, `0` bloqueios de identidade; `160` proposições bloqueadas por ausência de vínculo exato.
- Manifesto substantivo oficial ALRS em cache fresco: `767` proposições, `959` versões verdes; aquisição anterior: `24/24` URLs HTTP 200 e `3.456` `data-item`.
- Materialização autenticada de perfis: `28.679` votos factuais, `28.679` linhas de índice e `79` perfis; sem score editorial ou matriz alterada.
- Batch `alrs-impact-editorial-batch-001-v2`: `25` proposições, `151` ocorrências de candidatos, `7` candidatos únicos, `151` votos factuais; hash `a871c36b706d5b4c7eba7828408bcdf73abeab063d3b33b9e715a57f11a6b548`.
- Classifier/reviewer independente: `25/25` decisões, `valid=true`, `0` erros.
- Dataset oficial `consulta_cand_2026_RS.csv` versus snapshot: `1003/1003` IDs, diferença `0/0`; SHA do CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

## Gates locais
- `npm run test`: `413/413` testes em `102` arquivos.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0.
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos, `1` fonte TSE.
- `npm run build`: RC 0 — `233` módulos, sitemap `1003 + 2`, release gerado.
- `git diff --check`: RC 0.

## Publicação
- Commit `770845fbb2a2df4b55410a9dcc5ed5ad1bff4464` alinhado a `origin/main`.
- Deploy primário `33053258144`: `success`, mesmo `headSha`.
- Backup `33053279176`: `skipped` por duplicidade do deploy primário.
- Produção: `/` HTTP 200 e `/release.json` HTTP 200; release `770845f`, snapshot `1003`.
- `portal:publication:verify`: `published_verified`; auditoria live: `1000` claims publicadas e `0` sem fonte.

## Bloqueios reais
- Auditoria strict de fontes continua fail-closed: gaps ALRS/Câmara/Senado `1251/3/112` em versões, `1647/2/188` em eventos e `4/2/455` em votos.
- As `160` proposições bloqueadas não geraram voto inventado nem promoção editorial. Nenhuma matriz/assessment/disposição foi aprovada automaticamente.
- `npm run orch:doctor` permanece degradado por Node 22 no shell e OpenCode ausente; os gates do projeto foram executados em Node 24.19.0.

## Próximo passo
Continuar a recuperação read-only das fontes e dos vínculos exatos das `160` proposições bloqueadas; manter decisões do batch sob revisão humana e não publicar score/matriz sem gate editorial autenticado.
