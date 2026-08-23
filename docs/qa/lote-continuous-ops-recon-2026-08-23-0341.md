# QA — continuous ops recon — 2026-08-23 03:41 UTC

## Objetivo
Executar tick bounded do control plane: reconhecimento oficial read-only, diff do
`dataset2026`, gates locais completos e tentativa de publicar o HEAD sem fabricar
fatos.

## Entregue e verificado
- Lock não bloqueante adquirido/liberado com `flock -n`.
- Estado Git antes da documentação: `main`, HEAD `c4f47e8`, worktree limpa, `41` commits à frente de `origin/main`; após registrar este QA, commit documental local foi criado e ficou `42` commits à frente.
- Diff dataset/snapshot por `SQ_CANDIDATO`: CSV oficial
  `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` com
  `1.003` linhas/IDs, snapshot com `1.003`; diferença `0/0`; CSV SHA-256
  `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- ALRS FED-17 residual dry-run RC 0:
  `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`,
  `impact_touched=false`. Os quatro casos de Enio Carlos Terra seguem sem ID
  oficial e fonte exata.
- Câmara oficial `dadosabertos.camara.leg.br/api/v2`: 8 janelas trimestrais,
  `8/8` páginas `ok`, `blocked=null`, `700` IDs transitórios; sem reconciliação
  ou escrita.
- Auditoria de cobertura read-only RC 0, gaps reais preservados: versões sem
  fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Gates com Node `v24.19.0`: `401` testes em `98` arquivos; TypeScript; schema;
  `data:check` com `1.003` candidaturas, `988` fotos oficiais e `1` fonte TSE;
  build com `224` módulos, sitemap `1003 + 2` URLs e release local
  `c4f47e8-20260823T033915062Z`; `git diff --check` verde.
- Smoke local RC 0: `1002` cards, `0` falhas HTTP, `0` erros online, service
  worker pronto; rota de detalhe e modo offline validados.

## Publicação
- `gh api` confirma usuário `Snerolino` e permissões API `push=true/admin=true`.
- `env -u GH_TOKEN git push origin main` falhou RC 128 com HTTP 403:
  `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Causa real permanece divergência entre credencial efetiva aceita pelo transporte
  Git HTTPS e permissões reportadas pela API. Nenhum bypass foi usado; nenhum
  workflow novo ou deploy foi acionado.

## Estado dos dados e bloqueios
- Nenhuma alteração factual, Supabase, migration, RLS, Cloudflare ou workflow
  remoto foi executada.
- Senado permanece fail-closed sem envelope nominal com SHA verificável.
- Strict source audit continua bloqueado pelos gaps oficiais existentes; isso é
  gap de cobertura, não falha a ser mascarada.
- Doctor permanece RC 1 porque o shell padrão usa Node 22, embora os gates tenham
  sido executados explicitamente com Node 24.19.0; OpenCode ausente e Codex MCP
  não foram necessários para este tick read-only.

## Próximo passo
Retentar `main -> main` quando a credencial efetiva do transporte Git for corrigida;
se aceitar, validar o workflow backup `334951434`, comparar `headSha` com o commit
publicado e revalidar `https://rs.votopraquem.org`/`release.json`. Manter ALRS,
Senado e gaps de fontes fail-closed até evidência oficial, ID exato, manifesto/hash,
dry-run e idempotência.
