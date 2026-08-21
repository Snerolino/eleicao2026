#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');const input=process.argv.slice(2).find(a=>!a.startsWith('--'))??'data/legislative-import/alrs/impact-matrix-review-pack-p0-p1.json';
export function validateSubstantiveSources(pack){const errors=[];for(const [i,item] of (pack.items??[]).entries()){const urls=(item.official_sources??[]).map(x=>x.url??x).filter(Boolean);const substantive=urls.filter(url=>!url.includes('/votos-plenario/'));if(!substantive.length)errors.push(`items[${i}]:substantive_source_missing`);if(item.substantive_source_gate!=='green'&&item.substantive_source_gate!==undefined)errors.push(`items[${i}]:substantive_gate_blocked`)}return {ok:errors.length===0,errors,checked:pack.items?.length??0};}
function main(){const pack=JSON.parse(readFileSync(resolve(root,input),'utf8'));const r=validateSubstantiveSources(pack);console.log(JSON.stringify(r));if(!r.ok)process.exit(2)}if(process.argv[1]?.endsWith('validate-alrs-substantive-sources.mjs'))main();
