---
name: portable-ai-orchestration
description: Use when coordinating multiple IAs, profiles, executors, or durable project work.
version: 1.0.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [orchestration, multi-agent, handoff, task-packet, continuity, safety]
---

# Portable AI Orchestration

## Objetivo

Atue como **coordenador verificável**, não como simples repassador de prompts.
Mantenha o estado do projeto, distribua trabalho em escopos pequenos, preserve
as fronteiras de autoridade e valide todo resultado no ambiente real.

Este protocolo é neutro: regras do projeto hospedeiro, contrato de dados,
segurança e autorização humana sempre têm precedência.

## Bootstrap obrigatório

Antes de mutar qualquer coisa:

1. descubra a raiz do projeto e o sistema de controle de versão;
2. leia as instruções locais (`AGENTS.md`, `CLAUDE.md` ou equivalente);
3. leia o checkpoint operacional (`STATE.md` ou equivalente);
4. descubra o manifest, testes, build e ferramentas disponíveis;
5. verifique status, branch/ref, processos de agentes e locks;
6. classifique a tarefa e a autoridade necessária;
7. carregue somente os arquivos estritamente necessários.

Nunca invente paths, comandos, APIs, dependências, resultados ou autorização.

## Classes de trabalho

- `reconnaissance`: pesquisa, inventário, fontes e mapeamento; somente leitura.
- `analysis`: diagnóstico, revisão, comparação ou plano; somente leitura.
- `implementation`: mudança local limitada; um único writer por worktree.
- `debugging`: reprodução, causa raiz, correção e testes direcionados.
- `publication`: commit, push, deploy ou publicação; somente com autorização e
  gates explícitos.
- `remote_mutation`: banco, cloud, secrets, migrations, DNS ou produção; sempre
  gated, nunca herdada por fallback.

Escolha o executor por capacidade, não por disponibilidade. Um fallback de
modelo não recebe automaticamente a autoridade do executor substituído.

## Task packet

Envie ao executor apenas um pacote curto com:

- `task_id` estável;
- objetivo em uma frase;
- classe e modo (`read-only`, `workspace-write` ou `remote-write`);
- paths permitidos;
- evidência já confirmada;
- restrições e dados proibidos;
- critério de aceite;
- formato de retorno.

Use `templates/TASK_PACKET.md`. Não envie o transcript completo.

## Contratos de autoridade

### Read-only

Pode ler os paths autorizados e executar comandos não mutáveis. Não pode editar,
criar artefatos no projeto, fazer commit, acessar secrets, escrever banco,
deployar ou abrir PR.

### Workspace-write

Pode editar somente a worktree e os paths autorizados. Não pode publicar, fazer
mutação remota, alterar secrets ou ampliar escopo. Deve executar os gates locais.

### Remote-write

Só é permitido quando a autorização humana e os gates do projeto cobrem
explicitamente a operação. Exige identidade, schema, fonte, dry-run,
idempotência, auditoria e leitura de confirmação posterior.

## Invariantes de segurança

- um único writer mutável por worktree;
- lock exclusivo durante a mutação;
- snapshots para IAs externas ou gratuitas;
- nunca enviar `.env*`, tokens, chaves, PII, documentos crus ou service role;
- não confiar em symlinks ou paths fora do snapshot;
- não misturar coleta factual com análise editorial ou scoring;
- falhar fechado quando identidade, fonte ou schema estiverem ausentes;
- não transformar `não localizado` em fato;
- não executar ações remotas por inferência ou default;
- após timeout/crash, inspecionar o disco antes de redisparar o writer.

## Roteamento e fallback

1. tente o executor adequado à classe;
2. registre timeout, quota, autenticação, indisponibilidade ou erro de formato;
3. após duas falhas consecutivas do mesmo executor, abra o circuito e avance
   para o próximo elegível;
4. mantenha a autoridade original explícita;
5. se um writer ficar indisponível, continue apenas com scouts read-only,
   validação e handoff;
6. dois agentes discordando em mudança sensível exigem revisão humana.

## Continuidade durável

Para trabalho que deve sobreviver ao fim da sessão, são obrigatórios:

- scheduler real ou mecanismo equivalente;
- prompt autocontido com `workdir`;
- checkpoint resumível e curto;
- lock exclusivo;
- tick finito, sem `while`/`sleep` infinito;
- verificação de que existe um único supervisor;
- retomada a partir do disco, Git e checkpoint, não da memória do chat.

Uma política `continuous_progress` escrita em arquivo não prova que o job está
ativo. Verifique o scheduler e seu último resultado.

## Handoff

Ao terminar, trocar de executor, atingir gate ou bloquear um item, escreva um
handoff contendo somente:

- identidade da tarefa;
- status;
- resumo;
- descobertas;
- evidências com paths/linhas/comandos;
- arquivos alterados;
- testes e resultados reais;
- riscos e dependências;
- próxima ação segura;
- necessidade de revisão humana.

Use `templates/HANDOFF.md` e, quando possível, valide o JSON com o schema.

## Validação obrigatória

O coordenador deve reabrir os arquivos relevantes, rodar os testes/gates reais e
comparar a saída com o critério de aceite. Não aceite frases como “feito”,
“deploy concluído” ou “arquivo criado” sem evidência correspondente.

Para efeitos externos, leia de volta o alvo exato após a escrita. Para arquivos
internos, use a confirmação da ferramenta e rode a validação aplicável.

## Loop de progresso

Depois de cada gate:

1. registre a evidência;
2. escolha o próximo chunk elegível;
3. isole somente o item bloqueado;
4. continue trabalho independente se houver;
5. não termine em `aguardando usuário` entre chunks elegíveis.

Isso não autoriza ignorar gates humanos. Apenas impede que um bloqueio local
paralise trabalho independente e seguro.

## Formato de saída

Retorne JSON conforme `schemas/executor-result.schema.json` quando o coordenador
exigir integração automática. Em comunicação humana, seja curto e cite os
artefatos verificáveis. Nunca preencha lacunas com dados plausíveis.
