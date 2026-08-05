-- Rewrite claim pending_review do Paulo Pimenta: converte JSON cru do agente de coleta em texto legível de dossiê.
-- Não publica; apenas melhora a legibilidade do conteúdo da claim em análise no /admin.

update public.claims
   set content = 'Paulo Roberto Severo Pimenta foi eleito deputado federal pelo Rio Grande do Sul nas eleições de 2022, como titular eleito por quociente partidário (QP), com 223.109 votos (3,62% dos votos válidos), pelo PT. Em 2026, disputa uma vaga ao Senado Federal pelo PT/RS. Fonte: resultado oficial das eleições de 2022 (TSE).'
 where id = '23ad4051-7b3c-4637-96a7-541738d6bf81'
   and category = 'historico_politico'
   and status = 'pending_review'
   and content like '{%' ;