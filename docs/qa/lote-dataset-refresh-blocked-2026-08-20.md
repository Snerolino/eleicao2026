# QA — refresh do dataset bloqueado (2026-08-20)

## Objetivo
Revalidar o `../dataset2026` contra o snapshot público versionado antes de qualquer sincronização.

## Verificado
- Worktree iniciou limpa em `5bb6a68f3f13b8d1119a83287a69466b1cbd38d2`.
- `../dataset2026` contém 22 CSVs; os CSVs de candidatos comparáveis não fecham paridade com o snapshot atual.
- O comando `node scripts/refresh-public-snapshot.mjs` foi executado uma vez com Node 24.19.0 para inspeção operacional e gerou uma proposta local de 1002 candidaturas.
- A proposta removeu `tse_candidate_id=210002533050` (`FRANCISCO MARQUES NETO`) e zerou os 1003 `photo_url`/`photo_source_url` do snapshot versionado; por isso foi rejeitada e revertida imediatamente (`git restore`).
- Após a reversão, a worktree voltou limpa; nenhuma alteração de snapshot, manifesto, Supabase, claim, voto, identidade, FK ou deploy foi mantida.
- `npm run impact:sources:audit` passou em modo read-only, mas reporta gaps reais: ALRS 1251 versões/1647 eventos/4 votos; Câmara 3 versões/2 eventos/2 votos; Senado 112 versões/188 eventos/455 votos sem fonte.

## Estado dos dados
- Snapshot versionado preservado; não promover refresh enquanto o dataset local não preservar candidato e fotos oficiais já publicados.
- Nenhum dado factual novo foi inserido.

## Bloqueio real
O refresh atual não é seguro como sincronização incremental: a entrada local disponível diverge do snapshot público em candidato e metadados de fotos. Sem manifesto/artefato oficial que explique a remoção e a perda de fotos, fail-closed.

## Próximo passo
Preparar um comparador de refresh que preserve campos oficiais já publicados e exija prova explícita para remoções/perdas de foto; depois repetir gates completos. Manter ALRS/Senado em reconciliação oficial read-only e sem aplicação remota.
