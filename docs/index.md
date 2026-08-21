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
| [`architecture/proposta-orquestracao-votacoes-federais-v2.md`](architecture/proposta-orquestracao-votacoes-federais-v2.md) | Proposta consolidada e atualizada para orquestrar votações federais, comparação legislativa e carga segura no Supabase |
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
| [`handoff/2026-08-12-nova-sessao-pos-fase2.md`](handoff/2026-08-12-nova-sessao-pos-fase2.md) | Guia compacto para iniciar a nova sessão Hermes com o que já foi implementado e próximos passos do app |
| [`handoff/2026-08-14-primeiro-pacote-real-impacto-dryrun.md`](handoff/2026-08-14-primeiro-pacote-real-impacto-dryrun.md) | Primeiro pacote real Câmara/Marcel van Hattem para `impact:dryrun`, sem escrita remota |
| [`handoff/2026-08-14-source-references-plp-230-pronto-para-gate.md`](handoff/2026-08-14-source-references-plp-230-pronto-para-gate.md) | Source references oficiais do PLP 230/2025 prontas para gate remoto, sem execução Supabase |
| [`handoff/2026-08-14-gate-legislativo-bloqueado-candidato-remoto-ausente.md`](handoff/2026-08-14-gate-legislativo-bloqueado-candidato-remoto-ausente.md) | Tentativa de SQL factual bloqueada sem parcialidade porque `MARCEL VAN HATTEM` ainda não existe em `candidates` remoto |
| [`handoff/2026-08-14-gate-factual-plp-230-aplicado.md`](handoff/2026-08-14-gate-factual-plp-230-aplicado.md) | Candidato remoto sincronizado e pacote factual PLP 230/2025 aplicado sem criar matriz |
| [`handoff/2026-08-14-primeira-matriz-real-pending-review.md`](handoff/2026-08-14-primeira-matriz-real-pending-review.md) | Primeira matriz real criada em `pending_review`, vinculada ao PLP 230/2025, sem aprovação/publicação |
| [`handoff/2026-08-14-primeira-matriz-real-approved-publicada.md`](handoff/2026-08-14-primeira-matriz-real-approved-publicada.md) | Primeira matriz real revisada, aprovada e publicável pela RLS |
| [`handoff/2026-08-14-sync-candidatos-remotos-snapshot-publico.md`](handoff/2026-08-14-sync-candidatos-remotos-snapshot-publico.md) | Supabase `candidates` sincronizado com o snapshot público de 938 candidaturas, preservando registro remoto extra |
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

