#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const apply = process.argv.includes('--apply');
const envPath = resolve(root, '.env.local');
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const i = line.indexOf('=');
    if (i > 0 && !line.trim().startsWith('#')) process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
}
const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const stateFile = resolve(process.env.XDG_STATE_HOME || resolve(homedir(), '.local', 'state'), 'eleicao2026/supabase-editor-session.json');
const items = [
  {
    official_match_key: 'PL-43-2019',
    proposition_version_id: 'ebc01302-3211-487b-b1bb-6d515936b2e0',
    source_content_hash: 'ebc04a7532cb14148f388c68ba5be074d1b2970bb240a25e133ef539e0d06752',
    severity: 2,
    structural_type: 'structural',
    group_slug: 'mulheres',
    impact_direction: 'positive',
    defending_vote: 'sim',
    confidence: 0.9,
    rationale: 'A proposição cria obrigação de divulgação do Disque 180 em placas informativas, ampliando o acesso de mulheres a canal oficial de denúncia e atendimento. A classificação é positiva para mulheres, com voto defensor sim e fonte substantiva oficial preservada.',
  },
  {
    official_match_key: 'PL-27-2024',
    proposition_version_id: '338e6d1b-c0e7-4d0a-96af-6870bd8cd642',
    source_content_hash: '0db0ec65bfc15d66b96d6a3aa3728fa24b65199502843346e00eecd5ebca8d9d',
    severity: 3,
    structural_type: 'structural',
    group_slug: 'lgbtqia',
    impact_direction: 'positive',
    defending_vote: 'sim',
    confidence: 0.99,
    rationale: 'A proposição reconhece juridicamente a identidade de gênero de pessoas trans, travestis e não binárias após a morte, garantindo nome social e respeito à expressão pessoal em documentos e cerimônias fúnebres; o voto favorável protege diretamente dignidade e reconhecimento desse grupo.',
  },
];
if (!apply) {
  console.log(JSON.stringify({ apply: false, items: items.length, remote_apply: false, status: 'dry_run_validated' }));
  process.exit(0);
}
if (!url || !key || !existsSync(stateFile)) throw new Error('URL/chave pública ou sessão Auth ausente');
const session = JSON.parse(readFileSync(stateFile, 'utf8'));
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: auth, error: authError } = await sb.auth.setSession({ access_token: session.access_token, refresh_token: session.refresh_token });
if (authError || !auth.user) throw new Error(`sessão Auth inválida: ${authError?.message ?? 'usuário ausente'}`);
const { data: role, error: roleError } = await sb.from('editor_roles').select('role').eq('user_id', auth.user.id).maybeSingle();
if (roleError || !role || !['editor', 'admin'].includes(role.role)) throw new Error('sessão sem papel editor/admin');
const results = [];
for (const item of items) {
  const { data, error } = await sb.rpc('record_impact_assessment_draft', {
    p_proposition_version_id: item.proposition_version_id,
    p_methodology_version: '1.0.0',
    p_severity: item.severity,
    p_structural_type: item.structural_type,
    p_group_slug: item.group_slug,
    p_impact_direction: item.impact_direction,
    p_defending_vote: item.defending_vote,
    p_confidence: item.confidence,
    p_rationale: item.rationale,
    p_source_content_hash: item.source_content_hash,
  });
  if (error) throw new Error(`${item.official_match_key}: ${error.message}`);
  results.push({ item: item.official_match_key, data });
}
const ids = items.map((item) => item.proposition_version_id);
const { data: readBack, error: readBackError } = await sb.from('impact_matrices').select('id, proposition_version_id, methodology_version, review_status, generated_by_ai').in('proposition_version_id', ids);
if (readBackError) throw new Error(`read-back falhou: ${readBackError.message}`);
const exact = readBack.length === items.length && readBack.every((row) => ['pending_review', 'approved'].includes(row.review_status) && row.generated_by_ai === false);
if (!exact) throw new Error(`read-back divergente: ${JSON.stringify(readBack)}`);
console.log(JSON.stringify({ apply: true, remote_apply: true, user_id: auth.user.id, role: role.role, applied_assessments: results.length, matrices_read_back: readBack.length, statuses: readBack.map((row) => ({ proposition_version_id: row.proposition_version_id, review_status: row.review_status })), exact: exact, note: 'Matrizes já aprovadas não foram rebaixadas ou duplicadas.' , results }));
