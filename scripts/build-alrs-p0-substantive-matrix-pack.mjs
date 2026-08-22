#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const input=resolve(root,'data/legislative-import/alrs/impact-matrix-review-pack-p0-only.json');
const manifest=resolve(root,'data/legislative-import/alrs/p0-substantive-source-manifest.json');
const output=resolve(root,'data/legislative-import/alrs/p0-substantive-matrix-review-pack-v1.json');
const p=JSON.parse(readFileSync(input,'utf8'));const fullManifest=JSON.parse(readFileSync(manifest,'utf8'));const m=fullManifest.items;
const items=p.items.map(item=>{const source=m[item.proposition_version_id];const green=Boolean(source?.source_bytes_preserved&&source?.renewable_locator_verified&&source?.durability_gate==='green');return {...item,substantive_sources:source?[source]:[],substantive_source_gate:green?'green':'blocked',source_durability_gate:green?'green':'blocked',human_review_required:true,editorial_status:'pending_review',remote_apply:false};});
const result={...p,packet_type:'alrs_p0_substantive_matrix_review_pack',totals:{versions:items.length,substantive_source_gate_green:items.filter(x=>x.substantive_source_gate==='green').length,source_durability_gate_green:items.filter(x=>x.source_durability_gate==='green').length,factual_votes:items.reduce((s,x)=>s+x.factual_vote_count,0)},items};writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({output,...result.totals}));
