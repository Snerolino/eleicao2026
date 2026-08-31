#!/usr/bin/env node
/**
 * Descobre autoria Câmara a partir do arquivo oficial anual proposicoesAutores.
 * Somente leitura: não altera snapshot, banco ou documentos brutos versionados.
 */
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const OUT = resolve(ROOT, 'data/legislative-import/camara/candidate-authored-projects-factual-manifest-v1.json');
const TMP = resolve('/tmp/eleicao2026-camara-authored');
const YEARS = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];
const API = 'https://dadosabertos.camara.leg.br/api/v2';

function sanitizeText(value) { return String(value ?? '').replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[DADO_SENSIVEL_REMOVIDO]').replace(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/g, '[DADO_SENSIVEL_REMOVIDO]').replace(/(?:\+?55\s*)?(?:\(?\d{2}\)?\s*)?\d{4,5}[-. ]\d{4}\b/g, '[DADO_SENSIVEL_REMOVIDO]'); }
function normalize(value) { return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
function parseCsvLine(line) {
  const values=[]; let current=''; let quoted=false;
  for(let i=0;i<line.length;i+=1){const c=line[i]; if(c==='"' && line[i+1]==='"' && quoted){current+='"';i+=1;} else if(c==='"'){quoted=!quoted;} else if(c===';'&&!quoted){values.push(current);current='';} else current+=c;}
  values.push(current); return values;
}
async function download(url, file) { const r=await fetch(url,{headers:{accept:'text/csv', 'user-agent':'eleicao2026-authored-projects-recon/1.0'}}); if(!r.ok) throw new Error(`HTTP ${r.status}: ${url}`); const b=Buffer.from(await r.arrayBuffer()); await writeFile(file,b); return {url,status:r.status,bytes:b.length,sha256:`sha256:${createHash('sha256').update(b).digest('hex')}`}; }
async function* rows(file) { const input=createReadStream(file); const rl=createInterface({input,crlfDelay:Infinity}); let headers=null; for await(const line of rl){if(!line.trim())continue; const vals=parseCsvLine(line).map(x=>x.replace(/^\uFEFF/,'')); if(!headers){headers=vals;continue;} const row={}; headers.forEach((h,i)=>{row[h]=vals[i]??''}); yield row;} }
function statusOf(row){const s=normalize(row.ultimoStatus_descricaoSituacao); if(s.includes('ARQUIV')||s.includes('RETIRAD'))return 'arquivado'; if(s.includes('VETAD'))return 'vetado'; if(s.includes('TRANSFORM')||s.includes('LEI'))return 'transformado_em_lei'; if(s.includes('APROV'))return 'aprovado'; return 'tramitando';}
const candidates=JSON.parse(await readFile(resolve(ROOT,'data/public-candidates.json'),'utf8'));
const candidateNames=new Map(); for(const c of candidates){for(const name of [c.full_name,c.ballot_name]){const k=normalize(name);if(!k)continue;const a=candidateNames.get(k)??[];if(!a.some(x=>x.tse_candidate_id===c.tse_candidate_id))a.push({tse_candidate_id:c.tse_candidate_id,name:c.full_name});candidateNames.set(k,a);}}
await mkdir(TMP,{recursive:true}); const manifests=[]; const authorRows=[]; const projectIds=new Map();
for(const year of YEARS){const url=`https://dadosabertos.camara.leg.br/arquivos/proposicoesAutores/csv/proposicoesAutores-${year}.csv`; const file=resolve(TMP,`authors-${year}.csv`); manifests.push(await download(url,file)); for await(const row of rows(file)){const matches=candidateNames.get(normalize(row.nomeAutor))??[]; if(row.siglaUFAutor!=='RS'||matches.length!==1||!row.idProposicao)continue; const c=matches[0]; authorRows.push({year,project_id:row.idProposicao,project_url:row.uriProposicao,author_id:row.idDeputadoAutor||null,author_name:row.nomeAutor,proponente:row.proponente==='1',candidate_tse_id:c.tse_candidate_id}); projectIds.set(`${year}|${row.idProposicao}`,{year,id:row.idProposicao,url:row.uriProposicao});}}
const projects=[]; for(const year of YEARS){const wanted=[...projectIds.values()].filter(x=>x.year===year);if(!wanted.length)continue;const wantedIds=new Set(wanted.map(x=>x.id));const url=`https://dadosabertos.camara.leg.br/arquivos/proposicoes/csv/proposicoes-${year}.csv`;const file=resolve(TMP,`projects-${year}.csv`);manifests.push(await download(url,file));for await(const row of rows(file)){if(!wantedIds.has(row.id))continue;const authors=authorRows.filter(x=>x.year===year&&x.project_id===row.id);for(const a of authors)projects.push({candidate_tse_id:a.candidate_tse_id,id:`camara:${String(row.siglaTipo).toLowerCase()}-${row.numero}-${row.ano}-${row.id}`,house:'camara',type:row.siglaTipo,number:row.numero,year:Number(row.ano),title:`${row.siglaTipo} ${row.numero}/${row.ano}`,role:a.proponente?'autor_principal':'coautor',official_url:row.uri,authorship_source_url:a.project_url,authorship_official_id:a.author_id,official_status:statusOf(row),official_ementa:sanitizeText(row.ementa||''),content_read:false,editorial_status:'pending_review'});}}
const result={schema_version:'1.0.0',packet_type:'candidate_authored_projects_factual_manifest',mode:'read-only',remote_apply:false,content_read:false,years:YEARS,source_manifests:manifests,totals:{candidate_authorship_rows:authorRows.length,project_role_rows:projects.length,unique_candidates:new Set(projects.map(x=>x.candidate_tse_id)).size,unique_projects:new Set(projects.map(x=>x.id)).size},projects}; await writeFile(OUT,`${JSON.stringify(result,null,2)}\n`); console.log(JSON.stringify({...result.totals,output:OUT}));
