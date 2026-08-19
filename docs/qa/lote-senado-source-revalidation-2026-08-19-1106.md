# QA — revalidação de fontes nominais do Senado (2026-08-19 11:06 UTC)

## Objetivo
Revalidar, em modo read-only e com retry controlado, os seis PDFs oficiais do catálogo nominal do Senado; manter o item fail-closed enquanto houver deriva binária contra o manifesto versionado.

## Entregue e verificado
- 6/6 GETs oficiais retornaram HTTP 200.
- 6/6 respostas mantiveram o prefixo PDF válido (`%PDF-`).
- 1/6 respostas coincidiu em bytes com o manifesto; 0/6 coincidiu em SHA-256.
- Evidência transitória atualizada em `.orchestrator/runtime/senado-scout/revalidation-current.json`.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções e 0 votos tocados.
- Nenhuma escrita em Supabase, votos, identidades, FKs ou `source_references` foi executada.

## Estado dos dados
- `npm run data:check`: 1003 candidaturas públicas e 988 fotos oficiais.
- O snapshot permanece sem deriva de candidatos conhecida no checkpoint vigente.
- Senado permanece fail-closed até fonte estável e gates R0/schema/FK/dry-run/idempotência.

## Gates locais
Executados com Node v22.22.2 disponível no shell:
- `npm run test`: verde, 79 arquivos / 368 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde, 1003 / 988.
- `npm run build`: verde; sitemap com 1003 candidatos + 2 estáticas; `release.json` gerado.
- `git diff --check`: verde.
- Worktree limpa antes da documentação; a documentação deste lote é a única alteração rastreada esperada.

## Bloqueios reais
- Deriva binária persistente: 0/6 SHA-256 coincide com o manifesto. Não gerar manifesto novo automaticamente e não aplicar dados factuais.
- `npm run orch:doctor`: `OK=48 WARN=5 FAIL=1`; o único FAIL é o shell em Node v22.22.2, mas o projeto exige Node `>=24 <25`. OpenCode está ausente; não bloqueou a revalidação local.

## Publicação verificada
- Commit documental inicial `707a324d6623f1d421d8ea5c0bf1643b623fabda` foi publicado em `origin/main`.
- Backup Cloudflare `334951434`, run `32246035809`: `completed/success`, `headSha` idêntico ao commit.
- Produção raiz: HTTP 200.
- Produção `/release.json`: HTTP 200, SHA `707a324d6623f1d421d8ea5c0bf1643b623fabda` idêntico ao commit, versão `0.2.428`, snapshot com 1003 registros.

## Próximo passo bounded
Repetir os seis GETs oficiais com retry controlado no próximo tick; manter o Senado fail-closed e continuar lanes locais/publicação documental independentes sem inventar hash, URL, identidade ou voto.
