# Auditoria global de scores — 2026-09-24

## Objetivo

Verificar se a regressão observada em Matheus Pereira Gomes, Elizandro Silva de Freitas Sabino, Adão Pretto Filho e Luciana Krebs Genro afetava somente esses candidatos ou a camada inteira de scores publicados.

## Causa confirmada

A troca para a metodologia v2 desativou o fallback de `category_scores` do snapshot público. Como o Supabase ainda possui zero atribuições evento–assessment v2 aprovadas, o serviço retornava apenas a camada v2 retida e ocultava os scores históricos publicados. Os dados do snapshot não foram apagados.

## Auditoria do snapshot

Fonte: `data/public-candidates.json`, release `4e5d4b1`.

- candidaturas públicas: `1003`;
- candidatos com perfil de votos nominais: `87`;
- candidatos com `category_scores` publicados: `82`;
- candidatos com votos, mas sem `category_scores`: `5`;
- linhas de score no snapshot: `476`;
- candidatos ALRS com score: `50`;
- candidatos ALRS com votos e sem score de snapshot: `2`;
- candidatos Câmara com score: `32`;
- candidatos Câmara com votos e sem score de snapshot: `3`;
- candidatos sem perfil nominal: `916`.

### Candidatos com votos, mas sem score histórico

Esses casos não são regressão do fallback: o snapshot já não contém `category_scores` para eles.

- ALRS: Halley Lino de Souza (`292` votos); Enio Carlos Terra (`4` votos);
- Câmara: Luciano Palma de Azevedo (`376` votos); Henrique Fontana Júnior (`1674` votos); Marcelo de Brum da Costa (`1384` votos).

Eles permanecem sem score e devem ser tratados como `não avaliado`, não como score perdido.

## Verificação de produção

Foi aberta a página de todos os `87` candidatos com votos nominais, usando Playwright contra `https://rs.votopraquem.org`.

- `87/87` páginas carregaram;
- `82/82` candidatos com snapshot scoreado exibiram a mesma quantidade de valores score do snapshot;
- `5/5` candidatos sem `category_scores` permaneceram sem score;
- não houve divergência de quantidade;
- os quatro candidatos amostrados pelo usuário exibiram score novamente.

Amostra confirmada:

- Matheus: Mulheres `+1,00`, `21` itens do snapshot;
- Elizandro: Mulheres `+1,00`, `26` itens do snapshot;
- Adão: Mulheres `+1,00`, `20` itens do snapshot;
- Luciana: Mulheres `+1,00`, `30` itens do snapshot.

## Estado v2 remoto

- assessments: `68`;
- matrizes aprovadas: `66`;
- atribuições evento–assessment: `0`;
- atribuições v2 elegíveis: `0`.

Os valores restaurados são identificados na UI como `snapshot editorial 1.0.0` e `itens do snapshot`. Não são apresentados como novas atribuições v2 nem misturados com fatos v2 retidos.

## Correção e prevenção

- fallback do snapshot restaurado somente como camada histórica explícita;
- scores v2 aprovados continuam prioritários quando existirem;
- eventos sem atribuição v2 não são convertidos em score;
- barra e texto diferenciam `eventos elegíveis` de `itens do snapshot`;
- teste de regressão ampliado para todos os `82` candidatos com cobertura de snapshot;
- lotes históricos preservados quando a fila ativa possui zero pendências.

## Verificação local

- teste direcionado: `5/5`;
- suíte completa anterior: `537/537`;
- build: aprovado;
- smoke local: aprovado;
- produção: release `0.2.1400`, SHA `4e5d4b1`.
