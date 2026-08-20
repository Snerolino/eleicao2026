# Política de precedência de fontes

## Regra vigente

Quando um registro do `../dataset2026` divergir de uma fonte oficial primária,
o registro oficial vence automaticamente. O registro do dataset é descartado
somente para aquele conflito e a decisão é registrada no relatório de
precedência.

```text
fonte oficial primária > dataset2026 sem comprovação oficial > fonte desconhecida
```

A exceção importante é o mirror local do próprio TSE: quando o registro do
`dataset2026` possui `official_url` HTTPS e hash que identificam o arquivo oficial
TSE, ele é tratado como evidência oficial TSE, não como fonte inferior.

## Comando

```bash
npm run data:source:precedence -- \
  /caminho/records.json \
  --key=external_id \
  --output=/tmp/records-resolved.json
```

O resultado contém:

- `resolved`: um registro vencedor por chave;
- `discarded`: registros descartados;
- `reason=official_source_wins` quando houve conflito oficial;
- `conflicting_fields` com os campos divergentes.

A política não apaga o fato original do arquivo bruto ou do histórico de
proveniência; apenas impede que o dataset inferior prevaleça na camada derivada,
no snapshot público ou em aplicação factual.

## Limites

- Não usar matching fuzzy para criar chaves.
- Não considerar HTTP 200 sozinho como prova de conteúdo oficial correto.
- Não substituir manifesto/hash oficial por dado do dataset.
- Votos legislativos continuam exigindo identidade, fonte, FK, dry-run e
  idempotência.
