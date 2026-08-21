#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');const input=resolve(root,'data/legislative-import/alrs/substantive-review-queue-v1.json');const output=resolve(root,'data/legislative-import/alrs/p1-substantive-review-pack-v1.json');
const q=JSON.parse(readFileSync(input,'utf8'));const items=(q.items??[]).filter(x=>x.priority==='P1').map(x=>({...x,review_batch:'P1-official-event-classification',human_review_required:true,remote_apply:false}));const result={...q,packet_type:'alrs_p1_substantive_review_pack',priorities:['P1'],totals:{versions:items.length,factual_votes:items.reduce((s,x)=>s+x.factual_vote_count,0)},items};writeFileSync(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({output,...result.totals}));
