# Rascunho de claims P0 — majoritários RS 2026

Data: 2026-08-02  
Escopo: 6 candidaturas majoritárias do snapshot público.  
Status: **rascunho editorial local**. Não inserir nem publicar sem revisão humana.

## Regras deste rascunho

- Todas as claims abaixo, se aprovadas, devem entrar no banco como `pending_review`.
- Publicação pública somente por `editorial_reviews.decision='approved'` + RPC `publish_claim()`.
- `reputacao` fica fora deste bloco.
- Fontes marcadas como “a verificar” não devem ser usadas para inserção até extração/leitura direta.

## Fontes comuns

| Código | Fonte | Categoria | URL | Uso |
|---|---|---|---|---|
| `tse-divulgacandcontas` | TSE — DivulgaCandContas | oficial | https://divulgacandcontas.tse.jus.br/ | identificação, cargo, partido, número, registro |
| `sul21-up-convencao` | Sul21 — Unidade Popular oficializa Priscila Voigt | imprensa | https://sul21.com.br/noticias/politica/2026/07/unidade-popular-oficializa-priscila-voigt-como-candidata-ao-governo-do-rs/ | chapa UP, trajetória de Priscila, eixos da campanha UP |
| `movimento-psol-convencao` | Revista Movimento — PSOL oficializa candidaturas no RS | imprensa/outro | https://movimentorevista.com.br/2026/07/psol-oficializa-candidaturas-e-mira-ampliacao-de-bancadas/ | homologação de Manuela, estratégia PSOL-Rede |
| `camara-pimenta` | Câmara dos Deputados — Paulo Pimenta | oficial | https://www.camara.leg.br/deputados/74400 | mandato, atuação parlamentar e cargos em 2026 |
| `camara-manuela` | Câmara dos Deputados — Manuela D'Ávila | oficial | https://www.camara.leg.br/deputados/141492 | histórico parlamentar de Manuela; precisa leitura direta antes de inserir |
| `gzh-luciano-2024` | GZH — Quem é Luciano do MLB | imprensa | https://gauchazh.clicrbs.com.br/politica/eleicoes/noticia/2024/08/quem-e-luciano-do-mlb-candidato-da-up-a-prefeito-de-porto-alegre-cm0541w8u00wr015ijgupk6n2.html | histórico público de Luciano em 2024 |
| `correio-tania-2026` | Correio do Povo — Saiba quem é Tânia Peres | imprensa | https://www.correiodopovo.com.br/not%C3%ADcias/pol%C3%ADtica/elei%C3%A7%C3%B5es/eleicoes-2026-saiba-quem-e-tania-peres-up-1.1728742 | histórico de Tânia; **a verificar por leitura direta** |
| `assufrgs-tania` | Assufrgs — Chapa 01 Autonomia e Luta | outro | https://www.assufrgs.org.br/eleicoes2025/chapa01/ | vínculo funcional/sindical de Tânia; **a verificar por leitura direta** |

## Claims propostas para revisão

### PRISCILA VOIGT — Governador

Candidate ID: `2c130d25-b139-5696-b440-7b9e0f376153`  
TSE candidate ID: `210002533355`  
Slug: `priscila_voigt_severiano_210002533355`

#### `historico_politico`

Texto proposto:

> Priscila Voigt é nutricionista, preside a Unidade Popular no Rio Grande do Sul e integra a direção nacional do partido. Segundo o Sul21, sua trajetória inclui atuação em movimentos populares, na Ocupação Lanceiros Negros e na Casa de Referência Mulheres Mirabal; em 2022, foi candidata a deputada federal pela UP.

Fonte principal: `sul21-up-convencao`  
Fonte de identificação: `tse-divulgacandcontas`  
Risco: baixo, mas revisar enumeração de cargos/atuações antes de publicar.

#### `plataforma`

Texto proposto:

> Na convenção estadual da UP, Priscila Voigt defendeu como eixos de campanha a valorização dos serviços públicos, a reestatização de empresas privatizadas, geração de empregos e defesa dos direitos trabalhistas, conforme reportagem do Sul21.

Fonte principal: `sul21-up-convencao`  
Risco: baixo; atribuir explicitamente como defesa feita em convenção.

### NAF NASCIMENTO — Vice-governador

Candidate ID: `46b34cdc-2c9b-518f-ade8-7f24f9e9199f`  
TSE candidate ID: `210002533354`  
Slug: `naftaly_pereira_do_nascimento_210002533354`

#### `historico_politico`

Texto proposto:

> Naf Nascimento compõe a chapa majoritária da Unidade Popular como candidata a vice-governadora ao lado de Priscila Voigt, conforme a convenção estadual noticiada pelo Sul21 e o registro de candidatura no TSE.

Fonte principal: `sul21-up-convencao`  
Fonte de identificação: `tse-divulgacandcontas`  
Risco: baixo; ainda falta fonte biográfica própria.

#### `plataforma`

Texto proposto:

> Como integrante da chapa da UP ao governo do RS, Naf Nascimento está vinculada à campanha que apresentou eixos como defesa dos serviços públicos, reestatização de empresas privatizadas, geração de empregos e defesa de direitos trabalhistas, segundo reportagem do Sul21 sobre a convenção partidária.

Fonte principal: `sul21-up-convencao`  
Risco: médio; formulação é de plataforma de chapa, não declaração individual. Revisar antes de publicar.

### MANUELA D'ÁVILA — Senador

