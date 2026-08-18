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
12. O arco atual tem autorização global do usuário para commit, push, GitHub, Supabase e Cloudflare; execute-os automaticamente depois dos gates verdes e da identidade remota confirmada. Migrations remotas, mudanças de RLS/RPC/Auth/Storage e secrets continuam exigindo seus gates técnicos específicos.
13. Quando houver checkpoint real, atualize apenas o estado necessário, produza handoff compacto e inicie o próximo chunk elegível na mesma retomada.

Estado funcional esperado para retomada: Fases 0–1 da Matriz de Impacto concluídas localmente; Fase 2 pendente; migrations de impacto ainda não aplicadas no Supabase remoto até nova confirmação/autorização.

Não encerre entre fases esperando o usuário. A primeira ação de cada retomada é revalidar e iniciar o próximo chunk seguro; após cada gate verde, continue automaticamente. Só pare o writer do item por bloqueio técnico, factual ou de segurança verificável; o control plane deve continuar em trilhas independentes.
