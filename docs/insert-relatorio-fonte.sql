-- ============================================================================
-- Insert do texto "Panorama Político e Mapeamento de Candidaturas 2026"
-- como raw_document no Supabase.
--
-- COMO USAR: Supabase Dashboard → SQL Editor → colar e executar
-- ============================================================================

insert into raw_documents (source_name, source_category, url, content_hash, raw_content)
values (
  'Save Chat — Dossiê Eleitoral e Arquitetura de Dados: Portal Transparência Eleitoral RS 2026',
  'outro',
  'https://chatgpt.com/share/SEU-LINK-AQUI',
  'hash-relatorio-arquitetura-20260725',
  'Panorama Político e Mapeamento de Candidaturas para as Eleições de 2026 no RS
A reconfiguração do quadro político no Estado do Rio Grande do Sul para o pleito geral de 2026 apresenta um cenário de acirrada disputa estratégica e reorganização das forças partidárias estaduais e federais. Impossibilitado constitucionalmente de concorrer a um terceiro mandato consecutivo, o atual governador Eduardo Leite (PSD) encerra sua gestão à frente do Palácio Piratini, desencadeando um movimento de sucessão que mobiliza frentes de esquerda, centro-esquerda, centro e direita. O panorama gaúcho espelha, em larga medida, a polarização política nacional, enquanto manifesta nuances locais derivadas de alianças históricas e da emergência de novas lideranças regionais.

Levantamentos e pesquisas eleitorais devidamente registrados no Tribunal Superior Eleitoral sob os protocolos RS-09313/2026 e RS-07063/2026 demonstram a consolidação de dois blocos competitivos na liderança das intenções de voto para o Poder Executivo estadual. De um lado, a ex-deputada estadual Juliana Brizola (PDT) encabeça uma aliança progressista unificada que reúne o PDT, a Federação Brasil da Esperança (composta por PT, PCdoB e PV), a Federação PSOL REDE, o PSB e o Avante. A chapa conta com o ex-deputado estadual e ex-presidente da Companhia Nacional de Abastecimento (Conab), Edegar Pretto (PT), indicado para a vaga de vice-governador após articulação promovida pelas diretivas nacionais. De outro lado, o deputado federal Luciano Zucco (PL) lidera uma coalizão conservadora denominada O Rio Grande Pode Mais, composta por PL, PP, União Brasil, Novo, Podemos, Republicanos, Democracia Cristã e Partido Mobilização Nacional, apresentando a deputada estadual Silvana Covatti (PP) como candidata a vice-governadora.

Paralelamente, a candidatura de continuidade administrativa é representada pelo atual vice-governador Gabriel Souza (MDB), que articula o apoio do PSD, Agir e da Federação Renovação Solidária (PRD/Solidariedade), tendo como candidato a vice-governador o ex-secretário estadual de Desenvolvimento Econômico, Ernani Polo (PSD). O quadro majoritário para o governo estadual complementa-se com as pré-candidaturas e candidaturas homologadas em convenções partidárias de Marcelo Maranata (PSDB), apoiado pela Federação PSOL Cidadania e acompanhado por Cláudio Diaz (PSDB) na vice; Priscila Voigt pela Unidade Popular (UP), com Naf Nascimento de vice; Rejane de Oliveira pelo Partido Socialista dos Trabalhadores Unificado (PSTU), com Adão Lima de vice; e César Pontes pelo Partido da Causa Operária (PCO).

-- PARTE 1 - Candidatos ao Governo
A estruturação documental das candidaturas ao Governo do Estado do Rio Grande do Sul reflete a composição formal enviada ou em fase de registro junto à Justiça Eleitoral durante o período de convenções e solicitações de registro.

Candidatos ao Governo do RS 2026:
- Juliana Brizola (PDT, nº 12) — Vice: Edegar Pretto (PT) — Coligação: PDT, FE Brasil (PT/PCdoB/PV), PSOL REDE, PSB, Avante
- Gabriel Souza (MDB, nº 15) — Vice: Ernani Polo (PSD) — Coligação: MDB, PSD, Agir, Fed. Renovação Solidária (PRD/Solidariedade)
- Luciano Zucco (PL, nº 22) — Vice: Silvana Covatti (PP) — Coligação: O Rio Grande Pode Mais (PL, PP, União Brasil, NOVO, Pode, Republicanos, DC, PMB)
- Marcelo Maranata (PSDB, nº 45) — Vice: Cláudio Diaz (PSDB) — Federação PSDB Cidadania
- Priscila Voigt (UP, nº 80) — Vice: Naf Nascimento (UP) — Unidade Popular
- Rejane de Oliveira (PSTU, nº 16) — Vice: Adão Lima (PSTU) — PSTU
- César Pontes (PCO, nº 29) — Vice: a definir — PCO

-- PARTE 2 - Candidatos ao Senado
O eleitorado gaúcho escolherá dois representantes para o Senado Federal nas eleições de 2026, ocupando as vagas atualmente pertencentes a Luis Carlos Heinze (PP) e Paulo Paim (PT).

Candidatos ao Senado pelo RS 2026:
- Paulo Pimenta (PT/FE Brasil) — Deputado Federal, ex-Ministro da SECOM — Frente de Esquerda
- Germano Rigotto (MDB) — Ex-Governador do RS (2003-2006), Deputado Federal — Aliança MDB/PSD
- Marcel Van Hattem (NOVO) — Deputado Federal, Deputado Estadual — Coligação O Rio Grande Pode Mais
- Manuela dÁvila (PSOL/Fed. PSOL REDE) — Deputada Federal, Deputada Estadual, Vereadora de POA — Esquerda
- Ubiratan Sanderson (PL) — Deputado Federal — Coligação O Rio Grande Pode Mais
- Frederico Antunes (PSD) — Deputado Estadual, Líder de Governo na ALERS — Aliança MDB/PSD
- Régis Ethur (PSTU) — Dirigente Sindical — PSTU
- Tânia Peres (UP) — Militante de Direitos Humanos — Unidade Popular

-- PARTE 3 - Diretrizes de Engenharia de Dados
O Portal Transparência Eleitoral RS demanda o desenvolvimento de uma infraestrutura de dados orientada pelos princípios de legalidade, auditabilidade, ética computacional e transparência técnica. A arquitetura de extração automatizada opera exclusivamente sobre ecossistemas de dados abertos e APIs disponibilizadas por órgãos oficiais.

Conformidade Legal: respeito integral à LAI (Lei 12.527/2011), Marco Civil da Internet (Lei 12.965/2014) e LGPD (Lei 13.709/2018). Vedada a burla de CAPTCHA, autenticação obrigatória ou robots.txt. Rate limiting obrigatório nas APIs do TSE.

Integridade Documental: todos os dados coletados passam por geração de assinatura SHA-256 no momento da recepção. Versionamento imutável — registros antigos não são substituídos, apenas versionados com nova data/hora de coleta e novo hash.

Fontes de dados:
- API DivulgaCandContas TSE (JSON, REST, horário, SHA-256)
- Portal de Dados Abertos TSE/CKAN (CSV/ZIP, diário)
- API DataJud/CNJ (JSON, semanal)
- WebServices TRE-RS (JSON/XML, diário)
- Diários Oficiais DOU e DOE-RS (PDF/HTML, diário)

-- PARTE 4 - Desambiguação de Identidade
A atribuição equivocada de ações judiciais por homonímia pode causar danos à reputação e comprometer a credibilidade do portal. A busca isolada por nome civil é proibida como critério de publicação automática.

Matriz de atribuição: o vínculo entre pessoa física e registro processual exige confirmação em ao menos 3 dos seguintes vetores: CPF ou Título de Eleitor, data de nascimento e filiação, domicílio eleitoral e histórico de cargos, coincidência do número do processo em certidões apresentadas pelo candidato.

Registros com apenas nome civil recebem sinalizador possible_homonym = true, têm confiança rebaixada e ficam bloqueados para exibição pública até checagem manual.

-- PARTE 5 - Mitigação de Riscos
Nenhum registro de caráter judicial, administrativo ou de prestação de contas rejeitada é publicado diretamente por fluxos automatizados. Todos nascem com status pending_review. A transição para published exige assinatura digital de validador humano.

-- PARTE 6 - Taxonomia Jurídica
Taxonomia padronizada de 24 categorias: investigacao, inquerito, denuncia_apresentada, denuncia_recebida, denuncia_rejeitada, acao_em_andamento, decisao_liminar, condenacao_primeira_instancia, condenacao_colegiada, condenacao_definitiva, absolvicao, arquivamento, prescricao, acordo, decisao_anulada, recurso_pendente, inelegibilidade, inelegibilidade_suspensa, inelegibilidade_encerrada, contas_aprovadas, contas_aprovadas_com_ressalvas, contas_rejeitadas, sancao_administrativa, nao_classificado.

-- PARTE 7 - Escala de Confiança
5 = Fonte primária definitiva (certidão oficial, DOE, decisão definitiva, API TSE) — publicação permitida
4 = Fonte oficial em andamento (processo ativo DataJud, prestação de contas pendente) — publicação permitida com indicação de pendência
3 = Múltiplas fontes confiáveis (matérias jornalísticas citando documentos públicos) — bloqueado para validação manual
2 = Parcialmente confirmado (matéria de fonte única sem nº de processo) — retido no banco
1 = Não confirmado / especulativo (redes sociais, denúncias anônimas) — exclusão sumária

-- PARTE 8 - Estatísticas de Cobertura (dados ilustrativos do diagnóstico)
Cobertura total estimada: 1.250 candidatos encontrados, 1.180 processados (94,4%), 850 com dados completos (68%), 330 pendentes de revisão (26,4%), 42 alertas de homonímia (3,36%), 88 registros jurídicos pendentes (7,04%), 15 documentos sem URL pública estável (1,2%).

Candidatos majoritários: 7 governadores, 10 senadores — cobertura de 100% em processamento.
Candidatos proporcionais: 485 deputados federais (458 processados), 748 deputados estaduais (705 processados).

Fontes acessadas com sucesso (18 plataformas): TSE (API REST + CKAN), TRE-RS, CNJ/DataJud, ALERS, Câmara dos Deputados, Senado Federal, DOU, DOE-RS, TCU, TCE-RS, veículos de imprensa (JOTA, Poder360, Veja, CNN Brasil, Brasil de Fato, GZH).

Fontes bloqueadas: TJ-RS (CAPTCHA), consulta de diários da justiça de 2ª instância (rate limiting).

Erros operacionais: 14 timeouts (504 Gateway Timeout) na API CKAN do TSE, 6 erros de parsing em PDF sem OCR.

-- PARTE 9 - Exemplo de Resumo Factual (Juliana Brizola)
"Juliana Brizola, candidata ao Governo do Estado do Rio Grande do Sul pelo PDT. Exerceu os mandatos de Secretária Municipal da Juventude de Porto Alegre (2007-2008), Vereadora da Capital (2009-2010) e Deputada Estadual (2011-2023). Seu plano de governo protocolado no TSE prioriza a valorização do ensino público, expansão de escolas técnicas e investimentos em infraestrutura. Consta representação eleitoral em andamento no TRE-RS referente à propaganda eleitoral, sem condenação definitiva até a data da coleta."
'
);