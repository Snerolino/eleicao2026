#!/usr/bin/env node
/** Gera lotes editoriais a partir do manifesto factual; não publica nem interpreta. */
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const input=resolve(root,'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json');
const outDir=resolve(root,'data/legislative-import/camara/authored-project-review-batches');
const manifest=JSON.parse(await readFile(input,'utf8')); const by=new Map();
for(const p of manifest.projects){const a=by.get(p.candidate_tse_id)??[];a.push(p);by.set(p.candidate_tse_id,a);}
const ids=[...by.keys()].sort(); await mkdir(outDir,{recursive:true}); const batches=[];
for(let i=0;i<ids.length;i+=20){const candidateIds=ids.slice(i,i+20);const projects=candidateIds.flatMap(id=>by.get(id)).sort((a,b)=>a.id.localeCompare(b.id));const batch={schema_version:'1.0.0',packet_type:'candidate_authored_projects_editorial_review_batch',mode:'pending_review',remote_apply:false,content_read:false,batch_id:`camara-authored-${String(i/20+1).padStart(3,'0')}`,candidate_tse_ids:candidateIds,counts:{candidates:candidateIds.length,projects:projects.length},instructions:'Analisar somente com fontes normativas/eventuais oficiais; não inferir mecanismo, grupos ou score pela ementa isolada.',projects};const file=resolve(outDir,`${batch.batch_id}.json`);await writeFile(file,`${JSON.stringify(batch,null,2)}\n`);batches.push({batch_id:batch.batch_id,candidates:candidateIds.length,projects:projects.length,file});}
const result={schema_version:'1.0.0',packet_type:'candidate_authored_projects_editorial_review_queue',mode:'pending_review',remote_apply:false,batch_size:20,batches};await writeFile(resolve(outDir,'manifest.json'),`${JSON.stringify(result,null,2)}\n`);console.log(JSON.stringify({batches:batches.length,candidates:ids.length,projects:manifest.projects.length,output:outDir}));
