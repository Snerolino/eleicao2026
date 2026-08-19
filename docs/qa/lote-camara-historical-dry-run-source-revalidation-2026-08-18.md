# QA — dry-run histórico Câmara e revalidação de fontes — 2026-08-18

## Objetivo

Fechar o chunk de preparação do envelope histórico Câmara com revalidação oficial
em rede, adaptação ao contrato do planner e dry-run factual, sem promover os oito
registros de identidade bloqueados e sem escrita remota.

## Evidência executada

- Lock bounded adquirido e liberado; nenhum writer concorrente.
- Processo executado com Node `v24.19.0`.
- Adaptador `scripts/adapt-camara-historical-contract.mjs` refez o envelope a
  partir dos artefatos versionados e produziu: 2 proposições, 6 versões, 6
  eventos, 84 votos, 18 candidatos elegíveis e 7 fontes oficiais.
- Auditor `scripts/audit-camara-envelope-sources.mjs` refez sequencialmente os 7
  GETs oficiais e gravou manifesto transitório:
  `.orchestrator/runtime/camara-historical-scout/revalidated-source-manifest-2026-08-18.json`.
- Resultado da auditoria: **7/7 HTTP 200**, com bytes e SHA-256 revalidados.
- `node scripts/import-legislative-dry-run.mjs --catalog <catálogo-adaptado>
  <envelope-adaptado>`: **RC 0**, plano com 2/6/6/84 operações e nenhuma escrita.

## Entrega verificada

- Artefatos transitórios de envelope, catálogo, relatório de adaptação, plano e
  manifesto revalidado permanecem em `.orchestrator/runtime/` e não são fonte
  pública nem carregam UUID inventado.
- O planner resolve candidatos apenas pelo catálogo TSE; nenhuma identidade
  heurística foi promovida.
- Os 8 registros bloqueados (Sanderson como `senador` e Henrique Fontana como
  `outro`) permanecem fora do envelope, fail-closed.

## Estado remoto e segurança

- Nenhuma proposição, versão, evento, voto, identidade, FK, `source_reference`,
  matriz, RPC, Supabase ou Cloudflare foi alterado neste chunk.
- As 7 referências históricas continuam pendentes de materialização remota; não
  foi preenchido nenhum `source_reference_id` sem UUID confirmado.
- Aplicação remota permanece separada: exige nova leitura de identidade/schema,
  refetch com comparação de HTTP/bytes/hash e prova de idempotência antes e após
  qualquer `--apply` autorizado.

## Gates locais

Executados com Node `v24.19.0`, todos RC 0:

- `npm run test -- --passWithNoTests`: 76 arquivos / 359 testes.
- `npx tsc --noEmit`: RC 0.
- `node scripts/validate-impact-schema.mjs`: RC 0, checkpoint OK.
- `npm run data:check`: 1003 candidaturas / 988 fotos oficiais.
- `npm run build`: RC 0; sitemap com 1003 candidatos + 2 estáticas e `release.json` gerado.
- `git diff --check`: RC 0.

O `orch:doctor -- --smoke` no shell cron permanece bloqueado somente pelo Node
22.22.2; a execução do tick foi corrigida por `nvm use 24.19.0` e os gates acima
foram executados nessa versão suportada.

## Publicação e verificação

- Commit funcional/documental `ccc44a1ee4bca20f0235ca9d2fd031b26aee9256` foi
  publicado em `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32199836179`, concluiu `success`
  com `headSha` idêntico ao commit.
- Produção respondeu `HTTP 200` em `https://rs.votopraquem.org`.
- `/release.json` confirmou SHA completo `ccc44a1ee4bca20f0235ca9d2fd031b26aee9256`,
  release `ccc44a1-20260819T000527903Z`, versão `0.2.362` e snapshot com 1003
  candidaturas.
- O follow-up documental `af5318a87c6c8bf2d5a39cff5332e856007d8bc4` também foi
  publicado em `origin/main`; backup `334951434`, run `32199939419`, concluiu
  `success` com `headSha` idêntico, produção HTTP 200 e `/release.json` confirmou
  o SHA final e snapshot com 1003 candidaturas.

## Próximo passo

Auditar novamente o catálogo remoto de `source_references` e preparar, em chunk
separado, o writer idempotente das 7 referências; os 8 casos inelegíveis não
podem entrar na carga factual.
