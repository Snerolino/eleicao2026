# QA — carry-forward 001 corrigido

**Data:** 2026-08-24

## Remoção procedural

O item foi removido:

```text
f209f023-b385-4975-b59e-02d33a91fcdc
```

Motivo: UUID corresponde à preferência procedural do PL 172/2026, não à versão substantiva da LDO 2027.

A versão substantiva:

```text
e297c2d0-84d6-4053-b42f-51e6450673d0
```

já está no Supabase como:

```text
no_direct_population_group / approved
```

## Carry-forward atual

```text
items=2
batch_sha256=820db6ccd666c3d02a2b37dcd935543e53d62e5e3a4def25593b026dfd963b11
```

Itens:

```text
PEC 302/2025 → no_direct_population_group
PL 432/2023 → taxonomy_gap
```

Nenhuma fonte, assessment ou matriz foi reaberta.

## Contrato

`needs_changes` agora exige explicitamente:

```text
disposition
aquisição notes >= 20 caracteres
```

A aplicação continua exclusivamente pelo `/admin`, com RPC autenticada.
