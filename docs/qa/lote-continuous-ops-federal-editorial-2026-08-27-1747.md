# QA — lote contínuo federal editorial — 2026-08-27 17:47 UTC

## Objetivo
Executar o próximo tick bounded da esteira da Câmara: reconstruir lote por cobertura nominal, classificar com verossimilhança intercasas, revisar independentemente e validar fail-closed, sem aplicar mutação remota.

## Entregue e verificado
- Lote federal reconstruído: `30` proposições, `batch_id=camara-editorial-batch-001-502c0b02649c`.
- Classificador: `30` decisões geradas, incluindo `5` matérias com assessment.
- Revisor independente: `30/30` decisões aprovadas.
- Validação independente: `valid=true`, `30` itens, `30` revisados, `30` aprovados, `0` erros; hash/batch_id coincidentes.
- Nenhuma aplicação remota foi executada. O artefato permanece com `remote_apply=false`; não houve alteração de Supabase, score ou matriz aprovada.

## Estado dos dados
- `data:check`: `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Dataset oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`; IDs `1003/1003`, diferenças `0/0` contra o snapshot.
- Auditoria de fontes read-only: gaps permanecem em versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`. Nenhuma fonte foi inventada.
- Portal: `published_verified`; raiz HTTP `200` (`3097` bytes) e `/release.json` HTTP `200` (`405` bytes).

## Gates locais
- Testes: `457/457` em `111` arquivos — verde.
- TypeScript, schema de impacto, `data:check` e `git diff --check` — verdes.
- Build: `237` módulos; sitemap `1003 + 2 = 1005` URLs; `release.json` gerado; verde.
- Doctor: `FAIL` apenas por shell Node `22` enquanto o projeto exige Node `24`; `WARN` OpenCode ausente. Gates do projeto foram executados com Node `24.19.0`.

## Bloqueios
- O lote ainda não pode ser tratado como publicação remota: o writer federal atual produz relatório/artifact local, não RPC autenticada de persistência. Portanto não aplicar fatos/assessments por atalho.
- Auditoria strict de fontes continua fail-closed nos gaps listados; votos sem evidência oficial não serão fabricados.

## Transporte e próximo passo
- Commit local: `4ab5a03` (`feat: preparar ciclo editorial federal fail-closed`).
- `git push origin main` foi tentado 3 vezes e bloqueado por HTTP 403: `Permission to Snerolino/eleicao2026.git denied to Snerolino`; nenhum deploy novo foi acionado.
- Manter a reconciliação read-only e preparar o gate factual/editorial remoto somente quando houver RPC Auth/editor/admin, catálogo de fontes e prova de idempotência; preservar o lote validado e não publicar matriz sem revisão/autorização específica.
