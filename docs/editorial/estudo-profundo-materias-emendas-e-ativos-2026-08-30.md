# Estudo Profundo: Ativos Declarados, Matérias Pendentes e Análise Contextual de Emendas e Estratégias Legislativas

**Data:** 30 de Agosto de 2026  
**Status:** Oficial / Estudo Editorial  
**Metodologia:** Versão 1.1.0  
**Contexto:** Portal da Transparência Eleitoral RS — *Voto Pra Quem?*

---

## 1. Auditoria e Análise dos Ativos Declarados (Assets)

### A. Panorama Geral e Distribuição Patrimonial
- **Candidatos com Histórico Patrimonial Mapeado:** 49 candidaturas ativas no RS.
- **Volume Total Declarado (2026):** R$ 23.981.718,75 (vinte e três milhões, novecentos e oitenta e um mil, setecentos e dezoito reais e setenta e cinco centavos).
- **Composição Patrimonial por Categoria:**
  - **Imóveis e Terrenos:** R$ 13.700.903,13 (57,13% do total)
  - **Veículos e Automotores:** R$ 3.422.197,46 (14,27%)
  - **Participações Societárias e Empresas:** R$ 3.061.283,79 (12,76%)
  - **Aplicações e Depósitos Bancários:** R$ 2.262.063,74 (9,43%)
  - **Outros Bens e Direitos:** R$ 1.363.385,43 (5,69%)
  - **Créditos e Direitos:** R$ 155.885,20 (0,65%)
  - **Dinheiro em Espécie:** R$ 16.000,00 (0,07%)

### B. Critérios de Auditoria de Evolução Patrimonial
1. **Defasagem Temporal e Inflação (IPCA)**:
   A variação percentual bruta de bens entre eleições (ex.: 2018 -> 2022 -> 2026) é contrastada com o IPCA acumulado do período (~42,5% entre 2018 e 2026). Crescimentos nominais abaixo do IPCA representam estagnação ou desvalorização real de ativos fixos.
2. **Diversificação e Liquidez**:
   Detecta-se migração de bens imobilizados para quotas empresariais e fundos de investimento, permitindo ao eleitor identificar se o candidato possui vínculos societários diretos com setores regulados pelo Estado (ex.: agronegócio, concessionárias, serviços de saúde privados).
3. **Fail-Closed nos Ativos**:
   Bens declarados sem especificação clara de valor histórico permanecem sob auditoria descritiva, sem julgamento moral automático, exibindo a discriminação item a item conforme registrado no TSE.

---

## 2. Estudo Profundo das Matérias e Emendas Pendentes na Fila

### A. Inventário da Fila de Tramitação
- **Fila Substantiva ALRS (`substantive-review-queue-v1.json`):** 462 versões de proposições com 1.398 votos factuais de 79 parlamentares do RS.
- **Lote Federal da Câmara (`impact-editorial-batch-001-v1.json`):** 30 proposições prioritárias com 53 eventos nominais.
- **Matérias em Quarentena (`quarentena-regressao-gabarito-2026-08-30.json`):** 234 matérias isoladas para recuperação de identidade legislativa e proveniência textual.

### B. Distribuição Temática Preliminar da Fila ALRS
- **Servidores Públicos e Carreiras:** 51 proposições
- **Estudantes e Educação Básica:** 34 proposições
- **Mulheres e Proteção de Gênero:** 32 proposições
- **Crianças e Adolescentes em Vulnerabilidade:** 16 proposições
- **Usuários do SUS e Saúde Pública:** 15 proposições
- **Pessoas com Deficiência (PcD):** 9 proposições
- **Agricultura Familiar e Pequenos Produtores:** 3 proposições
- **Pessoas Idosas Dependentes:** 3 proposições
- **Trabalhadores Informais:** 2 proposições

---

## 3. Análise Teórica e Prática da Estratégia Legislativa: "Ceder o Mínimo para Evitar o Justo"

