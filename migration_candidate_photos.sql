alter table candidates add column if not exists photo_url text;
alter table candidates add column if not exists photo_source_url text;

-- Convenção: o resumo curto do candidato é uma claim comum, category = 'summary'.
-- Isso faz o resumo herdar automaticamente fonte, score e status de publicação
-- do mesmo pipeline usado pelas demais categorias — nenhum campo "solto" sem proveniência.
comment on column candidates.photo_url is 'URL da foto do candidato — priorizar fonte oficial (TSE) quando disponível';
comment on column candidates.photo_source_url is 'URL da página/fonte que credita a foto — exibida no card como "fonte da foto"';
