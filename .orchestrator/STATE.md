# STATE — eleicao2026

Atualizado: 2026-08-10
Status: `STANDBY_READY_FOR_ORCHESTRATOR_V1`

> Este é um checkpoint, não uma fonte eterna. Ao retomar, Hermes deve conferir
> Git, ambiente e serviços antes de confiar em SHAs, contagens ou disponibilidade.

## Git

- Repositório: `Snerolino/eleicao2026`.
- Produção permanece na `main`.
- `main` no início desta migração: `a252fb0f77f58694a1133a24f5c136985025a7ad`.
- Feature em stand-by: `feat/matriz-impacto-populacional-v1`.
- Checkpoint herdado da feature: `565116619de6c36cde99c3d159e8540f18530386`.
- A feature estava 5 commits à frente e 0 atrás de `main` no início desta migração.
- Branch da arquitetura: `chore/hermes-orchestrator-v1`, criada a partir de `5651166`.

## Aplicação

- Produção declarada verde com 792 candidaturas públicas e fotos TSE.
- Stack preservada: React + Vite + TypeScript + Tailwind + Supabase + Cloudflare Pages + PWA.
- GitHub Actions é o caminho normal de deploy após merge autorizado em `main`.

## Matriz de Impacto Populacional v1

- Fase 0 concluída: contrato, metodologia, governança, schemas e fixtures.
- Fase 1 concluída: domínio, testes e 5 migrations locais.
- Checkpoint validado antes do stand-by: 222 testes, TypeScript limpo, build OK e RPC de aprovação validada localmente.
- As migrations `20260810090000` a `20260810090400` NÃO estavam aplicadas no Supabase remoto no início desta migração de arquitetura.

## Supabase remoto

- Projeto: `eleicao2026` (`hhqxhxcfkoijevxyzfky`), região `sa-east-1`.
- Estado observado em 2026-08-10: `ACTIVE_HEALTHY`.
- `public.candidates`: 793 linhas no banco remoto; superfície pública versionada: 792.
- Nenhuma Edge Function ativa observada.
- Débitos separados da migração de agentes: advisors indicam funções com `search_path` mutável, RPCs `SECURITY DEFINER` executáveis por `authenticated`, além de alertas de performance/RLS. Não corrigir por carona; abrir trabalho próprio.

## Cloudflare

- Produção: `https://rs.votopraquem.org`.
- Projeto Pages versionado no workflow: `portal-transparencia-rs`.
- Deploy normal: GitHub Actions `deploy.yml`, somente push em `main`, usando secret `CLOUDFLARE_API_TOKEN` no GitHub.
- Não copiar esse token para Hermes ou para executores apenas para permitir rotina de desenvolvimento.

## Executores já validados antes desta migração

- Codex CLI `0.147.0`, auth ChatGPT Plus, sem `OPENAI_API_KEY` para a rota Codex.
- Codex `gpt-5.6-luna/terra/sol` disponíveis; `codex exec` estruturado validado.
- OpenCode `1.18.15`; `opencode/deepseek-v4-flash-free` já respondeu em testes anteriores.
- Gemini CLI autenticado localmente e utilizável, porém foi lento como agente de edição. Nesta arquitetura passa a ser executor consultivo/read-only.

## Próximo trabalho funcional após concluir a arquitetura

1. Validar todos os executores com `npm run orch:doctor -- --smoke`.
2. Retomar a Fase 2 da Matriz de Impacto: importador dry-run de proposições/votos e desenho da persistência de score.
3. Tratar separadamente os dois bugs encontrados pelo Codex em `src/services/candidates.ts` e `src/pages/AdminPage.tsx`.
4. Somente depois de revisão humana, decidir aplicação remota das migrations de impacto.

## Gates permanentes

- Apenas um writer por worktree.
- Modelos gratuitos: somente repositório público/sanitizado, nunca secrets/PII/raw documents.
- Nenhum agente faz merge em `main`, deploy de produção, migration remota, mudança de RLS/RPC, rotação de secret ou mutação Cloudflare/Supabase sem autorização humana explícita.
- Se o executor mutável perder quota, interromper escrita e produzir handoff read-only; não continuar a mutação automaticamente num modelo gratuito.
