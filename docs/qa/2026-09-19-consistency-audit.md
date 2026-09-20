# Auditoria de consistência entre perfil e comparação

Data: 2026-09-19
Escopo: perfil individual, comparação, scores, casas legislativas, snapshot nominal e materialização remota.

## Verificações executadas

- revisão independente de três agentes read-only;
- busca estática em serviços, domínio, páginas e componentes;
- auditoria dos snapshots `data/public-candidates.json` e `data/candidate-nominal-votes.json`;
- dry-run do materializador remoto de perfis;
- `npm run test -- --passWithNoTests`;
- `npx tsc --noEmit`;
- `node scripts/data-check.mjs`;
- `node scripts/validate-impact-schema.mjs`;
- `git diff --check`.

## Correções implementadas nesta auditoria

- deduplicação da comparação por candidato, casa, grupo e evento;
- deduplicação no adaptador de fatos aprovados do Supabase;
- fallback local/remoto por evento completo, sem descartar toda a categoria quando a cobertura remota é parcial;
- identidade estável de evento no caminho local, sem índice posicional;
- materializador remoto deduplicando por candidato e evento;
- tabela comparativa sem média entre casas legislativas;
- gerador do snapshot nominal descartando votos Câmara sem `event_id` e duplicatas exatas.

## Evidência positiva

- suíte: 520 testes aprovados em 125 arquivos;
- TypeScript aprovado;
- schema de impacto aprovado;
- snapshot público estrutural básico aprovado: 1.003 candidaturas e 988 fotos oficiais;
- materializador remoto em dry-run: 110.252 votos relevantes, 110.252 votos canônicos, 0 duplicatas remotas, 87 perfis.

## Resultado da reconciliação

O snapshot nominal foi reconstruído a partir do universo factual remoto:

- 110.707 linhas remotas lidas;
- 110.252 linhas canônicas após deduplicação;
- 6.906 eventos;
- 87 candidatos com cobertura nominal;
- 455 duplicatas removidas;
- 0 votos sem identidade após a reconciliação.

Os `voting_profiles` públicos foram recalculados do mesmo snapshot e totalizam 110.252 votos. Os 476 `category_scores` derivados foram restaurados do snapshot editorial anterior, que já continha os assessments aprovados; os eventos nominais continuam deduplicados e os novos eventos sem vínculo permanecem sem grupo/score. A associação factual e a avaliação editorial continuam separadas.

## Gate de publicação

A publicação fica autorizada somente depois de completar os gates locais abaixo e confirmar o deploy com read-back. Eventos sem assessment aprovado continuam deliberadamente como não avaliados.
