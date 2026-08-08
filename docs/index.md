# Documentação

## Projeto

| Arquivo | Descrição |
|---------|-----------|
| [`proposta-inicial.md`](proposta-inicial.md) | Proposta original do agente de pesquisa automatizada |
| [`portal-transparencia-eleitoral-rs-v2.md`](portal-transparencia-eleitoral-rs-v2.md) | Especificação v2 do portal |
| [`migracao-lovable-2026-07-24.md`](migracao-lovable-2026-07-24.md) | Migração do ambiente Lovable para standalone |
| [`proximos-passos.md`](proximos-passos.md) | Roadmap e próximos passos |

## Banco de dados

| Arquivo | Descrição |
|---------|-----------|
| [`seed-completo.sql`](seed-completo.sql) | Seed completo do Supabase |
| [`seed-exemplo.sql`](seed-exemplo.sql) | Seed de exemplo para testes |
| [`cleanup-duplicatas.sql`](cleanup-duplicatas.sql) | Script de limpeza de duplicatas |
| [`insert-relatorio-fonte.sql`](insert-relatorio-fonte.sql) | Template de inserção de claims com fontes |

## Automação

| Arquivo | Descrição |
|---------|-----------|
| [`prompt-raspador-eventos.md`](prompt-raspador-eventos.md) | Prompt para raspagem de dados do TSE |

## Editorial

| Arquivo | Descrição |
|---------|-----------|
| [`editorial/2026-08-02-majoritarios-p0.md`](editorial/2026-08-02-majoritarios-p0.md) | Draft seguro da carga editorial mínima dos 6 majoritários; sem publicação automática |
| [`editorial/2026-08-02-majoritarios-p0-rascunho-claims.md`](editorial/2026-08-02-majoritarios-p0-rascunho-claims.md) | Rascunho local de claims e fontes dos 6 majoritários; itens pendentes não devem ser inseridos |

## Handoffs

| Arquivo | Descrição |
|---------|-----------|
| [`handoff/2026-08-01-fase7-decisoes-ux-node.md`](handoff/2026-08-01-fase7-decisoes-ux-node.md) | Estado atual da branch `fase-7-decisoes-ux-node`, snapshot 212 local, produção 213 e riscos antes do PR |
| [`handoff/2026-08-02-plano-pos-review-moa.md`](handoff/2026-08-02-plano-pos-review-moa.md) | Plano pós-review incorporando o relatório externo de 02/08 e o padrão MOA Hermes + OpenCode até 15/08 |
| [`handoff/2026-07-31-mvp-atualizado.md`](handoff/2026-07-31-mvp-atualizado.md) | Estado atualizado do MVP, dados TSE 213, Supabase, produção, riscos e próximos passos |
| [`handoff/fase-2-chatgpt.md`](handoff/fase-2-chatgpt.md) | Handoff histórico da Fase 2 |

## Runbooks

| Arquivo | Descrição |
|---------|-----------|
| [`runbooks/h6-1-observabilidade.md`](runbooks/h6-1-observabilidade.md) | Health check, smoke, interpretação de componentes e rollback operacional |
| [`runbooks/h6-2-seguranca-headers-dependencias.md`](runbooks/h6-2-seguranca-headers-dependencias.md) | Headers, CSP report-only, auditoria de dependências e hardening editorial |
| [`runbooks/h6-3-incidentes-recuperacao.md`](runbooks/h6-3-incidentes-recuperacao.md) | Incidentes, diagnóstico, rollback e decisões humanas obrigatórias |

## QA

| Arquivo | Descrição |
|---------|-----------|
| [`qa/fase-7-acessibilidade-contraste-final.md`](qa/fase-7-acessibilidade-contraste-final.md) | Rodada final de teclado, headings e contraste em mobile/desktop; registra correção de `h1` da Home |
| [`qa/fotos-candidatos-fontes-oficiais.md`](qa/fotos-candidatos-fontes-oficiais.md) | Fontes, método e cobertura das fotos oficiais TSE aplicadas ao snapshot público |
| [`qa/dossie-lote1-novo-2026.md`](qa/dossie-lote1-novo-2026.md) | Importação do dossiê Lote 1 (NOVO/DF) como claims `pending_review` — critérios e rastreabilidade |
| [`qa/dossie-lote2-novo-2026.md`](qa/dossie-lote2-novo-2026.md) | Importação do dossiê Lote 2 (NOVO/DF+DE) como claims `pending_review` — Ramiro e Everton |
| [`qa/e0-cobertura-majoritarios.md`](qa/e0-cobertura-majoritarios.md) | Evidência do gate E0: claims dos 6 majoritários por categoria, status e pendências de revisão |
| [`qa/cobertura-editorial-2026-08-03.md`](qa/cobertura-editorial-2026-08-03.md) | Cobertura editorial atual por cargo/categoria e próximo lote recomendado |
| [`qa/fotos-sem-match-2026-08-03.md`](qa/fotos-sem-match-2026-08-03.md) | Distribuição dos 139 candidatos sem foto e do caso ambíguo por cargo/partido |

## Release

| Arquivo | Descrição |
|---------|-----------|
| [`release/fase-7-checklist-mvp.md`](release/fase-7-checklist-mvp.md) | Checklist final Fase 7, evidências de MVP operacional e gates humanos decididos |

## Scripts

Ver `scripts/` na raiz do projeto para scripts de build, ingestão e TSE.
