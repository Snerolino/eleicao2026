# Lote continuous ops — recon bounded e gates locais

- **Data/hora UTC:** 2026-08-21T05:40:28Z
- **Objetivo:** executar o tick bounded das lanes oficiais ALRS/Câmara, manter Senado fail-closed, sincronizar somente evidência oficial local e verificar o app sem aplicação factual remota.

## Entregue e verificado

- ALRS FED-17: `scripts/repair-alrs-fed17-residual.mjs` em dry-run; `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- ALRS fontes de mérito: 7/7 URLs oficiais HTTP 200, 7/7 válidas, 0 falhas. Manifesto atualizado apenas no timestamp (`data/legislative-import/alrs/impact-merit-source-manifest.json`); nenhum voto foi aplicado.
- Câmara: API oficial `dadosabertos.camara.leg.br/api/v2/votacoes`, janela 2026-10-01 a 2026-12-31, resposta válida, 0 `vote_ids`, sem inferência.
- Auditoria de cobertura read-only: ALRS 4 votos sem fonte; Câmara 2; Senado 455. Também persistem gaps de versões/eventos: ALRS 1251/1647, Câmara 3/2, Senado 112/188.
- Snapshot público: `data:check` verde com 1003 candidaturas e 988 fotos oficiais.

## Gates locais (Node 24.19.0)

- `npm run test`: **0**, 97 arquivos, 398 testes passados.
- `npx tsc --noEmit`: **0**.
- `node scripts/validate-impact-schema.mjs`: **0**.
- `npm run data:check`: **0**, 1003 candidaturas / 988 fotos.
- `npm run build`: **0**, sitemap com 1003 candidatos + 2 estáticas; `release.json` gerado para o HEAD `82141728b1568805ec468f155a9409d56d5ba6ab`.
- `git diff --check`: **0**.
- `npm run smoke:local`: **0**, 1002 cards (mínimo 1002), 0 falhas HTTP, 0 erros de console online, service worker pronto.

## Bloqueios reais

- Quatro votos ALRS FED-17 continuam sem ID/fonte exata individualizável; dry-run não encontrou correção segura.
- Senado permanece fail-closed enquanto os PDFs atuais divergirem do manifesto por SHA/bytes.
- Câmara não apresentou lote novo na janela consultada.
- Auditoria estrita de fontes continua com gaps reais; nenhuma fonte, UUID, identidade, voto, FK ou hash foi inventado.
- `orch:doctor` do shell continua limitado pelo Node 22.22.2, enquanto os gates foram executados explicitamente com Node 24.19.0; WARNs anteriores de executores opcionais permanecem não bloqueantes.

## Estado remoto

- Nenhuma escrita factual em Supabase, identidade, FK, voto, matriz, claim ou source reference.
- Commit `1985a833c06f4320d8266c8f1855cc44310ba3b4` publicado em `origin/main`.
- Workflow backup `334951434`, run `32451471195`: `completed/success`, `headSha` idêntico ao commit.
- Produção `https://rs.votopraquem.org/?cb=1985a83`: HTTP 200. `release.json` confirmou SHA `1985a833c06f4320d8266c8f1855cc44310ba3b4`, release `1985a83-20260821T054145857Z` e snapshot `row_count=1003`.

## Próximo passo

Repetir recon bounded oficial e manter a lane local independente; qualquer aplicação remota continua condicionada a R0, schema/FK, fonte oficial exata, dry-run validado e prova de idempotência.
