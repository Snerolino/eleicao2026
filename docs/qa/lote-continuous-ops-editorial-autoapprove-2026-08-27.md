# QA — lote continuous ops editorial autoapprove — 2026-08-27

## Objetivo

Processar dois lotes consecutivos de disposições editoriais ALRS com fonte verde,
classificação determinística, revisão independente, validação de hash e aplicação
somente via RPC autenticada de editor/admin.

## Entregue e verificado

- Primeiro lote: `25/25` decisões válidas e aplicadas; `25 approved`, `0 needs_changes`.
- Segundo lote: `25/25` decisões válidas e aplicadas; `25 approved`, `0 needs_changes`.
- Ambos os lotes usaram `source_gate=green`, `review_key` exato e hash do batch validado.
- RPC aplicada: `record_impact_editorial_disposition`; não houve INSERT/UPDATE direto,
  nem alteração de votos factuais ou de score/matriz aprovada.
- Reconciliação remota após os lotes: `132` versões resolvidas, contra `82` no início
  deste tick; `51` perfis ALRS.
- Um novo lote bounded foi reconstruído após a aplicação: `25` proposições,
  `100` ocorrências/candidatos, `100` votos factuais, permanecendo `pending_review`
  para o próximo tick.
- `portal:publication:verify`: `published_verified`; portal e `release.json` HTTP 200.

## Gates locais

- Testes: `437/437` em `106` arquivos.
- TypeScript: passou.
- `validate-impact-schema`: passou.
- `data:check`: `1003` candidaturas e `988` fotos oficiais; passou.
- `build`: passou; `237` módulos, sitemap com `1003 + 2` URLs.
- `git diff --check`: passou.

## Estado de fontes e bloqueios

- Auditoria strict permanece fail-closed: versões sem fonte ALRS/Câmara/Senado
  `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- O reparo residual ALRS continua bloqueado porque a evidência oficial mudou na URL
  `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario/pesquisa?solicitante=93&ano=2026`.
  Nenhum voto residual foi inventado ou aplicado.
- `orch:doctor` permanece RC 1 por Node `22.22.2` no shell enquanto o projeto exige
  Node 24 e por OpenCode ausente; a rota local do projeto passou nos gates acima.

## Próximo passo

Manter o próximo lote em `pending_review`, continuar a aquisição/reconciliação
read-only de fontes oficiais e aplicar somente itens com fonte/hash/match exatos.
