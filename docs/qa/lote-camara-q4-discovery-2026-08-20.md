# QA — Reconhecimento Câmara Q4/2026

- **Data:** 2026-08-20
- **Objetivo:** verificar, somente leitura, se a API oficial da Câmara possui novas votações na janela `2026-10-01` a `2026-12-31`, após o encerramento do lote bounded Q3 de 300 IDs.

## Entrega verificada

- Endpoint consultado exclusivamente: `https://dadosabertos.camara.leg.br/api/v2/votacoes`.
- Janela respeitou o limite máximo de três meses da API; `max_pages=3`.
- Resultado: HTTP 200, uma página válida, zero `vote_id` retornados e nenhum bloqueio.
- Evidência transitória: `.orchestrator/runtime/camara-q4-discovery/result.json`.
- Nenhum detalhe de votação, identidade, voto, FK, envelope ou fonte foi inferido a partir da resposta vazia.
- Nenhuma escrita em Supabase, snapshot público, claims ou dados factuais remotos foi realizada.

## Estado dos dados e gates relacionados

- `npm run data:check`: verde — 1003 candidaturas e 988 fotos oficiais.
- Auditoria read-only de fontes Câmara: 7 URLs, todas HTTP 200; manifesto versionado permaneceu sem alteração.
- Auditoria estrita de cobertura: exit 2 por gaps reais já conhecidos — Câmara 2 votos sem fonte, ALRS 4 votos sem fonte e Senado 455 votos sem fonte.
- Publicação documental: commit `6d8bd886d6e0be83a25847e1fdb4c5e15b5225df` em `origin/main`; workflow backup `334951434`, run `32367645034`, `completed/success`, `headSha` idêntico.
- Produção verificada após propagação: raiz HTTP 200; `/release.json` HTTP 200 com SHA completo idêntico e snapshot `row_count=1003`; smoke remoto exit 0, 1002 cards, 0 falhas HTTP e 0 erros de console online.
- ALRS permanece fail-closed nos quatro residuais de Enio Carlos Terra; Senado permanece fail-closed pela deriva SHA-256 dos PDFs.

## Bloqueios

- Não há lote Q4 disponível na API oficial no momento da consulta; não foi criado lote factual.
- Gaps de fontes e deriva de hashes permanecem bloqueios de seus respectivos itens, sem bloquear a reconciliação local.

## Próximo passo

Manter reconhecimento oficial independente e, na próxima janela elegível, revalidar a API Câmara sem inventar eventos; em paralelo, executar os gates locais/documentais e continuar ALRS/Senado somente quando identidade, fonte, hash, dry-run e idempotência estiverem satisfeitos.