| [`qa/lote-senado-source-revalidation-2026-08-20-0357.md`](qa/lote-senado-source-revalidation-2026-08-20-0357.md) | Senado nominal: revalidação oficial com deriva SHA-256; aplicação bloqueada |

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
| [`qa/camara-federal-adaptacao-auditoria.md`](qa/camara-federal-adaptacao-auditoria.md) | Auditoria FED-0 da nova instrução para deputados federais/Câmara |
| [`qa/fed1-multi-house-voting-profiles-2026-08-17.md`](qa/fed1-multi-house-voting-profiles-2026-08-17.md) | Fechamento QA da FED-1: perfis multi-house |
| [`qa/fed2-factual-vs-impact-2026-08-17.md`](qa/fed2-factual-vs-impact-2026-08-17.md) | Fechamento QA da FED-2: fato legislativo separado de impacto |
| [`qa/fed3-camara-candidate-catalog-2026-08-17.md`](qa/fed3-camara-candidate-catalog-2026-08-17.md) | Fechamento QA da FED-3: catálogo Câmara ↔ candidato TSE |
| [`qa/fed4-camara-collector-2026-08-17.md`](qa/fed4-camara-collector-2026-08-17.md) | Fechamento QA da FED-4: coletor oficial Câmara em dry-run |
| [`qa/fed5-camara-pilot-2026-08-17.md`](qa/fed5-camara-pilot-2026-08-17.md) | Fechamento QA da FED-5: lote factual piloto Câmara |
| [`qa/fed6-camara-impact-pending-review-2026-08-17.md`](qa/fed6-camara-impact-pending-review-2026-08-17.md) | Fechamento QA da FED-6: impacto Câmara em pending_review |
| [`qa/fed7a-camara-remote-readiness-2026-08-17.md`](qa/fed7a-camara-remote-readiness-2026-08-17.md) | Fechamento QA da FED-7A: prontidão remota Câmara |
| [`qa/fed7b-camara-factual-apply-2026-08-17.md`](qa/fed7b-camara-factual-apply-2026-08-17.md) | Fechamento QA da FED-7B: carga factual Câmara |
| [`qa/fed8-camara-idempotency-2026-08-18.md`](qa/fed8-camara-idempotency-2026-08-18.md) | Fechamento QA da FED-8: idempotência e votação simbólica |
| [`qa/fed9-senado-block-2026-08-18.md`](qa/fed9-senado-block-2026-08-18.md) | Fechamento QA da FED-9: bloqueio Senado; Câmara concluída |
| [`qa/fed10-alrs-nominal-2026-08-18.md`](qa/fed10-alrs-nominal-2026-08-18.md) | Fechamento QA da FED-10: votos nominais ALRS |
| [`qa/fed11-alrs-vote-profiles-2026-08-18.md`](qa/fed11-alrs-vote-profiles-2026-08-18.md) | Fechamento QA da FED-11: perfis nominais ALRS |
| [`qa/fed12-public-alrs-profile-coverage-2026-08-18.md`](qa/fed12-public-alrs-profile-coverage-2026-08-18.md) | Fechamento QA da FED-12: cobertura pública de perfis ALRS |
| [`qa/fed13-production-alrs-profile-smoke-2026-08-18.md`](qa/fed13-production-alrs-profile-smoke-2026-08-18.md) | Fechamento QA da FED-13: smoke público dos perfis ALRS |
| [`qa/fed14-multi-house-coverage-2026-08-18.md`](qa/fed14-multi-house-coverage-2026-08-18.md) | Fechamento QA da FED-14: cobertura multi-house |
| [`qa/fed15-legislative-source-coverage-2026-08-18.md`](qa/fed15-legislative-source-coverage-2026-08-18.md) | Fechamento QA da FED-15: cobertura de fontes legislativas |
| [`qa/fed17-supabase-remote-identity-2026-08-18.md`](qa/fed17-supabase-remote-identity-2026-08-18.md) | Gate R0 FED-17: identidade remota Supabase |
| [`qa/fed18-camara-scout-2026-08-18.md`](qa/fed18-camara-scout-2026-08-18.md) | FED-18: scout read-only da próxima batch Câmara |
| [`qa/fed19-camara-q1-dry-run-2026-08-18.md`](qa/fed19-camara-q1-dry-run-2026-08-18.md) | FED-19: batch Câmara Q1/2026 em dry-run |
| [`qa/fed17-alrs-source-recovery-2026-08-18.md`](qa/fed17-alrs-source-recovery-2026-08-18.md) | FED-17: recuperação parcial de fontes ALRS |
| [`qa/fed20-camara-identity-reconciliation-2026-08-18.md`](qa/fed20-camara-identity-reconciliation-2026-08-18.md) | FED-20: reconciliação de identidades Câmara Q1/2026 |
| [`qa/fed21-camara-q1-envelope-resolvido-2026-08-18.md`](qa/fed21-camara-q1-envelope-resolvido-2026-08-18.md) | FED-21: envelope Câmara Q1 com identidades resolvidas |
| [`qa/fed22-vote-profiles-after-camara-q1-2026-08-18.md`](qa/fed22-vote-profiles-after-camara-q1-2026-08-18.md) | FED-22: perfis nominais após batch Câmara Q1 |
| [`qa/fed23-camara-historical-source-gaps-2026-08-18.md`](qa/fed23-camara-historical-source-gaps-2026-08-18.md) | FED-23: lacunas históricas de fontes Câmara |
| [`qa/lote-senado-sources-parser-ready-2026-08-19.md`](qa/lote-senado-sources-parser-ready-2026-08-19.md) | Senado nominal: fontes aplicadas e parser preparado |
| [`qa/lote-senado-envelope-legislator-id-2026-08-19.md`](qa/lote-senado-envelope-legislator-id-2026-08-19.md) | Senado: envelope nominal por legislator_id |
| [`qa/lote-vote-category-comparison-contract-2026-08-19.md`](qa/lote-vote-category-comparison-contract-2026-08-19.md) | Contrato de comparação de votos por categoria |
| [`qa/lote-vote-category-comparison-ui-2026-08-19.md`](qa/lote-vote-category-comparison-ui-2026-08-19.md) | UI de comparação de votos por categoria |
| [`qa/lote-alrs-fed17-residual-repair-2026-08-19.md`](qa/lote-alrs-fed17-residual-repair-2026-08-19.md) | FED-17: reparo residual ALRS |
| [`qa/lote-alrs-fed17-final-gate-2026-08-20.md`](qa/lote-alrs-fed17-final-gate-2026-08-20.md) | Fechamento final do gate R1 ALRS |
| [`qa/lote-camara-q2-scout-2026-08-20.md`](qa/lote-camara-q2-scout-2026-08-20.md) | Scout Câmara Q2/2026 |
| [`qa/lote-camara-q2-apply-2026-08-20.md`](qa/lote-camara-q2-apply-2026-08-20.md) | Aplicação Câmara Q2/2026 |
| [`qa/lote-camara-q3-scout-parcial-2026-08-20.md`](qa/lote-camara-q3-scout-parcial-2026-08-20.md) | Scout Câmara Q3/2026 parcial |
| [`qa/lote-camara-q3-scout-completo-2026-08-20.md`](qa/lote-camara-q3-scout-completo-2026-08-20.md) | Scout Câmara Q3/2026 completo |
| [`qa/lote-camara-q3-apply-2026-08-20.md`](qa/lote-camara-q3-apply-2026-08-20.md) | Aplicação Câmara Q3/2026 |
| [`qa/lote-camara-q3-extra-apply-2026-08-20.md`](qa/lote-camara-q3-extra-apply-2026-08-20.md) | Câmara Q3 extra nominal |
| [`qa/lote-camara-q3-pagination-final-2026-08-20.md`](qa/lote-camara-q3-pagination-final-2026-08-20.md) | Fechamento da paginação Câmara Q3 |
| [`qa/lote-r5-smoke-comparacao-pos-q3-2026-08-20.md`](qa/lote-r5-smoke-comparacao-pos-q3-2026-08-20.md) | Smoke R5 após Câmara Q2/Q3 |
| [`qa/lote-r5-fechamento-final-2026-08-20.md`](qa/lote-r5-fechamento-final-2026-08-20.md) | Fechamento final R5 |
| [`qa/lote-r4-review-queue-pos-q2-q3-2026-08-20.md`](qa/lote-r4-review-queue-pos-q2-q3-2026-08-20.md) | Fila R4 após Câmara Q2/Q3 |
| [`qa/lote-r4-review-queue-camara-q2-q3-2026-08-20.md`](qa/lote-r4-review-queue-camara-q2-q3-2026-08-20.md) | Fila R4 Câmara Q2/Q3 |
| [`qa/lote-r4-isolamento-q2-q3-2026-08-20.md`](qa/lote-r4-isolamento-q2-q3-2026-08-20.md) | Isolamento R4 Q2/Q3 |
| [`qa/guia-revisao-r4-camara-q2-q3.md`](qa/guia-revisao-r4-camara-q2-q3.md) | Guia operacional de revisão R4 |
| [`qa/lote-r4-fechamento-editorial-q2-q3-2026-08-20.md`](qa/lote-r4-fechamento-editorial-q2-q3-2026-08-20.md) | Fechamento editorial R4 Q2/Q3 |
| [`qa/lote-r4-fechamento-final-2026-08-20.md`](qa/lote-r4-fechamento-final-2026-08-20.md) | Fechamento final R4 |
| [`qa/lote-vote-category-score-ui-2026-08-20.md`](qa/lote-vote-category-score-ui-2026-08-20.md) | Saldo metodológico por categoria |
| [`qa/lote-scores-por-categoria-dossie-2026-08-20.md`](qa/lote-scores-por-categoria-dossie-2026-08-20.md) | Scores por categoria no dossiê |
| [`qa/lote-caso-adao-704-votos-sem-assessment-alrs-2026-08-20.md`](qa/lote-caso-adao-704-votos-sem-assessment-alrs-2026-08-20.md) | Caso Adão: votos ALRS sem assessment |
| [`qa/lote-alrs-impact-review-queue-v1-2026-08-20.md`](qa/lote-alrs-impact-review-queue-v1-2026-08-20.md) | Fila ALRS de impacto por versão |
| [`qa/lote-alrs-impact-review-priority-p0-p1-2026-08-20.md`](qa/lote-alrs-impact-review-priority-p0-p1-2026-08-20.md) | Fila ALRS prioritária P0/P1 |
| [`qa/lote-alrs-impact-merit-pack-p0-p1-2026-08-20.md`](qa/lote-alrs-impact-merit-pack-p0-p1-2026-08-20.md) | Pacote ALRS candidato a mérito |
| [`qa/lote-alrs-impact-matrix-review-pack-p0-p1-2026-08-20.md`](qa/lote-alrs-impact-matrix-review-pack-p0-p1-2026-08-20.md) | Pacote ALRS de matrizes para revisão |
| [`qa/lote-alrs-assessment-drafts-v1-2026-08-20.md`](qa/lote-alrs-assessment-drafts-v1-2026-08-20.md) | Drafts de assessments ALRS |
| [`qa/lote-alrs-assessment-proposals-v1-2026-08-20.md`](qa/lote-alrs-assessment-proposals-v1-2026-08-20.md) | Propostas preliminares de assessments ALRS |
| [`qa/lote-correcao-estrutural-fila-alrs-2026-08-21.md`](qa/lote-correcao-estrutural-fila-alrs-2026-08-21.md) | Correções estruturais da fila ALRS |
| [`qa/lote-alrs-version-key-collisions-2026-08-21.md`](qa/lote-alrs-version-key-collisions-2026-08-21.md) | Auditoria de colisões ALRS |
| [`qa/lote-alrs-version-collision-resolution-pack-2026-08-21.md`](qa/lote-alrs-version-collision-resolution-pack-2026-08-21.md) | Pacote de resolução de colisões ALRS |
| [`qa/lote-alrs-collision-source-recovery-followup-2026-08-21.md`](qa/lote-alrs-collision-source-recovery-followup-2026-08-21.md) | Follow-up de fontes das colisões ALRS |
| [`qa/lote-alrs-matrix-apply-plan-2026-08-21.md`](qa/lote-alrs-matrix-apply-plan-2026-08-21.md) | Plano local de aplicação da matriz ALRS (fail-closed) |
| [`qa/lote-official-recon-bounded-2026-08-21-0116.md`](qa/lote-official-recon-bounded-2026-08-21-0116.md) | Reconhecimento oficial bounded e circuit-breaker ALRS |
| [`qa/lote-alrs-title-recovery-pack-2026-08-21.md`](qa/lote-alrs-title-recovery-pack-2026-08-21.md) | Pacote ALRS de recuperação de títulos |
| [`qa/lote-alrs-p0-matrix-pack-2026-08-21.md`](qa/lote-alrs-p0-matrix-pack-2026-08-21.md) | Pacote editorial P0 ALRS |
| [`qa/lote-alrs-p0-official-event-evidence-2026-08-21.md`](qa/lote-alrs-p0-official-event-evidence-2026-08-21.md) | Evidência oficial estruturada P0 |
| [`qa/lote-alrs-p0-assessment-proposals-2026-08-21.md`](qa/lote-alrs-p0-assessment-proposals-2026-08-21.md) | Propostas editoriais P0 ALRS |
| [`qa/lote-alrs-safe-matrix-apply-plan-2026-08-21.md`](qa/lote-alrs-safe-matrix-apply-plan-2026-08-21.md) | Plano seguro de aplicação ALRS |
| [`qa/lote-alrs-merit-review-pack-p0-p1-2026-08-20.md`](qa/lote-alrs-merit-review-pack-p0-p1-2026-08-20.md) | Pacote ALRS de revisão de mérito P0/P1 |
| [`qa/lote-official-recon-senado-alrs-camara-2026-08-20-1938.md`](qa/lote-official-recon-senado-alrs-camara-2026-08-20-1938.md) | Reconhecimento oficial bounded |
| [`architecture/politica-precedencia-fontes.md`](architecture/politica-precedencia-fontes.md) | Precedência: fonte oficial sobre dataset2026 |
| [`qa/lote-importacao-documentacao-orquestracao-hermes-2026-08-20.md`](qa/lote-importacao-documentacao-orquestracao-hermes-2026-08-20.md) | Importação da documentação Hermes |
| [`OPERACAO-ATUAL-PARA-REVISORES.md`](OPERACAO-ATUAL-PARA-REVISORES.md) | Modo operacional atual para revisores |
| [`qa/lote-documento-operacional-revisores-2026-08-20.md`](qa/lote-documento-operacional-revisores-2026-08-20.md) | QA do documento operacional |
| [`qa/lote-precedencia-fonte-oficial-dataset2026-2026-08-20.md`](qa/lote-precedencia-fonte-oficial-dataset2026-2026-08-20.md) | QA da precedência de fontes |
| [`qa/fotos-sem-match-2026-08-03.md`](qa/fotos-sem-match-2026-08-03.md) | Distribuição dos candidatos sem foto e caso ambíguo |

## Release

| Arquivo | Descrição |
|---------|-----------|
| [`release/fase-7-checklist-mvp.md`](release/fase-7-checklist-mvp.md) | Checklist final Fase 7, evidências de MVP operacional e gates humanos decididos |

## Scripts

Ver `scripts/` na raiz do projeto para build, ingestão, TSE e `scripts/orchestrator/` para executores multi-CLI.
