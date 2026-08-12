# Documentação

## Projeto

| Arquivo | Descrição |
|---------|-----------|
| [`proposta-inicial.md`](proposta-inicial.md) | Proposta original do agente de pesquisa automatizada |
| [`portal-transparencia-eleitoral-rs-v2.md`](portal-transparencia-eleitoral-rs-v2.md) | Especificação v2 do portal |
| [`migracao-lovable-2026-07-24.md`](migracao-lovable-2026-07-24.md) | Migração do ambiente Lovable para standalone |
| [`proximos-passos.md`](proximos-passos.md) | Roadmap e próximos passos |

## Arquitetura de agentes

| Arquivo | Descrição |
|---------|-----------|
| [`architecture/hermes-orchestrator-v1.md`](architecture/hermes-orchestrator-v1.md) | Arquitetura atual: Hermes control plane, Codex MCP, Antigravity, OpenCode free, snapshots, handoffs e fallback local |
| [`../.orchestrator/STATE.md`](../.orchestrator/STATE.md) | Checkpoint operacional curto para retomada do Hermes |
| [`../.orchestrator/routing.yaml`](../.orchestrator/routing.yaml) | Política declarativa de roteamento, escalonamento e autoridade |
| [`templates/HERMES_OPENCODE_ROUTING.template.md`](templates/HERMES_OPENCODE_ROUTING.template.md) | Template antigo preservado como legado; não usar como política atual |

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
| [`handoff/2026-08-10-analise-externa-arquitetura-codex.md`](handoff/2026-08-10-analise-externa-arquitetura-codex.md) | Estado herdado: Fases 0–1 da Matriz de Impacto + validação Codex antes da arquitetura v1 |
| [`handoff/2026-08-12-fechamento-fase2-proxima-sessao.md`](handoff/2026-08-12-fechamento-fase2-proxima-sessao.md) | Fechamento definitivo da Fase 2 em produção e bootstrap da próxima sessão `eleicao2026-pos-fase2-matrizes-reais` |
| [`handoff/2026-08-01-fase7-decisoes-ux-node.md`](handoff/2026-08-01-fase7-decisoes-ux-node.md) | Estado da branch `fase-7-decisoes-ux-node`, snapshot 212 local, produção 213 e riscos antes do PR |
| [`handoff/2026-08-02-plano-pos-review-moa.md`](handoff/2026-08-02-plano-pos-review-moa.md) | Plano histórico pós-review/MOA; consultar apenas como histórico |
| [`handoff/2026-07-31-mvp-atualizado.md`](handoff/2026-07-31-mvp-atualizado.md) | Estado histórico do MVP, dados TSE, Supabase, produção e riscos |
| [`handoff/fase-2-chatgpt.md`](handoff/fase-2-chatgpt.md) | Handoff histórico da Fase 2 |

## Runbooks

| Arquivo | Descrição |
|---------|-----------|
| [`runbooks/hermes-orchestrator-setup.md`](runbooks/hermes-orchestrator-setup.md) | Setup local completo: Hermes profile, Codex MCP/OAuth, Antigravity, OpenCode, Supabase, GitHub Actions e smokes |
| [`runbooks/h6-1-observabilidade.md`](runbooks/h6-1-observabilidade.md) | Health check, smoke, interpretação de componentes e rollback operacional |
| [`runbooks/h6-2-seguranca-headers-dependencias.md`](runbooks/h6-2-seguranca-headers-dependencias.md) | Headers, CSP report-only, auditoria de dependências e hardening editorial |
| [`runbooks/h6-3-incidentes-recuperacao.md`](runbooks/h6-3-incidentes-recuperacao.md) | Incidentes, diagnóstico, rollback e decisões humanas obrigatórias |

## QA

| Arquivo | Descrição |
|---------|-----------|
| [`qa/fase-7-acessibilidade-contraste-final.md`](qa/fase-7-acessibilidade-contraste-final.md) | Rodada final de teclado, headings e contraste em mobile/desktop; registra correção de `h1` da Home |
| [`qa/fotos-candidatos-fontes-oficiais.md`](qa/fotos-candidatos-fontes-oficiais.md) | Fontes, método e cobertura das fotos oficiais TSE aplicadas ao snapshot público |
| [`qa/fotos-pendentes-2026-08-12.md`](qa/fotos-pendentes-2026-08-12.md) | Lista dos 32 candidatos sem foto oficial 2026 aplicável ou fallback conservador seguro |
| [`qa/dossie-lote1-novo-2026.md`](qa/dossie-lote1-novo-2026.md) | Importação do dossiê Lote 1 como claims `pending_review` |
| [`qa/dossie-lote2-novo-2026.md`](qa/dossie-lote2-novo-2026.md) | Importação do dossiê Lote 2 como claims `pending_review` |
| [`qa/dossie-lote3-novo-2026.md`](qa/dossie-lote3-novo-2026.md) | Importação do dossiê Lote 3/consolidado como claims `pending_review` |
| [`qa/card-sem-summary-estado-honesto.md`](qa/card-sem-summary-estado-honesto.md) | Correção do badge enganoso em cards sem summary publicado |
| [`qa/e0-cobertura-majoritarios.md`](qa/e0-cobertura-majoritarios.md) | Evidência do gate E0 dos majoritários |
| [`qa/cobertura-editorial-2026-08-03.md`](qa/cobertura-editorial-2026-08-03.md) | Cobertura editorial atual por cargo/categoria |
| [`qa/fotos-sem-match-2026-08-03.md`](qa/fotos-sem-match-2026-08-03.md) | Distribuição dos candidatos sem foto e caso ambíguo |

## Release

| Arquivo | Descrição |
|---------|-----------|
| [`release/fase-7-checklist-mvp.md`](release/fase-7-checklist-mvp.md) | Checklist final Fase 7, evidências de MVP operacional e gates humanos decididos |

## Scripts

Ver `scripts/` na raiz do projeto para build, ingestão, TSE e `scripts/orchestrator/` para executores multi-CLI.
