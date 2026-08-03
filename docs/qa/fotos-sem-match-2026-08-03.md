# Fotos sem match conservador — 2026-08-03

Fonte de fotos usada: ZIP oficial TSE 2024, `foto_cand2024_RS_div`.  
Regra: só aplicar foto com match conservador por nome/partido e origem TSE rastreável.

## Resultado atual

| Métrica | Total |
|---|---:|
| Candidaturas no snapshot público | 212 |
| Fotos oficiais aplicadas | 72 |
| Caso ambíguo | 1 |
| Sem match conservador | 139 |

## Sem match por cargo

| Cargo | Sem foto |
|---|---:|
| deputado_federal | 58 |
| deputado_estadual | 70 |
| outro | 7 |
| senador | 3 |
| vice_governador | 1 |

## Sem match por cargo/partido

| Cargo | Partido | Sem foto |
|---|---|---:|
| deputado_estadual | NOVO | 22 |
| deputado_estadual | PODE | 34 |
| deputado_estadual | PSOL | 10 |
| deputado_estadual | REDE | 2 |
| deputado_estadual | UP | 2 |
| deputado_federal | NOVO | 18 |
| deputado_federal | PODE | 24 |
| deputado_federal | PSOL | 12 |
| deputado_federal | REDE | 1 |
| deputado_federal | UP | 3 |
| outro | PDT | 1 |
| outro | PT | 2 |
| outro | UP | 4 |
| senador | PSOL | 1 |
| senador | PT | 1 |
| senador | UP | 1 |
| vice_governador | UP | 1 |

## Caso ambíguo

| Candidato | Partido | Motivo |
|---|---|---|
| ANETTE SCHIEMANN PEGAS (`210002533073`) | NOVO | duas fotos oficiais TSE 2024 com mesmo nome/partido: vereador e vice-prefeito em Santa Cruz do Sul |

Decisão: manter sem foto até haver critério adicional seguro. Não escolher manualmente uma das duas imagens sem evidência de que corresponde à candidatura correta.

## Próximo passo seguro

1. Não aplicar fotos novas sem fonte TSE/rastreável.
2. Aguardar fonte TSE 2026 (`fotoUrlPublicavel=true` ou ZIP oficial 2026).
3. Quando houver fonte 2026, priorizar match por `SQ_CANDIDATO`/`tse_candidate_id`.
4. Se revisar 2024 manualmente, registrar evidência por candidato antes de alterar `photo_url`.
