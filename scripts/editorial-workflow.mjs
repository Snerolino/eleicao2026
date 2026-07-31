/**
 * Script: editorial-workflow
 *
 * Gerencia o fluxo editorial de claims (draft → pending_review → published).
 * Permite listar, revisar e publicar claims via terminal.
 *
 * Uso:
 *   node scripts/editorial-workflow.mjs list              # listar pendentes
 *   node scripts/editorial-workflow.mjs pending           # em revisão
 *   node scripts/editorial-workflow.mjs publish <claim_id>             # publicar via RPC
 *   node scripts/editorial-workflow.mjs correct <claim_id> <content>   # corrigir via nova versão
 *   node scripts/editorial-workflow.mjs retract <claim_id> [notes]     # retratar mantendo histórico
 *   node scripts/editorial-workflow.mjs stats              # estatísticas
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Defina VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const ACTION = process.argv[2];
const CLAIM_ID = process.argv[3];
const EXTRA_ARG = process.argv.slice(4).join(' ');

async function supFetch(path, opts = {}) {
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
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

async function listClaims(status) {
  const claims = await supFetch(
    `/claims?select=id,category,content,confidence_score,status,candidate_id&status=eq.${status}&order=created_at.asc`
  );

  if (claims.length === 0) {
    console.log(`📭 Nenhuma claim com status "${status}".`);
    return;
  }

  // Buscar nomes dos candidatos
  const ids = [...new Set(claims.map((c) => c.candidate_id))];
  const candidates = ids.length > 0
    ? await supFetch(`/candidates?select=id,full_name&id=in.(${ids.map((i) => `"${i}"`).join(',')})`)
    : [];
  const nameMap = Object.fromEntries(candidates.map((c) => [c.id, c.full_name]));

  console.log(`📋 ${claims.length} claim(s) — status: ${status}\n`);

  for (const claim of claims) {
    console.log(`  ID:       ${claim.id}`);
    console.log(`  Candidato: ${nameMap[claim.candidate_id] || claim.candidate_id}`);
    console.log(`  Categoria: ${claim.category}`);
    console.log(`  Score:     ${claim.confidence_score ?? '—'}`);
    console.log(`  Conteúdo:  ${claim.content.slice(0, 120)}${claim.content.length > 120 ? '...' : ''}`);
    console.log('');
  }
}

async function publishClaim(id) {
  await supFetch('/rpc/publish_claim', {
    method: 'POST',
    body: JSON.stringify({ p_claim_id: id }),
  });
  console.log(`✅ Claim ${id} publicada.`);
}

async function correctClaim(id, content) {
  if (!content) {
    console.log('❌ Uso: node scripts/editorial-workflow.mjs correct <claim_id> <novo_conteúdo>');
    process.exit(1);
  }

  const claim = await supFetch('/rpc/correct_claim', {
    method: 'POST',
    body: JSON.stringify({
      p_claim_id: id,
      p_content: content,
      p_notes: 'Correção registrada via script editorial.',
    }),
  });
  console.log(`✅ Claim ${id} corrigida em nova versão ${claim?.id ?? 'desconhecida'}.`);
}

async function retractClaim(id, notes) {
  await supFetch('/rpc/retract_claim', {
    method: 'POST',
    body: JSON.stringify({
      p_claim_id: id,
      p_notes: notes || 'Retração registrada via script editorial.',
    }),
  });
  console.log(`✅ Claim ${id} retratada.`);
}

async function stats() {
  const all = await supFetch('/claims?select=status');
  const counts = {};
  for (const c of all) {
    counts[c.status] = (counts[c.status] || 0) + 1;
  }

  const total = all.length;
  console.log('📊 Estatísticas editoriais\n');
  for (const [status, count] of Object.entries(counts)) {
    const pct = ((count / total) * 100).toFixed(1);
    console.log(`  ${status.padEnd(20)} ${String(count).padStart(4)} (${pct}%)`);
  }
  console.log(`  ${''.padEnd(20, '─')}${''.padStart(6, '─')}`);
  console.log(`  Total                ${String(total).padStart(4)}`);
}

async function main() {
  switch (ACTION) {
    case 'list':
      await listClaims('draft');
      break;
    case 'pending':
      await listClaims('pending_review');
      break;
    case 'publish':
      if (!CLAIM_ID) {
        console.log('❌ Uso: node scripts/editorial-workflow.mjs publish <claim_id>');
        process.exit(1);
      }
      await publishClaim(CLAIM_ID);
      break;
    case 'correct':
      if (!CLAIM_ID) {
        console.log('❌ Uso: node scripts/editorial-workflow.mjs correct <claim_id> <novo_conteúdo>');
        process.exit(1);
      }
      await correctClaim(CLAIM_ID, EXTRA_ARG);
      break;
    case 'retract':
      if (!CLAIM_ID) {
        console.log('❌ Uso: node scripts/editorial-workflow.mjs retract <claim_id> [motivo]');
        process.exit(1);
      }
      await retractClaim(CLAIM_ID, EXTRA_ARG);
      break;
    case 'stats':
      await stats();
      break;
    default:
      console.log(`
Uso: node scripts/editorial-workflow.mjs <comando> [args]

Comandos:
  list              Listar claims em rascunho (draft)
  pending           Listar claims em revisão (pending_review)
  publish <id>      Publicar uma claim via função transacional
  correct <id> <t>  Corrigir como nova versão pública
  retract <id> [m]  Retratar mantendo histórico/auditoria
  stats             Estatísticas editoriais
`);
  }
}

main().catch(console.error);
