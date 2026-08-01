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

## Handoffs

| Arquivo | Descrição |
|---------|-----------|
| [`handoff/2026-07-31-mvp-atualizado.md`](handoff/2026-07-31-mvp-atualizado.md) | Estado atualizado do MVP, dados TSE 213, Supabase, produção, riscos e próximos passos |
| [`handoff/fase-2-chatgpt.md`](handoff/fase-2-chatgpt.md) | Handoff histórico da Fase 2 |

## Runbooks

| Arquivo | Descrição |
|---------|-----------|
| [`runbooks/h6-1-observabilidade.md`](runbooks/h6-1-observabilidade.md) | Health check, smoke, interpretação de componentes e rollback operacional |
| [`runbooks/h6-2-seguranca-headers-dependencias.md`](runbooks/h6-2-seguranca-headers-dependencias.md) | Headers, CSP report-only, auditoria de dependências e hardening editorial |
| [`runbooks/h6-3-incidentes-recuperacao.md`](runbooks/h6-3-incidentes-recuperacao.md) | Incidentes, diagnóstico, rollback e decisões humanas obrigatórias |

## Release

| Arquivo | Descrição |
|---------|-----------|
| [`release/fase-7-checklist-mvp.md`](release/fase-7-checklist-mvp.md) | Checklist final Fase 7, evidências de MVP operacional e gates humanos restantes |

## Scripts

Ver `scripts/` na raiz do projeto para scripts de build, ingestão e TSE.
