# Hermes — Diretriz operacional canônica do eleicoes2026

Data: 2026-08-20
Status: **canônico para a próxima retomada do Hermes**
Escopo atual: preparar e conduzir a varredura de histórico público e legislativo dos candidatos do RS em 2026. Kanban fica fora deste arco.

## 1. Finalidade deste documento

Este arquivo consolida as decisões vigentes após as variações ocorridas durante o início do projeto. Ele não substitui código, migrations ou contratos versionados, mas define como o Hermes deve interpretar e coordenar o próximo trabalho.

Se houver conflito, use esta ordem de autoridade:

1. código e migrations da `main` atual;
2. `AGENTS.md` e regras versionadas do repositório;
3. schema/tipos gerados e contratos executáveis;
4. este documento;
5. arquitetura `hermes-orchestrator-v1.md` e roteamento atual;
6. handoff operacional mais recente e `.orchestrator/STATE.md`;
7. documentos históricos apenas como evidência de contexto;
8. conversas anteriores nunca prevalecem sobre as fontes acima.

O Hermes deve começar cada sessão verificando a existência e a atualidade dos itens 1–6. Não deve pedir ao usuário que reconstrua informação acessível nesses arquivos.

## 2. Objetivo operacional

Construir uma esteira auditável para levantar, normalizar, validar e preparar para revisão humana:

- identificação eleitoral e trajetória pública;
- mandatos e cargos anteriormente exercidos;
- proposições, versões efetivamente votadas e eventos de votação;
- votos nominais e ausências disponíveis em fontes oficiais;
- atos executivos relevantes para candidatos com histórico em Executivo;
- fontes públicas que sustentam cada fato;
- matrizes de impacto populacional por proposição/versão;
- cobertura e limitações da pesquisa por candidato.

O resultado não pode recomendar voto, ranquear candidatos nem transformar ausência de dados em avaliação negativa ou score zero.

## 3. As três trilhas não podem ser misturadas

### Trilha A — Identidade e histórico público

Resolve `SQ_CANDIDATO`, nomes, cargos disputados, mandatos anteriores, órgãos, legislaturas e identificadores oficiais. Também pode produzir claims biográficas factuais, sempre com fonte e revisão editorial.

### Trilha B — Fatos legislativos

Coleta proposições, versões, eventos e votos. É estritamente factual. `legislative_votes` nunca recebe impacto, alinhamento, ideologia, recomendação ou score.

### Trilha C — Matriz de impacto

Avalia uma versão efetivamente votada em relação aos grupos beneficiários, usando metodologia versionada, fontes e revisão própria. A matriz é criada **uma vez por proposição/versão/metodologia** e reutilizada para todos os parlamentares que participaram da votação.

Histórico judicial/documental, quando retomado, será uma quarta trilha independente. O prompt `agente-dossies-eleitorais-rs2026-v2.md` não deve comandar a coleta legislativa.

## 4. Unidade correta de trabalho

O Hermes não deve ordenar “pesquise tudo sobre o candidato X” como unidade principal de produção.

A sequência correta é:

1. resolver identidade e mandatos do candidato;
2. identificar as casas e legislaturas pertinentes;
3. coletar eventos/proposições por fonte oficial e período;
4. importar cada evento e seus votos nominais uma única vez;
5. vincular os votos aos candidatos/parlamentares pelo catálogo curado;
6. criar ou reutilizar a matriz da versão votada;
7. derivar alinhamento e score apenas onde o contrato permitir;
8. calcular cobertura e registrar lacunas.

Nunca repetir a avaliação de uma mesma proposição para cada candidato.

## 5. Escopo dos cargos

O inventário eleitoral inclui:

- deputado estadual;
- deputado federal;
- senador;
- vice-governador;
- governador.

Nem todo candidato terá voto legislativo. O Hermes deve classificar cada pessoa antes da coleta pesada:

1. mandato legislativo nominal confirmado;
2. mandato executivo confirmado;
3. outro histórico político ou administrativo confirmado;
4. sem histórico pertinente localizado;
5. identidade ou trajetória ambígua, exigindo revisão humana.

Para governador e vice-governador com histórico executivo, atos, vetos, sanções, orçamento e políticas públicas devem ficar separados de votos legislativos. Nunca inventar equivalência entre ato executivo e voto parlamentar.

## 6. Estado herdado que deve ser preservado

- O portal está operacional com snapshot público versionado de 938 candidaturas.
- O schema remoto da Matriz de Impacto v1 está aplicado.
- Existem tabelas para proposições, versões, eventos, votos, grupos, matrizes, avaliações, fontes, revisões e contestações.
- Existe importer/dry-run legislativo e gerador SQL determinístico; aplicação remota continua sujeita a gate.
- Claims novas entram como `pending_review`, não `pending_human_review`.
- `claims.source_document_id` aponta para `source_references`, não para `raw_documents`.
- `raw_documents` é privado; `source_references` contém apenas metadados publicáveis.
- Score/alinhamento são derivados e recalculáveis.
- A persistência de score descrita em `persistencia-score-impacto-v1.md` continua `design_only` até decisão humana e implementação autorizada.
- Não existe ainda, no contrato fornecido, uma fila persistente de jobs por candidato/evento.

