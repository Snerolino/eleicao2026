#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';

const root = resolve(import.meta.dirname, '..');
const pageSize = 1000;
const apply = process.argv.includes('--apply');
function loadEnv(file) { if (!existsSync(file)) return; for (const line of readFileSync(file, 'utf8').split('\n')) { const t=line.trim(); const i=t.indexOf('='); if (i>0 && !t.startsWith('#')) process.env[t.slice(0,i).trim()] ??= t.slice(i+1).trim().replace(/^["']|["']$/g,''); } }
loadEnv(resolve(root, '.env.local'));
const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL; const key=process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY obrigatórios');
const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
if(apply){const stateFile=resolve(process.env.XDG_STATE_HOME||resolve(homedir(),'.local','state'),'eleicao2026/supabase-editor-session.json');if(!existsSync(stateFile))throw new Error(`sessão Auth ausente: ${stateFile}`);const session=JSON.parse(readFileSync(stateFile,'utf8'));const {data:auth,error:authError}=await sb.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token});if(authError||!auth.user)throw new Error(`sessão Auth inválida: ${authError?.message??'usuário ausente'}`);const {data:role,error:roleError}=await sb.from('editor_roles').select('role').eq('user_id',auth.user.id).maybeSingle();if(roleError||!role||!['editor','admin'].includes(role.role))throw new Error('sessão sem papel editor/admin');}
async function fetchAll(select, table='legislative_votes') {
  const { count, error: countError } = await sb.from(table).select('*',{count:'exact',head:true}); if(countError) throw countError;
  const ranges=Array.from({length:Math.ceil((count??0)/pageSize)},(_,i)=>[i*pageSize,i*pageSize+pageSize-1]);
  const pages=await Promise.all(ranges.map(async([from,to])=>{const {data,error}=await sb.from(table).select(select).range(from,to);if(error)throw error;return data??[];})); return pages.flat();
}
const votes=await fetchAll('candidate_id,value,voting_events!inner(id,house)');
const relevant=votes.filter((v)=>v.candidate_id && v.voting_events?.house);
const indexRows=relevant.map((v)=>({candidate_id:v.candidate_id,voting_event_id:v.voting_events.id??null,value:v.value,direction:v.value==='sim'?1:v.value==='nao'?-1:0})).filter((v)=>v.voting_event_id);
async function upsertChunks(table, rows, onConflict) {
  let written = 0;
  for (let offset = 0; offset < rows.length; offset += 500) {
    const { error } = await sb.from(table).upsert(rows.slice(offset, offset + 500), { onConflict });
    if (error) throw new Error(`${table} chunk ${offset}-${Math.min(offset + 500, rows.length)}: ${error.message}`);
    written += Math.min(500, rows.length - offset);
  }
  return written;
}
const grouped=new Map(); for(const v of relevant){const house=v.voting_events.house;const k=`${v.candidate_id}|${house}`;const g=grouped.get(k)??{candidate_id:v.candidate_id,house,total_votes:0,votos_sim:0,votos_nao:0,votos_abstencao:0,votos_ausente:0,votos_obstrucao:0};g.total_votes++;g[`votos_${v.value}`]++;grouped.set(k,g);}
const profileRows=[...grouped.values()].map((r)=>({...r,profile_score:(r.votos_sim-r.votos_nao)/Math.max(r.total_votes,1)}));
const report={schema_version:'1.0.0',packet_type:'legislator_vote_profile_materialization',mode:apply?'apply':'dry-run',remote_apply:false,votes:relevant.length,index_rows:indexRows.length,profile_rows:profileRows.length};
if(apply){report.index_rows_written=await upsertChunks('legislator_vote_index',indexRows,'candidate_id,voting_event_id');report.profile_rows_written=await upsertChunks('legislator_vote_profile',profileRows,'candidate_id,house');report.remote_apply=true;}
console.log(JSON.stringify(report));
