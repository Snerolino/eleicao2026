# H0.4 — Smoke do hotfix e publicação controlada

Base: `h0-contencao-restauracao` @ `75c4eb464828db79f9fe9e9acc737184da190280`
PR: https://github.com/Snerolino/eleicao2026/pull/24
Preview Cloudflare: https://2b974731.portal-transparencia-rs.pages.dev/
Data: 2026-07-30

## Checks locais

Ambiente local: `npm run preview -- --host 127.0.0.1 --port 4173` com o build atual.

| Check | Resultado |
|---|---|
| Home renderiza candidatos | OK — 69 cards |
| Seções esperadas | OK — 29 deputado federal + 40 deputado estadual |
| Busca por `ADEMAR` | OK — 1 de 69 |
| Detalhe por link da home | OK — página de `ADEMAR RODRIGUES DE MORAES` abriu |
| Comparar | OK — seleção de 2 candidatos e tabela renderizada |
| Requests Supabase no fluxo local | OK — `candidates` 200, `claims` 200 |
| Console JS | Sem erros; apenas warnings conhecidos de React Router v7 future flags |
| PWA/offline básico | `offline.html` existe e é servido; teste completo offline ainda pendente para fase PWA |

## Checks no preview Cloudflare

| Check | Resultado |
|---|---|
| Preview publicado | OK — deployment `2b974731`, branch `h0-contencao-restauracao` |
| Cloudflare Pages check no PR | OK |
| Home renderiza candidatos | **FALHOU — 0 cards** |
| Banner de demonstração | **FALHOU — aparece `AMBIENTE DE DEMONSTRAÇÃO — DADOS DE TESTE`** |
| Requests Supabase | **FALHOU — nenhuma chamada `rest/v1` feita** |
| Mensagem pública | `Nenhum candidato está disponível no momento.` |

## Diagnóstico

O hotfix funciona localmente, mas o preview do Cloudflare diverge do ambiente local. O bundle publicado no preview não recebe configuração Supabase e/ou build data íntegro, então entra em modo demonstração e publica lista vazia. Isso confirma os riscos descritos no Guia em H0.4/H1:

- Preview diverge por variáveis de ambiente/origem de dados.
- Build/deploy pode ficar verde mesmo funcionalmente vazio.
- Não é seguro fazer merge/deploy em main com esse gate falhando.

## Decisão operacional

H0.4 está **bloqueado** no preview remoto. Próximo bloco seguro: H1.1/H1.2 — build reproduzível + CI/deploy com preflight de dados e variáveis, antes de qualquer merge para main.
