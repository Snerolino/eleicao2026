# QA — revalidação parser nominal Câmara (FED-26)

- **Data:** 2026-08-18
- **Objetivo:** refazer os quatro GETs oficiais históricos pendentes com o parser HTML validado, preservando evidência de transporte e sem aplicar votos/identidades.

## Evidência oficial

- `9002` (PEC 6/2019): HTTP 200, 79.457 bytes, SHA-256 `1e7e76c9da6680c1eb9f044dfbb2b5fec057a29dc05d5282a55c2be51938ad5c`; Henrique Fontana/RS = `Não`.
- `9003` (PEC 6/2019): HTTP 200, 58.685 bytes, SHA-256 `de2075a3559e0f5cdd828a5e999959b4fb9d7677515ba22e3106fd9cf9d0b287`; Henrique Fontana/RS = `Obstrução`.
- `9224` (PL 3723/2019): HTTP 200, 58.008 bytes, SHA-256 `5ce82d869a34547149d742d9e136f20151e2e10b7b2277b8b29b9ca4d2f5ad50`; Henrique Fontana/RS = `Obstrução`.
- `9227` (PL 3723/2019): HTTP 200, 70.141 bytes, SHA-256 `b87af47156369cfb359c33993441d33dcbf433f019ac2c831b2d8405b400118e`; Henrique Fontana/RS = `Não`.

Os hashes/bytes coincidem com o catálogo oficial versionado e os votos/data/proposição coincidem com o dry-run nominal anterior. Artefato completo (não versionado): `.orchestrator/runtime/camara-historical-scout/parser-revalidation-2026-08-18.json`.

## Decisão fail-closed

- A linha parlamentar exata foi extraída nos quatro eventos, mas nenhum voto foi aplicado.
- O remoto ainda classifica os quatro registros como `position=outro`; não se promove cargo histórico por legislatura isolada.
- Nenhum UUID, FK, `source_reference`, matriz, RPC ou escrita Supabase/Cloudflare ocorreu.

## Próximo passo

Resolver a identidade/cargo histórico oficial com evidência conjunta e consultar a FK remota por `tse_candidate_id`; somente então preparar envelope factual idempotente. Manter qualquer caso sem cargo/UF/proposição/data/voto exatos fora do writer.
