# Fotos dos candidatos — fontes oficiais

Data: 2026-08-12

## Fonte usada nesta rodada

- Órgão/fonte: Tribunal Superior Eleitoral (TSE)
- Conjunto oficial primário: fotos publicáveis de candidatos RS 2026
- URL oficial 2026: `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2026/fotos/foto_cand2026_RS_div.zip`
- Diretório local usado como espelho extraído: `/home/lourenco/Projetos/dataset2026/_originais/foto_cand2026_RS_div`
- Fallback conservador: fotos publicáveis de candidatos RS 2024, URL `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip`, usado somente quando não há match exato 2026 por `SQ_CANDIDATO`.

## Regra de matching

Script versionado: `scripts/apply-official-candidate-photos.mjs`.

Critérios aceitos:

0. Match exato por `SQ_CANDIDATO` no nome técnico `FRS{SQ_CANDIDATO}_div.jpg` do ZIP oficial 2026.

1. Nome completo normalizado + partido, exato.
2. Nome completo contido + partido.
3. Nome de urna contido + partido.
4. Palavras significativas do nome de urna + partido.
5. Palavras significativas do nome completo + partido.

Critérios rejeitados:

- Match sem partido.
- Match ambíguo com mais de uma foto no mesmo score.
- Foto de fonte não oficial ou sem origem rastreável.
- Match 2024 quando há foto 2026 oficial exata.

## Resultado aplicado

- Candidaturas oficiais TSE no manifesto: 939
- Candidaturas no snapshot público: 938
- Fotos oficiais aplicadas: 906
- Matches exatos 2026 por `SQ_CANDIDATO`: 879
- Fallbacks conservadores 2024: 27
- Matches ambíguos deixados sem foto: 1
- Sem match: 31
- Assets públicos: `public/photos/tse-2026-rs/` e `public/photos/tse-2024-rs/`
- Manifesto de rastreabilidade: `data/public-candidate-photo-matches.json`

Cada candidatura com foto recebeu:

- `photo_url`: asset local versionado em `/photos/tse-2026-rs/<slug>.<ext>` ou fallback `/photos/tse-2024-rs/<slug>.<ext>`
- `photo_source_url`: URL oficial do ZIP TSE

## Evidência de controle

- `npm run data:check` mostra contagem de fotos oficiais.
- `scripts/__tests__/public-snapshot.test.mjs` valida:
  - pelo menos 212 fotos no snapshot;
  - URL de fonte oficial TSE;
  - arquivo público existente para cada `photo_url`.

## Próxima atualização

Quando o ZIP oficial TSE 2026 avançar, baixar novamente o ZIP, atualizar o espelho local, rodar `npm run data:refresh` seguido de `npm run data:photos` com `--source-dir-2026` explícito, e validar se os 31 sem match/1 ambíguo foram reduzidos.
