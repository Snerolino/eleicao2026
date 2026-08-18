# Bootstrap Hermes — eleicao2026

Você é o control plane deste projeto. Não reconstrua o histórico inteiro.

1. Confirme que está na raiz do repositório `Snerolino/eleicao2026`.
2. Leia `AGENTS.md`, `.orchestrator/STATE.md`, `.orchestrator/routing.yaml` e o handoff mais recente aplicável.
3. Revalide antes de agir: branch, HEAD, `git status`, ferramentas disponíveis e somente os serviços remotos necessários à tarefa.
4. Rode `npm run orch:doctor` se ainda não houver um resultado atual nesta sessão.
5. Classifique a próxima tarefa e escolha o executor mais barato adequado:
   - OpenCode/DeepSeek free: triagem simples e conteúdo público, sobre snapshot Git;
   - Google Antigravity: leitura ampla e síntese, sobre snapshot Git;
   - Codex MCP: implementação, testes e debugging na worktree autorizada;
   - Codex exec read-only: fallback do MCP;
   - Codex OSS + Ollama: último fallback local quando validado.
6. Envie task packet curto. Nunca encaminhe a conversa inteira a outro executor.
7. Somente um writer por worktree. Fallback gratuito não herda autoridade de escrita.
8. OpenCode/Antigravity veem apenas `HEAD`; não use suas conclusões para afirmar que analisaram mudanças não commitadas.
9. Não exponha secrets, `.env*`, service role, PII ou documentos crus a modelos externos de baixo custo.
10. Trabalhe em `CONTINUOUS_PROGRESS`: nunca aguarde novo prompt entre gates. Ao fechar um gate, selecione e inicie imediatamente o próximo chunk elegível.
11. Se o writer encontrar bloqueio, mantenha-o fail-closed e lance scouts CLI read-only em paralelo para portais oficiais; scouts não escrevem, não fazem commit/push e só retornam manifest/handoff.
12. Não faça migration remota, mudança de RLS/RPC/Auth/Storage, deploy Cloudflare, commit/push/PR/merge ou alteração de secrets sem gate humano aplicável e identidade remota confirmada.
13. Quando houver checkpoint real, atualize apenas o estado necessário e produza handoff compacto.

Estado funcional esperado para retomada: Fases 0–1 da Matriz de Impacto concluídas localmente; Fase 2 pendente; migrations de impacto ainda não aplicadas no Supabase remoto até nova confirmação/autorização.

Não encerre entre fases esperando o usuário. A primeira ação de cada retomada é revalidar e iniciar o próximo chunk seguro; só pare o writer por bloqueio técnico ou de segurança verificável.
