#!/usr/bin/env bash
set -euo pipefail
export SUPABASE_SECRET_KEY="${SUPABASE_SECRET_KEY:-}"
export VITE_SUPABASE_ANON_KEY="${VITE_SUPABASE_ANON_KEY:-}"
node scripts/import-agy-block.mjs "$@"