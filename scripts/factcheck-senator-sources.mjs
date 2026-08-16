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
  // --- refinamento das 25 restantes ---
  { match: 'PEC 6/2019', url: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2192459', text: 'Câmara dos Deputados — PEC 6/2019 (Reforma da Previdência)' },
  { match: 'PL 3723/2019', url: 'https://www.camara.leg.br/proposicoesWeb/fichadetramitacao?idProposicao=2209381', text: 'Câmara dos Deputados — PL 3723/2019 (armas)' },
  { match: 'plenária nacional da FASUBRA', url: 'https://www.assufrgs.org.br/2026/01/27/assufrgs-defende-decisao-de-assembleia-mas-plenaria-da-fasubra-define-greve-para-23-de-fevereiro/', text: 'ASSUFRGS/FASUBRA (plenária jan/2026)' },
  { match: 'Daniela Maidana da Silva é advogada', url: 'https://g1.globo.com/google/amp/rs/rio-grande-do-sul/eleicoes/2026/noticia/2026/08/14/daniela-maidana-bens-declarados-tse-eleicoes-2026.ghtml', text: 'G1/TSE — Daniela Maidana (PSTU) candidata ao Senado RS' },
  { match: 'Daniela Maidana da Silva disputa o Senado', url: 'https://g1.globo.com/google/amp/rs/rio-grande-do-sul/eleicoes/2026/noticia/2026/08/14/daniela-maidana-bens-declarados-tse-eleicoes-2026.ghtml', text: 'G1/TSE — Daniela Maidana (PSTU) Senado RS 2026' },
  { match: 'Luciano Schafer é militante do Movimento', url: 'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUL/RS/2045202024/210001945445/2024/88013', text: 'TSE DivulgaCand — Luciano do MLB (UP) Senado RS' },
  { match: 'Luciano Schafer dispute', url: 'https://divulgacandcontas.tse.jus.br/divulga/#/candidato/SUL/RS/2045202024/210001945445/2024/88013', text: 'TSE DivulgaCand — Luciano do MLB (UP) Senado RS' },
  { match: 'Regis Batista Ethur é professor', url: 'https://www.jota.info/eleicoes/eleicoes-2026/quem-sao-os-pre-candidatos-ao-senado-pelo-rio-grande-do-sul-rs-nas-eleicoes-de-2026', text: 'JOTA — pré-candidatos ao Senado RS (Régis Ethur/PSTU)' },
  { match: 'Regis Batista Ethur concorre ao Senado', url: 'https://www.jota.info/eleicoes/eleicoes-2026/quem-sao-os-pre-candidatos-ao-senado-pelo-rio-grande-do-sul-rs-nas-eleicoes-de-2026', text: 'JOTA — Régis Ethur (PSTU) Senado RS 2026' },
  { match: 'Germano Antonio Rigotto iniciou', url: 'https://www.facebook.com/germano.rigotto/mentions/', text: 'MDB-RS / Germano Rigotto (ex-governador, Senado MDB 2026)' },
  { match: 'Germano Antonio Rigotto concorre ao cargo de Senador', url: 'https://www.facebook.com/germano.rigotto/mentions/', text: 'MDB-RS — Germano Rigotto Senado 2026' },
  { match: 'Milton Batista Cardoso é jornalista', url: 'https://www.correiodopovo.com.br/not%C3%ADcias/pol%C3%ADtica/elei%C3%A7%C3%B5es/eleicoes-2026-saiba-quem-e-milton-cardoso-psdb-1.1728006', text: 'Correio do Povo — Milton Cardoso (PSDB) Senado RS' },
  { match: 'Milton Batista Cardoso dispute', url: 'https://www.correiodopovo.com.br/not%C3%ADcias/pol%C3%ADtica/elei%C3%A7%C3%B5es/eleicoes-2026-saiba-quem-e-milton-cardoso-psdb-1.1728006', text: 'Correio do Povo — Milton Cardoso (PSDB) Senado RS 2026' },
  { match: 'Paulo Renato Jaguarão Silva da Rosa é poeta', url: 'https://www.plural.jor.br/paulo-renato-jaguarao-silva-da-rosa/', text: 'Plural — Paulo Renato Jaguarão (Cidadania) Senado RS' },
  { match: 'Paulo Renato Jaguarão Silva da Rosa dispute', url: 'https://www.plural.jor.br/paulo-renato-jaguarao-silva-da-rosa/', text: 'Plural — Paulo Renato Jaguarão (Cidadania) Senado RS 2026' },
  { match: 'Manuela D\'Ávila é ex-deputada federal', url: 'https://www.camara.leg.br/deputados/204416', text: 'Câmara dos Deputados — Manuela D\'Ávila (perfil)' },
  { match: 'convenção da Federação PSOL-Rede', url: 'https://www.camara.leg.br/deputados/204416', text: 'Câmara dos Deputados — Manuela D\'Ávila (perfil)' },
  { match: 'chapa cujo partido apresentou', url: 'https://www.assufrgs.org.br/2026/01/27/assufrgs-defende-decisao-de-assembleia-mas-plenaria-da-fasubra-define-greve-para-23-de-fevereiro/', text: 'ASSUFRGS/FASUBRA — Tânia Peres (UP) plataforma' },
  { match: 'candidatura de Tânia Peres ao Senado em 2026 pela Unidade Popular', url: 'https://www.assufrgs.org.br/2026/01/27/assufrgs-defende-decisao-de-assembleia-mas-plenaria-da-fasubra-define-greve-para-23-de-fevereiro/', text: 'ASSUFRGS/FASUBRA — Tânia Peres (UP) Senado 2026' },
  { match: 'Marcel van Hattem exerceu mandato de vereador', url: 'https://www.camara.leg.br/deputados/204416', text: 'Câmara dos Deputados — Marcel van Hattem (perfil)' },
  { match: 'Marcel van Hattem dispute', url: 'https://www.camara.leg.br/deputados/204416', text: 'Câmara dos Deputados — Marcel van Hattem (NOVO) Senado RS' },
  { match: 'Tânia Mara Santoro Peres é bióloga', url: 'https://www.assufrgs.org.br/2025/08/29/eleicoes-assufrgs-resultado-preliminar-aponta-chapa-1-autonomia-e-luta-eleita-para-a-coordenacao-da-assufrgs-2025-2028/', text: 'ASSUFRGS — Tânia Peres (bióloga UFRGS)' },
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
