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

## Próximo passo

Manter a fila de reconhecimento ALRS em background e avançar a lane independente de Câmara/Senado/local. Só criar plano de aplicação após identidade oficial, fonte HTML exata, hash/bytes, FK remota, dry-run e segunda execução idempotente.
