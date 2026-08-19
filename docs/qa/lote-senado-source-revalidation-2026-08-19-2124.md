# Lote Senado — revalidação oficial e gates locais (2026-08-19 21:24 UTC)

## Objetivo

Executar um tick bounded de continuidade: revalidar as seis fontes oficiais do Senado, manter o fluxo fail-closed diante de deriva de conteúdo, provar o dry-run do aplicador e confirmar os gates locais do snapshot público.

## Entregue e verificado

- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao final.
- Reconhecimento read-only das seis URLs oficiais do manifesto:
  - HTTP 200: **6/6**;
  - prefixo PDF válido: **6/6**;
  - bytes idênticos ao manifesto: **2/6**;
  - SHA-256 idêntico ao manifesto: **0/6**.
- Evidência atualizada em `.orchestrator/runtime/senado-revalidation-current.json` (runtime ignorado pelo Git).
- `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.
- CSV oficial local `../dataset2026/candidatos/lista_candidatos_2026.csv`: SHA-256 `7c80d8260618ddc18ce62b44f12f7c463032c937f7f6ea5179cf75943f4207ea`, 67.483 bytes.
- Snapshot público: 1.003 candidaturas.

## Gates locais

Executados com Node 24 via nvm:

- `npm run test -- --passWithNoTests`: **81 arquivos / 371 testes, 0 falhas**.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde**, 1.003 candidaturas e 988 fotos oficiais.
- `npm run build`: **verde**, release local `0.2.0`, sitemap com 1.005 URLs e `release.json` gerado.
- `git diff --check`: **verde**.
- Worktree após os gates: sem alterações funcionais não documentadas.

## Bloqueios e segurança

A deriva SHA-256 permanece real: nenhum dos seis PDFs atuais coincide com o manifesto versionado. Portanto, o lote permanece **fail-closed**: não atualizar manifesto, não inserir fontes no Supabase e não tocar votos. HTTP 200 e prefixo PDF não substituem a prova de identidade por hash.

O doctor do cron continua com FAIL de infraestrutura porque o shell usa Node 22.22.2 enquanto o projeto exige Node 24; os gates foram executados com Node 24. OpenCode está ausente e o fallback Ollama não respondeu ao preflight, ambos opcionais.

## Próximo passo

Repetir os seis GETs oficiais em próximo tick, sem gerar manifesto novo nem aplicar fatos enquanto persistir a deriva. Manter a lane local/publicação independente e verificar o commit documental desta QA em CI/Cloudflare quando publicado.