### A. O Fenômeno Político-Legislativo das "Migalhas a Toque de Caixa"
No processo legislativo contemporâneo, frequentemente observa-se uma dinâmica em que maiorias parlamentares ou governos apresentam propostas que concedem avanços marginais e cosméticos a determinada categoria ("migalhas"), com o objetivo precípuo de:
1. Esvaziar a tramitação de projetos de lei mais robustos e estruturantes que garantiriam direitos integrais;
2. Construir narrativa pública eleitoral de que "votaram a favor" da categoria;
3. Rejeitar emendas de plenário que corrigem perdas históricas, pisos salariais ou garantias universais.

### B. A Distorção da Análise Simplista vs A Abordagem Contextual Desacoplada
- **Erro da Abordagem Simplista (Ingênua)**:
  Considerar que todo voto SIM no texto-base rebaixado é "favorável (+1.0)" e todo voto NÃO é "contrário (-1.0)". Isso premia o parlamentar que votou a favor de migalhas para barrar o projeto justo, e pune o parlamentar da oposição que votou NÃO ou obstruiu para exigir a proposta integral.
- **Regra Editorial da Metodologia v1.1 (Desacoplamento por Evento)**:
  1. **Emendas de Ampliação de Direitos**: Devem ser tratadas como **eventos autônomos e pontuáveis** (`score_eligible = true`). O voto SIM na emenda que estende benefícios ou protege direitos é o verdadeiro voto defensor do grupo (+1.0). O voto NÃO na emenda por quem apoiou o texto rebaixado demonstra postura contrária à categoria (-1.0).
  2. **Texto-Base Rebaixado ou Composto**: Quando o texto-base oferece paliativos condicionados a renúncias ou metas fiscais punitivas, deve ser classificado como `score_eligible = false` (votação composta) ou receber avaliação restritiva contextual fundamentada, **nunca penalizando quem votou NÃO ou obstruiu** para denunciar a manobra.

---

## 4. Estudos de Caso Reais em Profundidade

### Estudo de Caso 1: ALRS PL 347/2025 (Programa de Reconhecimento da Educação Gaúcha)
- **Objeto da Matéria**: Criação de bonificação temporária condicionada a metas de assiduidade e desempenho institucional para servidores da educação e premiações a estudantes.
- **A Manobra**: O texto governista não recompõe o piso básico da carreira do magistério e institui bônus que não incorporam à aposentadoria, excluindo servidores afastados por motivo de saúde.
- **As Emendas da Oposição**: Emendas apresentadas propunham a reposição inflacionária no vencimento básico de toda a categoria e a vinculação de verbas diretas às escolas sem critérios punitivos.
- **Decisão Editorial**:
  - **Texto-Base**: `score_eligible = false`, `vote_attribution_status = 'compound_non_separable'`, `impact_direction = 'mixed'`, `defending_vote = null`. O voto NÃO no texto-base não pode ser interpretado como voto anti-educação.
  - **Emendas de Reposição do Magistério**: Quando votadas nominalmente, recebem `score_eligible = true`, `group = 'servidores_publicos'`, `defending_vote = 'sim'`. Quem votou NÃO na emenda recebe alinhamento negativo (-1.0).

### Estudo de Caso 2: Câmara PLP 230/2025 (FUST e Conectividade Escolar)
- **Objeto da Matéria**: Conectividade de escolas públicas de educação básica com recursos do FUST.
- **A Manobra**: O substitutivo global aprovado em plenário incluiu cláusulas que vedam contingenciamento do fundo, mas criaram regimes de compensação e benefícios tributários cruzados para concessionárias de telecomunicações.
- **As Emendas**: Destaques visavam garantir 100% de aplicação direta dos recursos em escolas rurais e periféricas, sem repasses a intermediárias privadas.
- **Decisão Editorial**:
  - **Votação Global do Substitutivo**: `score_eligible = false`, `textual_defending_vote = 'sim'`, `event_defending_vote = null`, `defending_vote = null`. O NÃO de bancadas que recusaram as concessões às teles não conta contra os estudantes.
  - **Destaques de Blindagem Escolar**: Recebem análise pontual por dispositivo (`score_eligible = true`, `group = 'estudantes'`).

