# QA — gate de segurança do refresh TSE (2026-08-20)

## Objetivo
Impedir que `data:refresh` promova silenciosamente uma divergência do `../dataset2026` que remova candidatos públicos ou apague metadados de fotos oficiais já publicados.

## Entregue e verificado
- Adicionado `compareRefreshSafety()` em `scripts/refresh-public-snapshot.mjs`.
- O refresh agora falha fechado antes de qualquer escrita quando detecta remoções por `tse_candidate_id` ou perda de `photo_url`/`photo_source_url`.
- Adicionados testes unitários para rejeição e aceitação do comparador.
- Execução real de `npm run data:refresh` com Node 24: exit 1, sem escrita mantida; rejeitou `1` candidato removido e `1990` perdas de metadados de foto.
- A mensagem exige prova oficial explícita antes de qualquer promoção, sem inventar identidade, fonte ou hash.

## Estado dos dados
- Snapshot público preservado: `1003` candidaturas e `988` fotos oficiais.
- `npm run data:check`: verde, `1003/988`.
- Auditoria de fontes read-only: exit 0, gaps reais permanecem: ALRS `1251` versões/`1647` eventos/`4` votos; Câmara `3`/`2`/`2`; Senado `112`/`188`/`455` sem fonte.

## Gates locais
- Node `v24.19.0`.
- `npm run test`: verde — `84` arquivos, `379` testes.
- `npx tsc --noEmit`: verde.
- `node scripts/validate-impact-schema.mjs`: verde.
- `npm run data:check`: verde.
- `npm run build`: verde; sitemap com `1003` candidatos + estáticas; `release.json` gerado.
- `git diff --check`: verde.
- `npm run smoke:local`: verde — `1002` cards visíveis, `0` falhas HTTP, `0` erros de console online, service worker pronto.

## Bloqueios reais
- O refresh de fonte local continua bloqueado por divergência factual não explicada: remoção de candidato e perda de fotos. Nenhuma sincronização foi aplicada.
- `npm run orch:doctor` permanece exit 1 porque o shell padrão usa Node `v22.22.2`, enquanto o projeto exige Node 24; OpenCode ausente é WARN opcional. Os gates do código foram executados explicitamente com Node `v24.19.0`.
- Gaps de fontes legislativas continuam sem evidência oficial suficiente; não houve escrita remota.

## Próximo passo
Reconciliar boundedmente os quatro votos ALRS residuais buscando apenas ID oficial e HTML exato; manter Senado fail-closed enquanto os SHA-256 divergirem do manifesto e Câmara somente com lotes oficiais não vazios. Depois, se houver novo código local elegível, repetir os gates e publicar apenas artefatos documentais/verificados.
