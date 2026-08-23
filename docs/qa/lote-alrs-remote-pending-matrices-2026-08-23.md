# QA — aplicação remota de matrizes ALRS em pending_review

**Data:** 2026-08-23

## Resultado remoto

Aplicação idempotente autorizada executada para o pacote editorial:

```text
12 matrizes criadas/localizadas
14 assessments criados/localizados
14 vínculos de fonte
12 curadorias internas approved
5 revisões painel_externo approved
```

Estado remoto verificado:

```text
12 matrizes novas: pending_review
0 matrizes novas: approved
0 score ALRS novo publicado
```

As duas matrizes `approved` observadas na contagem global são matrizes Câmara
anteriores e não fazem parte deste lote ALRS.

## Gate restante

A RPC `approve_impact_matrix` exige `auth.uid()` autenticado com papel editor.
A chamada service-role foi recusada corretamente com:

```text
42501 editor role required
```

Isso confirma o hardening. Não foi criado usuário, não foi inventado reviewer_id
e não foi feito bypass direto por UPDATE.

A aprovação final exige sessão autenticada de editor para:

- chamar a RPC nas 12 matrizes;
- validar o gate externo nas 5 severity 4;
- recalcular/verificar scores públicos.
