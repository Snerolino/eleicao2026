# Prompt: Raspador de Eventos de Campanha — Eleições 2026 RS

## Objetivo
Construir um script Node.js (ou Python) que coleta eventos públicos de campanha dos candidatos às eleições 2026 no Rio Grande do Sul e os insere no Supabase como `raw_documents` + `claims` com `category = 'agenda'`.

## Fontes a varrer

### 1. Fontes oficiais (prioridade máxima)
- **TSE — DivulgaCandContas** → agenda de campanha registrada
  - API REST: `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/`
  - Endpoint de candidatos por estado: `/candidato/listar/2026/RS/` (posições: 1=gov, 2=sen, 6=dep fed, 7=dep est)
- **TRE-RS** → pautas de julgamento, sessões, intimações públicas
  - `https://www.tre-rs.jus.br/`

### 2. Fontes de imprensa (segundário)
- **G1 RS** (`https://g1.globo.com/rs/rio-grande-do-sul/eleicoes/`)
- **Zero Hora / GZH** (`https://gauchazh.clicrbs.com.br/politica/eleicoes/`)
- **JOTA** (`https://www.jota.info/eleicoes`)
- **Poder360** (`https://www.poder360.com.br/eleicoes/`)
- **Brasil de Fato RS** (`https://brasildefato.com.br/`)
- **CNN Brasil** (`https://www.cnnbrasil.com.br/politica/`)

### 3. Redes sociais oficiais (se tiver API)
- Perfis oficiais dos candidatos no Instagram / Twitter (via RSS ou scraping público)
- Perfil oficial do TRE-RS / TSE

## Definição de evento

Um evento de campanha é qualquer ocorrência pública que atenda a pelo menos um destes critérios:
- Comício, carreata, caminhada, bandeiraço
- Entrevista, debate, sabatina, podcast
- Agenda oficial de governo (se candidato for atual mandatário)
- Reunião com apoiadores, sindicatos, associações
- Aula / palestra / participação em evento acadêmico
- Visita a obras, hospitais, escolas, feiras
- Sessão legislativa relevante (votação de projeto de interesse)
- Julgamento ou decisão judicial envolvendo candidatura
- Protocolo de registro de candidatura
- Divulgação de plano de governo

## Formato de saída

Cada evento vira uma `claim` com `category = 'agenda'` vinculada a um `raw_document`:

### raw_document
```json
{
  "source_name": "G1 RS / Eleições 2026",
  "source_category": "imprensa",
  "url": "https://...",
  "content_hash": "sha256-do-texto-bruto",
  "raw_content": "Título + texto completo + data da matéria"
}
```

### claim
```json
{
  "candidate_id": "uuid-do-candidato-no-banco",
  "category": "agenda",
  "content": "Descrição factual do evento (data, local, tipo, frase-chave do candidato se houver)",
  "source_document_id": "uuid-do-raw_document",
  "confidence_score": 5,
  "status": "published"
}
```

## Regras

1. **Desambiguação obrigatória** — o nome do candidato no texto deve bater com `full_name` + `party` na tabela `candidates`. Se houver homonímia, marcar como `pending_review`.

2. **Filtro de estado** — ignorar eventos de fora do RS (salvo menção direta a candidato gaúcho).

3. **Rate limiting** — máximo 1 requisição por segundo por domínio. Respeitar `robots.txt`.

4. **Deduplicação** — verificar se o evento já existe pelo `content_hash` (SHA-256 do título + data + URL).

5. **Versionamento** — se o mesmo evento aparecer em fonte diferente, criar NOVO raw_document + claim separadas (com `confidence_score` = 5 se oficial, 2 se imprensa isolada).

6. **Integridade** — `raw_content` é o texto COMPLETO, não resumo. Se a página tiver mais de 50KB, extrair só o article/main e truncar com aviso.

## Estrutura técnica

### Pré-requisitos
- `SUPABASE_SERVICE_ROLE_KEY` no ambiente (para bypass de RLS)
- `VITE_SUPABASE_URL` no ambiente
- `@supabase/supabase-js` ou `supabase-py`
- `cheerio` (se Node) ou `BeautifulSoup` (se Python) para parsing HTML

### Fluxo
1. Buscar lista de candidatos ativos do banco
2. Para cada candidato, buscar eventos nas fontes (limitado a 1x/dia por candidato)
3. Extrair e estruturar cada evento encontrado
4. Inserir `raw_document` + `claim` no Supabase
5. Log de execução: quantos candidatos varridos, quantos eventos novos, quantos ignorados (duplicata)

## Exemplo de saída

```json
{
  "candidate": "Juliana Brizola",
  "event": "Comício na Praça da Matriz",
  "date": "2026-07-28",
  "time": "19:00",
  "location": "Praça da Matriz, Porto Alegre/RS",
  "type": "comicio",
  "source": "https://gauchazh.clicrbs.com.br/...",
  "confidence": 5
}
```

## Roadmap sugerido
1. **MVP** — scraper de RSS/feed de notícias (G1, ZH) + inserção manual
2. **V2** — conector TSE agenda oficial
3. **V3** — perfis de redes sociais (se APIs públicas disponíveis)
4. **V4** — agendador cron (`30m` no Hermes ou cron do servidor)

---

## Uso no Hermes

Para executar periodicamente, salvar como skill e agendar cron:

```bash
hermes cron create \
  --name "raspador-eventos" \
  --schedule "every 30m" \
  --prompt "Roda o raspador de eventos de campanha. Verifica fontes (G1, ZH, TSE) em busca de novos eventos para os candidatos do RS 2026. Insere raw_documents e claims no Supabase." \
  --skills "raspador-eventos"
```
