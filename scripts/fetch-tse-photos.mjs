/**
 * Script: fetch-tse-photos
 *
 * Busca fotos dos candidatos no DivulgaCandContas e atualiza
 * photo_url + photo_source_url no Supabase.
 *
 * Uso:
 *   node scripts/fetch-tse-photos.mjs              # todos os candidatos sem foto
 *   node scripts/fetch-tse-photos.mjs --dry-run     # só lista, não modifica
 *
 * Requer: VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente
 * (carregados automaticamente em produção; use .env.local em dev)
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TSE_API = 'https://divulgacandcontas.tse.jus.br/divulga/rest/v1';
const ELECTION_ID = 20322002026; // Eleição Geral Federal 2026
const UF = 'RS';
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

async function supabaseFetch(path, opts = {}) {
  const url = `${SUPABASE_URL}/rest/v1${path}`;
  const res = await fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...opts.headers,
    },
    ...opts,
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

async function tseFetch(path) {
  const url = `${TSE_API}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`TSE ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  // 1. Buscar candidatos sem photo_url no Supabase
  const candidates = await supabaseFetch(
    "/candidates?select=id,full_name,party,ballot_number,position,tse_candidate_id&photo_url=is.null&order=full_name.asc"
  );

  if (candidates.length === 0) {
    console.log('✅ Todos os candidatos já têm photo_url.');
    return;
  }

  console.log(`📸 Buscando fotos TSE para ${candidates.length} candidatos...\n`);

  let updated = 0;
  let notFound = 0;

  for (const candidate of candidates) {
    const sqCandidato = candidate.tse_candidate_id;

    let photoUrl = null;
    let sourceUrl = null;

    // 2. Se tiver tse_candidate_id, tenta buscar foto diretamente
    if (sqCandidato) {
      const data = await tseFetch(`/candidato/buscar/2026/RS/${ELECTION_ID}/candidato/${sqCandidato}`);
      if (data?.arquivos?.length) {
        const foto = data.arquivos.find((a) => a.tipo === 'foto');
        if (foto?.url) {
          photoUrl = foto.url;
          sourceUrl = `https://divulgacandcontas.tse.jus.br/divulga/#/candidato/RS/2026/${sqCandidato}`;
        }
      }
    }

    // 3. Se não achou, tenta buscar pelo número do candidato
    if (!photoUrl && candidate.ballot_number) {
      const data = await tseFetch(`/candidatura/listar/${2026}/RS/${ELECTION_ID}/3/candidatos`);
      if (data?.candidatos) {
        const match = data.candidatos.find(
          (c) => c.nrCandidato === candidate.ballot_number || c.nmUrna === candidate.full_name
        );
        if (match?.id) {
          const detail = await tseFetch(
            `/candidato/buscar/2026/RS/${ELECTION_ID}/candidato/${match.id}`
          );
          if (detail?.arquivos?.length) {
            const foto = detail.arquivos.find((a) => a.tipo === 'foto');
            if (foto?.url) photoUrl = foto.url;
          }
        }
      }
    }

    // 4. Atualizar no Supabase
    if (photoUrl) {
      if (DRY_RUN) {
        console.log(`  [dry-run] ${candidate.full_name} → ${photoUrl}`);
      } else {
        await supabaseFetch(`/candidates?id=eq.${candidate.id}`, {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            photo_url: photoUrl,
            photo_source_url: sourceUrl || `https://divulgacandcontas.tse.jus.br/divulga/`,
          }),
        });
        console.log(`  ✅ ${candidate.full_name} → foto atualizada`);
      }
      updated++;
    } else {
      console.log(`  ⚠️  ${candidate.full_name} → foto não encontrada no TSE`);
      notFound++;
    }

    // Respeitar rate limit do TSE
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\n📊 Resultado:`);
  console.log(`  Atualizados: ${updated}`);
  console.log(`  Não encontrados: ${notFound}`);
  console.log(`  Restantes sem foto: ${candidates.length - updated}`);
}

main().catch((err) => {
  console.error('Erro:', err);
  process.exit(1);
});
