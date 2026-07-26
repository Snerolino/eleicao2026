/**
 * Script: ingest-data
 *
 * Insere candidatos, claims, raw_documents e source_references
 * no Supabase via service_role.
 *
 * Uso:
 *   node scripts/ingest-data.mjs <arquivo.json>     # importa do JSON
 *   node scripts/ingest-data.mjs --sample            # cria dados de exemplo
 *
 * Formato do JSON:
 * {
 *   "candidates": [{ "full_name": "...", "party": "...", "ballot_number": 12, "position": "Governador" }],
 *   "documents": [{ "source_name": "...", "source_category": "oficial", "url": "...", "raw_content": "..." }],
 *   "claims": [{ "candidate": "full_name", "category": "summary", "content": "...", "confidence_score": 5, "document": 0 }]
 * }
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const INPUT = process.argv[2];

async function supFetch(method, path, body) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'return=representation' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Supabase ${method} ${path} → ${res.status}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

// --- Dados de exemplo ---
const SAMPLE = {
  candidates: [
    { full_name: 'Eduardo Leite', party: 'PSDB', ballot_number: 45, position: 'Governador' },
    { full_name: 'Edegar Pretto', party: 'PT', ballot_number: 13, position: 'Governador' },
    { full_name: 'Fábio Dutra', party: 'PSOL', ballot_number: 50, position: 'Senador' },
    { full_name: 'Marina Silva', party: 'REDE', ballot_number: 18, position: 'Senador' },
    { full_name: 'Dionilso Mateus Marcon', party: 'PT', ballot_number: 131, position: 'Deputado Federal' },
    { full_name: 'Marcelo Moraes', party: 'PL', ballot_number: 2211, position: 'Deputado Federal' },
    { full_name: 'Kelly Moraes', party: 'PT', ballot_number: 13123, position: 'Deputado Estadual' },
    { full_name: 'Capitão Martim', party: 'PSDB', ballot_number: 4520, position: 'Deputado Estadual' },
  ],
  documents: [
    { source_name: 'TSE DivulgaCandContas', source_category: 'oficial', url: 'https://dadosabertos.tse.jus.br/dataset/candidaturas-2026' },
    { source_name: 'Portal ALRS', source_category: 'oficial', url: 'https://www.al.rs.gov.br' },
    { source_name: 'Câmara dos Deputados', source_category: 'oficial', url: 'https://www.camara.leg.br' },
    { source_name: 'G1 RS', source_category: 'imprensa', url: 'https://g1.globo.com/rs/' },
    { source_name: 'Aos Fatos', source_category: 'fact_check', url: 'https://www.aosfatos.org' },
  ],
  claims: [
    { candidate: 'Eduardo Leite', category: 'summary', content: 'Governador do RS (2023-presente), prefeito de Pelotas (2013-2018). Candidato à reeleição pelo PSDB.', confidence_score: 5, document: 0 },
    { candidate: 'Eduardo Leite', category: 'plataforma', content: 'Defende continuidade do programa de privatizações e reforma administrativa.', confidence_score: 4, document: 3 },
    { candidate: 'Edegar Pretto', category: 'summary', content: 'Deputado estadual (2015-2023), ex-presidente da Assembleia. Candidato apoiado pela coligação PT-PCB.', confidence_score: 4, document: 0 },
    { candidate: 'Edegar Pretto', category: 'plataforma', content: 'Propõe ampliação de programas sociais e revisão de concessões estaduais.', confidence_score: 3, document: 3 },
    { candidate: 'Fábio Dutra', category: 'summary', content: 'Advogado, ativista de direitos humanos. Primeira candidatura ao Senado pelo PSOL.', confidence_score: 3, document: 0 },
    { candidate: 'Marina Silva', category: 'summary', content: 'Ex-senadora pelo Acre, ex-ministra do Meio Ambiente. Candidata ao Senado pelo RS.', confidence_score: 5, document: 0 },
    { candidate: 'Dionilso Mateus Marcon', category: 'summary', content: 'Vereador por Porto Alegre. Candidato a Deputado Federal pelo PT.', confidence_score: 3, document: 0 },
    { candidate: 'Marcelo Moraes', category: 'summary', content: 'Deputado estadual (2023-presente). Candidato a Deputado Federal pelo PL.', confidence_score: 4, document: 2 },
  ],
};

async function main() {
  let data;

  if (INPUT === '--sample') {
    data = SAMPLE;
    console.log('📋 Usando dados de exemplo\n');
  } else if (INPUT) {
    const { readFileSync } = await import('fs');
    const raw = readFileSync(INPUT, 'utf-8');
    data = JSON.parse(raw);
    console.log(`📋 Importando de ${INPUT}\n`);
  } else {
    console.error('Uso: node scripts/ingest-data.mjs --sample | <caminho.json>');
    process.exit(1);
  }

  const { candidates = [], documents = [], claims = [] } = data;

  // 1. Inserir documentos
  const docMap = [null]; // 1-indexed, index 0 = null
  if (documents.length > 0) {
    console.log(`📄 Inserindo ${documents.length} raw_documents...`);
    const result = await supFetch('POST', '/raw_documents', documents.map((d) => ({
      source_name: d.source_name,
      source_category: d.source_category,
      url: d.url || null,
      raw_content: d.raw_content || `Fonte: ${d.source_name}`,
    })));
    for (let i = 0; i < documents.length; i++) {
      docMap.push(result?.[i]?.id || null);
    }
  }

  // 2. Inserir candidatos
  const candidateMap = {}; // nome -> id
  if (candidates.length > 0) {
    console.log(`👤 Inserindo ${candidates.length} candidatos...`);
    const result = await supFetch('POST', '/candidates', candidates.map((c) => ({
      full_name: c.full_name,
      party: c.party,
      ballot_number: c.ballot_number,
      position: c.position,
    })));
    for (let i = 0; i < candidates.length; i++) {
      candidateMap[candidates[i].full_name] = result?.[i]?.id || null;
    }
  }

  // 3. Inserir claims
  if (claims.length > 0) {
    console.log(`📝 Inserindo ${claims.length} claims...`);
    const claimPayload = claims.map((c) => {
      const docIndex = typeof c.document === 'number' ? c.document : null;
      return {
        candidate_id: candidateMap[c.candidate],
        category: c.category,
        content: c.content,
        confidence_score: c.confidence_score ?? 3,
        status: 'published',
        source_document_id: docIndex ? docMap[docIndex] : null,
      };
    });
    await supFetch('POST', '/claims', claimPayload);
  }

  console.log(`\n✅ Importação concluída:`);
  console.log(`  Documentos: ${documents.length}`);
  console.log(`  Candidatos: ${candidates.length}`);
  console.log(`  Claims:     ${claims.length}`);
}

main().catch((err) => {
  console.error('Erro:', err);
  process.exit(1);
});
