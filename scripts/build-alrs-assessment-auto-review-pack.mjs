#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'data/legislative-import/alrs/impact-assessment-auto-review-pack-v1.json');
function loadEnv(file) { if (!existsSync(file)) return; for (const line of readFileSync(file, 'utf8').split('\n')) { const t = line.trim(); const i = t.indexOf('='); if (i > 0 && !t.startsWith('#')) process.env[t.slice(0, i).trim()] ??= t.slice(i + 1).trim().replace(/^["']|["']$/g, ''); } }
loadEnv(resolve(root, '.env.local'));
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const state = resolve(process.env.XDG_STATE_HOME || resolve(homedir(), '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
if (!url || !key || !existsSync(state)) throw new Error('URL/chave pública ou sessão Auth ausente');
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const session = JSON.parse(readFileSync(state, 'utf8'));
const { data: auth, error: authError } = await sb.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
if (authError || !auth.user) throw new Error(authError?.message || 'sessão Auth inválida');
const { data: dispositions, error } = await sb.from('impact_editorial_dispositions').select('proposition_version_id,methodology_version,review_key,title,proposition_versions(version_key,legislative_propositions(external_id,house,title))').eq('disposition', 'assess').eq('status', 'approved');
if (error) throw error;
const sources = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/alrs/alrs-substantive-source-manifest-v1.json'), 'utf8')).items ?? {};
function infer(title) {
  const text = title.toLowerCase();
  if (/feminic|mulher|violên.*mulher|maternidade|disque 180|parto|violência doméstica/.test(text)) return { group_slug: 'mulheres', severity: /feminic|violên|segurança|vida/.test(text) ? 3 : 2 };
  if (/lgbt|nome social|transgên|travesti|homofob|transfob/.test(text)) return { group_slug: 'lgbtqia', severity: 3 };
  if (/deficiên|acessibil|autism|pcd|braille|libras|mobilidade reduzida/.test(text)) return { group_slug: 'pessoas_com_deficiencia', severity: 3 };
  if (/criança|adolescente|órf|acolhimento institucional|primeira infância/.test(text)) return { group_slug: 'criancas_adolescentes_vulnerabilidade', severity: 3 };
  if (/indígen|quilomb|igualdade racial|população negra/.test(text)) return { group_slug: /indígen/.test(text) ? 'povos_indigenas' : /quilomb/.test(text) ? 'comunidades_quilombolas' : 'populacao_negra_periferica', severity: 3 };
  return null;
}
const items = [];
for (const disposition of dispositions ?? []) {
  const lp = disposition.proposition_versions?.legislative_propositions;
  const source = sources[disposition.proposition_version_id];
  const inferred = infer(lp?.title ?? disposition.title);
  if (!lp || !source || source.durability_gate !== 'green' || !inferred) continue;
  items.push({ proposition_version_id: disposition.proposition_version_id, review_key: disposition.review_key, external_id: lp.external_id, title: lp.title, source_url: source.proposition_page, source_content_hash: source.document_sha256, group_slug: inferred.group_slug, impact_direction: 'positive', defending_vote: 'sim', severity: inferred.severity, structural_type: 'structural', confidence: 0.9, rationale: `A versão oficial descreve medida diretamente relacionada a ${inferred.group_slug.replaceAll('_', ' ')}, com fonte substantiva preservada e decisão editorial assess aprovada.`, review_status: 'pending_review', human_review_required: true, remote_apply: false });
}
const result = { schema_version: '1.0.0', packet_type: 'alrs_impact_assessment_auto_review_pack', methodology_version: '1.0.0', remote_apply: false, public_approval: false, totals: { approved_assess_dispositions: dispositions?.length ?? 0, drafts: items.length, not_ready: (dispositions?.length ?? 0) - items.length }, items };
writeFileSync(output, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ output, ...result.totals }));
