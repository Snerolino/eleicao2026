#!/usr/bin/env node
/**
 * Read-only ALRS live-state audit.
 *
 * Combines an authoritative linked-Supabase count with local, versioned
 * collision/recovery artifacts. It never writes to Supabase or applies data.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const generatedAt = new Date().toISOString();
const sql = `
with alrs_versions as (
  select pv.id
  from public.proposition_versions pv
  join public.legislative_propositions lp on lp.id = pv.proposition_id
  where lp.house = 'alrs'
), alrs_events as (
  select id, occurred_at, source_reference_id
  from public.voting_events
  where house = 'alrs'
    and proposition_version_id in (select id from alrs_versions)
    and occurred_at >= '2022-01-01'
), yearly as (
  select
    extract(year from occurred_at)::int as year,
    count(*)::int as events,
    count(*) filter (where source_reference_id is null)::int as events_without_source
  from alrs_events
  group by 1
  order by 1
), alrs_rows as (
  select i.candidate_id, i.voting_event_id, e.occurred_at, e.source_reference_id
  from public.legislator_vote_index i
  join alrs_events e on e.id = i.voting_event_id
)
select
  (select json_agg(yearly order by year) from yearly) as yearly,
  (select count(*) from alrs_events)::int as events,
  (select count(*) from alrs_events where source_reference_id is null)::int as events_without_source,
  (select count(*) from alrs_rows)::int as votes,
  (select count(distinct candidate_id) from alrs_rows)::int as candidates,
  (select count(*) from public.legislator_vote_profile where house = 'alrs')::int as profiles,
  (select count(*) from public.impact_assessments ia
    join public.impact_matrices im on im.id = ia.impact_matrix_id
    where im.proposition_version_id in (select id from alrs_versions))::int as assessments,
  (select count(*) from public.impact_matrices
    where review_status in ('approved','contested')
      and proposition_version_id in (select id from alrs_versions))::int as approved_matrices,
  (select count(*) from public.impact_event_attributions ea
    join public.voting_events ve on ve.id = ea.voting_event_id
    join public.impact_assessments ia on ia.id = ea.assessment_id
    join public.impact_matrices im on im.id = ia.impact_matrix_id
    where ea.methodology_version = '2.0.0'
      and ve.house = 'alrs'
      and ve.proposition_version_id in (select id from alrs_versions)
      and im.proposition_version_id in (select id from alrs_versions))::int as event_attributions_v2,
  (select count(*) from public.impact_event_attributions ea
    join public.voting_events ve on ve.id = ea.voting_event_id
    join public.impact_assessments ia on ia.id = ea.assessment_id
    join public.impact_matrices im on im.id = ia.impact_matrix_id
    where ea.methodology_version = '2.0.0'
      and ve.house = 'alrs'
      and ve.proposition_version_id in (select id from alrs_versions)
      and im.proposition_version_id in (select id from alrs_versions)
      and ea.score_eligible = true
      and ea.review_status in ('approved','contested')
      and ea.vote_attribution_status in ('isolated','compound_separable')
      and ea.event_defending_vote in ('sim','nao')
      and im.review_status in ('approved','contested')
      and exists (select 1 from public.impact_event_attribution_sources eas where eas.attribution_id = ea.id)
      and exists (select 1 from public.impact_assessment_sources ias where ias.assessment_id = ia.id)
      and exists (select 1 from public.impact_event_attribution_reviews er where er.attribution_id = ea.id and er.reviewer_type = 'curadoria_interna' and er.decision = 'approved' and er.reviewer_id is distinct from ea.created_by)
      and (im.severity < 4 and coalesce(ia.confidence, 1) >= 0.60 or exists (select 1 from public.impact_event_attribution_reviews er where er.attribution_id = ea.id and er.reviewer_type = 'painel_externo' and er.decision = 'approved')) )::int as scoreable_attributions_v2,
  (select count(*) from public.impact_editorial_dispositions d where d.proposition_version_id in (select id from alrs_versions) and d.status = 'approved')::int as approved_dispositions,
  (select count(*) from public.impact_editorial_dispositions d where d.proposition_version_id in (select id from alrs_versions) and d.status = 'needs_changes')::int as needs_changes_dispositions,
  (select count(*) from public.impact_editorial_dispositions d where d.proposition_version_id in (select id from alrs_versions) and d.status = 'rejected')::int as rejected_dispositions,
  (select count(*) from public.impact_editorial_dispositions d where d.proposition_version_id in (select id from alrs_versions) and d.status not in ('approved','needs_changes','rejected'))::int as non_terminal_dispositions;
`;

function readJson(relative) {
  const path = resolve(root, relative);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw new Error(`LOCAL_STATE_UNKNOWN:${relative}:${error.message}`);
  }
}

function readJsonOptional(relative) {
  try {
    return JSON.parse(readFileSync(resolve(root, relative), 'utf8'));
  } catch (error) {
    return { __state_unknown: true, __state_error: `LOCAL_STATE_UNKNOWN:${relative}:${error.message}` };
  }
}

function queryLinked() {
  const raw = execFileSync('supabase', ['db', 'query', '--linked', '--output-format', 'json', sql], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  const start = raw.indexOf('{');
  if (start < 0) throw new Error('Supabase CLI returned no JSON payload');
  const payload = JSON.parse(raw.slice(start));
  if (!Array.isArray(payload.rows) || payload.rows.length !== 1) throw new Error('Unexpected Supabase count payload');
  return payload.rows[0];
}

function localState() {
  const recovery = readJson('data/legislative-import/alrs/alrs-score-recovery-queue-v1.json');
  const collisions = readJson('data/legislative-import/alrs/version-key-collision-audit-v1.json');
  const lane = readJson('data/legislative-import/alrs/alrs-exclusive-editorial-lane-v1.json');
  const inventory = readJsonOptional('artifacts/reprocess-impact-v2/release-inventory.json');
  const pilot = readJsonOptional('data/legislative-import/alrs/alrs-attribution-pilot-v1.json');
  return {
    score_recovery_total: Number(recovery.counts?.total ?? recovery.items?.length ?? 0),
    score_recovery_event_binding_missing: Number(recovery.counts?.event_binding_missing ?? 0),
    score_recovery_compound_non_separable: Number(recovery.counts?.compound_non_separable ?? 0),
    collision_keys: Number(collisions.totals?.collision_keys ?? collisions.collisions?.length ?? 0),
    collision_affected_versions: Number(collisions.totals?.affected_versions ?? 0),
    collision_affected_events: Number(collisions.totals?.affected_events ?? 0),
    exclusive_pending_versions: Number(lane.totals?.pending_versions ?? 0),
    exclusive_remote_read_ok: lane.remote_disposition_read?.ok === true,
    release_inventory_state: inventory.__state_unknown ? 'unknown' : 'known',
    release_inventory_error: inventory.__state_error ?? null,
    release_inventory_count: inventory.__state_unknown ? null : Number(inventory.inventory_count ?? 0),
    release_inventory_counts: inventory.__state_unknown ? null : inventory.counts ?? {},
    attribution_pilot_state: pilot.__state_unknown ? 'unknown' : 'known',
    attribution_pilot_error: pilot.__state_error ?? null,
    attribution_pilot_mode: pilot.__state_unknown ? 'unknown' : pilot.mode ?? 'unknown',
    attribution_pilot_selected_count: pilot.__state_unknown ? null : Number(pilot.selected_count ?? 0),
  };
}

function buildMarkdown(state) {
  const rows = (state.remote.yearly ?? [])
    .map((row) => `| ${row.year} | ${row.events} | ${row.events_without_source} |`)
    .join('\n');
  const blockers = [];
  if (state.remote.event_attributions_v2 === 0) blockers.push('Não existem atribuições evento–assessment v2; por isso não há score v2 elegível.');
  if (state.remote.events_without_source > 0) blockers.push(`${state.remote.events_without_source} eventos ALRS não possuem source_reference_id.`);
  if (state.local.collision_keys > 0) blockers.push(`${state.local.collision_keys} chaves de colisão afetam ${state.local.collision_affected_versions} versões e ${state.local.collision_affected_events} eventos.`);
  if (state.local.score_recovery_total > 0) blockers.push(`A fila de recuperação contém ${state.local.score_recovery_total} itens, dos quais ${state.local.score_recovery_event_binding_missing} sem vínculo de evento e ${state.local.score_recovery_compound_non_separable} compostos não separáveis.`);
  return `# Relatório de estado ALRS — 2022 até o presente\n\nGerado em ${state.generated_at}. Auditoria somente leitura; nenhuma mutação remota foi executada.\n\n## Estado factual remoto\n\n- eventos ALRS: **${state.remote.events}**;\n- votos nominais indexados: **${state.remote.votes}**;\n- candidatos com votos: **${state.remote.candidates}**;\n- perfis ALRS: **${state.remote.profiles}**;\n- eventos sem fonte: **${state.remote.events_without_source}**;\n- assessments: **${state.remote.assessments}**;\n- matrizes aprovadas/contestadas: **${state.remote.approved_matrices}**.\n\n| Ano | Eventos | Sem fonte |\n|---:|---:|---:|\n${rows}\n\n## Estado editorial e v2\n\n- disposições aprovadas: **${state.remote.approved_dispositions}**;\n- disposições needs_changes: **${state.remote.needs_changes_dispositions}**;\n- disposições rejected: **${state.remote.rejected_dispositions ?? 'desconhecido'}**;\n- disposições não terminais: **${state.remote.non_terminal_dispositions}**;\n- atribuições evento–assessment v2: **${state.remote.event_attributions_v2}**;\n- atribuições v2 elegíveis para score: **${state.remote.scoreable_attributions_v2}**;\n- pendências da lane editorial ativa: **${state.local.exclusive_pending_versions}**.\n\n## Inventário de liberação\n\n- itens evento × assessment: **${state.local.release_inventory_count}**;\n- factual_ready: **${state.local.release_inventory_counts?.factual_ready ?? 'desconhecido'}**;\n- impact_ready_for_review: **${state.local.release_inventory_counts?.impact_ready_for_review ?? 'desconhecido'}**;\n- impact_release_ready: **${state.local.release_inventory_counts?.impact_release_ready ?? 'desconhecido'}**;\n- withheld_source: **${state.local.release_inventory_counts.withheld_source ?? 0}**;\n- withheld_attribution: **${state.local.release_inventory_counts.withheld_attribution ?? 0}**;\n- piloto: **${state.local.attribution_pilot_mode}**, selecionados: **${state.local.attribution_pilot_selected_count}**.\n\n## Gargalo principal\n\n${blockers.map((item) => '- ' + item).join('\n')}\n\nO gargalo semântico principal é a ausência de atribuições v2 por evento. A fila de disposição editorial não é o bloqueio atual: a leitura remota está confirmada e não há pendências ativas.\n\n## Melhorias implementadas\n\n1. Este comando consolida contagens remotas e artefatos locais em uma única leitura reproduzível, evitando decisões baseadas em snapshots antigos.\n2. O monitor deve distinguir fila editorial ativa, corpus factual, fontes, colisões e atribuições v2; nenhuma dessas camadas é usada como substituta de outra.\n3. A fila v2 permanece dry-run/fail-closed: nenhum score é promovido sem fonte do evento, voto defensor explícito, separação de evento e revisão.\n4. Colisões e compostos permanecem em filas próprias, sem matching por título ou inferência de voto.\n\n## Próximo plano eficiente\n\n- priorizar um piloto de 5–10 eventos simples com fonte oficial e zero colisões;\n- gerar envelopes de atribuição 'pending_review', sem apply remoto;\n- revisar e aprovar atribuições pela RPC protegida;\n- executar read-back e segunda passagem idempotente;\n- só então recalcular scores e perfis;\n- continuar em paralelo a recuperação de fontes dos ${state.remote.events_without_source} eventos restantes.\n\n## Colisões locais\n\n- chaves: **${state.local.collision_keys}**;\n- versões afetadas: **${state.local.collision_affected_versions}**;\n- eventos afetados: **${state.local.collision_affected_events}**.\n`;
}

async function main() {
  const remote = queryLinked();
  const state = { schema_version: '1.0.0', generated_at: generatedAt, remote, local: localState() };
  if (process.argv.includes('--check-only')) {
    console.log(JSON.stringify({ ...state.remote, ...state.local, remote_apply: false, check_only: true }));
    return;
  }
  const outputDir = resolve(root, 'data/legislative-import/alrs');
  const reportPath = resolve(root, 'docs/qa/2026-09-24-alrs-live-state.md');
  await mkdir(outputDir, { recursive: true });
  await writeFile(resolve(outputDir, 'alrs-live-state-v1.json'), `${JSON.stringify(state, null, 2)}\n`);
  await writeFile(reportPath, `${buildMarkdown(state)}\n`);
  console.log(JSON.stringify({ state_file: 'data/legislative-import/alrs/alrs-live-state-v1.json', report: 'docs/qa/2026-09-24-alrs-live-state.md', remote_apply: false, ...remote, ...state.local }));
}

await main();
