# QA — operação contínua P2-2 editorial

**Data:** 2026-08-23

## Objetivo

Consolidar o pacote editorial local do micro-lote ALRS P2-2 depois da
recuperação das fontes oficiais, sem publicar assessment ou matriz
automaticamente.

## Entrega verificada

- `5/5` identidades oficiais ALRS no manifesto;
- `5/5` páginas oficiais e PDFs com HTTP 200, bytes e SHA reproduzidos;
- `5/5` fontes com `durability_gate=green`;
- pacote editorial com `5` versões, `source_green=5` e `5` disposições
  `pending_review`;
- `0` assessments automáticos, `remote_apply=false` e
  `public_approval=false`;
- gerador corrigido para não falhar nem promover fonte quando o manifesto
  estiver ausente; a execução atual encontrou o manifesto oficial presente;
- idempotência comprovada: duas execuções consecutivas produziram o mesmo
  SHA do pacote.

Artefatos:

- `data/legislative-import/alrs/p2-microbatch-2-source-manifest.json`;
- `data/legislative-import/alrs/p2-microbatch-2-editorial-review-pack.json`;
- `scripts/build-alrs-p2-microbatch-2-editorial-pack.mjs`.

## Gates locais

- `npm run test`: RC 0 — `401` testes, `98` arquivos;
- `npx tsc --noEmit`: RC 0;
- `node scripts/validate-impact-schema.mjs`: RC 0;
- `npm run data:check`: RC 0 — `1003` candidaturas, `988` fotos, `1` fonte TSE;
- `npm run build`: RC 0 — `224` módulos, sitemap `1003 + 2`, release local
  `a8e629b-20260823T131347157Z`;
- `git diff --check`: RC 0;
- verificação independente dos cinco PDFs: `bytes` e SHA coincidentes;
- `node --check` do gerador: RC 0.

## Estado e bloqueios

O pacote continua local e pendente de decisão editorial humana no `/admin`.
Nenhuma matriz, assessment, voto, identidade remota, FK, source reference,
claim, Supabase ou Cloudflare foi alterado. Publicação GitHub permanece sujeita
à revalidação do transporte que vinha retornando HTTP 403.

## Próximo passo

Commit/push do lote documental e validação do workflow backup `334951434`,
`headSha` e `/release.json` se o transporte Git aceitar. A aplicação factual
remota só pode ocorrer depois de revisão editorial, R0/schema/FK, dry-run e
segunda execução idempotente.
