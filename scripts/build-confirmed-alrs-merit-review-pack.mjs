#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const meritPath=resolve(root,'data/legislative-import/alrs/impact-merit-review-pack-p0-p1.json');
const p0Path=resolve(root,'data/legislative-import/alrs/p0-official-version-validation.json');
const p1Path=resolve(root,'data/legislative-import/alrs/p1-official-classification-report.json');
const output=resolve(root,'data/legislative-import/alrs/confirmed-merit-review-pack-v1.json');
const merit=JSON.parse(readFileSync(meritPath,'utf8'));
const p0=JSON.parse(readFileSync(p0Path,'utf8')).items;
const p1=JSON.parse(readFileSync(p1Path,'utf8')).items;
const p0Ids=new Set(Object.keys(p0));
const p1Ids=new Set(p1.filter(x=>x.official_event_classification==='merit_candidate_confirmed'&&x.official_match_status==='matched_official_identity').map(x=>x.proposition_version_id));
const items=(merit.items??[]).filter(x=>p0Ids.has(x.proposition_version_id)||p1Ids.has(x.proposition_version_id)).map(x=>({...x,official_merit_confirmed:true,event_type:'merit_confirmed',review_gate:'official_event_confirmed',substantive_source_gate:p0Ids.has(x.proposition_version_id)?'green':'blocked_until_impact_sources',review_status:'pending_review',editorial_status:'pending_review',human_review_required:true,remote_apply:false}));
const result={schema_version:'1.0.0',packet_type:'alrs_confirmed_merit_review_pack',methodology_version:'1.0.0',unit_of_work:'one_matrix_per_proposition_version',review_status:'pending_review',remote_apply:false,public_approval:false,totals:{versions:items.length,factual_votes:items.reduce((s,x)=>s+x.factual_vote_count,0),p0_versions:items.filter(x=>x.priority==='P0').length,p1_versions:items.filter(x=>x.priority==='P1').length,substantive_source_green:items.filter(x=>x.substantive_source_gate==='green').length},items};
writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({output,...result.totals}));
