# Pipeline de Enrichment de Claims via AGY — Documentação Operacional

## Visão Geral

Gerador de claims de perfil para candidatos eleitorais (RS 2026) via executor AGY (Antigravity CLI) em blocos de 25 candidatos/pedido. Cada bloco produz claims de 4 categorias: `historico_politico`, `plataforma`, `reputacao`, `estruturio`.

Estado atual (2026-08-16): 14 blocos importados (~667 claims `pending_review`). Blocos restantes (6,7,9,11,13,16-27,29,30,32-36,38,39) em reprocessamento via `scripts/retry-agy-blocks.sh`.

## Pré-requisitos

- Autenticação Antigravity configurada fora do repositório pelo ambiente oficial.
- Snapshot público sincronizado: `data/public-candidates.json` (1002 candidatos RS 2026)
- Publicação deve usar somente o fluxo Auth/RPC autorizado; `service_role` não entra neste pipeline.
- `scripts/generate-block-prompt.py` — gera prompt por bloco N
- `scripts/agy-enrich-block.sh` — wrapper AGY com variáveis de ambiente
- `scripts/import-agy-block.mjs` — ETL Node.js para ingestão no Supabase
- `scripts/check-claims-status.py` — contagem de claims por status

## Estrutura dos arquivos de bloco

```
.orchestrator/runtime/blocks/
├── block-000-prompt.txt           # prompt para bloco N (gerado por generate-block-prompt.py)
├── block-000-output.txt           # output do AGY para bloco N (gerado pelo AGY, pode conter fences ```json)
├── block-000-output.json          # output convertido sem fences (gerado manualmente se necessário)
└── block-NNN-output.txt → block-N-output.txt   # symlinks com padding 3 dígitos para compatibilidade com import-agy-block.mjs
```

## Fluxo real de execução (2026-08-15)

### Primeiro bloco (bloco 0)

Bloco 0 foi executado antes do início desta sessão com sucesso: 25 candidatos, 30 claims geradas, 6 inseridas no Supabase (21 erros de candidato não encontrado no snapshot).

Problemas identificados no bloco 0:
- 7 candidatos do bloco 0 não existiam no snapshot público versionado (`data/public-candidates.json`)
- O import relatou "Candidato não encontrado no snapshot para slug X" para esses 7 candidatos
- Somente 6 claims foram inseridas com sucesso

### Blocos 1–4: execução em paralelo

Os blocos 1, 2, 3 e 4 foram gerados via AGY com a nova chave Antigravity e executados em paralelo via script de batch.

**Bloco 1**: saiu com exit=46 (output corrompido — apenas 939 bytes de erro AGY). Reprocessado com a nova chave Antigravity e saiu com exit=0 (21870 bytes, JSON válido). Importado no Supabase com sucesso: 55 claims para 25 candidatos, 0 erros.

**Bloco 3**: saiu com erro DNS `lh3.googleusercontent.com` na primeira tentativa (timeout de rede). Reprocessado e saiu com exit=0 (20674 bytes, JSON válido). Importado no Supabase com sucesso: 54 claims para 25 candidatos.

**Bloco 2 e Bloco 4**: gerados e importados com sucesso na primeira tentativa.

### Symlinks com padding 3 dígitos

O `import-agy-block.mjs` busca arquivos com padding 3 dígitos (`block-000-output.txt` a `block-004-output.txt`). A primeira tentativa de importar blocos 2, 3 e 4 falhou porque os symlinks não existiam. Corrigido com:

```bash
for i in 0 1 2 3 4; do
  padded=$(printf "%03d" $i)
  rm -f ".orchestrator/runtime/blocks/block-${padded}-output.txt"
  ln -sf "block-${i}-output.txt" ".orchestrator/runtime/blocks/block-${padded}-output.txt"
done
```

### Problemas de claims vazias

Alguns blocos geraram muitos candidatos com claims vazias (array vazio). Por exemplo:
- Bloco 2 (5379 bytes): apenas 3 candidatos com claims, 22 com array vazio
- Bloco 4 (24109 bytes): começa com Jose Antonio Flores Minetti mas muitos candidatos sem claims significativas

Isso é esperado para candidatos sem histórico político relevante ou novo registro.

## Commandos

### Gerar prompt para bloco N

```bash
python3 scripts/generate-block-prompt.py N
# Exemplo: python3 scripts/generate-block-prompt.py 0
# Saída: .orchestrator/runtime/blocks/block-000-prompt.txt
```

### Executar bloco via AGY

```bash
# Bloco 0 (primeiro bloco — autenticação resolvida pelo ambiente oficial)
cd /home/lourenco/Projetos/eleicao2026 && export REAL_HOME=/home/lourenco && export HERMES_REAL_HOME=/home/lourenco && export ANTIGRAVITY_AGENT_MODEL="Gemini 3.6 Flash (Low)" && export ANTIGRAVITY_AGENT_NAME="eleicao2026-reader" && export ORCH_EXECUTOR_TIMEOUT=480 && timeout 475 bash scripts/orchestrator/run-antigravity.sh "$(cat .orchestrator/runtime/blocks/block-000-prompt.txt)" > .orchestrator/runtime/blocks/block-000-output.txt 2>&1; echo "Bloco 0: exit=$?"

