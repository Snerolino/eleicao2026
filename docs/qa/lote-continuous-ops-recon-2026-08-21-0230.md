# Lote continuous-ops — recon oficial bounded e gates locais

- **Data/hora UTC:** 2026-08-21T02:30Z
- **Objetivo:** repetir reconhecimento oficial das lanes ALRS/Câmara/Senado, comparar o dataset vivo sem promover deriva, e validar o estado local.

## Entregue e verificado

- Lock `.orchestrator/runtime/locks/continuous-progress.lock` adquirido e liberado com `flock -n`.
- ALRS P0: `npm run impact:alrs:r4:p0:evidence` consultou 7/7 URLs oficiais com HTTP 200 e capturou 526 `data-item`; evidência permanece `remote_apply=false`.
- ALRS P0/P1: `npm run impact:alrs:r4:sources` refez 7/7 GETs oficiais, todos HTTP 200 e `ok=7`, sem falhas; somente o timestamp do manifesto foi atualizado.
- Câmara: `npm run impact:camara:discover` consultou janelas trimestrais oficiais de 2025–2026, recebeu páginas válidas e retornou `vote_ids`; a saída permaneceu read-only.
- Senado: `npm run impact:senado:sources:apply -- --dry-run` planejou 6 fontes, com 0 ausentes, 0 inserções e 0 votos tocados.
- Dataset vivo: os CSVs comparáveis não apresentaram IDs ausentes em relação ao snapshot público; nenhum refresh ou sincronização foi aplicado.

## Gates locais (Node 24.19.0)

- Testes: **95 arquivos, 396 testes, exit 0**.
- TypeScript: `npx tsc --noEmit`, **exit 0**.
- Schema de impacto: **exit 0**.
- `data:check`: **1003 candidaturas, 988 fotos oficiais, exit 0**.
- Build Vite/PWA/sitemap/release: **exit 0**; sitemap com 1003 candidatos + 2 estáticas (1005 URLs).
- Smoke local: **exit 0**, 1002 cards, expectedMinCount 1002, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: **exit 0**.

## Dados e bloqueios

- Nenhuma escrita factual em snapshot, votos, claims, source references, identidades, FKs, matriz, Supabase ou Cloudflare.
- ALRS continua bloqueado nos quatro residuais de Enio Carlos Terra sem ID oficial/fonte exata; nenhum voto foi inferido.
- Senado continua fail-closed fora do dry-run enquanto a evidência/hash oficial não fechar.
- Câmara permanece em reconhecimento; qualquer aplicação exige reconciliação exata, R0/schema/FK/fonte, dry-run e idempotência.
- Doctor do shell cron continua com FAIL por Node 22.22.2; o chunk foi executado e validado explicitamente com Node 24.19.0. OpenCode ausente e Ollama sem preflight permanecem warnings opcionais.

## Publicação/verificação

- Commit documental inicial: `dcda2c3d1137385ae224484c15630cf7a7cd03ff` publicado em `origin/main`.
- Workflow backup `334951434`, run `32440153324`, concluiu `completed/success` com `headSha` idêntico ao commit.
- Produção: raiz `HTTP 200`; após propagação, `/release.json` confirmou SHA `dcda2c3d1137385ae224484c15630cf7a7cd03ff`, snapshot `row_count=1003`.

## Próximo passo

Iniciar nova recon bounded sem promover deriva; ALRS, Senado e Câmara continuam fail-closed para aplicação factual sem os gates específicos.
