# Instrução de build — Coletor de Histórico de Candidatos (RS 2026)

> Para o agente de IA (Hermes/OpenCode) que vai implementar. Este documento é a
> instrução inicial de escopo e arquitetura — não é o código. Leia até o fim antes
> de escrever a primeira linha.

---

## 0. Antes de escrever qualquer código

1. Leia o schema atual do Supabase usado pelo `extrator-sympla`/`eventos-poa`
   (tabelas `raw_documents`, `claims`, e qualquer tabela de candidatos que já
   exista). **Não crie tabelas paralelas** sem antes confirmar que as existentes
   não servem — o padrão `raw_documents` + `claims` já existe para os eventos de
   agenda; a ideia é reaproveitar, não duplicar.
2. Leia o arquivo `agente-dossies-eleitorais-rs2026-v2.md` (anexo/já entregue) —
   esse é o system prompt que este serviço vai usar na etapa de síntese via API
   da Anthropic. Você não reimplementa a lógica de classificação de evidência;
   você só monta o payload, chama o modelo com esse prompt, e persiste a saída.
3. Não faça deploy nem grave em produção sem aprovação. Trabalhe em branch/PR,
   nunca em merge direto — mesma regra já em vigor no `eventos-poa` (só reportar
   achados/propor mudança, não aplicar sem aprovação prévia).
4. Passos pequenos e reversíveis. Cada fase da seção 8 é um PR isolado e
   revisável — não pule fase para "ganhar tempo".

---

## 1. Objetivo

Construir um serviço que, para cada candidato registrado do RS 2026 (Senador,
Deputado Federal, Deputado Estadual):

1. reúne dados brutos de fontes estruturadas e semi-estruturadas (TSE Dados
   Abertos, API pública do DataJud/CNJ, scraping institucional);
2. envia esse material bruto, junto com o system prompt do **Agente Dossiês v2**,
   para o modelo Claude via API da Anthropic, pedindo a saída no schema JSON
   definido nesse prompt;
3. grava o resultado em `raw_documents` (dado bruto, por fonte) e `claims` (dado
   estruturado, sempre com `review_status = pending_human_review`);
