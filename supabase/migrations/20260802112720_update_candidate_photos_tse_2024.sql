-- Atualiza fotos oficiais TSE 2024 para candidatos públicos 2026 enquanto o TSE 2026 não divulga fotos.
-- Fonte: https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip
-- Diretório oficial usado localmente: /home/lourenco/Projetos/dataset2026/foto_cand2024_RS_div
-- Matches conservadores: nome + partido; ambiguidades permanecem sem foto.

with photo_updates(tse_candidate_id, photo_url, photo_source_url) as (
  values
    ('210002533016', '/photos/tse-2024-rs/alini_artioli_de_souza_210002533016.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002532995', '/photos/tse-2024-rs/sandra_bonetto_210002532995.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002532991', '/photos/tse-2024-rs/emilia_mari_frare_210002532991.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002532989', '/photos/tse-2024-rs/tiago_jose_albrecht_210002532989.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533002', '/photos/tse-2024-rs/felipe_zortea_camozzato_210002533002.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533008', '/photos/tse-2024-rs/wagner_machado_bittencourt_210002533008.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533007', '/photos/tse-2024-rs/julia_bueno_zardo_210002533007.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002532993', '/photos/tse-2024-rs/milton_milan_210002532993.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533010', '/photos/tse-2024-rs/lara_prade_210002533010.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533009', '/photos/tse-2024-rs/eduardo_wartchow_210002533009.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002532994', '/photos/tse-2024-rs/rovani_peres_de_athayde_210002532994.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533056', '/photos/tse-2024-rs/ramiro_stallbaum_rosario_210002533056.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533035', '/photos/tse-2024-rs/carla_cristiane_hubner_duwe_210002533035.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533045', '/photos/tse-2024-rs/charles_luis_da_silva_oliveira_210002533045.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533057', '/photos/tse-2024-rs/claudia_de_freitas_peruzzato_210002533057.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533044', '/photos/tse-2024-rs/elicezio_brum_de_almeida_210002533044.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533036', '/photos/tse-2024-rs/marcos_alexandre_kayser_210002533036.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533051', '/photos/tse-2024-rs/emerson_dapper_cardoso_210002533051.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533061', '/photos/tse-2024-rs/matheus_schilling_nunes_210002533061.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533046', '/photos/tse-2024-rs/juelci_de_souza_210002533046.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533062', '/photos/tse-2024-rs/igor_dal_bo_210002533062.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533048', '/photos/tse-2024-rs/tiago_correia_bitencourt_210002533048.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533066', '/photos/tse-2024-rs/giuseppe_ricardo_meneghetti_riesgo_210002533066.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533052', '/photos/tse-2024-rs/luis_paulo_kayser_210002533052.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533065', '/photos/tse-2024-rs/camila_willemberg_210002533065.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533059', '/photos/tse-2024-rs/luciana_ortolan_corsetti_slaviero_210002533059.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533070', '/photos/tse-2024-rs/luciano_drum_de_almeida_210002533070.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534282', '/photos/tse-2024-rs/eliton_dos_santos_avila_210002534282.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534289', '/photos/tse-2024-rs/marciele_da_silveira_rosa_210002534289.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534286', '/photos/tse-2024-rs/vera_de_moura_freire_210002534286.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534297', '/photos/tse-2024-rs/levi_lorenzo_melo_210002534297.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534288', '/photos/tse-2024-rs/luciane_elisa_da_silva_bento_210002534288.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534291', '/photos/tse-2024-rs/antonio_elemar_de_oliveira_210002534291.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534283', '/photos/tse-2024-rs/iriel_dallacort_sachet_210002534283.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534296', '/photos/tse-2024-rs/jose_clemente_da_silva_correa_210002534296.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534327', '/photos/tse-2024-rs/giovane_luiz_de_lima_junior_210002534327.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534319', '/photos/tse-2024-rs/igor_peres_dummer_210002534319.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534332', '/photos/tse-2024-rs/marne_de_souza_210002534332.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534310', '/photos/tse-2024-rs/elanice_lambertes_muller_210002534310.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534337', '/photos/tse-2024-rs/ulberto_navarro_pereira_210002534337.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534308', '/photos/tse-2024-rs/adriano_guerra_strack_210002534308.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534318', '/photos/tse-2024-rs/uilson_moreira_droppa_210002534318.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534307', '/photos/tse-2024-rs/danubia_dos_santos_pereira_210002534307.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534347', '/photos/tse-2024-rs/paulo_remi_silveira_martins_210002534347.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534341', '/photos/tse-2024-rs/paulo_sergio_silva_pereira_210002534341.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534315', '/photos/tse-2024-rs/talis_romeu_pohren_ferreira_210002534315.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002534311', '/photos/tse-2024-rs/ademar_sarzi_sartori_210002534311.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533919', '/photos/tse-2024-rs/carlos_roberto_de_souza_robaina_210002533919.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533913', '/photos/tse-2024-rs/atena_beauvoir_roveda_210002533913.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533916', '/photos/tse-2024-rs/tamires_paveglio_210002533916.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533911', '/photos/tse-2024-rs/ederson_de_oliveira_rodrigues_210002533911.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533901', '/photos/tse-2024-rs/patricia_de_oliveira_rex_210002533901.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533912', '/photos/tse-2024-rs/jurandir_buchweitz_e_silva_210002533912.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533908', '/photos/tse-2024-rs/ingra_costa_e_silva_210002533908.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533923', '/photos/tse-2024-rs/almiro_rodrigo_gehrat_210002533923.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533920', '/photos/tse-2024-rs/vinicius_de_moraes_brasil_210002533920.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533918', '/photos/tse-2024-rs/paulo_brack_210002533918.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533937', '/photos/tse-2024-rs/danielle_dos_santos_kroeff_210002533937.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533933', '/photos/tse-2024-rs/vilmar_francisco_da_silva_210002533933.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533943', '/photos/tse-2024-rs/matheus_edemar_pereira_vicente_210002533943.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533941', '/photos/tse-2024-rs/fabiano_benites_210002533941.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533934', '/photos/tse-2024-rs/matheus_pereira_gomes_210002533934.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533929', '/photos/tse-2024-rs/pedro_homero_stein_210002533929.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533946', '/photos/tse-2024-rs/adriano_tadeu_hartmann_ricoldi_210002533946.jpeg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533931', '/photos/tse-2024-rs/karen_morais_dos_santos_210002533931.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533940', '/photos/tse-2024-rs/alice_carvalho_da_silva_dos_santos_210002533940.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533945', '/photos/tse-2024-rs/ivera_regina_soares_da_silva_210002533945.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533930', '/photos/tse-2024-rs/fernanda_pinto_miranda_210002533930.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533580', '/photos/tse-2024-rs/lucas_caregnato_210002533580.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533907', '/photos/tse-2024-rs/julio_alberto_braga_lopes_de_moura_210002533907.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533355', '/photos/tse-2024-rs/priscila_voigt_severiano_210002533355.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip'),
    ('210002533435', '/photos/tse-2024-rs/luciano_schafer_210002533435.jpg', 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip')
)
update public.candidates as c
set
  photo_url = u.photo_url,
  photo_source_url = u.photo_source_url
from photo_updates as u
where c.tse_candidate_id = u.tse_candidate_id
  and (
    c.photo_url is distinct from u.photo_url
    or c.photo_source_url is distinct from u.photo_source_url
  );
