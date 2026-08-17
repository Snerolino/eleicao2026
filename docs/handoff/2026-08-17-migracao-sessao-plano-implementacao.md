# Handoff — migração de sessão e plano de implementação

Data: 2026-08-17
Projeto: `Snerolino/eleicao2026`
Produção: https://rs.votopraquem.org
Perfil Hermes: `eleicao2026`

## Como retomar em uma nova sessão

No TUI atual, executar:

```text
/new eleicao2026-plano-implementacao
```

Na primeira mensagem da nova sessão, informar:

```text
Leia AGENTS.md, .orchestrator/STATE.md e este handoff:
docs/handoff/2026-08-17-migracao-sessao-plano-implementacao.md.
Consulte também ../dataset2026/INDEX.md,
../dataset2026/GUIA DE IMPLEMENTAÇÃO.md e
../dataset2026/planejamento_perfil_votacao.md.
Continue pelo plano ALRS-0/UI-1, revalidando Git, Supabase e produção antes de mutar.
```

Não é necessário instalar ferramenta nem copiar o histórico manualmente. O handoff está no repositório e o perfil Hermes mantém as skills/memória. Se for aberto outro terminal, usar o mesmo perfil `eleicao2026` e a raiz do projeto.

## Estado Git e produção

- Branch: `main`.
- Último commit funcional: `85d7031` — `feat: exibir claims e perfil de votações no dossiê`.
- Worktree limpa e sincronizada com `origin/main` no momento deste handoff.
- Release live: `0.2.275`, SHA `85d7031`.
- CI/deploy do commit `85d7031`: run `32014969028`, verde.
- Build, TypeScript, 302/302 testes, smoke local, smoke deployment e health: verdes.

## Diagnóstico que motivou a correção recente

- O backend tinha claims e perfis, mas a UI não os mostrava.
- Quando o Supabase tinha menos candidatos que o snapshot público, o frontend descartava todo o resultado remoto e usava apenas `data/public-candidates.json`; isso apagava as claims remotas da tela.
- Não existia consulta frontend para `legislator_vote_profile`; os perfis estavam materializados apenas no banco.
- Corrigido em `src/services/candidates.ts`: fallback agora combina snapshot público com claims remotas por `tse_candidate_id`.
- Corrigido em `src/pages/CandidateDossierPage.tsx`: dossiê mostra perfil nominal, contagens, saldo descritivo e fonte ALRS.
- Consulta anon ao perfil retorna HTTP 200.
- Verificação live real em `/candidatos/marcel_van_hattem_210002547819` mostrou claims publicadas e perfil com 3 votos, 2 Sim, 1 Não, saldo 0.33 e fonte ALRS.

## Estado factual remoto confirmado

- Claims: 2.650 `published`, 33 `pending_review`; não promover automaticamente.
- Votos legislativos: 3.936 no total após a carga ALRS.
- Proposições: 1.264.
- Versões: 1.264.
- Eventos: 1.347.
- Fontes: 93.
- Itens de índice: 3.481.
- Perfis materializados: 14.
- Carga ALRS: 3.453 votos individuais válidos; segunda passagem idempotente inseriu zero linhas.
- Correspondência ALRS→TSE exclusivamente exata; sem matching heurístico.

## Fonte externa consultada

O usuário chamou a pasta de `database2026`, mas ela não existe em `/home/lourenco/Projetos`. A pasta existente e consultada é:

```text
/home/lourenco/Projetos/dataset2026
```

Arquivos relevantes:

- `INDEX.md`
- `GUIA DE IMPLEMENTAÇÃO.md`
- `planejamento_perfil_votacao.md`
- `relatorios/pesquisas/votacoes_plenario_alrs_2026.md`
- `relatorios/pesquisas/proposicoes_alrs_2026.md`
- `relatorios/pesquisas/alrs_mandato_2019.md` até `alrs_mandato_2025.md`
- `relatorios/analises/matriz_impacto_v1_deputados_rs_2026.md`
- dossiês em `relatorios/dossies/`

