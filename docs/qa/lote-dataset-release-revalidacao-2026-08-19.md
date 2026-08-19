# QA — revalidação dataset e release — 2026-08-19

## Objetivo

Fechar o chunk bounded de retomada: revalidar o backup Cloudflare pendente,
produção e a fonte viva `../dataset2026`, sem alterar dados legislativos ou
promover registros ALRS bloqueados.

## Evidência verificada

- Worktree limpa no início do chunk; `HEAD` e `origin/main` em
  `712898f10a539431bd0b18fb45ba87bd4668a53a`.
- Workflow backup `334951434`, run `32213337592`: `completed/success`, com
  `headSha=1f4eec2ec4e8ec37b4263d7bd5a952315414fa68`.
- Produção: raiz HTTP 200; `/release.json` HTTP 200.
- Produção confirma o commit atual `712898f10a539431bd0b18fb45ba87bd4668a53a`,
  versão `0.2.382`, release `712898f-20260819T034950699Z` e snapshot com 1003
  candidaturas. Portanto, o run consultado é sucesso de um commit anterior;
  não foi atribuído a ele o deploy do `HEAD` atual.
- `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv`
  contém 1003 IDs TSE únicos; comparação determinística com
  `data/public-candidates.json`: snapshot-only 0, dataset-only 0.
- `npm run data:check`: verde — 1003 candidaturas, 988 fotos oficiais.
- `node scripts/validate-impact-schema.mjs`: verde.

## Bloqueios e escopo

Nenhuma fonte legislativa nova foi encontrada neste chunk. A fila ALRS FED-17
continua fail-closed: não executar `--apply` sem correspondência oficial exata
de proposição, data, candidato, valor, URL e hash. Não houve escrita Supabase,
FK, UUID, voto, matriz, claim, RPC, Cloudflare ou DNS.

O workflow específico do `HEAD` atual ainda precisa ser identificado/concluído
em próximo chunk; a confirmação de produção já prova que o commit está live,
mas não substitui a evidência de `headSha` do workflow correspondente.

## Próximo passo

Selecionar outro lote legislativo independente para auditoria read-only de
fonte/schema/FK; manter ALRS FED-17 bloqueado até aparecer prova oficial
aplicável e manter a reconciliação por `tse_candidate_id` exata.
