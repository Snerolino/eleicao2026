#!/usr/bin/env node
/** Seleciona projetos únicos por cobertura de candidatos para revisão editorial. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const manifest=JSON.parse(await readFile(resolve(root,'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json'),'utf8'));
const groups=new Map();
for(const row of manifest.projects){const g=groups.get(row.id)??{...row,candidate_tse_ids:[],roles:[]};if(!g.candidate_tse_ids.includes(row.candidate_tse_id))g.candidate_tse_ids.push(row.candidate_tse_id);g.roles.push({candidate_tse_id:row.candidate_tse_id,role:row.role,authorship_official_id:row.authorship_official_id,authorship_source_url:row.authorship_source_url});groups.set(row.id,g);}
const offset=Number(process.argv.find((x) => x.startsWith('--offset='))?.split('=')[1] ?? 0);
const limit=Number(process.argv.find((x) => x.startsWith('--limit='))?.split('=')[1] ?? 25);
const projects=[...groups.values()].sort((a,b)=>b.candidate_tse_ids.length-a.candidate_tse_ids.length||a.id.localeCompare(b.id)).slice(offset,offset+limit).map(p=>({...p,candidate_occurrences:p.candidate_tse_ids.length}));
const out=`/tmp/camara-authored-unique-review-${offset+1}-${offset+projects.length}.json`;await writeFile(out,`${JSON.stringify({schema_version:'1.0.0',packet_type:'candidate_authored_projects_unique_editorial_batch',mode:'pending_review',remote_apply:false,content_read:false,selection:'unique projects sorted by exact candidate coverage',projects},null,2)}\n`);console.log(JSON.stringify({projects:projects.length,candidate_occurrences:projects.reduce((n,p)=>n+p.candidate_occurrences,0),unique_candidates:new Set(projects.flatMap(p=>p.candidate_tse_ids)).size,output:out}));
