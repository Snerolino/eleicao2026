# Lote continuous-ops — reconhecimento oficial 2026-08-23 07:25Z

## Objetivo
Executar o próximo tick bounded das lanes de reconhecimento oficial, sem promover fatos sem fonte exata, e revalidar o snapshot público.

## Entregue e verificado
- Lock bounded `flock -n` adquirido e liberado sem manter loop/sleep.
- ALRS FED-17 residual em dry-run: `planned_votes=0`, `planned_event_date_fixes=0`, `blocked_remaining=4`, `impact_touched=false`.
- Câmara: consulta oficial read-only à API `https://dadosabertos.camara.leg.br/api/v2`, janela `2026-07-01` a `2026-09-30`, `max_pages=1`; página bloqueada com `network_error`/`fetch failed`, portanto `vote_ids=[]` por fail-closed.
- Senado: envelope nominal verificável ausente em `/tmp/senado-nominal-envelope-latest.json`; nenhuma tentativa de aplicação.
- Dataset vivo versus snapshot: `1003/1003` registros, `0` somente no CSV, `0` somente no snapshot; SHA-256 do CSV `443eac3d55aa7f671a626525e30d68e191a4bd4da5b62c7a334844a1dcbc1de9`.
- `npm run data:check`: RC 0; `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.

## Estado dos dados
Nenhum candidato, voto, identidade, FK, source reference, claim, Supabase remoto ou Cloudflare foi alterado. As quatro pendências ALRS de Enio Carlos Terra permanecem sem ID oficial e fonte exata. A janela Câmara permanece sem evidência por falha de rede.

## Bloqueios reais
- ALRS: evidência oficial exata/ID oficial ainda não recuperados; dry-run não planejou escrita.
- Câmara: API oficial retornou `fetch failed` na janela consultada; nenhum ID foi inventado.
- Senado: não há envelope nominal com SHA verificável; fail-closed.
- Doctor: RC 1 por shell Node 22.22.2 enquanto o projeto exige Node 24; OpenCode ausente. Não bloqueou o reconhecimento local nem o `data:check`.

## Publicação e verificação
- Commit local criado: `df2818295b6703f5815e4e174f41e6b695bc6a38` (`docs: registrar recon oficial bounded`).
- `git push origin main` e `env -u GH_TOKEN git push origin main`: RC 128, HTTP 403 `Permission to Snerolino/eleicao2026.git denied to Snerolino`. `gh api` identifica `Snerolino` com permissões `push=true/admin=true`, evidenciando divergência entre API e transporte Git.
- Produção existente revalidada independentemente: raiz HTTP 200 e `/release.json` HTTP 200. Nenhum deploy novo nem validação de `headSha` deste commit foi possível porque o push não chegou ao remoto.

## Próximo passo
Retentar reconhecimento read-only em nova janela oficial quando o transporte estiver disponível; manter remote factual apply bloqueado até `R0/schema/FK/fonte/dry-run/idempotência`. Após `main -> main` aceito, validar backup Cloudflare `334951434`, `headSha` e produção.
