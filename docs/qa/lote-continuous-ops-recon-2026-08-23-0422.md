# QA — lote continuous ops recon — 2026-08-23 04:22 UTC

## Objetivo

Executar um tick bounded do control plane: manter recon oficial read-only ativa,
revalidar o snapshot contra `../dataset2026`, executar os gates locais e tentar a
publicação do checkpoint sem promover fatos sem fonte/identidade exata.

## Reconhecimento oficial verificado

- **ALRS FED-17 residual:** `repair-alrs-fed17-residual.mjs` em dry-run retornou
  `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4` e
  `impact_touched=false`. Os quatro casos Enio Carlos Terra continuam sem ID
  oficial e fonte exata; nenhum voto/data foi aplicado.
- **Câmara:** API oficial `https://dadosabertos.camara.leg.br/api/v2/votacoes`,
  oito janelas explícitas entre 2025-01-01 e 2026-12-31, uma página por janela:
  `8/8` páginas HTTP OK, `blocked=null`, `700` IDs transitórios agregados. O
  último trimestre (2026-10-01 a 2026-12-31) retornou zero IDs, sem erro. Não
  houve reconciliação, escrita ou aplicação.
- **Senado:** permanece fail-closed; não existe envelope nominal verificável com
  SHA suficiente para reconciliação.
- **Fontes legislativas:** auditoria read-only regular retornou RC 0; a auditoria
  estrita retorna RC 2 pelos gaps reais: versões sem fonte ALRS/Câmara/Senado
  `1251/3/112`, eventos `1647/2/188` e votos `4/2/455`. Nada foi inventado.

## Dados públicos

Comparação read-only por `SQ_CANDIDATO`:

- CSV oficial: `1003` IDs;
- snapshot: `1003` IDs;
- diferença CSV→snapshot: `0`; snapshot→CSV: `0`;
- SHA-256 do CSV: `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.

`npm run data:check`: `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.

## Gates locais verificados (Node 24.19.0)

- `npm run test`: **401 testes / 98 arquivos aprovados**;
- `npx tsc --noEmit`: **OK**;
- `node scripts/validate-impact-schema.mjs`: **OK**;
- `npm run data:check`: **OK**;
- `npm run build`: **OK**, `224` módulos, sitemap `1003 + 2` URLs, release local
  `f03a347-20260823T042207753Z`;
- `git diff --check`: **OK**;
- `npm run smoke:local`: **OK**, `1002` cards, `0` falhas HTTP, `0` erros online,
  service worker pronto.

## Bloqueios

- `npm run orch:doctor -- --smoke`: RC 1. O shell padrão usa Node 22.22.2,
  incompatível com o requisito Node 24; rota Codex MCP/fallback falhou por
  `401 invalid_refresh_token`; OpenCode está ausente. Antigravity comprovou a
  leitura sanitizada. Isso não bloqueou os gates locais executados explicitamente
  com Node 24.19.0.
- Publicação GitHub ainda depende da permissão efetiva do transporte Git. O
  checkpoint anterior registrou HTTP 403 para `git push origin main`, apesar de
  `gh api` reportar `push=true`; não repetir escrita remota sem verificar a
  tentativa deste tick.

## Estado remoto

- Nenhuma escrita factual no Supabase, migration, RLS, source reference ou
  Cloudflare ocorreu neste lote.
- Produção revalidada: raiz `https://rs.votopraquem.org` HTTP 200. O
  `/release.json` permanece em `3aae2d0` / versão `0.2.835`, não corresponde ao
  HEAD local deste checkpoint.

## Próximo passo

Retentar `git push origin main` com a credencial efetiva disponível. Se o push
for aceito, confirmar o workflow backup `334951434`, `headSha` igual ao commit
publicado e HTTP 200/`release.json` em produção. Manter ALRS/Senado fail-closed e
Câmara apenas em reconciliação read-only até R0, schema/FK, fonte oficial, dry-run
e idempotência passarem.
