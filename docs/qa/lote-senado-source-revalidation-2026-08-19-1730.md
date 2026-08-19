# QA — revalidação de fontes nominais do Senado (2026-08-19 17:30 UTC)

## Objetivo

Revalidar, em modo somente leitura, as seis URLs oficiais do catálogo nominal do Senado antes de qualquer cadastro de `source_references` ou aplicação factual.

## Entrega verificada

- Reconhecimento sequencial das 6 URLs do manifesto `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Evidência runtime: `.orchestrator/runtime/senado-revalidation-current.json`.
- 6/6 respostas HTTP 200.
- 6/6 respostas com prefixo PDF `255044462d312e35`.
- 5/6 tamanhos em bytes coincidiram com o manifesto.
- 0/6 SHA-256 coincidiram com o manifesto versionado.
- Dry-run `npm run impact:senado:sources:apply -- --dry-run`: 6 planejadas, 0 ausentes, 0 inserções, 0 votos tocados.

## Estado dos dados

O catálogo oficial continua versionado e íntegro como contrato, mas a resposta atual diverge do manifesto em SHA-256. Nenhum voto, identidade, FK ou fonte remota foi alterado. O snapshot público permanece válido: 1003 candidaturas e 988 fotos oficiais.

## Gates locais

Executados com Node 24.19.0:

- `npm run test`: verde — 81 arquivos, 371 testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde — 1003 candidaturas, 988 fotos.
- `npm run build`: verde — sitemap com 1003 candidatos/1005 URLs e `release.json` gerado.
- `git diff --check`: verde.
- `git status --short`: sem alterações antes da documentação deste tick.

Doctor do shell cron: `OK=48 WARN=5 FAIL=1`; o único FAIL é Node 22.22.2 no shell, enquanto os gates foram executados explicitamente com Node 24. OpenCode ausente e Ollama sem resposta permanecem avisos opcionais.

## Bloqueio real

Senado permanece **fail-closed**: não gerar manifesto substituto e não executar `--apply` enquanto a deriva de SHA-256 persistir. O tamanho coincidente não é suficiente para provar identidade do conteúdo.

## Próximo passo

No próximo tick, repetir os seis GETs oficiais sem alterar o manifesto e sem aplicar dados factuais. Se a deriva persistir, manter a fila de recuperação documentada e continuar somente com gates locais e verificação de publicação documental.
