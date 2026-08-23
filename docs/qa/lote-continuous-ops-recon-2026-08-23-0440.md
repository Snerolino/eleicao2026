# Lote continuous-ops — recon oficial e publicação — 2026-08-23 04:40Z

## Objetivo
Executar um tick bounded do control plane mantendo as lanes de reconhecimento oficial, verificação local e publicação. Não promover fatos sem identidade/fonte exata.

## O que foi entregue e verificado
- Lock não bloqueante adquirido e liberado com `flock -n`.
- Câmara dos Deputados: descoberta read-only em 8 janelas trimestrais explícitas entre 2025-01-01 e 2026-12-31; `8/8` respostas `ok`, `blocked=null`, `700` IDs transitórios. Nenhum ID foi reconciliado ou aplicado.
- ALRS FED-17 residual: execução dry-run não prosseguiu por erro real `JWT issued at future`; nenhum voto, data ou fonte foi alterado. Os 4 casos residuais de Enio Carlos Terra permanecem bloqueados por ausência de ID oficial/fonte exata.
- Auditoria de fontes read-only: RC 0 para execução, preservando gaps existentes — versões sem fonte ALRS/Câmara/Senado `1251/3/112`; eventos `1647/2/188`; votos `4/2/455`.
- Snapshot público: `npm run data:check` RC 0, com `1003` candidaturas, `988` fotos oficiais e `1` fonte TSE.
- `git diff --check` RC 0 e worktree sem alterações antes da documentação.

## Publicação
- `env -u GH_TOKEN git push origin main` falhou RC 128: GitHub respondeu HTTP 403, `Permission to Snerolino/eleicao2026.git denied to Snerolino`.
- A API autenticada continua identificando `Snerolino` e listando o workflow backup `334951434`, mas a credencial efetiva do transporte Git não tem permissão aceita pelo remoto.
- Por isso não houve novo workflow, deploy Cloudflare ou alteração remota neste tick.
- Verificação independente pós-commit: `origin/main` continua em `3aae2d06338f81dc0b8c5df92ecc61ed8825dda3`; backup mais recente `32614074680` terminou `completed/skipped` nesse SHA antigo; produção raiz e `/release.json` responderam HTTP 200 e permanecem no release `3aae2d0` / versão `0.2.835`.

## Estado dos dados
Nenhum candidato, voto, FK, `source_reference`, claim, Supabase ou Cloudflare foi alterado. Senado segue fail-closed sem envelope nominal com SHA verificável.

## Bloqueios reais
1. Transporte Git HTTPS rejeitado pelo remoto com HTTP 403; impede publicar os commits documentais locais.
2. JWT Supabase com emissão futura (`JWT issued at future`) bloqueia a leitura/repair ALRS FED-17.
3. Fonte/identidade oficial exata ausente nos 4 casos Enio Carlos Terra; não é permitido inferir.
4. Gaps de fontes legislativas permanecem na fila de recuperação; auditoria estrita deve continuar fail-closed.

## Próximo passo
Retentar a publicação quando a permissão efetiva do transporte Git estiver corrigida; somente após `main -> main` aceito validar o workflow backup `334951434`, `headSha` e produção. Em paralelo, manter recon Câmara read-only e Senado/ALRS fail-closed; não aplicar fatos sem R0, schema/FK, fonte oficial, dry-run e idempotência comprovados.