O planejamento externo alerta que os relatórios ALRS são staging editorial, não fonte canônica automática. Divergências documentadas incluem PL 312/2023, Plano Rio Grande/FUNRIGS, PL 38/2026 e PL 361/2025. A fonte primária ALRS/DOE deve confirmar proposição, versão, evento e voto antes de novas cargas.

## Plano de implementação a seguir

### ALRS-0 — classificação editorial

- Marcar relatórios ALRS 2019–2026 como `research_draft`/staging, sem ingerir afirmações não confirmadas.
- Inventariar proposições, eventos e claims candidatas.
- Separar votação de mérito, emenda, preferência, veto, admissibilidade, subscrição, comissão, simbólica e nominal.
- Gate: nenhuma ingestão automática somente pelo relatório.

### ALRS-1 — conferência canônica

- Conferir cada proposição contra portal ALRS/Sistema Legis/DOE.
- Exigir URL oficial, ID, ano, tipo, versão textual e hash.
- Corrigir divergências antes de qualquer lote remoto.
- Gate: catálogo auditável e fontes oficiais.

### ALRS-2 — contrato de eventos

- Avaliar campos `vote_method`, `motion_type`, `result`, totais do placar e `is_individualized`.
- Votação simbólica/aclamação não gera votos individuais fictícios.
- Eventos de preferência, emenda, veto, requerimento ou subscrição não devem ser tratados automaticamente como voto de mérito.
- Gate: testes e parser fail-closed verdes.

### ALRS-3 — perfil e score

- Revisar `profile_score` e migration drift.
- Não expor score bruto sem metodologia e cobertura.
- Preservar distinção entre voto factual, perfil agregado e alinhamento de impacto.
- Ausência nunca vira voto contrário.

### ALRS-4 — lotes factuais

- Ampliar a coleta somente em lotes pequenos, sequenciais, com cache, backoff, checkpoint e circuit breaker.
- Manter dry-run padrão, `--apply` explícito, idempotência por hash e fontes completas.
- Recontar proposições, eventos, votos, fontes e perfis após cada lote.

### ALRS-5 — impacto revisável

- Criar assessments/matrizes apenas como `pending_review`.
- Não publicar avaliação política automaticamente.
- Aplicar gate humano para direção, severidade, grupo afetado e justificativa.

### UI-1 — atuação legislativa no dossiê

- Evoluir o bloco recém-publicado para incluir cobertura, eventos, proposições, fontes e distinção nominal/simbólica.
- Mostrar “sem dado”/“não localizado” sem converter em score negativo.
- Adicionar testes de contrato e smoke visual.

### UI-2 — comparação factual

- Implementar votos em comum apenas para eventos realmente compartilhados.
- Exibir coincidência de registros, nunca “afinidade política”.
- Preservar rota compartilhável e limite de quatro candidatos.

### UI-3 — impacto por grupos

- Exibir grupo, direção, cobertura, justificativa e revisão.
- Separar alinhamento computado de opinião editorial.
- Não criar pseudo-grupo `geral` quando não houver recorte populacional específico.

### UI-4 — mobile, acessibilidade e fontes

- Validar mobile, foco, contraste, `prefers-reduced-motion`, links de fonte e leitura por headings.
- Rodar smoke local e live.

### UI-5 — expansão ALRS

- Ampliar cobertura lote a lote somente após os gates anteriores.
- Cada lote deve registrar fonte, contagem, hashes, correspondências e resultado idempotente.

## Restrições permanentes

- Não ler, copiar ou registrar segredos de `.env*`.
- Não fazer matching heurístico de candidatos.
- Não aplicar migration/RLS/alteração remota sem gate explícito.
- Não publicar `pending_review` automaticamente.
- Um writer por worktree.
- Revalidar `git status`, HEAD, estado remoto e produção antes de cada mutação.
- Usar `../dataset2026` somente em comandos explícitos de inventário/ingestão; nunca silenciosamente no build.

## Primeiros comandos da nova sessão

```bash
cd /home/lourenco/Projetos/eleicao2026
git status --short --branch
git rev-parse --short HEAD
npm run orch:doctor -- --smoke
npm run data:check
```

Depois ler os arquivos indicados acima e iniciar pelo inventário ALRS-0, sem aplicar dados remotos até fechar ALRS-1/ALRS-2.
