#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const sql=`select pv.id::text as proposition_version_id,pv.version_key,lp.house,lp.proposition_type,lp.number,lp.year,lp.external_id,lp.title from public.proposition_versions pv join public.legislative_propositions lp on lp.id=pv.proposition_id where lp.house='alrs';`;
const raw=execFileSync('npx',['supabase','db','query','--linked','--output','json',sql],{cwd:root,encoding:'utf8',maxBuffer:32*1024*1024});const start=raw.indexOf('{'),end=raw.lastIndexOf('}');const rows=JSON.parse(raw.slice(start,end+1)).rows??[];const items=Object.fromEntries(rows.map(row=>[row.proposition_version_id,row]));mkdirSync(resolve(root,'data/legislative-import/alrs'),{recursive:true});const out={schema_version:'1.0.0',source:'supabase_read_only_metadata',remote_apply:false,totals:{versions:rows.length},items};writeFileSync(resolve(root,'data/legislative-import/alrs/proposition-version-metadata-v1.json'),JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({versions:rows.length}));
