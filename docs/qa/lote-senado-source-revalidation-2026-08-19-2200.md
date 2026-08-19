# QA — lote Senado: revalidação oficial bounded (2026-08-19 22:00 UTC)

## Objetivo
Executar um tick bounded de continuidade: repetir os seis GETs oficiais do Senado, manter o fluxo fail-closed enquanto o conteúdo divergir do manifesto, provar o dry-run do aplicador e validar os gates locais sem alterar fatos remotos.

## Entregue e verificado

- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao final de cada bloco.
- Reconhecimento sequencial read-only das seis URLs em `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Evidência atualizada em `.orchestrator/runtime/senado-revalidation-current.json` (runtime ignorado pelo Git): **6/6 HTTP**, **6/6 prefixos PDF**, **2/6 bytes idênticos**, **0/6 SHA-256 idênticos**.
- Observação: os seis downloads tiveram HTTP bem-sucedido; os tamanhos observados foram 138360, 138559, 138151, 97445, 97428 e 97376 bytes, respectivamente. Nenhum hash novo foi promovido ao manifesto.
- `npm run impact:senado:sources:apply -- --dry-run`: **6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados**.

## Gates locais

Executados com Node `v24.19.0` via PATH do nvm:

- `npm run test -- --passWithNoTests`: **81 arquivos / 371 testes, 0 falhas**.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde — **1.003 candidaturas / 988 fotos oficiais**.
- `npm run build`: verde — sitemap **1.005 URLs** e `release.json` local gerado.
- `git diff --check`: verde.
- Worktree permaneceu limpa antes da documentação; não houve alteração funcional ou factual.

## Bloqueios e segurança

A deriva SHA-256 permanece real: **0/6** respostas atuais coincide com o manifesto. HTTP 200, prefixo PDF ou pequena variação de bytes não substituem prova de identidade por hash. Portanto, nenhum manifesto foi atualizado, nenhuma fonte foi inserida no Supabase e nenhum voto/identidade/FK foi tocado.

O `npm run orch:doctor` retornou `OK=48 WARN=5 FAIL=1`: FAIL conhecido porque o shell do cron usa Node 22.22.2 enquanto o projeto exige Node 24; OpenCode ausente e Ollama sem resposta permanecem WARN opcionais. Os gates do projeto passaram com Node 24.19.0.

## Publicação e verificação final

- Commit documental final: `c8675b6e119ca6a06f96592a9b2b163c3c105e01` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32306924768`: `completed/success`, `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org/`: raiz HTTP 200 e `/release.json` HTTP 200.
- `release.json` confirma SHA completo `c8675b6e119ca6a06f96592a9b2b163c3c105e01`, versão `0.2.468` e snapshot com `row_count=1003`.

## Publicação e verificação

- Commit documental inicial: `8e774a6267ed792afd9f0e41e283ed63fcca79f1` publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32306802705`: `completed/success`, `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org/`: raiz HTTP 200 e `/release.json` HTTP 200.
- `release.json` confirma SHA completo `8e774a6267ed792afd9f0e41e283ed63fcca79f1`, versão `0.2.467` e snapshot com `row_count=1003`.

## Próximo passo

No próximo tick, repetir os seis GETs oficiais sem gerar manifesto novo nem aplicar fatos enquanto persistir a deriva. Manter a lane local/publicação independente e continuar verificando release/Cloudflare após cada documentação publicada.
