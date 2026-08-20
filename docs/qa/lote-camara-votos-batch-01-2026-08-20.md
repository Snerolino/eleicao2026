# QA — Câmara: coleta nominal bounded, lote 01

**Data:** 2026-08-20 05:51 UTC  
**Modo:** reconhecimento oficial read-only + dry-run; nenhuma escrita remota

## Objetivo

Avançar o próximo chunk da lane de reconhecimento: consultar o endpoint oficial
`/votacoes/{id}/votos` para os primeiros 25 de 300 `vote_ids` descobertos na
API aberta da Câmara, sem inferir voto individual a partir de listagem ou
placar de bancada.

## Entrega verificada

- Fonte oficial: `https://dadosabertos.camara.leg.br/api/v2`.
- Artefato de entrada: `.orchestrator/runtime/camara-discovery-current.json`,
  janela `2026-07-01` a `2026-09-30`, 300 IDs, páginas HTTP válidas.
- Coletor: `scripts/collect-camara-votes.mjs`.
- Lote: 25 IDs, artefatos brutos gravados em
  `.orchestrator/runtime/camara-votes-batch-01/`.
- Manifesto: modo `dry-run`, 25 eventos processados, 25 respostas `/votos`
  sem registros individualizados, 0 eventos nominais e 0 votos no envelope.
- O coletor terminou com exit 0 e declarou explicitamente que nenhuma escrita
  remota foi realizada.
- Nenhuma identidade, FK, proposição ou voto foi inventado ou aplicado.

## Gates locais do tick

- `git diff --check`: verde.
- Worktree: limpa antes da documentação; somente este QA foi criado no tick.
- Doctor: permanece com FAIL estrutural no shell cron porque o processo atual
  resolve Node `v22.22.2`, enquanto `package.json` exige Node `>=24 <25`.
- A tentativa de sincronizar/reiniciar o gateway com Node `v24.19.0` falhou no
  comando `hermes -p eleicao2026 gateway restart`; o serviço existente permaneceu
  ativo. O drop-in `70-eleicao2026-node24.conf` foi criado fora da worktree, mas
  não se declarou a correção como concluída.

## Bloqueios e escopo

- Este lote não encontrou votos nominais; isso não prova votação simbólica e não
  autoriza classificação factual. Os detalhes brutos permanecem somente no
  runtime transitório.
- ALRS continua bloqueado pelo JWT `issued at future` e sem ID oficial exato
  para os quatro residuais de Enio Carlos Terra.
- Senado continua fail-closed por deriva SHA-256 dos seis PDFs frente ao
  manifesto; nenhum hash foi atualizado.
- A lane `remote_factual_apply` não foi acionada: faltam envelope nominal,
  reconciliação exata de identidade/UF/cargo, catálogo de FK, dry-run de escrita
  e prova de idempotência.

## Próximo passo

Consultar o lote 02 dos IDs Câmara, bounded e read-only, preservando as URLs
completas e tratando apenas registros individualizados como candidatos a
reconciliação posterior. Em paralelo, manter Senado/ALRS em reconciliação
fail-closed e corrigir o runtime Node do gateway em chunk separado, sem repetir
reinícios cegos.
