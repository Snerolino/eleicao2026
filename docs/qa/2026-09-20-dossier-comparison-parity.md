# Paridade entre dossiê e comparação

Correção de apresentação e identidade, sem reescrever snapshots, votos ou assessments.

## Causas identificadas

- Dossiê substituía resultados do serviço por `candidate.category_scores` quando o snapshot tinha mais avaliações, inclusive sobre resultados não avaliados.
- Identidade TSE/pública e identidade UUID remota podiam levar a caminhos diferentes de fallback.
- O serviço decidia fallback com base na cobertura total dos candidatos consultados, tornando a seleção de pares relevante ao resultado individual.

## Correção

- Dossiê apenas filtra por casa o resultado do serviço compartilhado.
- Identificador TSE é normalizado para o ID público no serviço.
- Chamadas com vários candidatos são decompostas em cálculos individuais.
- Não houve nova associação por título, remoção de dados ou alteração editorial.

## Evidência local

- Regressões de página reproduziram o bug antes da mudança: dois testes falharam; após a mudança os três testes passaram.
- Suíte completa: 522 testes em 125 arquivos; TypeScript e build aprovados.
- `node scripts/check-dossier-comparison-parity.mjs`: consulta ambas as telas reais, expande a tabela e compara rótulos acessíveis com score/contagem; Matheus, 21 categorias de cada lado, zero divergências.
- Trabalhadores formais retornou -1,00 / 1 item em ambos os caminhos nesta execução. Este teste demonstra igualdade entre telas, não revalidação editorial da matéria.
- Smoke local: 1002 cards, zero falhas HTTP e zero erros online.

## Limites

A igualdade foi testada no navegador para Matheus com Fernanda como segundo candidato; não é auditoria editorial completa de todos os candidatos. A política de fallback do serviço e a proveniência dos vínculos publicados anteriormente permanecem objeto de auditoria separada. Nenhum novo score foi aprovado por esta alteração.
