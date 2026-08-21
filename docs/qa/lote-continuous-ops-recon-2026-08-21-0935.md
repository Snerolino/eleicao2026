# Lote continuous ops — recon oficial e gates locais — 2026-08-21 09:35Z

## Objetivo
Executar um tick bounded das quatro lanes: revalidar ALRS, Senado e Câmara exclusivamente em fontes oficiais; manter aplicação factual fail-closed; regenerar o pacote local de pedidos substantivos; comparar `../dataset2026` ao snapshot; e fechar os gates locais.

## Entregue e verificado
- Lock não bloqueante disponível em `.orchestrator/runtime/locks/continuous-progress.lock`; tick executado sem writer concorrente.
- ALRS: extração P0/P1 refeita em 7/7 URLs oficiais HTTP 200, com 526 itens oficiais; pacote de pedidos substantivos regenerado com 9 pedidos / 8 versões.
- ALRS FED-17: reparo permaneceu dry-run com `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Senado: dry-run de fontes com `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`; nenhuma aplicação. A adaptação de envelope não foi executada porque o input transitório `/tmp/senado-nominal-envelope-latest.json` não existe; nenhum fallback ou dado foi inventado.
- Câmara: API oficial respondeu em janelas trimestrais válidas de 2025–2026 e retornou IDs oficiais; descoberta foi somente read-only, sem reconciliação ou aplicação de voto/identidade/FK.
- Dataset vivo: 5 CSVs de candidatos comparáveis, 1003 IDs; snapshot com 1003 IDs; `only_dataset=0` e `only_snapshot=0`. Nenhum refresh aplicado.
- Validador substantivo confirmou fail-closed: 25 itens, todos bloqueados por `substantive_source_missing` / `substantive_gate_blocked`.

## Gates locais
Executados com Node `v24.19.0` via `source ~/.nvm/nvm.sh && nvm use 24`:
- `npm test`: 97 arquivos / 398 testes, todos passaram.
- `npx tsc --noEmit`: passou.
- `node scripts/validate-impact-schema.mjs`: passou.
- `npm run data:check`: passou; 1003 candidaturas, 988 fotos oficiais.
- `npm run build`: passou; sitemap com 1003 candidatos + estáticas = 1005 URLs; `release.json` gerado para `501e3b6`.
- `npm run smoke:local`: passou; 1002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- `git diff --check`: passou; worktree continuou limpa após os comandos de recon/gates.

## Estado dos dados
Nenhuma candidatura, foto, identidade, FK, voto, matriz, claim, source reference, Supabase, Cloudflare ou snapshot público foi inventado ou aplicado. O tick produziu apenas artefatos transitórios ignorados e validações read-only; não há alteração factual rastreável para publicar.

## Bloqueios reais
- 4 itens ALRS residuais de Enio Carlos Terra continuam sem identidade oficial e fonte exata.
- 25 itens substantivos continuam sem fonte substantiva oficial; o validador bloqueia corretamente.
- Senado segue fail-closed por deriva de bytes/SHA registrada no manifesto de 2026-08-19; HTTP 200 e prefixo PDF válido não são prova suficiente.
- Adaptação do envelope Senado bloqueada por ausência real do input transitório `/tmp/senado-nominal-envelope-latest.json`.
- Auditoria estrita de cobertura mantém gaps reais: ALRS 1251 versões / 1647 eventos / 4 votos; Câmara 3 / 2 / 2; Senado 112 / 188 / 455.
- `npm run orch:doctor` no shell cron continua FAIL por Node `v22.22.2`; os gates foram executados comprovadamente com Node `v24.19.0`. Smoke Codex MCP segue indisponível por `401 invalid_refresh_token` e não foi repetido.

## Publicação e verificação externa
- Documentação publicada no commit `13b368239daa17712aa52341ec3c4cc06f5534bb` (`main -> origin/main`), com worktree limpa após o push.
- Backup Cloudflare `334951434`, run `32468717253`: `completed/success`, `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org`: HTTP 200; `/release.json` confirmou SHA idêntico, release `13b3682-20260821T093702679Z`, versão `0.2.691`, `row_count=1003`.
- Smoke remoto: 1002 cards, 0 falhas HTTP, 0 erros de console online, service worker pronto.
- A recon do tick não criou dado factual; a publicação contém apenas o checkpoint operacional e a evidência dos gates.

## Próximo passo
Nova recon bounded oficial e lane local independente. Priorizar a recuperação de identidade/fonte exata dos 4 casos Enio/Terra e a recuperação do input oficial do Senado, sempre fail-closed. Aplicação remota factual continua condicionada a R0, schema/FK, fonte oficial exata, dry-run e idempotência.
