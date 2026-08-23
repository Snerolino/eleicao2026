# QA — P2-2 bloqueado por fonte oficial

**Data:** 2026-08-23

O scout verificou os cinco IDs do snapshot atual. O campo `snapshot_sha256`
representa o hash canônico do array `items`; o SHA do arquivo JSON inteiro é
diferente e não deve ser comparado ao campo sem essa distinção.

Mesmo corrigindo a interpretação do hash, os cinco itens permanecem sem fonte
substantiva oficial confirmada no lote atual:

```text
0 PDFs promovidos
0 assessments
0 matriz
0 escrita remota
```

Uma proposição semelhante encontrada para o item de símbolos tinha SEI e
identidade diferentes e foi rejeitada por fail-closed.
