#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const q=JSON.parse(readFileSync(resolve(root,'data/legislative-import/alrs/p2-microbatch-2-editorial-review-pack.json'),'utf8'));
const item=q.items.find(x=>x.official_match_key==='PL-43-2019');
if(!item) throw new Error('PL 43/2019 não encontrado no pack P2-2');
const result={schema_version:'1.0.0',packet_type:'alrs_p2_assessment_proposal_pack',methodology_version:'1.0.0',source:'admin_disposition_approved',remote_apply:false,public_approval:false,review_status:'pending_review',totals:{versions:1,proposed_assessments:1},items:[{...item,assessments:[{group_slug:'mulheres',impact_direction:null,defending_vote:null,severity:null,structural_type:null,confidence:null,rationale:null,proposal_status:'needs_human_review'}]}]};
writeFileSync(resolve(root,'data/legislative-import/alrs/p2-pl43-2019-assessment-proposal.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result.totals));
