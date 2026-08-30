# Manual de Metodologia v1.1 e Guia Operacional da Matriz de Impacto Populacional

**Portal da Transparência Eleitoral RS — Voto Pra Quem?**  
**Versão da Metodologia:** 1.1.0  
**Data de Publicação:** 30 de Agosto de 2026  
**Status:** Oficial / Produção  

---

## 1. Visão Geral e Princípios Fundamentais

A **Metodologia v1.1** é o padrão canônico e universal de classificação substantiva e pontuação de impacto populacional de votações parlamentares (ALRS, Câmara dos Deputados e Senado Federal).

### Os 4 Princípios Cardeais:
1. **Unidade Concreta de Atribuição (Cadeia de Proveniência)**:
   A análise legislativa não presume que toda votação de uma proposição possui o mesmo mérito. A unidade de análise obedece estritamente à cadeia:
   $$\text{proposition} \longrightarrow \text{proposition\_version} \longrightarrow \text{voting\_event} \longrightarrow \text{object\_voted} \longrightarrow \text{assessment} \longrightarrow \text{score\_eligible}$$
2. **Separação entre Efeito Textual e Atribuibilidade de Voto**:
   - `textual_defending_vote`: Sentido do mérito do texto normativo puro para o grupo populacional (ex.: PLP 230/2025 conectividade escolar = SIM).
   - `event_defending_vote`: Sentido do voto no evento concreto de votação (se o evento for um pacote composto não separável com temas fiscais e benefícios a operadoras, o sentido é `null`).
3. **Princípio Fail-Closed (Segurança Epistêmica)**:
   *"Menos score, porém correto > Mais score baseado em inferência arbitrária."*  
   Se um evento de votação não permitir separar claramente a posição do parlamentar em relação ao grupo populacional, `score_eligible = false`, `alignment = 'nao_avaliavel'` e nenhum score positivo ou negativo é atribuído.
4. **Taxonomia Fechada de 21 Grupos Canônicos**:
   É expressamente proibido criar grupos genéricos ("população geral", "sociedade") ou utilizar temas setoriais ("meio ambiente", "economia") como grupos populacionais.

---

## 2. Catálogo Fechado dos 21 Grupos Populacionais Canônicos

| # | Slug Canônico | Nome em Português | Descrição Operacional e Escopo |
| :-: | :--- | :--- | :--- |
| 1 | `povos_indigenas` | Povos Indígenas | Comunidades indígenas, demarcação de terras, direitos originários e proteção cultural. |
| 2 | `comunidades_quilombolas` | Comunidades Quilombolas | Populações remanescentes de quilombos e titulação territorial quilombola. |
| 3 | `populacao_negra_periferica` | População Negra e Periférica | Igualdade racial, combate ao racismo e inclusão socioespacial periférica. |
| 4 | `mulheres` | Mulheres | Enfrentamento à violência doméstica/de gênero, saúde da mulher, maternidade e igualdade. |
| 5 | `lgbtqia` | População LGBTQIA+ | Cidadania, direitos civis e combate à discriminação por orientação sexual/gênero. |
| 6 | `pessoas_com_deficiencia` | Pessoas com Deficiência | Acessibilidade, inclusão, direitos PcD, neurodivergentes e salvaguardas assistenciais. |
| 7 | `populacao_rua` | População em Situação de Rua | Acolhimento, moradia social, alimentação e assistência a pessoas em extrema vulnerabilidade. |
| 8 | `populacao_carceraria` | População Carcerária e Egressos | Direitos humanos no sistema prisional, ressocialização e execução penal digna. |
| 9 | `criancas_adolescentes_vulnerabilidade` | Crianças e Adolescentes Vulneráveis | Primeira infância, órfãos, combate ao abuso infantil, acolhimento e direitos ECA. |
| 10 | `pessoas_idosas_dependentes` | Pessoas Idosas Dependentes | Cuidados continuados, ILPIs, estatuto do idoso e amparo à dependência. |
| 11 | `trabalhadores_informais` | Trabalhadores Informais | Autônomos de baixa renda, ambulantes, entregadores de aplicativo e catadores. |
| 12 | `agricultura_familiar_sem_terra` | Agricultura Familiar e Sem-Terra | Pequenos produtores rurais de subsistência, PRONAF, crédito fundiário e reforma agrária. |
| 13 | `povos_de_terreiro` | Povos e Comunidades Tradicionais de Terreiro | Religiões de matriz africana e liberdade religiosa tradicional. |
| 14 | `imigrantes_refugiados` | Imigrantes e Refugiados | Acolhida humanitária, refúgio, regularização migratória e direitos de migrantes. |
| 15 | `estudantes` | Estudantes | Alunos da educação básica e superior pública, bolsas, permanência, merenda e passe livre. |
| 16 | `trabalhadores_formais` | Trabalhadores Formais | Empregados CLT, carteira assinada, pisos salariais, jornadas e proteção do trabalho. |
| 17 | `servidores_publicos` | Servidores Públicos | Servidores civis e militares, magistério público, planos de carreira e previdência estatal. |
| 18 | `usuarios_sus` | Usuários do SUS | Pacientes do sistema público de saúde, medicamentos, exames, UPAs e leitos hospitalares. |
| 19 | `pessoas_com_ludopatia` | Pessoas com Ludopatia | Proteção e tratamento contra dependência de apostas (bets) e superendividamento. |
| 20 | `candidatos_concursos_publicos` | Candidatos a Concursos Públicos | Concurseiros, aprovados, cadastros de reserva e isenções em certames públicos. |
| 21 | `pescadores_artesanais_comunidades_pesqueiras` | Pescadores Artesanais e Comunidades Pesqueiras | Pescadores artesanais profissionais, colônias de pesca e Seguro-Defeso. |

