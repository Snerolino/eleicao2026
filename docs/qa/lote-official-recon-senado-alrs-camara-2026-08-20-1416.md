# QA — reconhecimento oficial bounded Senado, ALRS e Câmara

- **Data:** 2026-08-20T14:16:40Z
- **Objetivo:** executar o tick read-only das três trilhas oficiais prioritárias, sem promover manifesto, voto, identidade, FK ou escrita remota.

## Entrega verificada

### Senado

- Manifesto consultado: `data/legislative-import/senado/nominal-source-manifest-2026-08-19.json`.
- Fonte exclusiva: API oficial de relatórios nominais do Senado.
- Resultado: **6/6 HTTP 200**, **6/6 prefixos PDF válidos**.
- Bytes coincidentes com o manifesto: **3/6**.
- SHA-256 coincidente com o manifesto: **0/6**.
- Deriva observada novamente: 2025/1186, 2026/6341 e 2026/825 divergiram em bytes; os demais mantiveram bytes ou também divergiram no conteúdo hash.
- Decisão fail-closed: manifesto não atualizado e nenhum dado factual aplicado.

### ALRS

- Fonte exclusiva: `https://transparencia.al.rs.gov.br/parlamentares/votos-plenario`.
- Resultado: **HTTP 200**, **77.442 bytes**, **0 `data-item`**, sem `Enio Carlos Terra` e sem `Terra`.
- Os quatro residuais de Enio Carlos Terra continuam sem ID oficial e fonte exata; nenhum matching heurístico foi feito.

### Câmara

- Fonte exclusiva: `https://dadosabertos.camara.leg.br/api/v2/votacoes`.
- Janela consultada: **2026-10-01 a 2026-12-31**, dentro do limite de três meses.
- Resultado: resposta oficial **OK**, uma página útil, **0 vote_ids**, sem bloqueio.
- Nenhum evento, voto ou identidade foi inferido da resposta vazia.

## Gates locais

- Node usado pelo cron: **v22.22.2**.
- `npm run test`: **exit 0**, 82 arquivos e 372 testes aprovados.
- `npx tsc --noEmit`: **exit 0**.
- `node scripts/validate-impact-schema.mjs`: **exit 0**.
- `npm run data:check`: **exit 0**, 1003 candidaturas e 988 fotos oficiais.
- `npm run build`: **exit 0**, sitemap com 1003 candidatos + 2 URLs estáticas; `release.json` gerado.
- `git diff --check`: **exit 0**.
- O build manteve apenas o warning não bloqueante de chunk JavaScript acima de 500 kB.

## Bloqueios e estado dos dados

- Senado: bloqueado exclusivamente pela deriva persistente de bytes/SHA-256 contra o manifesto versionado.
- ALRS: bloqueado exclusivamente pela ausência de ID oficial/fonte exata para quatro residuais.
- Câmara Q4: não há novos eventos oficiais na janela consultada.
- Auditoria anterior permanece com gaps reais de fontes; este tick não alterou cobertura.
- Nenhuma escrita Supabase, Cloudflare, snapshot, claim, manifesto ou dado factual remoto ocorreu durante o reconhecimento.

## Próximo passo

Manter Senado e ALRS em revalidação bounded sem gerar manifesto substituto; manter Câmara em nova janela oficial elegível. A lane local/publicação segue independente, condicionada aos gates e à verificação de produção.
