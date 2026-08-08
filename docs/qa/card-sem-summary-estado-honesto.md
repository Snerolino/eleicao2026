# Cards sem summary — correção do estado honesto (badge "não confirmado" enganoso)

Data: 2026-08-08
Commit: `11f4786`

## Problema

Verificação solicitada pelo usuário sobre candidatos com tag "Outra fonte / Não confirmado"
(ex.: ADRIANE FONSECA GONÇALVES, SQ 210002534672).

Causa raiz: no `CandidateCard`, quando o candidato **não tem claim `summary` publicada**,
o badge de fonte usado valores de fallback:

- `document = null` → categoria `'outro'` → selo "Outra fonte"
- `confidenceScore = 0` → nível `nao_confirmado` → selo "Não confirmado"

Resultado: **253 candidatos sem dados publicados** eram exibidos como se tivessem uma
fonte "outra" e um dado "não confirmado" — falso negativo enganoso (ausência de dados ≠ dado não confirmado).

## Correção

`CandidateCard` agora só renderiza o `SourceReferenceBadge` quando existe summary publicado.
Sem summary, exibe estado honesto:

> Sem dados publicados — aguarde a verificação editorial.

O dossiê (`CandidateDossierPage`) já tratava seções vazias com "Ainda não verificado".
A Home (464 cards) passa a distinguir: candidatos com summary (badge real) e sem summary (estado honesto).

## Verificação

- Teste RED: `CandidateCard` com `claims: []` NÃO pode conter "Não confirmado"/"Outra fonte",
  deve conter "Sem dados publicados". ✅
- Suíte: 174 testes ✅ · `tsc` ✅ · `build` ✅ · `smoke:local` (464 cards, 0 falhas) ✅
- Deploy CI: sucesso (release `11g4786-20260808T093603409Z`) ✅
- Produto DOM check em `https://rs.votopraquem.org/` (card ADRIANE FONSECA GONÇALVES):
  - ❌ badge "Outra fonte / Não confirmado" ausente
  - ✅ rodapé: "Sem dados publicados — aguarde a verificação editorial."

## Estado posterior

Os 253 candidatos sem summary publicado passam a mostrar o aviso honesto. Confiança real
publicada de cada claim permanece visível nos dossiês via `SourceReferenceBadge`. Refresh
será necessário quando novas claims de summary forem publicadas para esses candidatos.