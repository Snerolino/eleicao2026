#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
function loadEnv(file) { if (!existsSync(file)) return; for (const line of readFileSync(file, 'utf8').split('\n')) { const t=line.trim(); const i=t.indexOf('='); if (i>0 && !t.startsWith('#')) process.env[t.slice(0,i).trim()] ??= t.slice(i+1).trim().replace(/^["']|["']$/g,''); } }
loadEnv(resolve(root, '.env.local'));
const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL; const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY;
const stateFile=resolve(process.env.XDG_STATE_HOME||resolve(homedir(),'.local','state'),'eleicao2026/supabase-editor-session.json');
const manifest=JSON.parse(readFileSync(resolve(root,'data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json'),'utf8'));
const targetTse=new Set(['210002534036','210002537886','210002534313']); const rows=[];
for (const page of manifest.pages ?? []) for (const item of page.items ?? []) if (String(item.tipoProjeto).trim()==='VT' && Number(item.numProposicao)===599 && Number(item.anoProposicao)===2023) {
  const match=manifest.catalog.find((entry)=>entry.solicitante_id===page.solicitante_id)?.exact_candidate_matches?.[0];
  if (match && targetTse.has(match.tse_candidate_id) && !rows.some((row)=>row.candidate_tse_id===match.tse_candidate_id)) rows.push({candidate_tse_id:match.tse_candidate_id,source_url:page.url,source_sha256:page.sha256,title:item.materia,number:599,year:2023,external_id:'VT 599/2023',version_key:'veto-total-2026-08-25',effective_from:'2026-08-25T00:00:00Z'});
}
if (!url || !key || !existsSync(stateFile)) throw new Error('URL/key publica ou sessão Auth ausente');
const session=JSON.parse(readFileSync(stateFile,'utf8')); const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}); const {data:auth,error}=await sb.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token}); if(error||!auth.user) throw new Error(error?.message||'sessão inválida');
const {data:role,error:roleError}=await sb.from('editor_roles').select('role').eq('user_id',auth.user.id).maybeSingle(); if(roleError||!role||!['editor','admin'].includes(role.role)) throw new Error('papel editor/admin ausente');
const {data:versions,error:rpcError}=await sb.rpc('ensure_alrs_nominal_proposition_version',{p_rows:rows}); if(rpcError) throw rpcError;
console.log(JSON.stringify({remote_apply:true,user_id:auth.user.id,role:role.role,rows_sent:rows.length,versions},null,2));
