insert into source_references (source_name, source_category, url, title, content_hash) values
('Câmara dos Deputados — Dados Abertos', 'oficial', 'https://dadosabertos.camara.leg.br/api/v2/proposicoes/2580259', 'PLP 230/2025 — Proposição 2580259', 'sha256:d7ae8159cf6f0e238f5d1b88ffa438383f8db99fe4380968e81806a317472a25'),
('Câmara dos Deputados — Dados Abertos', 'oficial', 'https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24', 'PLP 230/2025 — Votação 2580259-24', 'sha256:f0a77d919b46f801fb4fe86bd9900c93fd0d6317c31326f48579c1beccddc112'),
('Câmara dos Deputados — Dados Abertos', 'oficial', 'https://dadosabertos.camara.leg.br/api/v2/votacoes/2580259-24/votos', 'PLP 230/2025 — Votação 2580259-24 — Votos nominais', 'sha256:3dd6bb755324f51e652058147b5354eb433e53884c3bd4460401f0836a372531'),
('Câmara dos Deputados — Inteiro Teor', 'oficial', 'https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=3170169', 'PLP 230/2025 — Substitutivo 1 PLEN — Inteiro teor', 'sha256:f40a924f3eb603a307d8a7436b33713fd267cf335594b054e128162962417b5c')
on conflict (content_hash) do update set
  source_name = excluded.source_name,
  source_category = excluded.source_category,
  url = excluded.url,
  title = excluded.title
returning id, content_hash;
