# QA — Autoria Câmara 1401–1425 — 2026-09-02

## Objetivo
Processar o microbatch de 25 projetos únicos de autoria da Câmara em duas lanes read-only, sem converter autoria em voto, impacto ou score.

## Entrega verificada
- Seleção determinística: 25 projetos únicos, 100 ocorrências candidato–projeto e 22 candidatos únicos; IDs preservados exatamente.
- Lane causal: Antigravity retornou JSON inválido por comentário HTML dentro do array; saída rejeitada na camada cli/formato. Fallback Codex MCP Luna forneceu 25/25 IDs exatos, todos withheld, score_eligible=false, sem versão/evento.
- Lane red-team: Antigravity retornou array JSON válido com 25/25 IDs exatos; todos withheld, risco high.
- Reconciliação independente: 25 itens, 0 divergências de cardinalidade/IDs, 0 aprovados, 0 pending_review, 25 withheld e 0 score_eligible.
- Artefato: data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-1401-1425-reconciled.json.

## Estado dos dados
- Checkpoint: projects_analyzed=1425, approved=0, pending_review=0, withheld=1425, próximo 1426-1450.
- Nenhum authored_projects, claim, voto, score, matriz, Supabase ou Cloudflare factual foi escrito.
- Os três artefatos impact-editorial previamente modificados permaneceram intocados.

## Bloqueios reais
- Antigravity causal falhou na camada de formato por comentário HTML em JSON; a saída não foi promovida.
- Todos os projetos continuam retidos: autoria não equivale a voto e falta a cadeia verificável fonte oficial → texto → versão/evento nominal → efeito.
- O script de construção de fila regenerou o manifesto de fila a partir do manifesto factual amplo; os arquivos de revisão do microbatch foram gerados separadamente e a fila factual não foi publicada.

## Próximo passo
Retomar 1426–1450 com heartbeat, seleção determinística e duas lanes read-only; usar fallback após falha de formato sem repetir o provider bloqueado no mesmo tick e manter fail-closed.
