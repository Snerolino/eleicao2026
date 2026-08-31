import fs from 'node:fs';
const causal=JSON.parse(fs.readFileSync('/tmp/camara-causal-review-51-75.json','utf8')).items;
const red=JSON.parse(fs.readFileSync('/tmp/camara-redteam-content-51-75.json','utf8'));
const redBy=new Map(red.map(x=>[x.id,x]));
const items=causal.map(x=>{const r=redBy.get(x.id);return {...x,redteam:{decision:r?.decision??'withheld',risk:r?.risco??'red-team record unavailable',missing_sources:r?.fontes_faltantes??[]},final_decision:'withheld',reconciliation_reason:'Nenhum item aprovado: autoria não equivale a voto; eventos ausentes ou apenas procedurais; score retido.'};});
if(items.length!==25||red.length!==25)throw new Error(`cardinality causal=${items.length} red=${red.length}`);
const out='data/legislative-import/camara/authored-project-review-batches/camara-authored-unique-review-51-75-reconciled.json';fs.writeFileSync(out,JSON.stringify({schema_version:'1.0.0',packet_type:'candidate_authored_projects_reconciled_editorial_review',mode:'withheld',remote_apply:false,content_read:true,source:'official_full_text',counts:{items:25,approved:0,pending_review:0,withheld:25,score_eligible:0},items},null,2)+'\n');console.log(JSON.stringify({items:25,approved:0,withheld:25,score_eligible:0,output:out}));
