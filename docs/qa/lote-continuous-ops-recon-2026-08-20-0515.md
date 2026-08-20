# QA — tick contínuo: reconciliação e fontes oficiais

**Data:** 2026-08-20 05:15 UTC  
**Modo:** reconhecimento read-only + gates locais; sem aplicação factual remota

## Objetivo

Manter as lanes oficiais ativas sem promover dados sem identidade/fonte exata:
revalidar Senado, tentar o residual ALRS, descobrir novos IDs oficiais da Câmara
e comparar o mirror `../dataset2026` ao snapshot público.

## Reconhecimento verificado

- Senado: `npm run impact:senado:sources:apply -- --dry-run` terminou com exit 0:
  6 planejadas, 0 ausentes, 0 inserções e 0 votos tocados. O gate de SHA-256
  continua fail-closed conforme a revalidação anterior; nenhum manifesto foi
  substituído.
- ALRS residual: `npm run impact:alrs:residual:repair -- --help` não avançou,
  terminando com `FED-17 repair: JWT issued at future`. O reparador não leu nem
  contornou credenciais; os quatro votos de Enio Carlos Terra continuam sem
  fonte/ID oficial verificável e não foram alterados.
- Câmara: `node scripts/discover-camara-vote-ids.mjs --start 2026-07-01
  --end 2026-09-30 --max-pages 3` terminou exit 0, com 3 páginas HTTP válidas e
  300 `vote_ids`, sem respostas bloqueadas. Artefato: 
  `.orchestrator/runtime/camara-discovery-current.json`. Nenhum voto foi
  classificado, reconciliado ou aplicado a partir apenas da listagem.
- Dataset: `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`
  tem 1003 IDs únicos e coincide integralmente com os 1003 IDs do snapshot.
  `lista_candidatos_2026.csv` tem 322 linhas sem coluna de ID TSE utilizável e
  não foi tratado como fonte equivalente.
- Auditoria ampla de fontes continua com gaps reais: votos ALRS 3996/4000 com
  fonte, Câmara 550/552 e Senado 0/455. O comando `impact:sources:audit --strict`
  terminou exit 2; isso é uma fila de recuperação, não foi suprimido.

## Gates locais

Executados com Node `v24.19.0`:

- `npm run test`: **82 arquivos / 372 testes, verde**.
- `npx tsc --noEmit`: **verde**.
- `node scripts/validate-impact-schema.mjs`: **verde**.
- `npm run data:check`: **verde**, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: **verde**, sitemap com 1003 candidatos + 2 URLs estáticas e
  `release.json` gerado.
- `git diff --check`: **verde**.
- Worktree após os gates: **limpa**; HEAD `2e87ad8588d4040a2fa23d82023cc8356964a68c`.

## Bloqueios

1. ALRS: JWT do ambiente está adiantado (`JWT issued at future`); além disso,
   não existe ID ALRS exato aprovado para os quatro residuais.
2. Senado: os seis PDFs continuam com deriva SHA-256 em relação ao manifesto;
   não atualizar hash nem aplicar votos.
3. Auditoria de cobertura: há fontes ausentes em eventos/versões históricos;
   nenhuma URL, UUID, hash ou identidade foi inventada.

## Próximo passo

Coletar os detalhes oficiais `/votacoes/{id}/votos` dos 300 IDs Câmara em lotes
bounded, reconciliar apenas identidades nominais exatas com UF/cargo e fonte,
e manter ALRS/Senado em reconciliação read-only. Nenhuma aplicação remota é
permitida sem R0, schema/FK, fonte, dry-run e idempotência.