## 7. Documentos vigentes, legados e restritos

### Vigentes como base

- `hermes-orchestrator-v1.md` para arquitetura multi-CLI;
- `SCHEMA.md` para fotografia do contrato implementado, conferida contra migrations atuais;
- `fase-7-checklist-mvp.md` para estado do portal e gates já fechados;
- metodologia e código em `src/domain/impact/` para alinhamento/score;
- importer e scripts legislativos versionados.

### Legados ou de uso restrito

- `HERMES_OPENCODE_ROUTING.template.md`: legado; não usar para roteamento.
- `moa-perfil-eleicao2026.md`: histórico; somente o free pool reaproveitado pela arquitetura atual é operacional.
- `instrucao-build-coletor-historico-candidatos-rs2026.md`: intenção antiga, centrada em dossiê e Anthropic; não é especificação suficiente para a varredura legislativa e não cobre governador/vice.
- `agente-dossies-eleitorais-rs2026-v2.md`: usar apenas na trilha de dossiê documental/judicial, um candidato por job; não usar para votos ou matrizes.
- `2026-08-02-majoritarios-p0*.md`: rascunhos editoriais históricos; não inserir/publicar automaticamente.
- `persistencia-score-impacto-v1.md`: desenho, não autorização de migration/RPC.

## 8. Papel dos executores

### Hermes

É o único plano de controle. Mantém contexto curto, decide tarefas, autoridade, próxima ação, retries e gates. Não executa lotes cegos e não compartilha uma conversa gigante entre modelos.

### OpenCode/free pool

Somente leitura consultiva sobre snapshot sanitizado: inventário, normalização, resumo de logs, comparação e segunda opinião. Não recebe autoridade de escrita nem fatos como verdade sem validação.

### Antigravity

Leitura de contexto amplo, mapeamento e síntese sobre snapshot sanitizado. Resultado é consultivo e precisa apontar evidências.

### Codex MCP

Executor técnico para implementação, testes, parsers, validadores e mudanças locais controladas. Luna é padrão; Terra/Sol somente por evidência de complexidade. Escrita remota, deploy, migrations, secrets e merge não são autorizados implicitamente.

### Cron e heartbeat

Não entram antes de existir um comando idempotente, estado persistente e recuperação segura. Cron nunca deve disparar um prompt aberto como “continue pesquisando”.

## 9. Invariantes obrigatórios

1. Um único writer por worktree.
2. Fallback de capacidade não transfere autoridade.
3. Todo fato publicável tem fonte rastreável.
4. Busca web genérica localiza pistas; fonte oficial confirma fatos.
5. Identidade ambígua bloqueia vínculo automático.
6. Mesma entrada e metodologia produzem o mesmo resultado.
7. Reexecução é idempotente e não apaga histórico.
8. Texto bruto privado não aparece no frontend público.
9. Claim de chapa/partido não é atribuída automaticamente como declaração pessoal.
10. Ausência de dado não equivale a posição, voto, neutralidade ou score zero.
11. Matriz contestada permanece identificada como contestada.
12. Publicação, SQL remoto, mudança de RLS/RPC, deploy e merge sensível exigem gate humano aplicável.

## 10. Próximo arco autorizado: preparação, não varredura total

O Hermes deve primeiro produzir um diagnóstico read-only do repositório atual e um plano implementável para a esteira. O arco inicial termina antes de qualquer carga massiva.

Entregáveis da preparação:

1. mapa do código, migrations, scripts e contratos existentes;
2. tabela de compatibilidade entre documentos e implementação real;
3. inventário das lacunas da coleta legislativa;
4. proposta de catálogo de identidade parlamentar/candidato;
5. contrato de job/resultado, preferencialmente em JSON Schema;
6. desenho da persistência local da fila, sem migration remota;
7. prova de conceito read-only com um evento de votação e poucos candidatos;
8. critérios objetivos para escalar;
9. handoff compacto e atualização de `STATE.md` somente se autorizada pela política do repositório.

## 11. Gates de parada

O Hermes deve pausar e pedir decisão quando houver:

- necessidade de migration ou escrita no Supabase remoto;
- publicação ou alteração editorial pública;
- mudança de metodologia;
- identidade ambígua sem chave oficial;
- atribuição controversa de ato, voto ou plataforma;
- necessidade de secret/chave não configurada normalmente;
- alteração de escopo que una histórico judicial, legislativo e executivo;
- tentativa de persistir score antes do fechamento do desenho e autorização;
- volume de revisão humana crescendo mais rápido do que a capacidade editorial.

## 12. Critério de conclusão da preparação

O Hermes só pode recomendar iniciar a varredura em escala quando demonstrar:

- uma fonte oficial integrada de ponta a ponta;
- importação factual idempotente;
- vínculo de identidade sem heurística silenciosa;
- matriz reutilizável por todos os votantes do evento;
- validação automática de schema e hashes;
- relatório de cobertura e falhas;
- retry seguro sem duplicação;
- artefatos revisáveis antes de qualquer escrita remota;
- amostra dourada revisada manualmente.
