#!/usr/bin/env node
/** Backfill idempotente das fontes dos votos ALRS usando o manifesto oficial atual. */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const root = resolve(import.meta.dirname, '..');
const manifestFile = resolve(root, 'data/legislative-import/alrs/alrs-nominal-discovery-manifest-v1.json');
const output = resolve(root, 'data/legislative-import/alrs/alrs-missing-sources-backfill-v1.json');
const apply = process.argv.includes('--apply');
function loadEnv(file) { if (!existsSync(file)) return; for (const line of readFileSync(file, 'utf8').split('\n')) { const text=line.trim(); const i=text.indexOf('='); if(i>0&&!text.startsWith('#')) process.env[text.slice(0,i).trim()] ??= text.slice(i+1).trim().replace(/^["']|["']$/g,''); } }
loadEnv(resolve(root,'.env.local'));
const url=process.env.SUPABASE_URL||process.env.VITE_SUPABASE_URL;
const writerKey=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
const key=writerKey||process.env.SUPABASE_PUBLISHABLE_KEY||process.env.VITE_SUPABASE_ANON_KEY;
if(!url||!key) throw new Error('credencial Supabase ausente');
if(apply && !writerKey) throw new Error('credencial Supabase de writer ausente para --apply');
const sb=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
async function all(table,select,build=(q)=>q){const rows=[];for(let from=0;;from+=1000){const {data,error}=await build(sb.from(table).select(select)).range(from,from+999);if(error)throw error;rows.push(...(data??[]));if((data??[]).length<1000)return rows;}}
function date(v){const m=String(v??'').match(/^(\d{2})\/(\d{2})\/(\d{4})/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(v).slice(0,10);}
function value(v){return ({Sim:'sim','Não':'nao',Abstenção:'abstencao',Ausente:'ausente',Obstrução:'obstrucao'})[String(v).trim()]??null;}
function type(v){const t=String(v??'').toLowerCase();return t.includes('pec')?'pec':t.includes('pl')?'pl':'outro';}
const manifest=JSON.parse(readFileSync(manifestFile,'utf8'));
const pagesByTse=new Map();
for(const row of manifest.catalog??[]){if(row.exact_candidate_matches?.length===1)pagesByTse.set(String(row.exact_candidate_matches[0].tse_candidate_id),manifest.pages.filter(p=>p.solicitante_id===row.solicitante_id));}
const candidates=await all('candidates','id,tse_candidate_id');
const candidatesById=new Map(candidates.map(x=>[x.id,String(x.tse_candidate_id)]));
const events=await all('voting_events','id,proposition_version_id,occurred_at,house,source_reference_id',(q)=>q.eq('house','alrs'));
const versions=await all('proposition_versions','id,proposition_id,legislative_propositions!inner(house,proposition_type,number,year,title)',(q)=>q.eq('legislative_propositions.house','alrs'));
const versionById=new Map(versions.map(x=>[x.id,{...x.legislative_propositions,id:x.id}]));
const missingVotes=await all('legislative_votes','id,voting_event_id,candidate_id,value,recorded_at,source_reference_id',(q)=>q.is('source_reference_id',null));
const eventsById=new Map(events.map(x=>[x.id,x]));
const plan=[]; const blocked=[];
for(const vote of missingVotes){const event=eventsById.get(vote.voting_event_id);if(!event)continue;const version=versionById.get(event.proposition_version_id);if(!version)continue;const tse=candidatesById.get(vote.candidate_id);const pages=pagesByTse.get(tse)??[];const sourceRows=pages.flatMap(p=>(p.items??[]).map(item=>({...item,page:p}))).filter(item=>type(item.tipoProjeto)===String(version.proposition_type).toLowerCase()&&Number(item.numProposicao)===Number(version.number)&&Number(item.anoProposicao)===Number(version.year)&&date(item.dataVotacao)===date(event.occurred_at)&&value(item.voto)===vote.value);
 if(sourceRows.length!==1){blocked.push({vote_id:vote.id,tse_candidate_id:tse,proposition_number:version.number,proposition_year:version.year,occurred_at:event.occurred_at,value:vote.value,reason:`expected_one_official_match_got_${sourceRows.length}`});continue;}
 const s=sourceRows[0].page;const body=JSON.stringify(s.items);plan.push({vote_id:vote.id,tse_candidate_id:tse,source_url:s.url,source_hash:`sha256:${s.sha256}`,source_bytes:s.bytes,source_name:'Portal da Transparência ALRS — Votos em Plenário'});
}
const unique=[...new Map(plan.map(x=>[x.source_url,x])).values()];
const report={schema_version:'1.0.0',packet_type:'alrs_missing_sources_backfill',mode:apply?'apply':'dry-run',remote_apply:false,planned_votes:plan.length,planned_sources:unique.length,blocked:blocked.length,blocked_items:blocked};
if(apply){const existing=await all('source_references','id,url,content_hash');const byUrl=new Map(existing.filter(x=>x.url).map(x=>[x.url,x]));for(const s of unique){if(!byUrl.has(s.source_url)){const {data,error}=await sb.from('source_references').insert({source_name:s.source_name,source_category:'oficial',url:s.source_url,content_hash:s.source_hash}).select('id,url').single();if(error)throw error;byUrl.set(s.source_url,data);}}
 let updated=0;for(const item of plan){const source=byUrl.get(item.source_url);const {error}=await sb.from('legislative_votes').update({source_reference_id:source.id}).eq('id',item.vote_id).is('source_reference_id',null);if(error)throw error;updated++;}report.updated_votes=updated;}
const digest=createHash('sha256').update(JSON.stringify(report)).digest('hex');report.report_sha256=`sha256:${digest}`;
import('node:fs').then(({writeFileSync})=>writeFileSync(output,JSON.stringify(report,null,2)+'\n'));
console.log(JSON.stringify({...report,output}));
