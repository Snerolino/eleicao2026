# QA — revalidação de fontes nominais históricas Câmara (FED-26)

- **Data:** 2026-08-18
- **Objetivo:** refazer, somente leitura, as fontes oficiais dos quatro eventos nominais associados a Henrique Fontana, sem promover `position=outro` nem escrever no remoto.

## Evidência verificada

- API oficial Câmara: `GET /deputados/73482/historico` respondeu HTTP 200, 7.634 bytes, SHA-256 `e08beccf1b578c5929143268a8d4da814668447c3a55fb1066dad69514d574fb`, 14 itens e legislaturas 51–56.
- Perfil oficial: `GET /deputados/73482` respondeu HTTP 200, 927 bytes, SHA-256 `4cd0dfc2d3f6234919c088baf22316f02b0ac63cb6b976a95b786202e9c4f654`.
- Legislatura oficial: `GET /legislaturas/56` respondeu HTTP 200, 226 bytes, SHA-256 `e2df6500daab1e958f992cb609b669f0dc7c8ce024c05099242b99549722b1a6`.
- As quatro URLs nominais legadas responderam HTTP 200 e repetiram exatamente os hashes/bytes já catalogados:
  - `9002`: 79.457 bytes, `1e7e76c9da6680c1eb9f044dfbb2b5fec057a29dc05d5282a55c2be51938ad5c`;
  - `9003`: 58.685 bytes, `de2075a3559e0f5cdd828a5e999959b4fb9d7677515ba22e3106fd9cf9d0b287`;
  - `9224`: 58.008 bytes, `5ce82d869a34547149d742d9e136f20151e2e10b7b2277b8b29b9ca4d2f5ad50`;
  - `9227`: 70.141 bytes, `b87af47156369cfb359c33993441d33dcbf433f019ac2c831b2d8405b400118e`.

## Decisão fail-closed

- O artefato `data/legislative-import/camara/historical-event-reconciliation.json` preserva HTTP, bytes e SHA-256 dos sete GETs.
- Esta coleta não criou votos, identidades, UUIDs, FKs, `source_references` nem alterou Supabase/Cloudflare.
- O parser leve desta coleta não extraiu linhas HTML (`fontana_rows=[]`); portanto **não** é usado como prova adicional de voto. A prova factual anterior continua limitada ao catálogo/manifesto oficial e à reconciliação já registrada.
- Os quatro casos `position=outro` continuam bloqueados até extração estruturada reproduzível da linha parlamentar e validação conjunta de proposição, data, UF, voto e identidade.

## Bloqueio e próximo chunk

- `FED26_CAMARA_HISTORICAL_HTML_ROW_EXTRACTION_PENDING`: hashes e disponibilidade estão confirmados; falta parser robusto da tabela HTML para produzir um envelope de reconciliação verificável.
- Próximo chunk: implementar/testar parser HTML offline contra fixture sanitizada derivada do formato oficial, depois refazer os quatro GETs. Nenhum apply remoto antes de o parser passar contrato e de a identidade/cargo permanecerem exatos.
