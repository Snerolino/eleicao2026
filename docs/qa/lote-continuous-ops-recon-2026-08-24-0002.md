# Lote continuous-ops — recon read-only — 2026-08-24 00:02Z

## Objetivo
Retomar o control plane sem escrita factual/editorial: conferir `dataset2026`, filas de fontes, snapshot público, gates locais e publicação vigente.

## Entregue e verificado
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Comparação explícita do CSV oficial `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026/consulta_cand_2026_RS.csv`: `553194` bytes, SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- Geração read-only do snapshot: `1003` existentes contra `1002` gerados; ausência do TSE `210002533050` e perdas de metadados de fotos foram rejeitadas pelo safety gate. Nenhuma sincronização foi promovida.
- Auditoria regular de fontes: RC 0. Strict permanece fail-closed: versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Residual ALRS dry-run: RC 0, `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- `verify-cli-output --live`: `1000` claims publicadas auditadas, `0` sem fonte.
- Gates locais Node 24.19.0: `404/404` testes em `98` arquivos, TypeScript, schema, `data:check`, build (`231` módulos; sitemap `1003 + 2`) e `git diff --check` verdes.
- Smoke local: RC 0, `1002` cards, `0` falhas HTTP, `0` erros online, service worker pronto. O preview já estava ativo na porta 4173; o smoke reutilizou-o após o aviso de porta ocupada.
- Produção: `/`, `/release.json` e `/admin` HTTP 200. Release `9cc5487-20260823T235158520Z`, SHA live `9cc5487d010116d7cc9b50d647f5fedec3cde305`, versão `0.2.980`, snapshot `1003`.
- GitHub Actions backup `334951434`: run `32674851611` success no mesmo `headSha`; primário no mesmo SHA falhou conforme padrão conhecido.

## Estado dos dados e decisões
Nenhum candidato, identidade, FK, voto, source reference, claim, assessment, matriz ou disposição editorial foi alterado. Nenhuma decisão humana foi promovida automaticamente.

## Bloqueios reais
- Quatro votos ALRS continuam sem evidência vinculável e permanecem bloqueados (`alrs_pl134_2023`, `alrs_pl165_2025`, `alrs_pl361_2025`, `alrs_pl77_2025`).
- Senado e gaps de fontes legislativas permanecem fail-closed.
- `orch:doctor` segue RC 1 por shell Node 22 e OpenCode ausente; os gates do projeto foram executados com Node 24.19.0. O smoke Codex rápido não foi exercitado.

## Próximo passo
Continuar recon read-only no próximo tick; não aplicar fatos até fonte oficial reproduzida com URL, hash, bytes e match exato, além de R0/schema/FK/dry-run/idempotência.
