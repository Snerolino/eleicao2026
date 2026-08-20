# Contratos mínimos — Task Packet e Handoff do Hermes

Data: 2026-08-20
Status: template operacional proposto; validar contra os schemas já versionados antes de substituir qualquer contrato existente.

## 1. Task Packet

Cada delegação deve ser pequena, independente e verificável.

```yaml
task_id: "prep-001"
title: "Inventariar importer legislativo existente"
objective: "Mapear contratos, scripts, testes e lacunas sem alterar arquivos"
mode: "read_only"
authority: "consultative"
executor_class: "context_large | cheap_triage | technical"
repository:
  branch: "<branch-confirmada>"
  head_sha: "<sha-confirmado>"
inputs:
  paths:
    - "src/domain/impact/"
    - "scripts/import-legislative-dry-run.mjs"
  evidence_required:
    - "arquivo e símbolo"
    - "teste ou comando read-only"
constraints:
  - "não editar"
  - "não acessar secrets"
  - "não usar Supabase remoto"
  - "não publicar"
  - "não criar fatos por inferência"
acceptance:
  - "lista de componentes existentes"
  - "lacunas separadas de bugs"
  - "nenhuma modificação na worktree"
output_schema: "executor-result.schema.json"
timeout_seconds: 600
```

## 2. Resultado do executor

O Hermes deve rejeitar respostas que não distingam fatos, inferências e bloqueios.

```json
{
  "task_id": "prep-001",
  "status": "completed|blocked|failed",
  "authority_used": "consultative",
  "summary": "string curta",
  "confirmed_findings": [
    {
      "claim": "string",
      "evidence": ["path:linha/símbolo ou comando"]
    }
  ],
  "inferences": [
    {
      "claim": "string",
      "basis": "string",
      "confidence": "low|medium|high"
    }
  ],
  "gaps": ["string"],
  "risks": ["string"],
  "files_changed": [],
  "tests_or_checks": [
    {"command": "string", "result": "pass|fail|not_run"}
  ],
  "requires_human_gate": false,
  "recommended_next_action": "string"
}
```

## 3. Handoff compacto

O handoff deve permitir retomada sem carregar uma conversa inteira.

```yaml
handoff_version: 1
project: "eleicao2026"
created_at: "<ISO8601>"
branch: "<branch>"
head_sha: "<sha>"
working_tree_state: "clean|dirty"
objective: "<objetivo atual>"
completed:
  - "<resultado verificável>"
confirmed_state:
  - fact: "<fato>"
    evidence: "<arquivo/comando>"
pending:
  - "<trabalho ainda não feito>"
blocked:
  - item: "<bloqueio>"
    gate: "<decisão ou autoridade necessária>"
files_changed:
  - path: "<path>"
    purpose: "<motivo>"
checks:
  - command: "<comando>"
    result: "<resultado>"
risks:
  - "<risco>"
next_safe_action: "<uma ação concreta>"
do_not_repeat:
  - "<checagem já concluída no mesmo SHA>"
```

## 4. Regras para divisão de tarefas

Um task packet deve cobrir apenas uma destas classes:

- inventário de código/contrato;
- resolução de identidade;
- mapeamento de uma fonte oficial;
- coleta de um lote factual;
- validação de schema/idempotência;
- criação de matriz para uma versão;
- relatório de cobertura;
- implementação local controlada.

Não combinar no mesmo packet:

- pesquisa factual e publicação;
- coleta legislativa e dossiê judicial;
- construção de matriz e aprovação editorial;
- mudança de código e deploy;
- leitura consultiva e escrita remota.

## 5. Identidade e deduplicação

Toda tarefa factual deve carregar as chaves naturais disponíveis:

```yaml
candidate_key: "SQ_CANDIDATO"
legislator_key: "identificador oficial da casa"
house: "camara_federal|senado|alrs|camara_municipal"
legislature: "string controlada"
proposition_external_id: "identificador oficial"
version_key: "versão efetivamente votada"
voting_event_external_id: "identificador oficial do evento"
methodology_version: "semver quando aplicável"
```

Se a relação entre candidato e parlamentar não puder ser confirmada por catálogo ou fonte oficial, o job termina como `blocked`, nunca com match heurístico silencioso.

## 6. Pacote inicial recomendado

Para a preparação da esteira, o Hermes deve emitir sequencialmente:

1. `prep-001`: inventário do código/schema atual;
2. `prep-002`: auditoria de divergências documentais;
3. `prep-003`: catálogo e estratégia de resolução de identidades;
4. `prep-004`: contrato da fila local e recovery;
5. `prep-005`: desenho da prova de conceito;
6. `prep-006`: revisão cruzada e relatório consolidado.

Paralelismo só é permitido quando os packets não dependem uns dos outros e não disputam escrita. Durante a preparação, prefira evidência e consistência a volume.
