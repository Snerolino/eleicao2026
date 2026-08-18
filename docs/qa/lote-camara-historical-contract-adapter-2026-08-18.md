# QA — adaptador de contrato Câmara histórico — 2026-08-18

## Objetivo
Separar o envelope factual histórico da Câmara do contrato do planner, derivando
campos obrigatórios somente dos artefatos oficiais versionados e mantendo
identidades/FKs remotas fail-closed.

## Entrega verificada

- `scripts/adapt-camara-historical-contract.mjs`:
  - deriva `number`/`year` de títulos oficiais;
  - deriva `text_hash` dos hashes SHA-256 do manifesto versionado;
  - valida HTTP, bytes, hash e cobertura das 7 fontes oficiais;
  - converte `tse_candidate_id` para referências lógicas `tse-candidate-*`;
  - rejeita candidato ausente ou `candidate_id` divergente do catálogo;
  - não fabrica UUID de `source_references` e mantém esses IDs como não resolvidos;
  - normaliza `obstrucao` com `absence_type=obstrucao_coordenada`.
- `scripts/__tests__/adapt-camara-historical-contract.test.mjs`: 5 testes de
  contrato, determinismo, fontes e falhas fechadas.

## Evidência

- Adaptador: `2 proposições, 6 versões, 6 eventos, 84 votos, 18 candidatos,
  7 fontes oficiais, 8 registros bloqueados`.
- Teste focado: `npm run test -- scripts/__tests__/adapt-camara-historical-contract.test.mjs --run` → 5/5 verde.
- Dry-run do planner sobre envelope adaptado → 0 erros, com 2 proposições,
  6 versões, 6 eventos e 84 votos planejados.
- Nenhuma chamada remota, SQL, Supabase, Cloudflare, FK ou `source_reference`
  foi escrita.

## Estado e bloqueios

O envelope adaptado está pronto para a próxima validação de catálogo remoto, mas
as 7 referências `source_references` continuam sem UUID remoto versionado. Não é
permitido aplicar SQL até resolver essas referências por catálogo/hash e repetir
o gate de identidade/schema remoto. Os 8 registros não elegíveis permanecem fora.

## Próximo passo

Executar auditoria read-only do catálogo remoto de `source_references` para as 7
URLs/hashes; somente se todas resolverem exatamente, preparar envelope de aplicação
idempotente. Não executar `--apply` neste chunk.