4. **nunca publica nada diretamente.** A fila de revisão editorial e a
   publicação no portal são responsabilidade de outro agente (o "agente
   adequador"), fora do escopo deste serviço.

---

## 2. Fora de escopo — não faça

- Não implemente UI de revisão editorial aqui — isso é do agente adequador/portal.
- Não implemente lógica de merge com dados já publicados no portal — o contrato
  de saída (seção 6) é o suficiente; quem casa dado novo com dado existente é o
  agente adequador.
- Não decida sozinho nível de evidência A/B/C ou status processual — isso é
  função do Agente Dossiês v2 (o LLM). Este serviço só orquestra chamadas e
  persiste o que volta.
- Não construa nenhum mecanismo de ranking, score ou recomendação de candidato —
  vedado também no v2 (base normativa: Resolução TSE 23.610/2019, alterada pela
  23.755/2026).

---

## 3. Arquitetura (visão geral)

```
TSE Dados Abertos ──▶ Ingestão ──▶ fila de candidatos (status: pending)
                                          │
                                          ▼
                              [ por candidato, 1 job ]
                     ┌────────────┬───────────────┬────────────┐
                     ▼            ▼               ▼            ▼
                DataJud API   TSE API      scraping oficial   busca web
                (metadados)  (registro)   (Diários, portais)  (só pista)
                     └────────────┴───────────────┴────────────┘
                                          │  payload bruto por fonte
                                          ▼
                          grava em raw_documents (auditável, reprocessável)
                                          │
                                          ▼
                    chamada à API da Anthropic
                    system = Agente Dossiês v2
                    input = payload bruto do candidato
                                          │
                                          ▼
                       valida resposta contra o schema JSON do v2
                                          │
                              ┌───────────┴────────────┐
                              ▼                         ▼
                     JSON válido → grava em      JSON inválido → loga erro,
                     claims (review_status =     não grava claim, marca
                     pending_human_review)        candidato para retry
                                          │
                                          ▼
                     [ fora do escopo deste serviço ]
                     agente adequador → merge com portal → gate humano → publish
```

---

## 4. Stack

Seguir o que já existe no projeto — não introduzir stack nova sem justificativa
por escrito no PR:

- **Linguagem:** Python (mesma linha do `extrator-sympla`) para coletor e
  orquestrador.
- **Persistência:** Supabase, reaproveitando `raw_documents` + `claims`.
- **Execução:** cron via Hermes, no mesmo padrão já definido para o raspador de
  eventos de agenda.
- **LLM:** API da Anthropic (Messages API), modelo configurável por variável de
  ambiente (não hardcode o nome do modelo), com `tool_use` para os fetchers
  estruturados (DataJud, TSE) quando fizer sentido dar ao próprio modelo a opção
  de buscar mais contexto, em vez de só receber payload fechado.

---

## 5. Modelo de dados — extensão, não substituição

- Verifique se `claims.category` já é um enum fechado ou string livre. Se for
  livre, use um novo valor (ex.: `"historico_candidato"`) para não colidir com
  `"agenda"`.
- Verifique se `claims` já tem uma coluna equivalente a `review_status`. Se não
  tiver, proponha uma migration incremental — não decida o nome sozinho sem
  checar a convenção já usada no schema de agenda.
- `raw_documents` guarda o payload bruto de **cada fonte consultada** (TSE,
  DataJud, scraping, busca) antes da síntese pelo LLM — isso permite auditoria e
  reprocessamento sem precisar refazer o fetch.
- Chave de dedup: `sq_candidato` + `id_registro` (campo definido no schema do
  v2). **Nunca sobrescrever** um `claim` existente com `UPDATE` destrutivo —
  sempre inserir nova versão com timestamp, seguindo a mesma lógica de
  rollback já definida no v2 (seção 12 daquele documento).

---

## 6. Contrato de saída para o agente adequador

- Cada execução bem-sucedida produz N linhas em `claims`, todas com
  `review_status = 'pending_human_review'`, no schema JSON do Agente Dossiês v2.
- O agente adequador é quem: casa `sq_candidato` com registro existente no
  portal, decide se é candidato novo ou atualização, e aplica o gate de revisão
  humana antes de publicar.
- Este serviço **nunca** tenta decidir isso sozinho. Se um `sq_candidato` já
  tiver `claims` publicados, mesmo assim grave a nova execução como nova
  versão — não leia nem modifique o que já está `published`.

---

## 7. Requisitos não-funcionais

Baseados diretamente nos achados de auditoria já registrados no
`extrator-sympla` e no `eventos-poa` — o objetivo explícito aqui é não repetir
os mesmos erros:

- Nenhuma credencial hardcoded, nem em arquivos de exemplo (`.env.example` só
  com placeholders).
- Toda chamada a fonte externa precisa de timeout, retry com backoff, e rate
  limiting — DataJud e os portais institucionais são de terceiros e não devem
  ser martelados.
- Sanitizar todo texto vindo de scraping ou da saída do LLM antes de qualquer
  persistência que possa depois ser renderizada como HTML no portal — já houve
  um vetor de XSS armazenado no `extrator-sympla` via campo `href` não
  validado; não repetir esse padrão aqui.
- RLS habilitado por padrão nas tabelas tocadas; nenhuma leitura anônima de dado
  ainda não aprovado.
- Nenhuma verificação de autenticação client-side (tipo `localStorage`)
  controlando o que é ou não publicado — falha já identificada no `eventos-poa`.
- Cobertura de teste mínima: validação do JSON do LLM contra o schema do v2
  (rejeitar e logar, nunca gravar, se inválido) e os fetchers estruturados
  (DataJud, TSE) com mocks.
- Log estruturado por candidato/execução — sem isso não dá para montar depois o
  relatório de cobertura descrito na seção 13 do v2.

---

## 8. Fases de implementação (cada uma é um PR isolado e revisável)

| Fase | Entrega | Critério de aceite |
|---|---|---|
| 0 — Levantamento | Documento mapeando schema atual e extensões mínimas necessárias (não migration ainda) | Revisado por Lole antes de codar |
| 1 — Ingestão | Puxa candidaturas RS 2026 do TSE Dados Abertos, popula fila | Fila reflete `SQ_CANDIDATO` reais, sem duplicata |
| 2 — Fetcher DataJud | Consulta por tribunal/TRE, com cache local do bruto | Roda para 1 candidato sem estourar rate limit |
| 3 — Fetcher scraping institucional | Reaproveita padrão de plugin do `extrator-sympla` onde aplicável | Roda para 1 candidato, grava bruto em `raw_documents` |
| 4 — Orquestração + LLM | Monta payload por candidato, chama API Anthropic com system = v2, valida JSON | Saída válida contra o schema do v2 para 1 candidato real |
| 5 — Persistência | Grava `raw_documents` + `claims`, sempre `pending_human_review`, versionado por `id_registro` | Reexecução do mesmo candidato não duplica claim idêntico |
| 6 — Observabilidade | Relatório agregado (processados/pendentes/erros) | Legível por humano, sem precisar consultar o banco direto |

---

## 9. Critérios de aceite gerais

- Rodar ponta a ponta para 1 candidato de teste sem erro e sem gravar nada em
  `published`.
- Reexecutar o mesmo candidato não duplica `claims` já idênticos (idempotência).
- Falha em uma fonte (ex.: DataJud fora do ar) não derruba o job inteiro — grava
  em `pendencias` e segue para a próxima fonte/candidato.
- Nenhum dado nível C ou "não confirmado" aparece fora de `pendencias[]`.

---

## 10. Antes de considerar "pronto"

- Revisão humana (Lole) do output de 3–5 candidatos reais antes de rodar em
  escala.
- Confirmação jurídica (nota já registrada no v2, seção 10) antes de qualquer
  **publicação** pública real — o risco jurídico relevante começa na
  publicação, não na coleta, já que este serviço só grava em
  `pending_human_review`. Mas vale já ter isso encaminhado antes de escalar o
  volume de coleta.
