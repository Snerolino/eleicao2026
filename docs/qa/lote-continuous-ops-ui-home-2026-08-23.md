# QA — lote continuous ops UI Home — 2026-08-23

## Objetivo

Verificar a alteração local da Home para navegação por cargo, visualização compacta/detalhada, candidatos salvos e paginação incremental, preservando a coleção pública e os gates de fonte.

## Entregue e verificado

- `HomePage` agora mantém o resumo inicial por cargo e expõe a navegação `Todos` para abrir a coleção completa.
- A navegação por cargo e o botão `Ver candidatos` entram efetivamente no modo de lista.
- O smoke local foi adaptado para validar a UX real: abre `Todos`, carrega os lotes de 60 e usa o título visível do card para abrir o dossiê.
- Smoke local verde: `1002` cards visíveis, mínimo `1002`, busca `ADEMAR` com `2` cards, dossiê `JÚLIA BUENO ZARDO`, URL canônica por slug, offline verde, `0` falhas HTTP e `0` erros de console online.
- Build verde com Node `v24.19.0`: `232` módulos transformados; sitemap `1003 candidatos + 2 estáticas = 1005 URLs`; `release.json` gerado localmente.
- TypeScript, schema, `data:check` e `git diff --check` verdes.
- Teste focado `src/pages/__tests__/HomePage.test.tsx`: `12/12` verde.

## Estado dos dados e produção

- Snapshot público: `1003` candidaturas, `988` fotos oficiais, `1` fonte TSE.
- Auditoria legislativa permanece fail-closed nos gaps conhecidos; nenhum voto sem fonte foi promovido.
- Produção atualizada para o redesign no commit `522c1a062d3ae09aecd3b6347761a7652664beba`; release `0.2.977`; raiz HTTP 200.
- Nenhuma identidade, FK, voto, claim, assessment, matriz ou schema Supabase foi alterado pelo redesign.

## Bloqueios

- O workflow primário terminou com falha após o build, mas o backup `334951434` concluiu com sucesso e a release em produção corresponde ao commit `522c1a0`.
- O aviso de bundle acima de 500 kB permanece conhecido e não bloqueante.

## Próximo passo

Coletar feedback visual em 320/390/768/1280 px e corrigir somente achados concretos. Manter a cadência editorial e os dados legislativos em paralelo.
