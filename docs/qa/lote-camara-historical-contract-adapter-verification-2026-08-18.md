# QA — verificação do adaptador de contrato Câmara histórico — 2026-08-18

## Objetivo

Revalidar o adaptador local fail-closed do envelope histórico Câmara após o
bloqueio de contrato/FK, sem promover os oito registros inelegíveis e sem
executar SQL remoto.

## Entrega verificada

- `scripts/adapt-camara-historical-contract.mjs` adaptou o envelope oficial
  versionado a partir de título, hashes/bytes do manifesto, catálogo nominal e
  catálogo TSE.
- Envelope adaptado: 2 proposições, 6 versões, 6 eventos, 84 votos, 18
  candidatos elegíveis e 7 fontes oficiais.
- Derivações verificadas: `number`/`year`, `text_hash` SHA-256, referências de
  candidato somente por `tse_candidate_id` e `deputy_id` lógico; nenhum UUID de
  `source_reference` foi inventado.
- Registros bloqueados: 8, incluindo Sanderson (`senador`) e Henrique Fontana
  (`outro`); continuam fora do envelope.
- Artefatos de dry-run foram gravados somente em
  `.orchestrator/runtime/camara-historical-scout/`, que é transitório e não é
  fonte pública.

## Evidência de execução

- Adaptador executado com Node `v24.19.0`: totais acima, sem erro.
- `node scripts/import-legislative-dry-run.mjs --catalog <catálogo-adaptado>
  <envelope-adaptado>`: **RC 0**, plano com 2/6/6/84 operações; nenhuma escrita.
- `npm run orch:doctor -- --smoke`: **RC 0**, `OK=53 WARN=4 FAIL=0`.
  Warnings não bloqueantes: Ollama lento/indisponível, OpenCode ausente e
  rotas opcionais não habilitadas.

## Gates locais

- `npm run test -- --passWithNoTests`: **RC 0**, 76 arquivos / 359 testes.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**, checkpoint OK.
- `npm run data:check`: **RC 0**, 1003 candidaturas / 988 fotos oficiais.
- `npm run build`: **RC 0**, sitemap com 1003 candidatos + 2 estáticas e
  `release.json` gerado para `7df8c53`.
- `git diff --check`: **RC 0**.
- Worktree: limpa antes e depois da verificação; nenhum arquivo funcional
  adicional alterado neste tick.

## Segurança e bloqueios

Nenhum SQL, FK, UUID, `source_reference`, voto, matriz, RPC, Supabase ou
Cloudflare foi escrito. O adaptador não resolve UUID remoto: o catálogo de
fontes permanece explicitamente pendente para uma futura aplicação idempotente.
Os oito registros inelegíveis permanecem fail-closed.

## Publicação e verificação

- Commit funcional/documental `ac368980a0a0e0e7139720b235ab93cc10b15cf1` foi publicado em `origin/main`.
- Workflow backup Cloudflare `334951434`, run `32192705790`, concluiu `success` com `headSha` idêntico.
- Produção respondeu `HTTP 200` em `https://rs.votopraquem.org`.
- `/release.json` confirmou SHA completo `ac368980a0a0e0e7139720b235ab93cc10b15cf1`, release `ac36898-20260818T222704535Z` e snapshot com 1003 candidaturas.
- Worktree final limpa e `git ls-remote` confirmou o mesmo SHA em `origin/main`.

## Próximo passo

Executar a auditoria read-only final do catálogo remoto de `source_references`
e das FKs por `tse_candidate_id`; somente depois preparar um plano de aplicação
idempotente, mantendo revisão das fontes e sem aplicar registros bloqueados.
