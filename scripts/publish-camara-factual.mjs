import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
const env={};
for (const line of fs.readFileSync('.env.local','utf8').split(/\r?\n/)) { const m=line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/); if(m) env[m[1]]=m[2].replace(/^['"]|['"]$/g,''); }
const session=JSON.parse(fs.readFileSync('/home/lourenco/.local/state/eleicao2026/supabase-editor-session.json','utf8'));
const envelope=JSON.parse(fs.readFileSync('/tmp/camara-rs-factual-envelope.json','utf8'));
const propositionSources=JSON.parse(fs.readFileSync('/tmp/camara-proposition-sources-hashed.json','utf8')).urls;
const eventSources=JSON.parse(fs.readFileSync('/tmp/camara-event-sources-hashed.json','utf8')).events;
const propHash=new Map(propositionSources.map(x=>[x.url,x.sha256]));
const eventHash=new Map(eventSources.map(x=>[x.source_url,x.sha256]));
const eventInfo=new Map();
for(const p of envelope.propositions) for(const ver of p.versions) for(const ev of ver.voting_events) eventInfo.set(ev.external_id,{p,ver,ev});
const rows=[];
for(const v of envelope.votes) {
 const i=eventInfo.get(v.event_external_id); if(!i) throw new Error('event missing '+v.event_external_id);
 const propUrl=i.p.official_url, eventUrl=i.ev.source;
 const allowedTypes=new Set(['pec','pl','plp','pld','lei','outro']);
 const row={candidate_tse_id:v.candidate_tse_id, proposition_external_id:i.p.external_id, event_external_id:v.event_external_id, value:v.value, recorded_at:v.recorded_at, occurred_at:i.ev.occurred_at, proposition_type:allowedTypes.has(i.p.type)?i.p.type:'outro', proposition_number:i.p.number, proposition_year:i.p.year, proposition_title:i.p.title, proposition_source_url:propUrl, proposition_source_hash:propHash.get(propUrl), version_key:i.ver.version_key, version_label:i.ver.version_label, event_session_id:i.ev.session_id, event_source_url:eventUrl, event_source_hash:eventHash.get(eventUrl), vote_source_url:v.source, vote_source_hash:v.source_sha256};
 if(Object.values(row).some(x=>x===undefined||x===null||x==='')) throw new Error('incomplete '+JSON.stringify(row)); rows.push(row);
}
const sb=createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const refreshed=await sb.auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token});
if(refreshed.error || !refreshed.data.session) throw new Error(`auth refresh failed: ${refreshed.error?.message || 'no session'}`);
const batchSize=50; let total={rows_received:0,inserted:0,already_present:0,conflicts:0,propositions_created:0,versions_created:0,events_created:0};
for(let n=0;n<rows.length;n+=batchSize){
 const batch=rows.slice(n,n+batchSize); let result;
 for(let attempt=1;attempt<=3;attempt++) { const r=await sb.rpc('import_camara_nominal_votes',{p_rows:batch}); if(!r.error){result=r.data;break;} if(attempt===3) throw new Error(`batch ${n}-${n+batch.length}: ${r.error.message}`); await new Promise(x=>setTimeout(x,1000*attempt)); }
 for(const k of Object.keys(total)) total[k]+=(result?.[k]||0);
 if(((n/batchSize)%20)===0||n+batch.length===rows.length) console.log(JSON.stringify({processed:n+batch.length,total:rows.length,last:result,aggregate:total}));
}
console.log(JSON.stringify({complete:true,aggregate:total}));
