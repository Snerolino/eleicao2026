#!/usr/bin/env node
/** Classifica o tipo de revisão sem inferir impacto ou voto. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const input=resolve(root,'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json');
const output=resolve(root,'data/legislative-import/camara/authored-project-review-batches/procedural-triage.json');
const data=JSON.parse(await readFile(input,'utf8'));const proceduralTypes=new Set(['REQ','RCP','REC','RPD','DOC','PROC']);
const items=data.projects.map(p=>{const type=String(p.type||'').toUpperCase();const title=String(p.title||'').toLowerCase();const procedural=proceduralTypes.has(type)||/requerimento|recurso|frente parlamentar|comissão|ata|sessão solene|bloco parlamentar/.test(title);return {id:p.id,candidate_tse_id:p.candidate_tse_id,classification:procedural?'procedural_candidate':'substantive_candidate',reason:procedural?'tipo/título indicam ato processual; não é decisão de impacto':'exige revisão de texto, versão e evento',editorial_status:'pending_review'};});
const counts={total:items.length,procedural_candidate:items.filter(x=>x.classification==='procedural_candidate').length,substantive_candidate:items.filter(x=>x.classification==='substantive_candidate').length};await writeFile(output,JSON.stringify({schema_version:'1.0.0',packet_type:'candidate_authored_project_procedural_triage',mode:'read-only',remote_apply:false,counts,items},null,2)+'\n');console.log(JSON.stringify({counts,output}));
