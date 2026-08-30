# Integração das novas categorias — Matriz de Impacto Legislativo

**Data:** 29/08/2026  
**População:** metodologia 1.1.0  
**Temas:** taxonomia 1.0.0  
**Economia:** metodologia 1.0.0  

## Decisão

As novas categorias foram integradas sem repetir o erro do gabarito anterior: população, tema e ator econômico permanecem dimensões separadas.

### Novos grupos populacionais

- `estudantes` — Estudantes
- `trabalhadores_formais` — Trabalhadores formais
- `servidores_publicos` — Servidores públicos
- `usuarios_sus` — Usuários do SUS
- `pessoas_com_ludopatia` — Pessoas com ludopatia
- `candidatos_concursos_publicos` — Candidatos a concursos públicos
- `pescadores_artesanais_comunidades_pesqueiras` — Pescadores artesanais e comunidades pesqueiras

A taxonomia populacional passa de **14 para 21 grupos**.

## Conversão das seis categorias legadas

| Categoria legada | Destino correto |
|---|---|
| `educacao_estudantes` | população `estudantes` + tema `educacao` |
| `saude_usuarios_sus` | população `usuarios_sus` + tema `saude` |
| `servidores_publicos` | população `servidores_publicos` + tema `servico_publico_estado`; eixo econômico apenas quando houver efeito material |
| `meio_ambiente_clima` | **tema apenas**, sem score populacional |
| `micro_pequenos_empreendedores` | eixo econômico: `microempreendedores_individuais`, `microempresas` ou `pequenas_empresas` conforme a fonte |
| `agricultores_familiares` | alias para população `agricultura_familiar_sem_terra` + tema `agro_terra` + ator econômico `agricultura_familiar` |

## Gaps resolvidos e reintegrados

Foram adicionadas **7 matérias** ao gabarito populacional, gerando **8 assessments**:

| Matéria | Novo grupo | Direção | Voto defensor | Severidade |
|---|---|---|---|---:|
| PL 238/2026 | `estudantes` | positive | sim | 3 |
| PL 52/2024 | `candidatos_concursos_publicos` | positive | sim | 2 |
| PL 233/2024 | `estudantes` | positive | sim | 2 |
| PL 311/2024 | `pessoas_com_ludopatia` | positive | sim | 3 |
| PL 33/2017 | `trabalhadores_formais` | positive | sim | 3 |
| PLC 385/2024 | `trabalhadores_formais` + `estudantes` | positive | sim | 3 |
| PL 432/2023 | `estudantes` | positive | sim | 2 |

O gabarito passa de **56 para 63 matérias aprovadas**.

## O que NÃO foi autoaprovado

Os **226 registros** do gabarito antigo que usavam as seis categorias legadas foram convertidos em fila de reclassificação dimensional. Eles não recebem score até nova revisão substantiva.

`PL 38/2026` e `PEC 305/2026` agora podem usar `servidores_publicos`, mas permanecem fora do gabarito aprovado até o gate externo por terem severity 4 e 5.

`PL 140/2022` passa a ser tratado prioritariamente como tema `educacao`/`servico_publico_estado`; a simples existência de `estudantes` não autoriza score populacional automático.

## Regra central

**Categoria existente não significa assessment válido.**  
A matéria ainda precisa demonstrar destinatário direto, direção de impacto, voto defensor e fonte substantiva. Tema não gera score populacional e ator econômico não é tratado como população.
