# QA — Autoria Câmara 1451–1475 — 2026-09-02

## Objetivo
Processar o microbatch seguinte de 25 projetos únicos de autoria da Câmara em duas lanes read-only, sem converter autoria em voto, impacto, score ou claim público.

## Seleção e heartbeat
- Seleção determinística: 25 projetos únicos, 100 ocorrências candidato–projeto e 18 candidatos únicos, offset 1450/limit 25.
- Checkpoint inicial registrado antes das lanes; checkpoint final `blocked`, `projects_analyzed=1475`, `approved=0`, `pending_review=0`, `withheld=1475`, próximo `1476–1500`.
- O lock exclusivo foi adquirido com `flock` durante os checkpoints e a seleção. Nenhuma escrita remota foi executada.

## Lanes e verificação independente
- **Causal / Antigravity:** processo `exit=0`, array JSON com 25 itens e IDs únicos, mas o conjunto não corresponde ao recorte solicitado: retornou projetos `camara:req-1406-2020-2254459` … `camara:req-1469-2020-2254773`, em vez dos IDs esperados `camara:req-184-2023-2348866` … `camara:req-216-2025-2483115`. Saída rejeitada independentemente na camada `contrato/cardinalidade-identidade`.
- **Red-team / Codex MCP Luna:** retorno extraído do envelope técnico para JSON; 25 itens, 25 IDs únicos, conjunto exato, schema válido, todos `decision=withheld` e `score_eligible=false`. A lane não foi promovida porque não houve segunda saída causal reconciliável para o mesmo conjunto.
- Não foi usada nova tentativa no mesmo tick após a falha de identidade/cardinalidade do Antigravity, respeitando o circuit-breaker por provider.

## Estado dos dados
- Batch `1451–1475`: `blocked` / fail-closed. Nenhum artefato reconciliado foi criado.
- O manifesto factual continua contendo somente metadados oficiais Câmara (`dadosabertos.camara.leg.br`); não houve leitura/promulgação de texto normativo, versão, evento nominal ou efeito causal.
- Nenhum `authored_projects`, claim, voto, score, matriz, Supabase ou Cloudflare factual foi escrito.

## Bloqueios reais
- A lane causal Antigravity entregou cardinalidade correta, porém IDs de outro recorte, impossibilitando reconciliação por identidade exata.
- A cadeia oficial necessária para autoria publicável e impacto continua ausente: fonte oficial → texto integral/versionamento → evento nominal vinculante → efeito. Autoria não equivale a voto.
- OpenCode/free pool segue indisponível por executável ausente; não foi repetido neste tick.

## Próximo passo
Retomar `1476–1500` com heartbeat, seleção determinística e duas lanes read-only. Exigir conjunto exato de IDs antes da reconciliação; manter `withheld`/fail-closed e não aplicar `authored_projects` sem fonte, análise causal completa e red-team reconciliado.