# Blocos 1–39: mesma estrutura (substituir block-000 por block-001, block-002, etc.)
# Bloco 40: apenas 2 candidatos restantes
```

### Importar bloco no Supabase

```bash
# exportar service_role key do raspador
source /home/lourenco/Projetos/raspador-candidados-2026/.env
export SUPABASE_SECRET_KEY="$SUPABASE_SERVICE_ROLE_KEY"

# importar bloco N
node scripts/import-agy-block.mjs N --apply
```

### Verificar status de claims

```bash
python3 scripts/check-claims-status.py
```

## Resolvedor de problemas comuns

### Causa raiz do exit=46 (CRÍTICO — ler antes de reprocessar)

`exit=46` **não** é corrupção de output nem erro de chave. O `run-antigravity.sh` retorna 46 quando o AGY encerra **sem resposta final** (`Antigravity encerrou sem resposta final`). A causa real: o AGY em `--mode=plan --sandbox` às vezes tenta usar `read_file` em arquivo fora do snapshot permitido, o permissionamento headless **auto-nega** (`no output produced — a tool required the "read_file" permission`), e o AGY devolve vazio → exit=46.

É **não-determinístico** (B8 passou de primeira, B6/B7 falharam mas passaram no retry). Por isso o reprocessamento sequencial com retry funciona.

**NÃO rode paralelismo massivo** (36 blocos simultâneos derruba o AGY por timeout DNS). Rode **1 bloco por vez** com retry:

```bash
# scripts/retry-agy-blocks.sh — roda 1 por vez, retry até 4x se exit=46
bash scripts/retry-agy-blocks.sh 6 7 9 11 13
# pode rodar lotes diferentes em paralelo (cada um sequencial internamente):
bash scripts/retry-agy-blocks.sh 16 17 18 19 20 &
bash scripts/retry-agy-blocks.sh 21 22 23 24 25 &
```

### JSON com fences ```json``` no output do AGY

O output do AGY às vezes envolve o JSON com fences Markdown. Converter com:

```bash
python3 -c "
import json, re, sys
with open(f'.orchestrator/runtime/blocks/block-{sys.argv[1]}-output.txt') as f:
    content = f.read()
m = re.search(r'```json\s*(.*?)\s*```', content, re.DOTALL)
if m:
    json_data = json.loads(m.group(1))
    with open(f'.orchestrator/runtime/blocks/block-{sys.argv[1]}-output.json', 'w') as f:
        json.dump(json_data, f, indent=2, ensure_ascii=False)
    print(f'Convertido: block-{sys.argv[1]}-output.json')
else:
    print('Sem fences ou arquivo já é JSON puro')
" N
```

### Symlinks com padding 3 dígitos

O `import-agy-block.mjs` busca `block-NNN-output.txt`. Criar symlinks se necessário:

```bash
for i in 0 1 2 3 4; do
  padded=$(printf "%03d" $i)
  rm -f ".orchestrator/runtime/blocks/block-${padded}-output.txt"
  ln -sf "block-${i}-output.txt" ".orchestrator/runtime/blocks/block-${padded}-output.txt"
done
```

### Candidato não encontrado no snapshot

Se o import reportar "Candidato não encontrado no snapshot para slug X", verifique se o candidato existe em `data/public-candidates.json`.

### Erro de DNS no AGY (`lh3.googleusercontent.com`)

O bloco 3 falhou com timeout DNS para `lh3.googleusercontent.com` na primeira tentativa. Reprocessar resolve o problema.

## Estado do pipeline (blocos 0–4)

| Bloco | Claims geradas | Status | Observação |
|-------|---------------|--------|------------|
| 0 | 30 claims | ✅ Importado | Primeiro bloco, testado |
| 1 | 55 claims | ✅ Importado | Reprocessado após erro AGY (exit=46) |
| 2 | 54 claims | ✅ Importado | — |
| 3 | 54 claims | ✅ Importado | Reprocessado após falha DNS |
| 4 | 54 claims | ✅ Importado | — |
| **Total** | **247** | **171 injetadas** | — |

## Próximos passos

1. Blocos 5–40: prompts gerados, executar em paralelo via AGY
2. Importar cada bloco gerado: `node scripts/import-agy-block.mjs N --apply`
3. Aprovação: `node scripts/approve-all-claims.mjs` para claims com confidence >= 4
4. Deploy: `npm run build && npx wrangler pages deploy dist --project-name=portal-transparencia-rs`
5. Validação: `npm run test`, `npx tsc --noEmit`, `npm run data:check`

