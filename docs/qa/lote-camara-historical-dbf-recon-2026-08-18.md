# QA — Reconciliação offline dos DBFs históricos da Câmara

- Data: 2026-08-18
- Fase: FED-24
- Modo: somente leitura; nenhum voto, identidade, FK, source reference ou escrita remota foi criado.

## Objetivo

Revalidar os seis DBFs oficiais já baixados, cruzando `NOME_PAR` de registros `ESTADO=RIO GRANDE DO SUL` com `full_name`/`ballot_name` do snapshot público, sem matching heurístico.

## Evidência oficial

Os seis artefatos do manifesto `data/legislative-import/camara/historical-dbf-manifest.json` têm HTTP 200, 44.312 bytes, 513 registros e SHA-256 versionado. Foram usados os próprios arquivos locais do manifesto em `.orchestrator/runtime/camara-historical-dbf/`; os brutos não entram no snapshot Git.

## Resultado verificado

- 6 DBFs processados; 31 registros RS por arquivo; 186 linhas avaliadas.
- Cada arquivo produziu 19 correspondências únicas no snapshot, 10 nomes ausentes e 2 nomes ambíguos (`GIOVANI CHERINI` e `MARCEL VAN HATTEM`, duas entradas cada).
- Os 10 nomes ausentes recorrentes são: DANIEL TRZECIAK, DARCISIO PERONDI, GIOVANI FELTES, JERONIMO GOERGEN, LIZIANE BAYER, MARCIO BIOLCHI, MARLON SANTOS, NEREU CRISPIM, PAULO PIMENTA e SANTINI.
- PL 3723/2019: quatro votações em 2019-11-05 (`CD190396`–`CD190400`), com `NUMVOT` 9224–9227.
- PEC 6/2019: duas votações em 2019-08-07 (`CD190242` e `CD190244`), com `NUMVOT` 9002–9003.
- Valores observados incluem `SIM`, `NAO`, `OBSTRUCAO` e `\<------->`; não foram convertidos em eventos do portal.

## Decisão fail-closed

Nenhum registro foi vinculado por nome parcial, cargo, partido, número histórico ou proximidade textual. A reconciliação não fornece identidade TSE suficiente para os 10 ausentes nem para os 2 ambíguos; portanto o lote permanece bloqueado para importação factual. Também não há, nesta etapa, prova de proposição/evento remoto exato para materializar os DBFs.

## Próximo passo

Buscar, em fonte oficial da Câmara, o catálogo histórico/endpoint que relacione os `NUMVOT` 9002–9003 e 9224–9227 aos identificadores nominais e às proposições/eventos correspondentes. Só depois gerar envelope dry-run com URL, hash, data, proposição, identidade e voto exatos.

## Reconhecimento de fonte oficial

- Busca em fonte oficial localizou o índice `https://www.camara.leg.br/Internet/VotacaoDBF/pages/listavotacao5601.asp`, que referencia os DBFs da 56ª Legislatura e descreve `CD190242` como PEC 6/2019 — segundo turno e `CD190244` como requerimento de retirada de pauta.
- A ficha oficial da PEC 6/2019 (`https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2192459`) confirma a proposição e as sessões de 07/08/2019, mas não substitui a prova nominal individual.
- O fetch direto do índice neste ambiente falhou antes do HTTP por DNS (`Name or service not known`); a saída do scraper/web search não foi convertida em dado.

## Publicação

- Gates locais: 73 arquivos / 347 testes, TypeScript, schema, `data:check` (1003 candidaturas / 988 fotos), build e `git diff --check` passaram.
- Commit local: `fe58376` (`docs: registra reconciliacao offline dos DBFs`).
- Push bloqueado por DNS de `github.com`; duas tentativas retornaram `Could not resolve host: github.com`. Produção permaneceu verificável em HTTP 200, mas o commit ainda não está no remoto.
