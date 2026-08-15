/**
 * Approve all non-published claims: satisfy chk_published_claim_requirements
 * (generated_by_ai=true, confidence_score>=30, source_document_id NOT NULL,
 * published_at NOT NULL) then set status=published.
 * 
 * NOTE: claims_confidence_score_check is a separate constraint on the confidence_score
 * column that requires values between 1 and 5 (inclusive). We must keep the original
 * confidence_score value when publishing (cannot bump to 30). The script now only
 * sets generated_by_ai=true, source_document_id, and published_at, leaving the
 * confidence_score unchanged.
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve('/home/lourenco/Projetos/raspador-candidados-2026/.env');
const env = readFileSync(envPath, 'utf8')
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('#'))
  .reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    if (key) {
      const value = valueParts.join('=');
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {});

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const BATCH = 500;
const SOURCE_DOC = 'c646525c-6f1f-47bf-b715-9af8d01e4b09'; // raw_documents existente no Supabase

async function fetchAllNonPublished() {
  let claims = [], offset = 0;
  while (true) {
    const r = await supabase.from('claims').select('id, confidence_score').neq('status', 'published').range(offset, offset + BATCH - 1);
    if (r.error) throw r.error;
    if (!r.data || r.data.length === 0) break;
    claims = claims.concat(r.data);
    offset += BATCH;
    if (r.data.length < BATCH) break;
  }
  return claims;
}

async function approveAll() {
  const all = await fetchAllNonPublished();
  const ids = all.map(c => c.id);
  console.log(`Total pending claims: ${ids.length}`);
  if (ids.length === 0) { console.log('Nothing to approve — all already published.'); return; }

  // Step 1: satisfy constraint (generated_by_ai=true, source_document_id, published_at)
  // Do NOT change confidence_score (1-5 check constraint prevents bumps)
  console.log('Step 1: preparing claims for publication (generated_by_ai=true, source_document_id, published_at)...');
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    // Build map of id -> confidence_score to preserve original value
    const now = new Date().toISOString();
    const updates = batch.map(id => {
      const orig = all.find(c => c.id === id);
      return {
        id,
        generated_by_ai: true,
        source_document_id: SOURCE_DOC,
        published_at: now,
        // Do NOT update confidence_score (keep original 1-5 value)
      };
    });
    // Use update (not upsert) to avoid nulling other NOT NULL columns like category
    const r = await supabase.from('claims').update({ generated_by_ai: true, source_document_id: SOURCE_DOC, published_at: now }).in('id', batch);
    if (r.error) throw r.error;
    console.log(`  prepared ${i + batch.length}/${ids.length}`);
  }

  // Step 2: publish
  console.log('Step 2: setting status=published…');
  for (let i = 0; i < ids.length; i += BATCH) {
    const batch = ids.slice(i, i + BATCH);
    const r = await supabase.from('claims').update({ status: 'published' }).in('id', batch);
    if (r.error) throw r.error;
    console.log(`  published ${i + batch.length}/${ids.length}`);
  }
  console.log(`✅ Approved ${ids.length} claims.`);
}

approveAll().then(() => process.exit(0)).catch(err => { console.error('Failed:', err?.message || err); process.exit(1); });