---

## 3. Tipologia de Votações e Regras de Atribuibilidade

### A. Votação Isolada de Mérito Unívoco (`vote_attribution_status = 'isolated'`)
- **Quando ocorre**: Votação de projeto de lei ou emenda cujo texto trata diretamente e exclusivamente daquele direito ou grupo.
- **Configuração**:
  - `score_eligible: true`
  - `textual_defending_vote: 'sim' | 'nao'`
  - `event_defending_vote: 'sim' | 'nao'`
  - `defending_vote: 'sim' | 'nao'`
- **Exemplo**: **PLP 41/2024** (Sistema de Enfrentamento à Violência contra Mulheres) $\rightarrow$ `defending_vote = 'sim'`.

### B. Votação Composta Não Separável (`vote_attribution_status = 'compound_non_separable'`)
- **Quando ocorre**: Pacotes legislativos amplos que combinam diretrizes protetivas a um grupo com reformas orçamentárias, fiscais, benefícios a outros setores ou restrições cruzadas.
- **Configuração**:
  - `score_eligible: false`
  - `textual_defending_vote: 'sim' | 'nao' | null`
  - `event_defending_vote: null`
  - `defending_vote: null`
  - `score_withholding_reason: 'compound_non_separable'`
- **Exemplo**: **PLP 230/2025** (Substitutivo global do FUST com internet escolar). Votar NÃO no pacote global não significa ser contra a escola, mas pode representar discordância das regras de contingenciamento fiscal das teles.

### C. Votação Procedimental (`vote_attribution_status = 'procedural'`)
- **Quando ocorre**: Requerimentos de urgência (Art. 155 RICD), preferência, retirada de pauta, encerramento de discussão.
- **Configuração**:
  - `disposition: 'excluded'` ou `score_eligible: false`
  - `event_defending_vote: null`
  - `defending_vote: null`
- **Regra**: Eventos procedimentais **nunca herdam o mérito substantivo** da matéria.

### D. Destaques e Emendas com Binding Pendente (`vote_attribution_status = 'event_binding_missing'`)
- **Quando ocorre**: Destaques de bancada para votação em separado (DVS) ou emendas cujo texto exato do dispositivo ainda não possui espelhamento estruturado no repositório.
- **Configuração**:
  - `score_eligible: false`
  - `score_withholding_reason: 'pending_final_version_binding'`

---

## 4. Fórmula Matemática e Cálculo de Alinhamento e Score

### A. Alinhamento por Voto do Parlamentar:
Se `score_eligible = true` e `event_defending_vote = D` onde `D in ('sim', 'nao')`:
- Voto igual a $D$: $+1.0$ (A favor do grupo)
- Voto oposto a $D$: $-1.0$ (Contra o grupo)
- Ausência Estratégica: $-0.5$
- Abstenção / Obstrução: $0.0$ (Neutro)
- Ausência Justificada / Sem dado: excluído do cálculo

Se `score_eligible = false` ou $D = 	ext{null}$:
- $	ext{alignment} = 	ext{'nao_avaliavel'}$ (score nulo, peso zero).

### B. Ponderação da Proposição:
$$	ext{Peso} = 	ext{Severidade (1 a 5)} 	imes 	ext{Fator Estrutural}$$
- **Tipo Estrutural**:
  - `structural` (1.5×)
  - `budgetary` (1.0×)
  - `symbolic` (0.5×)

---

## 5. Como Adicionar Novas Matérias no Gabarito Canônico

### Passo 1: Verificar Identidade e Fontes
Obtenha o ID estável (`<casa>:<tipo>-<numero>-<ano>`), o link oficial da tramitação no portal da casa legislativa e o link do inteiro teor do texto aprovado.

### Passo 2: Estruturar o Registro JSON em `data/impact-matrices/gabarito-materias-aprovadas.json`
```json
{
  "proposition_id": "camara:plp-41-2024",
  "house": "camara",
  "type": "plp",
  "number": "41",
  "year": 2024,
  "title": "Política Nacional de Enfrentamento da Violência contra Mulheres",
  "official_source_url": "https://dadosabertos.camara.leg.br/api/v2/proposicoes/2606313",
  "official_source_label": "Câmara dos Deputados — PLP 41/2024",
  "severity": 4,
  "structural_type": "structural",
  "review_status": "approved",
  "requires_external_review": true,
  "assessments": [
    {
      "group": "mulheres",
      "impact_direction": "positive",
      "defending_vote": "sim",
      "textual_defending_vote": "sim",
      "event_defending_vote": "sim",
      "score_eligible": true,
      "vote_attribution_status": "isolated",
      "confidence": 0.98,
      "rationale": "Criação de instrumentos integrados e financiamento para proteção de mulheres e meninas vítimas de violência.",
      "sources": ["https://dadosabertos.camara.leg.br/api/v2/proposicoes/2606313"]
    }
  ]
}
```

### Passo 3: Executar a Validação e Reconciliação
```bash
# 1. Validar schema
node scripts/validate-impact-schema.mjs

# 2. Reconciliar base pública e calcular scores
node scripts/reconcile-all-alrs-and-federal-candidate-profiles.mjs

# 3. Rodar suíte de testes completa
npm test

# 4. Verificar integridade e build
npm run data:check
npm run build
```
