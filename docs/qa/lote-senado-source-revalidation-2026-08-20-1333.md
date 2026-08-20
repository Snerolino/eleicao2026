# QA — revalidação oficial dos relatórios nominais do Senado

- **Data:** 2026-08-20T13:33:48Z
- **Objetivo:** refazer, somente leitura, os 6 GETs oficiais do manifesto `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`, sem gerar manifesto substituto e sem aplicar votos.

## Entrega verificada

- Fonte exclusiva: `https://legis.senado.leg.br/parlam-servicosweb/api/v1/relatorios/votacoes-nominais/ano/{ano}/parlamentar/{id}`.
- Resultado HTTP: **6/6 HTTP 200**.
- Prefixo PDF: **6/6** começaram com `255044462d312e35`.
- Comparação de bytes contra o manifesto: **3/6** coincidiram.
- Comparação SHA-256 contra o manifesto: **0/6** coincidiram.
- Diferenças observadas: 2025/1186 retornou 1 byte a menos; 2026/1186 retornou 3 bytes a menos; 2026/825 retornou 2 bytes a menos; os demais mantiveram o tamanho, mas todos divergiram no SHA-256.
- Resultado fail-closed: nenhum PDF foi promovido, nenhum manifesto foi alterado e nenhum voto/identidade/FK foi aplicado.

## Reconhecimento paralelo

- Portal oficial ALRS `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`: **HTTP 200**, 77.442 bytes; a resposta não continha `Enio Carlos Terra`, `Terra` nem objetos `data-item`. Os 4 residuais de Enio continuam sem ID oficial/fonte exata.
- Auditoria de fontes read-only: `npm run impact:sources:audit` exit **2** em modo estrito por gaps reais — votos com fonte: ALRS 3996/4000, Câmara 550/552, Senado 0/455.

## Gates locais

- `npm run test`: **82 arquivos, 372 testes aprovados**.
- `npx tsc --noEmit`: **exit 0**.
- `node scripts/validate-impact-schema.mjs`: **exit 0**.
- `npm run data:check`: **exit 0**, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: **exit 0**, sitemap com 1003 candidatos + 2 URLs estáticas; `release.json` gerado.
- `git diff --check`: **exit 0**.
- Doctor: **FAIL restrito ao shell Node 22.22.2**, embora os gates tenham sido executados com Node 24; OpenCode ausente e fallback Ollama sem preflight permanecem WARNs opcionais.

## Estado e bloqueios

- Senado permanece bloqueado exclusivamente pela deriva SHA-256 do conteúdo oficial contra o manifesto versionado.
- ALRS permanece bloqueado por ausência de ID oficial exato/fonte exata para os 4 residuais de Enio.
- Câmara Q3 permanece fechado; nenhum evento foi inferido a partir de resposta vazia.
- Não houve escrita Supabase, snapshot, claim ou dado factual remoto.

## Publicação e verificação

- Commit documental: `d19bedf7a35b32782539b3fdf724e82b3351118f` publicado em `origin/main`.
- Workflow backup `334951434`, run `32375095689`: `completed/success`, `headSha` idêntico ao commit.
- Preview Cloudflare `https://ac507dae.portal-transparencia-rs.pages.dev`: `/release.json` HTTP 200 e SHA `d19bedf7a35b32782539b3fdf724e82b3351118f` idêntico.
- Após novo push documental, workflow backup `334951434`, run `32375409134`: `completed/success`, `headSha` `7c8d4e6884d12aef03e6790330a9e6311d796eb9` idêntico ao `HEAD`; domínio customizado `/release.json` passou a servir o mesmo SHA, com raiz HTTP 200. A divergência transitória de propagação foi encerrada.
- Verificação posterior do workflow backup `32375603712`: `completed/success`, `headSha` `fccee8337291813f05de4bfd9c9ebe431f39ac7c`; após propagação, o domínio customizado `/release.json` HTTP 200 passou a servir esse SHA. Smoke funcional anterior permaneceu verde: 1002 cards, 0 falhas HTTP e 0 erros de console online.

## Próximo passo

Manter revalidação bounded dos seis relatórios sem atualizar o manifesto enquanto a deriva persistir; continuar a trilha independente de reconhecimento oficial e a fila de recuperação de fontes, sem bloquear os gates locais/documentais.