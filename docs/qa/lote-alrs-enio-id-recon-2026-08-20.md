# QA — reconhecimento oficial ALRS: Enio Carlos Terra

**Data:** 2026-08-20
**Modo:** reconhecimento read-only, fail-closed
**Objetivo:** procurar exclusivamente ID oficial ALRS e fonte exata para os quatro votos residuais de Enio Carlos Terra (`210002534312`).

## Evidência oficial consultada

- URL: `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`
- HTTP: `200`
- Resposta: HTML server-side, `77442` bytes
- O HTML contém `55` opções de parlamentares.
- Busca exata, sem fuzzy matching, não encontrou `Enio Carlos Terra` nem `Terra` na lista atual.
- O JavaScript oficial da página confirma que a lista usa `idDeputado` e `nomeDeputado`; a resposta requisitada pelo script continua HTML neste acesso, não foi tratada como JSON.

## Resultado verificado

Nenhum ID ALRS oficial verificável foi localizado neste tick. Não foram inventados ID, identidade histórica, URL de pesquisa, hash, voto ou FK. Nenhum registro remoto foi alterado.

Os quatro residuais permanecem:

- `alrs_pl134_2023`
- `alrs_pl165_2025`
- `alrs_pl361_2025`
- `alrs_pl77_2025`

## Auditoria atual

- `npm run impact:sources:audit`: exit `0` (read-only; cobertura ampla possui gaps)
- `node scripts/audit-legislative-source-coverage.mjs --strict`: exit `2`, por lacunas reais
- Votos ALRS: `3996/4000` com fonte; `4` sem fonte
- Nenhuma escrita factual, migration, RLS, RPC ou alteração editorial

## Bloqueio real

A página oficial atual não expõe Enio Carlos Terra no catálogo de 55 parlamentares. Sem rota histórica oficial ou ID oficial exato, o backfill continua bloqueado por identidade/fonte e permanece fail-closed.

## Publicação/verificação

- Gates locais em Node 24.19.0: `npm run test` — 82 arquivos/372 testes, exit 0; `npx tsc --noEmit` exit 0; `validate-impact-schema` exit 0; `data:check` 1003 candidaturas/988 fotos exit 0; `npm run build` exit 0; `git diff --check` exit 0.
- Commit publicado: `712a5286d4131368e85f2b86c34ef46568f94dd5`, `main -> origin/main`.
- Backup Cloudflare `334951434`, run `32371311304`: `completed/success`, `headSha` igual ao commit.
- Preview do run: `https://247c14ff.portal-transparencia-rs.pages.dev`.
- Produção: raiz HTTP 200; `/release.json` HTTP 200. Sem cache-bust, a primeira leitura ainda serviu release anterior; com `?cb=712a528`, release retornou SHA `712a5286d4131368e85f2b86c34ef46568f94dd5` e `row_count=1003`, evidenciando propagação/cache do domínio.
- Smoke remoto exit 0: 1002 cards, mínimo 1002, 0 falhas HTTP e 0 erros de console online.

## Próximo passo

Manter a fila de reconhecimento ALRS em background e avançar a lane independente de Câmara/Senado/local. Só criar plano de aplicação após identidade oficial, fonte HTML exata, hash/bytes, FK remota, dry-run e segunda execução idempotente.
