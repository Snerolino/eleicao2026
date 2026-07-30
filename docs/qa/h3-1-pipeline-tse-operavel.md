# H3.1 — Separar ingestão, staging e snapshot público

Data: 2026-07-30
Guia: Fase 3 — H3.1

## Implementado neste bloco

- Criado contrato reutilizável do pipeline TSE em `scripts/tse-ingest-contract.mjs`:
  - manifesto de fonte com `dataset_key`, `uf`, `scope`, `source_kind`, `source_path`, `official_url`, `sha256`, `row_count`, `created_at`;
  - guarda explícita para escrita remota: dry-run nunca autoriza write;
  - verificação de allowlist pública contra campos/valores sensíveis.
- `npm run data:refresh` agora gera também `data/tse-source-manifest.json`.
- `npm run data:check` valida:
  - snapshot público existente e não vazio;
  - ausência de campos/valores sensíveis no snapshot público;
  - manifesto TSE presente, com URL oficial HTTPS, hash SHA-256, escopo e contagem.
- `scripts/tse-ingest-pipeline.mjs` agora inclui manifesto de fonte no relatório de diff do dry-run.
- Dry-run RS validado com diff idempotente:
  - staging: 69;
  - produção: 69;
  - novos: 0;
  - atualizados: 0;
  - inalterados: 69;
  - nenhum write no banco.

## Arquivos tocados

- `scripts/tse-ingest-contract.mjs`
- `scripts/__tests__/tse-ingest-contract.test.mjs`
- `scripts/refresh-public-snapshot.mjs`
- `scripts/data-check.mjs`
- `scripts/tse-ingest-pipeline.mjs`
- `data/tse-source-manifest.json`

## Segurança

- ZIP/CSV bruto continuam fora do frontend e fora de `dist`.
- Snapshot público segue por allowlist; dados sensíveis como CPF, e-mail, título eleitoral, nascimento e `raw_content` são negados por contrato.
- Frontend não consulta staging/RPC administrativa.
- Staging remoto segue contido por H0.2; mudança física para schema privado remoto deve ser tratada como operação/migration sensível separada, porque altera caminho de escrita do pipeline autorizado.

## Validações

- RED observado:
  - `scripts/__tests__/tse-ingest-contract.test.mjs` falhou por módulo inexistente antes da implementação.
- `npm run data:refresh` — OK, 69 candidaturas e manifesto TSE gerado.
- `npm run data:check` — OK, 69 candidaturas e 1 fonte TSE.
- `node scripts/tse-ingest-pipeline.mjs --uf=RS --dry-run` — OK, sem escrita remota.

## Próximo bloco seguro

H3.2 — Corrigir semântica de upsert e retirada.

Antes de aplicar qualquer import remoto, revisar diff, confirmar cobertura completa da UF/cargo e pedir autorização explícita.
