# QA — revalidação das fontes nominais do Senado (2026-08-19 19:26 UTC)

## Objetivo

Executar um tick bounded de reconhecimento oficial read-only para os seis
relatórios nominais do Senado, repetir o dry-run do writer e manter a carga
factual bloqueada enquanto o manifesto versionado divergir das respostas atuais.

## Entregue e verificado

- 6/6 URLs oficiais responderam HTTP 200.
- 6/6 respostas têm prefixo PDF válido `255044462d312e35`.
- 3/6 respostas coincidiram em bytes com o manifesto versionado.
- 0/6 respostas coincidiram em SHA-256 com o manifesto versionado.
- Evidência bruta: `.orchestrator/runtime/senado-revalidation-current.json`, gerada em `2026-08-19T19:26:40.695Z`.
- Nenhum manifesto foi alterado e nenhum voto foi escrito.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: `planned=6`, `already_existing=0`, `missing=0`, `inserted=0`, `votes_touched=0`.

## Estado dos dados

- Snapshot público: 1003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- Reconciliação do CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`, 1003 linhas; 1003 IDs no dataset e 1003 no snapshot, sem diferenças após normalização dos cabeçalhos TSE.
- Reconciliação factual do Senado permanece **fail-closed**: a deriva SHA-256 impede usar o manifesto para qualquer aplicação remota.

## Gates locais

- Testes: 81 arquivos / 371 testes, todos passaram.
- TypeScript: passou (`npx tsc --noEmit`).
- Schema de impacto: passou.
- `npm run data:check`: passou (1003 candidaturas / 988 fotos).
- `npm run build`: passou; sitemap com 1003 candidatos + 2 URLs estáticas; `release.json` local com SHA `7ea1ba3c242a9039b37008140c7ae97c8bb608ae`, versão `0.2.459`.
- `git diff --check`: passou.
- Produção: `https://rs.votopraquem.org` HTTP 200 e `/release.json` HTTP 200; resposta pública observada ainda reporta versão `0.2.459` sem SHA no campo consultado, portanto a confirmação de SHA da publicação deste commit fica pendente do próximo release.

## Bloqueios reais

- Aplicação factual remota bloqueada por deriva SHA-256 em 6/6 entradas do manifesto; não é permitido gerar hash novo nem inventar substituição.
- `npm run orch:doctor -- --smoke`: `OK=51 WARN=5 FAIL=1`; o FAIL é Node 22.22.2 no shell, enquanto `package.json` exige Node 24. A execução local deste tick passou com Node 22, mas o gate de ambiente permanece explicitamente amarelo/vermelho no doctor.
- OpenCode está ausente e Ollama não respondeu ao preflight; são rotas opcionais e não bloquearam a verificação local.

## Próximo passo

Publicar esta evidência documental e verificar o SHA do commit no backup Cloudflare e em `/release.json`. Repetir os seis GETs oficiais no próximo tick, sem gerar manifesto novo e sem aplicar votos enquanto persistir a deriva SHA-256.
