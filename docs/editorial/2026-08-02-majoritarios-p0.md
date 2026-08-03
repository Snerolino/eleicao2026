# P0 editorial — dossiê mínimo dos majoritários RS 2026

Data: 2026-08-02  
Base: `data/public-candidates.json`  
Objetivo: preparar a primeira carga editorial sem publicar nada automaticamente.

## Regra de publicação

Nenhuma claim deste bloco pode nascer pública.

Fluxo obrigatório:

1. levantar fonte pública;
2. inserir `source_references`;
3. inserir `claims.status = 'pending_review'`;
4. registrar `editorial_reviews.decision = 'approved'` com revisão humana;
5. publicar via RPC `publish_claim()`;
6. atualizar snapshot e validar UI.

Categorias mínimas por candidatura:

- `historico_politico`;
- `plataforma`.

Categorias sensíveis como `reputacao` ficam fora deste P0 salvo decisão humana explícita e fonte robusta.

## Candidaturas majoritárias no snapshot público

| Cargo | Nome de urna | Nome completo | Partido | Nº | `tse_candidate_id` | Slug | Foto |
|---|---|---|---|---:|---|---|---|
| Governador | PRISCILA VOIGT | PRISCILA VOIGT SEVERIANO | UP | 80 | `210002533355` | `priscila_voigt_severiano_210002533355` | sim |
| Vice-governador | NAF NASCIMENTO | NAFTALY PEREIRA DO NASCIMENTO | UP | 80 | `210002533354` | `naftaly_pereira_do_nascimento_210002533354` | não |
| Senador | MANUELA D'ÁVILA | MANUELA PINTO VIEIRA D'ÁVILA | PSOL | 500 | `210002533581` | `manuela_pinto_vieira_d_avila_210002533581` | não |
| Senador | PIMENTA | PAULO ROBERTO SEVERO PIMENTA | PT | 131 | `210002533584` | `paulo_roberto_severo_pimenta_210002533584` | não |
| Senador | LUCIANO DO MLB | LUCIANO SCHAFER | UP | 800 | `210002533435` | `luciano_schafer_210002533435` | sim |
| Senador | TANIA PERES | TANIA MARA SANTORO PERES | UP | 808 | `210002533434` | `tania_mara_santoro_peres_210002533434` | não |

## Template de levantamento por candidatura

Preencher uma ficha por candidatura antes de qualquer inserção no Supabase.

```md
### <NOME DE URNA> — <CARGO>

- Candidate ID: `<uuid>`
- TSE candidate ID: `<sq_candidato>`
- Slug: `<slug>`

#### Claim 1 — `historico_politico`

- Texto factual proposto: `<1 a 3 frases verificáveis, sem adjetivo opinativo>`
- Fonte pública principal:
  - Nome:
  - URL:
  - Categoria: `oficial` / `imprensa` / `fact_check` / `outro`
  - Trecho/ancoragem:
- Fonte secundária opcional:
- Risco jurídico/editorial:
- Status de revisão: `pendente`

#### Claim 2 — `plataforma`

- Texto factual proposto: `<1 a 3 frases sobre proposta/programa/documento público>`
- Fonte pública principal:
  - Nome:
  - URL:
  - Categoria: `oficial` / `imprensa` / `fact_check` / `outro`
  - Trecho/ancoragem:
- Fonte secundária opcional:
- Risco jurídico/editorial:
- Status de revisão: `pendente`
```

## Fontes preferenciais por tipo de claim

### `historico_politico`

Prioridade:

1. TSE / DivulgaCandContas para identificação e registro;
2. páginas institucionais de mandatos atuais ou anteriores;
3. Câmara dos Deputados, Senado, Assembleia Legislativa, prefeituras, secretarias ou partidos;
4. imprensa consolidada apenas quando a fonte institucional não bastar.

Não usar rede social isolada para histórico político, salvo se for fonte primária de autodeclaração e identificada como tal.

### `plataforma`

Prioridade:

1. plano de governo/programa registrado ou publicado oficialmente;
2. site oficial de campanha/partido;
3. entrevista/debate/sabatina com fala direta;
4. imprensa como fallback, sempre com redação factual.

## Checklist antes de inserir

- [ ] 6 candidaturas conferidas contra `data/public-candidates.json`.
- [ ] 12 claims propostas: 6 `historico_politico` + 6 `plataforma`.
- [ ] Todas as 12 claims têm fonte pública URL.
- [ ] Nenhuma claim usa linguagem acusatória sem fonte forte.
- [ ] Nenhuma claim de `reputacao` misturada neste P0.
- [ ] Todas entram como `pending_review`.
- [ ] Revisão humana aprovada antes da RPC `publish_claim()`.

## Comandos de validação após inserção autorizada

Somente após autorização humana para Supabase remoto:

```bash
npm run data:refresh
npm run data:check
npm run smoke:local
npm test -- scripts/__tests__/h4-2-claims-workflow.test.mjs scripts/__tests__/editorial-workflow.test.mjs
```

Gate de saída:

- 6/6 majoritários com dossiê visível localmente;
- 12/12 claims publicadas por RPC após revisão;
- 0 claims sem `source_document_id`;
- 0 claims criadas direto como `published`.

## Provisionamento do login administrativo

A página `/admin` existe, mas não é linkada no header/footer público. Para habilitar o acesso, criar/atualizar um usuário Supabase Auth e vinculá-lo a `editor_roles`:

```bash
ADMIN_EMAIL=admin@votopraquem.org \
ADMIN_PASSWORD='<senha forte fora do repo>' \
SUPABASE_SERVICE_ROLE_KEY='<service_role JWT fora do repo>' \
node scripts/create-admin-user.mjs
```

Regras:

- não salvar a senha em `.env.local`, docs, histórico de shell compartilhado ou commit;
- usar `service_role` somente neste script administrativo;
- o painel usa anon key + Supabase Auth no navegador, nunca `service_role`;
- após login, a UI só mostra fila se o usuário existir em `editor_roles` como `editor` ou `admin`.