### Estudo de Caso 3: Câmara PEC 6/2019 (Reforma da Previdência)
- **Objeto da Matéria**: Reforma das regras gerais de previdência social e regimes próprios.
- **A Manobra**: Pacote constitucional macro que impôs idade mínima e aumento de tempo de contribuição para a grande massa, enquanto preservava categorias privilegiadas em acordos de bastidor.
- **Os DVSs (Destaques para Votação em Separado)**:
  - DVS da aposentadoria de professores da educação básica (`estudantes` / `servidores_publicos`);
  - DVS das regras de transição para trabalhadoras mulheres (`mulheres`);
  - DVS dos trabalhadores rurais e agricultura familiar (`agricultura_familiar_sem_terra`).
- **Decisão Editorial**:
  - **Texto-Base Global**: `score_eligible = false`, `severity = 5`, `structural`, `mixed`, `defending_vote = null`.
  - **Votações Nominais de DVSs**: Cada destaque sobre regras de proteção a mulheres, professores e rurais é pontuado de forma isolada com `score_eligible = true`. Votar SIM na manutenção da regra justa = +1.0.

### Estudo de Caso 4: Câmara MPV 1323/2025 (Seguro-Defeso e Pesca Artesanal)
- **Objeto da Matéria**: Regras do Seguro-Defeso concedido a pescadores artesanais no período de defeso da pesca.
- **O Conflito**: Destaque nominal discutiu se a comprovação da atividade pesqueira dependeria de atestado de colônias e entidades representativas da pesca ou de checagem puramente eletrônica governamental.
- **Decisão Editorial**:
  - `group = 'pescadores_artesanais_comunidades_pesqueiras'`, `severity = 2`, `structural`, `impact_direction = 'mixed'`, `score_eligible = false`, `defending_vote = null`.
  - Evita tomar partido institucional entre burocracia estatal e poder corporativo das colônias sob risco de fraude vs representatividade.

### Estudo de Caso 5: Câmara PL 490/2007 (Marco Temporal de Terras Indígenas)
- **Objeto da Matéria**: Fixação da data da promulgação da Constituição de 1988 como marco para demarcação de terras indígenas.
- **A Dinâmica**: Texto-base fortemente restritivo aos direitos territoriais originários. Emendas supressivas de bancadas pró-indígenas tentaram retirar os artigos restritivos.
- **Decisão Editorial**:
  - **Texto-Base**: `group = 'povos_indigenas'`, `impact_direction = 'negative'`, `defending_vote = 'nao'`, `event_defending_vote = 'nao'`, `severity = 5`, `structural`, `score_eligible = true`. Votar SIM no texto restritivo = -1.0; Votar NÃO = +1.0.
  - **Emendas Supressivas**: Votar SIM para suprimir a restrição = +1.0; Votar NÃO = -1.0.

---

## 5. Diretrizes para o Catálogo e Integração Contínua

1. **Aderência aos 21 Grupos Canônicos**: Nenhum grupo fora da lista oficial é aceito em `gabarito-materias-aprovadas.json`.
2. **Priorização da Quarentena ALRS**: Proposições isoladas na quarentena com texto substantive verificável (ex.: PL 77/2025 de proteção à mulher, PL 33/2017 de inclusão de PcD, PL 27/2024 de cidadania LGBTQIA+) devem ser recuperadas com número, ano e links para o Diário Oficial da ALRS.
3. **Isolamento de Destaques e Emendas**: No scraper e banco de dados, eventos com sigla `DVS`, `EMD` ou `SBT` devem ser vinculados ao dispositivo específico correspondente para viabilizar pontuação justa.
4. **Relatórios Transparentes ao Cidadão**: No dossiê do candidato e no comparador, o portal exibirá avisos claros quando uma matéria for composta não separável ou procedimental, educando o eleitor sobre a diferença entre votar no texto-base e votar nas emendas de aprofundamento de direitos.
