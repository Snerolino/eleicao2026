-- Migration: 20260729_add_slug_to_candidates
-- Adiciona coluna slug para URLs amigáveis e lookups estáveis

-- 1. Adicionar coluna (sem constraints primeiro)
alter table candidates
  add column if not exists slug text;

-- 2. Popular slug baseado no nome (normalizado: minúsculo, sem acentos, underscores)
update candidates
set slug = lower(regexp_replace(regexp_replace(full_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '_', 'g'))
where slug is null or slug = '';

-- 3. Garantir unicidade para homônimos (adicionar sufixo numérico se necessário)
with ranked as (
  select
    id,
    slug,
    row_number() over (partition by slug order by full_name) as rn
  from candidates
)
update candidates c
set slug = r.slug || '_' || r.rn
from ranked r
where c.id = r.id and r.rn > 1;

-- 4. Tornar coluna NOT NULL e única (agora que todos têm valores distintos)
alter table candidates
  alter column slug set not null;

create unique index if not exists idx_candidates_slug on candidates(slug);

-- 5. Constraint de formato (apenas alfanumérico e underscore)
alter table candidates
  add constraint chk_candidates_slug_format
  check (slug ~ '^[a-z0-9_]+$');