## A curto prazo (alimentação):

1. **Adicionar claims pros candidatos sem** — os 7 deputados (federais e estaduais) estão sem claims. Via SQL Editor do Supabase, seguindo o `docs/seed-completo.sql` como template.

2. **Adicionar fontes de imprensa/checagem** — hoje só tem fontes oficiais. O `docs/seed-completo.sql` já inclui placeholders (Zero Hora, G1 RS, Aos Fatos, Lupa), mas o `raw_content` deles é genérico — precisa de conteúdo real extraído das fontes.

3. **Adicionar fotos** — o TSE DivulgaCandContas disponibiliza URL das fotos oficialmente. Só popular `photo_url` na tabela `candidates` e o card já exibe.

4. **Verificar se o frontend carrega** — roda `npm run dev` e abre no navegador.

### Sobre o timeout nas queries de claims com `content`

Pode ser falta de índice na coluna `status`. Se continuar lento no frontend, roda no SQL Editor:

```sql
create index if not exists idx_claims_status on claims(status);
create index if not exists idx_claims_candidate on claims(candidate_id);
```
