# QA — correção de leitura editorial no `/admin`

**Data:** 2026-08-23

## Diagnóstico

O login administrativo funcionava, mas o painel mostrava nenhuma matriz porque as
policies públicas de `impact_matrices`, `impact_assessments` e
`impact_assessment_sources` só permitiam `approved/contested`.

## Correção remota

Migration aplicada:

```text
20260823100000_allow_editor_pending_matrix_read.sql
```

Policies verificadas no Supabase:

```text
impact_matrices_editor_read
impact_assessments_editor_read
impact_assessment_sources_editor_read
```

Todas para `authenticated`, condicionadas a `has_editor_role(auth.uid())`.

O banco mantém:

```text
12 matrizes pending_review
14 assessments
5 revisões externas
```

## Uso

1. abrir `https://rs.votopraquem.org/admin`;
2. sair e entrar novamente, ou recarregar a sessão;
3. abrir “Matrizes de impacto pendentes”;
4. usar “Aprovar matriz via RPC”.

A aprovação continua passando por `approve_impact_matrix`; nenhuma policy permite
UPDATE direto para `approved`.
