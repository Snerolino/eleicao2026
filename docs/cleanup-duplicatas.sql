-- cleanup-duplicatas.sql
-- Remove os candidatos duplicados criados pelo seed-completo.sql
-- (o `on conflict (tse_candidate_id)` não funcionou porque o campo é null)

-- 1. Primeiro, ver quantos candidatos existem com cada nome:
select full_name, party, position, count(*) as duplicates
from candidates
group by full_name, party, position
having count(*) > 1;

-- 2. Deletar os registros duplicados (os que têm os UUIDs mais recentes)
--    As claims estão vinculadas aos UUIDs ORIGINAIS, então não perdem referência.
delete from candidates where id in (
  '6bb03294-0b42-4c97-aa26-be600487d68c',  -- Juliana Brizola (duplicado)
  '0cbe10f0-2ad1-4934-bf34-42de661c9e78',  -- Gabriel Souza (duplicado)
  '4fdda8ae-2b32-4592-98ef-34ee75479700',  -- Luciano Zucco (duplicado)
  'a9b67915-628d-4c48-a4f2-29a278d7885e',  -- Beto Albuquerque (duplicado)
  '0e519107-f838-4318-b353-30b687242146'   -- Ana Amélia Lemos (duplicado)
);

-- 3. Verificar resultado: total por posição
select c.position, count(*) as candidatos, count(cl.id) as claims
from candidates c
left join claims cl on cl.candidate_id = c.id and cl.status = 'published'
group by c.position
order by c.position;
