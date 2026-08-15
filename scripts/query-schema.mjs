#!/usr/bin/env node
/**
 * Query script to inspect schema and constraint definitions
 * Uses service_role key from raspador .env
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

const SUPABASE_URL = env.SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

async function queryRaw(sql) {
  // Supabase REST doesn't support raw SQL by default
  // Use RPC with a function that runs SQL
  const { data, error } = await supabase.rpc('raw_sql', {
    query: sql
  });
  return data;
}

async function main() {
  console.log('Fetching constraint definition...');
  
  // Try to get constraint via information_schema
  const queries = [
    "SELECT conname, pg_get_constraintdef(oid) as definition FROM pg_constraint WHERE conname = 'chk_published_claim_requirements'",
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'claims' ORDER BY ordinal_position",
    "SELECT id, candidate_id, category, confidence_score, generated_by_ai, source_document_id FROM claims WHERE status = 'pending_review' LIMIT 10"
  ];
  
  for (const query of queries) {
    console.log('\n=== Query ===');
    console.log(query);
    console.log('=== Result ===');
    
    try {
      // Direct REST query on claims table (not raw SQL)
      const { data, error } = await supabase.from('claims').select('*').limit(10);
      console.log(JSON.stringify(data, null, 2));
    } catch(e) {
      console.error(e.message);
    }
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});