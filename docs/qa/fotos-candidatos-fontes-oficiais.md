# Fotos dos candidatos — fontes oficiais

Data: 2026-08-02

## Fonte usada nesta rodada

- Órgão/fonte: Tribunal Superior Eleitoral (TSE)
- Conjunto oficial: fotos publicáveis de candidatos RS 2024
- URL oficial: `https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip`
- Diretório local usado como espelho extraído: `/home/lourenco/Projetos/jsoneleicao/foto_cand2024_RS_div`
- Motivo: a API pública do DivulgaCandContas 2026 foi consultada e ainda retorna `fotoUrl: null` / `fotoUrlPublicavel: false` para os cargos RS consultados. Até o TSE publicar as fotos 2026, só entraram matches conservadores contra fotos oficiais já publicáveis do TSE 2024.

## Regra de matching

Script versionado: `scripts/apply-official-candidate-photos.mjs`.

Critérios aceitos:

1. Nome completo normalizado + partido, exato.
2. Nome completo contido + partido.
3. Nome de urna contido + partido.
4. Palavras significativas do nome de urna + partido.
5. Palavras significativas do nome completo + partido.

Critérios rejeitados:

- Match sem partido.
- Match ambíguo com mais de uma foto no mesmo score.
- Foto de fonte não oficial ou sem origem rastreável.
- Foto 2026 não publicável (`fotoUrlPublicavel=false`).

## Resultado aplicado

- Candidaturas no snapshot público: 212
- Fotos oficiais aplicadas: 72
- Matches ambíguos deixados sem foto: 1
- Sem match conservador: 139
- Assets públicos: `public/photos/tse-2024-rs/`
- Manifesto de rastreabilidade: `data/public-candidate-photo-matches.json`

Cada candidatura com foto recebeu:

- `photo_url`: asset local versionado em `/photos/tse-2024-rs/<slug>.<ext>`
- `photo_source_url`: URL oficial do ZIP TSE

## Evidência de controle

- `npm run data:check` mostra contagem de fotos oficiais.
- `scripts/__tests__/public-snapshot.test.mjs` valida:
  - 72 fotos no snapshot;
  - URL de fonte oficial TSE;
  - arquivo público existente para cada `photo_url`.

## Próxima atualização

Quando o TSE 2026 publicar `fotoUrlPublicavel=true` no DivulgaCandContas ou um ZIP 2026 oficial disponível, rodar nova ingestão priorizando a fonte 2026 e sobrescrevendo as fotos 2024 somente quando houver match por `SQ_CANDIDATO`.
