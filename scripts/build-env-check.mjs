import { loadPublicCandidateSnapshot } from './public-candidate-snapshot.mjs';

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function validateUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && /\.supabase\.co$/.test(url.hostname);
  } catch {
    return false;
  }
}

function validateAnonKey(value) {
  return typeof value === 'string' && value.startsWith('eyJ') && value.split('.').length === 3;
}

function main() {
  const requireSupabase = hasFlag('--require-supabase');
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  const serviceRoleLike = Object.entries(process.env).filter(
    ([key, value]) =>
      /SERVICE_ROLE|SUPABASE_SERVICE|SUPABASE.*SECRET/i.test(key) ||
      (key.startsWith('VITE_') && /service_role/i.test(String(value ?? ''))),
  );

  const candidates = loadPublicCandidateSnapshot();
  console.log(`✅ Snapshot público disponível: ${candidates.length} candidaturas`);

  if (serviceRoleLike.length > 0) {
    fail(
      `Variável sensível detectada no ambiente de build: ${serviceRoleLike
        .map(([key]) => key)
        .join(', ')}`,
    );
  }

  if (!requireSupabase && !supabaseUrl && !anonKey) {
    console.log('ℹ️ Supabase público ausente; build usará snapshot público versionado.');
    return;
  }

  if (!validateUrl(supabaseUrl)) {
    fail('VITE_SUPABASE_URL ausente ou inválida.');
  }

  if (!validateAnonKey(anonKey)) {
    fail('VITE_SUPABASE_ANON_KEY ausente ou inválida.');
  }

  console.log('✅ Variáveis públicas Supabase presentes e com formato válido');
}

main();
