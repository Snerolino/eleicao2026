# QA — lote continuous ops recon — 2026-08-22 16:42 UTC

## Objetivo
Executar um tick bounded com recon oficial read-only, verificar o dataset vivo, fechar os gates locais e preparar a publicação documental sem promover fatos sem fonte.

## Entregue e verificado
- Lock não bloqueante adquirido com `flock -n` e liberado ao final do tick; nenhum writer concorrente foi iniciado.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`. Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata verificável; nenhuma escrita ocorreu.
- Câmara: descoberta oficial read-only em `https://dadosabertos.camara.leg.br/api/v2`, janelas trimestrais de 2025-01-01 a 2026-12-31, duas páginas máximas por janela; 15 páginas retornaram `status=ok`, sem bloqueios, e 1.400 `vote_ids` foram descobertos. Nenhum voto foi reconciliado ou aplicado.
- Senado permaneceu fail-closed: não existe envelope nominal verificável disponível para parsing/identidade; nenhum voto foi inventado.
- Dataset conferido contra `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`: 1.003 IDs oficiais em ambos os lados, diferença `0/0`; SHA-256 do CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`. O arquivo `lista_candidatos_2026.csv` contém apenas 322 linhas e não é o snapshot completo; não houve refresh.
- `npm run data:check`: 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE (RC 0).
- Auditoria de fontes regular: RC 0. Auditoria estrita: RC 2 pelos gaps reais — versões sem fonte ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.
- Gates locais com Node 24.19.0: 401 testes em 98 arquivos (RC 0), TypeScript (RC 0), schema de impacto (RC 0), `data:check` (RC 0), build (RC 0) e `git diff --check` (RC 0).
- Build gerou `release.json` local `e3bb312-20260822T164221331Z`; aviso não bloqueante do Vite: chunk principal acima de 500 kB.
- Smoke local verificado: 1.002 cards, mínimo esperado 1.002, 2 cards na busca, detalhe canônico de Ademar Rodrigues de Moraes, 0 falhas HTTP, 0 erros de console online e service worker pronto.

## Publicação e produção
- Produção independente respondeu `root HTTP 200` e `release HTTP 200`.
- Workflows remotos confirmados: backup `334951434`, primário `320564705`, verificador `335560210`.
- O commit `c4f697c` foi criado localmente, mas `git push origin main` foi rejeitado neste tick com HTTP 403 (`Permission to Snerolino/eleicao2026.git denied to Snerolino`); nenhum workflow/deploy novo foi acionado.

## Bloqueios
- A autorização efetiva de escrita no remoto GitHub continua rejeitada (HTTP 403), apesar da autenticação local do `gh`; não há `headSha` remoto correspondente a este tick.
- Doctor tem FAIL porque o shell padrão usa Node 22.22.2, enquanto o projeto exige Node 24; os gates foram executados explicitamente com Node 24.19.0.
- ALRS/Senado continuam bloqueados por identidade/fonte oficial; auditoria estrita segue não-zero. Nenhum UUID, voto, URL, hash ou identidade foi fabricado.

## Próximo passo
Tentar `git add -A`, commit documental em português e `git push origin main`; se o push for aceito, acompanhar o workflow backup Cloudflare `334951434`, conferir `headSha`, HTTP de produção e smoke. Manter Câmara em recon read-only e ALRS/Senado fail-closed até R0/schema/FK/fonte/dry-run/idempotência.
