# H5.2 — Estados honestos de carregamento e degradação

Data: 2026-07-31
Guia: Fase 5 — H5.2

## Objetivo

Diferenciar estados públicos sem esconder indisponibilidade de banco, ausência oficial, filtro sem resultado, fallback por snapshot e degradação de claims.

## Implementado

Arquivos principais:

- `src/pages/HomePage.tsx`
- `src/components/states/index.tsx`
- `src/services/candidates.ts`
- `src/pages/__tests__/HomePage.test.tsx`
- `src/services/__tests__/candidates.test.ts`

## Estados cobertos

- `loading`: skeleton com `role="status"` e `aria-live="polite"`.
- `fatal-error`: `role="alert"`, botão `Tentar novamente`, mensagem pública sem detalhes técnicos.
- `empty-official`: lista oficial vazia é exibida como ausência de candidatura oficial na fonte atual, não como erro de rede.
- `filtered-empty`: filtro sem resultado informa que nenhum candidato corresponde aos filtros atuais e permite limpar filtros.
- `degraded-claims`: falha em claims mostra aviso de editoria indisponível, mas mantém busca, CSV, comparação e navegação de candidatos.
- `fallback-offline/snapshot`: fallback pelo snapshot público exibe origem/escopo/data via `DataFreshness`.
- `success`: candidatos continuam agrupados por cargo e navegáveis por slug canônico.

## Diagnóstico técnico

`src/services/candidates.ts` agora mantém diagnóstico técnico de fallback em `getLastCandidatesFetchDiagnostic()`, sem expor detalhes técnicos na mensagem pública da Home.

Exemplo coberto por teste:

- Supabase candidates retorna 500 → app usa snapshot público versionado;
- `wasLastCandidatesFetchFromSnapshot()` retorna `true`;
- `getLastCandidatesFetchDiagnostic()` registra mensagem acionável.

## Testes

RED confirmado:

- fatal-error esperava mensagem honesta e falhou com texto genérico anterior;
- empty-official esperava estado diferenciado e falhou com “Nenhum candidato está disponível”;
- filtered-empty esperava texto de filtros atuais e falhou com texto genérico de busca;
- degraded-claims esperava `aria-label`/`aria-live` específico e falhou sem nome acessível;
- diagnóstico técnico esperava função exportada e falhou por inexistência.

Validações focadas:

```bash
npm run test -- src/pages/__tests__/HomePage.test.tsx src/services/__tests__/candidates.test.ts
```

## Critérios do Guia

- Cada estado possui mensagem e ação adequadas.
- Estados críticos usam `role="alert"` ou `role="status"` com `aria-live`.
- Filtro sem resultado permite limpar filtros.
- Degradação de claims não impede busca nem navegação.
- Mensagem pública não confunde lista vazia oficial com falha de rede.
- Operador tem diagnóstico acionável no serviço, separado da UI pública.

## Risco residual

A Home já diferencia estados essenciais. Quando houver painel editorial público, os estados de formulário/autosalvamento devem ser testados separadamente para não conflitar com mensagens públicas de consulta.
