#!/usr/bin/env node
/** Gera índice persistente de fontes oficiais para evitar reconsultas redundantes. */
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const input=resolve(root,'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json');
const output=resolve(root,'data/legislative-import/camara/candidate-authored-source-index-v1.json');
const manifest=JSON.parse(await readFile(input,'utf8'));const byUrl=new Map();
for(const p of manifest.projects){for(const [kind,url] of [['proposition',p.official_url],['authorship',p.authorship_source_url]]){const e=byUrl.get(url)??{url,kind,project_ids:[],content_saved:false};if(!e.project_ids.includes(p.id))e.project_ids.push(p.id);byUrl.set(url,e);}}
const sources=[...byUrl.values()].sort((a,b)=>a.url.localeCompare(b.url));const result={schema_version:'1.0.0',packet_type:'candidate_authored_official_source_index',mode:'read-only',remote_apply:false,content_saved:false,source_precedence:'official_primary_only',counts:{unique_sources:sources.length,project_role_rows:manifest.totals.project_role_rows,unique_projects:manifest.totals.unique_projects},sources};await writeFile(output,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({counts:result.counts,output}));
