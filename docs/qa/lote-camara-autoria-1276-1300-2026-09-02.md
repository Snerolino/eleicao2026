# QA — Câmara autoria editorial 1276–1300 — 2026-09-02

## Objetivo

Executar o próximo microbatch de 25 projetos únicos do catálogo factual de autoria da Câmara, com duas análises read-only independentes (causal e red-team), sem publicar autoria como voto, impacto ou score.

## Preparação e fontes

- Lock exclusivo `flock` adquirido antes do checkpoint e liberado ao fim das operações.
- Seleção gerada de `/tmp/camara-authored-unique-review-1276-1300.json`: `25` projetos, `100` ocorrências candidato–projeto e `26` candidatos únicos.
- O manifesto de seleção preserva URLs oficiais da Câmara; não houve escrita remota nem alteração do snapshot público.
- Próximo pacote read-only preparado: `/tmp/camara-authored-unique-review-1301-1325.json`, `25/25` IDs únicos e `25/25` URLs oficiais `dadosabertos.camara.leg.br`.

## Resultado das duas lanes

- **Causal / Antigravity:** retornou JSON dentro de bloco Markdown, não JSON puro verificável pelo contrato; portanto rejeitado na camada `cli/formato`. Não foi aceito como dado.
- **Red-team / free pool:** bloqueado porque `opencode` não está disponível (`exit 69`); não repetir este provider neste tick.
- **Fallback red-team / Codex exec:** bloqueado por falta de créditos da API (`stream disconnected ... You have no credits remaining`, `exit 1`).
- Como não existe saída independente válida com cardinalidade/contrato verificáveis, o batch `1276-1300` foi marcado `blocked`/`withheld`: `25` analisados, `0` aprovados, `0` pending, `0` score-eligible.

## Estado dos dados e segurança

- `data/legislative-import/camara/authored-analysis-progress-v1.json` atualizado com `last_batch=1276-1300`, `status=blocked`, `next_batch=1301-1325`, `projects_analyzed=1300`, `withheld=1300`.
- Bloqueios persistidos: `authored-1276-1300-causal-format`, `authored-1276-1300-redteam-provider`, `authored-1276-1300-redteam-codex`.
- Nenhum `authored_projects` novo foi aplicado; nenhum claim, voto, score, matriz, Supabase, Cloudflare ou dado sem fonte foi escrito.

## Gates verificados

- `npm run test -- --passWithNoTests`: exit `0`.
- `npx tsc --noEmit`: exit `0`.
- `node scripts/validate-impact-schema.mjs`: exit `0`.
- `npm run data:check`: exit `0`.
- `npm run build`: exit `0`; `244` módulos, sitemap `1003 + 2`, `release.json` gerado.
- `git diff --check`: exit `0`.
- `npm run smoke:local`: exit `0`; `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto.
- Produção existente: `https://rs.votopraquem.org` HTTP `200` (sem deploy novo neste tick).

## Próximo passo

Retomar `1301-1325` somente com lane editorial cujo resultado seja JSON puro, cardinalidade exata e evidência oficial verificável. Manter todos os itens sem cadeia completa fonte → texto → versão/evento como `withheld`; não publicar automaticamente.

## Publicação documental verificada

- Commit `9346b51ec371dfb060cb9a65d0bf6b48f49b29ae` enviado com sucesso para `origin/main`.
- Workflow backup Cloudflare `334951434`, run `33629011829`: `completed/success`, `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org`: HTTP `200`; `/release.json` confirmou SHA `9346b51ec371dfb060cb9a65d0bf6b48f49b29ae`, release `9346b51-20260902T121656081Z`, versão `0.2.1181`, snapshot `1003` registros.
