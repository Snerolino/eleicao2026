# Lote continuous-ops recon — 2026-08-22 14:35Z

## Objetivo
Executar um tick bounded do control plane: recon oficial read-only, conferir o snapshot vivo do `dataset2026`, validar gates locais e verificar publicação sem promover fatos sem fonte.

## Entregue e verificado
- Lock bounded `.orchestrator/runtime/locks/continuous-progress.lock` adquirido com `flock -n` e liberado ao fim do tick.
- Push de `main` tentado duas vezes (normal e `env -u GH_TOKEN`): ambos falharam com HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- Workflows remotos enumerados: backup `334951434`, primário `320564705`, verificador `335560210`.
- Produção `/release.json`: HTTP 200; payload atual `version=0.2.806`, sem `commitSha`, `headSha`, `snapshotSha` ou `builtAt`, portanto sem correspondência verificável com o HEAD local.
- Snapshot contra a fonte oficial viva: `../dataset2026/candidatos/consulta_cand_2026/consulta_cand_2026_RS.csv` tem 1.003 IDs; `data/public-candidates.json` tem 1.003 IDs; diferença em ambos os sentidos = 0. CSV SHA-256 `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`, 553.194 bytes. Snapshot SHA-256 `a7db54b20bd1aa0d49003e278d48d1443617f00b772d004d711cd762d0c982cf`.
- `npm run test -- --passWithNoTests`: **401/401 testes, 98 arquivos, RC 0**.
- `npx tsc --noEmit`: **RC 0**.
- `node scripts/validate-impact-schema.mjs`: **RC 0**.
- `npm run data:check`: **RC 0**, 1.003 candidaturas, 988 fotos oficiais, 1 fonte TSE.
- `npm run build`: **RC 0**, sitemap 1.003 candidatos + 2 estáticas, `release.json` local `cc86810-20260822T143219847Z`.
- `git diff --check`: **RC 0**.
- `npm run smoke:local`: primeira execução transitória falhou com `cards=0` enquanto a lista carregava; repetição passou: **1.002 cards, 0 falhas HTTP, 0 erros online, service worker pronto**.
- Auditoria regular de fontes: **RC 0**. Auditoria estrita: **RC 2**, fail-closed pelos gaps reais: versões ALRS/Câmara/Senado `1251/3/112`, eventos `1647/2/188`, votos `4/2/455`.

## Estado dos dados e bloqueios
- Nenhum voto, identidade, URL, hash ou claim factual novo foi inventado ou promovido.
- Os 4 residuais de Enio Carlos Terra seguem bloqueados até ID oficial ALRS e fonte exata; Senado segue sem envelope nominal verificável; Câmara permanece somente em recon read-only conforme checkpoint anterior.
- O strict source audit continua bloqueado por ausência de fonte rastreável nos registros acima.
- Publicação está bloqueada no push por autorização GitHub efetiva (HTTP 403). Não foi disparado workflow nem deploy neste tick.

## Próximo passo
Retentar publicação somente quando a identidade GitHub tiver permissão efetiva; após `main -> main`, disparar/verificar o backup `334951434`, comparar `headSha` do run com o commit e validar HTTP/produção. Manter ALRS/Senado fail-closed e avançar recon oficial independente.
