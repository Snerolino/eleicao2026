#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const p1Input=resolve(root,'../dataset2026/documentacao/orquestracao/alrs-p1-editorial-review-2026-08-23.json');
const p0Path=resolve(root,'data/legislative-import/alrs/confirmed-merit-review-pack-v1.json');
const manifest=JSON.parse(readFileSync(resolve(root,'data/legislative-import/alrs/p1-substantive-source-manifest.json'),'utf8'));
const manifestItems=Object.fromEntries((manifest.items??[]).map(x=>[x.proposition_version_id,x]));
const p1Bytes=readFileSync(p1Input);const p1=JSON.parse(p1Bytes.toString('utf8'));const p0Bytes=readFileSync(p0Path);const p0=JSON.parse(p0Bytes.toString('utf8'));
const p0Items=p0.items.filter(x=>x.priority==='P0').map(x=>({...x,editorial_status:'approved',human_approval_recorded:true,editorial_review_status:'approved',assessments:(x.assessments??[]).map(a=>({...a,requires_external_review:a.severity>=4||a.confidence<0.6,status:'approved'})),remote_apply:false}));
const p1Items=p1.items.map(item=>{const source=manifestItems[item.proposition_version_id];if(!source)throw new Error(`P1 source missing: ${item.proposition_version_id}`);if(source.document_sha256!==item.source_basis.document_sha256)throw new Error(`P1 source SHA mismatch: ${item.official_match_key}`);const assessments=(item.assessments??[]).map(a=>({...a,status:'approved',requires_external_review:a.severity>=4||a.confidence<0.6}));return {...item,editorial_status:'approved',human_approval_recorded:true,review_status:'reviewed',assessments,remote_apply:false};});
const all=[...p0Items,...p1Items];const assessItems=all.filter(x=>x.editorial_disposition==='assess');const assessmentRows=assessItems.flatMap(x=>x.assessments??[]);const external=assessItems.filter(x=>(x.assessments??[]).some(a=>a.requires_external_review));
const result={schema_version:'1.0.0',packet_type:'alrs_editorial_approval_pack',methodology_version:'impacto-populacional-v1',review_status:'approved',public_approval:false,remote_apply:false,apply_ready:false,source_basis:{p0_pack_sha256:createHash('sha256').update(p0Bytes).digest('hex'),p1_review_sha256:createHash('sha256').update(p1Bytes).digest('hex')},totals:{versions:all.length,p0_versions:p0Items.length,p1_versions:p1Items.length,assess_versions:assessItems.length,assessment_rows:assessmentRows.length,external_review_required_versions:external.length},items:all};
writeFileSync(resolve(root,'data/legislative-import/alrs/editorial-approval-pack-v1.json'),JSON.stringify(result,null,2)+'\n');
const externalQueue={schema_version:'1.0.0',packet_type:'alrs_external_review_queue',remote_apply:false,public_approval:false,totals:{versions:external.length},items:external.map(x=>({proposition_version_id:x.proposition_version_id,official_match_key:x.official_match_key??x.review_key,assessments:(x.assessments??[]).filter(a=>a.requires_external_review),status:'pending_external_review'}))};writeFileSync(resolve(root,'data/legislative-import/alrs/external-review-queue-v1.json'),JSON.stringify(externalQueue,null,2)+'\n');
console.log(JSON.stringify({approval_pack:result.totals,external_queue:externalQueue.totals,source:'dataset2026_p1_review_plus_current_p0'}));
