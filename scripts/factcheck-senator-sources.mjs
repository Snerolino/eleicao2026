#!/usr/bin/env node
/**
 * factcheck-senator-sources.mjs — Fact-check reverso: aponta fonte PRIMÁRIA
 * oficial nas claims de senador já publicadas (fortalece auditabilidade).
 * Mantém o dossiê como origem (source_text) e adiciona source_url primário.
 *
 * Uso: node scripts/factcheck-senator-sources.mjs [--apply]
 */
import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const raspadorEnv = '/home/lourenco/Projetos/raspador-candidados-2026/.env';
function loadEnv() {
  for (const p of [resolve(__dirname, '../.env.local'), raspadorEnv]) {
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, 'utf-8').split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i === -1) continue;
      const k = t.slice(0, i).trim();
      const v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      process.env[k] = v;
    }
  }
}
loadEnv();
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error('Faltam credenciais.'); process.exit(1); }
const apply = process.argv.includes('--apply');
const sb = createClient(url, key, { auth: { persist: false } });

// Mapeamento fact-check reverso: substring do conteúdo -> fonte primária.
const MAP = [
  { match: 'Policial Federal licenciado', url: 'https://www.camara.leg.br/deputados/204416', text: 'Portal da Câmara dos Deputados (biografia oficial)' },
  { match: 'vereadora em Porto Alegre', url: 'https://www.camarapoa.rs.gov.br/', text: 'Câmara Municipal de Porto Alegre' },
  { match: 'servidora técnico-administrativa da universidade desde 2009', url: 'https://www.assufrgs.org.br/2025/08/29/eleicoes-assufrgs-resultado-preliminar-aponta-chapa-1-autonomia-e-luta-eleita-para-a-coordenacao-da-assufrgs-2025-2028/', text: 'ASSUFRGS (Sindicato dos Servidores UFRGS)' },
  { match: 'PLP 14/2026', url: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/172696/votacoes', text: 'Senado Federal — votações PLP 14/2026' },
  { match: 'PEC 18/2025', url: 'https://www25.senado.leg.br/web/atividade/materias/-/materia/172997', text: 'Senado Federal — PEC 18/2025 (2º turno)' },
  { match: 'PEC 438/2001', url: 'https://imagem.camara.leg.br/Imagem/d/pdf/DCD22AGO2007.pdf', text: 'Diário da Câmara dos Deputados (DCD 22/08/2007) — PEC 438/2001' },
];

async function main() {
  const { data: claims, error } = await sb.from('claims')
    .select('id, content, source_url, source_text')
    .eq('status', 'published')
    .or('external_id.like.dossier_sen_%,external_id.like.dossier_xlsx_%');
  if (error) { console.error('ERRO', error.message); process.exit(1); }
  console.log(`Claims senador: ${claims.length} | ${apply ? 'APLICAR' : 'DRY-RUN'}`);
  let updated = 0;
  for (const c of claims) {
    const hit = MAP.find((m) => c.content.includes(m.match));
    if (!hit) continue;
    if (c.source_url && c.source_url === hit.url) { continue; }
    console.log(`  [${hit.match.slice(0, 30)}] -> ${hit.url}`);
    if (!apply) { updated++; continue; }
    const { error: e2 } = await sb.from('claims').update({ source_url: hit.url, source_text: c.source_text || hit.text }).eq('id', c.id);
    if (e2) { console.error('  ERRO', e2.message); continue; }
    updated++;
  }
  console.log(`Atualizadas: ${updated}`);
  if (!apply) console.log('DRY-RUN: rode com --apply.');
}

main().catch((e) => { console.error('Erro:', e.message); process.exit(1); });
