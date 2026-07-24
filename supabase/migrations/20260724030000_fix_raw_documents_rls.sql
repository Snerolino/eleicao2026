-- Permitir leitura pública de raw_documents para que a anon key consiga
-- resolver a relação claims -> raw_documents nos joins do frontend.
-- Os dados são apenas textos de fontes públicas (TSE, imprensa, etc.),
-- sem informações sensíveis — não há risco de exposição.
-- A política anterior (service_role only) impedia o Supabase REST API
-- de resolver o join candidates -> claims -> raw_documents com a anon key,
-- fazendo o frontend exibir "Fonte não informada" mesmo com dados no banco.
create policy "raw_documents_public_read" on raw_documents
  for select using (true);