Candidate ID: `96aa5ddc-319c-5c3c-bd36-ab73566c075d`  
TSE candidate ID: `210002533581`  
Slug: `manuela_pinto_vieira_d_avila_210002533581`

#### `historico_politico`

Texto proposto:

> Manuela D'Ávila é ex-deputada federal por RS, conforme perfil da Câmara dos Deputados, e teve sua candidatura ao Senado homologada pela Federação PSOL-Rede em convenção no Rio Grande do Sul.

Fonte principal: `camara-manuela`  
Fonte complementar: `movimento-psol-convencao`  
Risco: baixo, mas `camara-manuela` precisa ser extraída/lida diretamente antes da inserção.

#### `plataforma`

Texto proposto:

> Na convenção da Federação PSOL-Rede, Manuela D'Ávila defendeu a ampliação da bancada federal do PSOL gaúcho e vinculou sua candidatura ao Senado a uma estratégia de fortalecimento da representação do partido no Congresso e na Assembleia Legislativa.

Fonte principal: `movimento-psol-convencao`  
Risco: baixo a médio; é uma posição estratégica/partidária, não programa setorial completo.

### PIMENTA — Senador

Candidate ID: `060f465c-7ab2-50be-bd4d-1a7ce7b542eb`  
TSE candidate ID: `210002533584`  
Slug: `paulo_roberto_severo_pimenta_210002533584`

#### `historico_politico`

Texto proposto:

> Paulo Pimenta é deputado federal pelo PT do Rio Grande do Sul. Em 2026, o perfil da Câmara dos Deputados registra atuação parlamentar com propostas de autoria, votações nominais, discursos, presença em plenário e cargos de liderança/vice-liderança.

Fonte principal: `camara-pimenta`  
Risco: baixo; texto factual institucional.

#### `plataforma`

Texto proposto:

> Plataforma específica de campanha ao Senado ainda precisa de fonte primária. Como rascunho provisório, usar apenas fonte a levantar sobre propostas para reconstrução do RS ou programa de campanha, sem publicar até confirmação documental.

Fonte principal: pendente  
Risco: alto se publicado sem fonte; **não inserir ainda**.

### LUCIANO DO MLB — Senador

Candidate ID: `f1e62b70-796a-5c9f-8ac4-08ffeca5df8b`  
TSE candidate ID: `210002533435`  
Slug: `luciano_schafer_210002533435`

#### `historico_politico`

Texto proposto:

> Luciano Schafer, conhecido como Luciano do MLB, é militante do Movimento de Luta nos Bairros, Vilas e Favelas e foi candidato a prefeito de Porto Alegre pela UP em 2024, segundo perfil publicado pela GZH; em 2026, foi oficializado pela UP como candidato ao Senado no RS.

Fonte principal: `gzh-luciano-2024`  
Fonte complementar: `sul21-up-convencao`  
Risco: baixo.

#### `plataforma`

Texto proposto:

> Como candidato ao Senado pela UP, Luciano do MLB integra a chapa cujo partido apresentou, em convenção estadual, eixos como serviços públicos, reestatização de empresas privatizadas, geração de empregos e direitos trabalhistas.

Fonte principal: `sul21-up-convencao`  
Risco: médio; plataforma de chapa/partido, não declaração individual.

### TANIA PERES — Senador

Candidate ID: `7b2f3843-58bf-50cb-913f-eba7c9c75d40`  
TSE candidate ID: `210002533434`  
Slug: `tania_mara_santoro_peres_210002533434`

#### `historico_politico`

Texto proposto:

> Tânia Mara Santoro Peres é candidata ao Senado pela UP na chapa de Priscila Voigt. Fontes a verificar indicam atuação como bióloga/técnica-administrativa e vínculo com a UFRGS/Assufrgs, mas a claim biográfica não deve ser inserida até leitura direta das fontes.

Fonte principal: `correio-tania-2026` ou `assufrgs-tania` após verificação  
Fonte complementar: `sul21-up-convencao` para candidatura  
Risco: médio; **não inserir biografia sem verificação direta**.

#### `plataforma`

Texto proposto:

> Como candidata ao Senado pela UP, Tânia Peres integra a chapa cujo partido apresentou, em convenção estadual, eixos como serviços públicos, reestatização de empresas privatizadas, geração de empregos e direitos trabalhistas.

Fonte principal: `sul21-up-convencao`  
Risco: médio; plataforma de chapa/partido, não declaração individual.

## Status de prontidão para inserção

| Candidatura | Histórico | Plataforma | Observação |
|---|---|---|---|
| Priscila Voigt | pronto para revisão | pronto para revisão | fonte Sul21 extraída |
| Naf Nascimento | pronto para revisão parcial | revisar antes | falta biografia própria |
| Manuela D'Ávila | revisar Câmara | pronto para revisão | Câmara bloqueou extração; fonte existe, mas precisa leitura direta |
| Paulo Pimenta | pronto para revisão | pendente | plataforma específica não localizada em fonte robusta |
| Luciano do MLB | pronto para revisão | revisar antes | histórico 2024 + chapa 2026 |
| Tânia Peres | pendente | revisar antes | biografia precisa verificação direta |

## Próxima ação segura

Antes de qualquer Supabase:

1. revisar manualmente este rascunho;
2. completar fontes pendentes de Pimenta e Tânia;
3. confirmar se claims de plataforma de chapa podem ser publicadas nos candidatos individuais ou devem virar claim da chapa/partido;
4. transformar apenas itens “pronto para revisão” em lote `pending_review`.
