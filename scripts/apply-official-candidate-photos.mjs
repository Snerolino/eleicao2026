#!/usr/bin/env node
/**
 * Aplica fotos oficiais de candidatos a partir de um diretório TSE já extraído.
 *
 * Fonte esperada: ZIP oficial TSE 2024 RS de fotos publicáveis:
 * https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip
 *
 * O TSE 2026 ainda pode retornar fotoUrlPublicavel=false/null no DivulgaCandContas.
 * Enquanto isso, este script usa somente matches conservadores por nome + partido
 * contra fotos oficiais publicáveis da eleição municipal de 2024.
 *
 * Uso:
 *   node scripts/apply-official-candidate-photos.mjs \
 *     --source-dir=/home/lourenco/Projetos/jsoneleicao/foto_cand2024_RS_div
 */

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { basename, extname, resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const SNAPSHOT_PATH = resolve(ROOT, 'data/public-candidates.json');
const OUT_DIR = resolve(ROOT, 'public/photos/tse-2024-rs');
const REPORT_PATH = resolve(ROOT, 'data/public-candidate-photo-matches.json');
const OFFICIAL_SOURCE_URL = 'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes2024/fotos/foto_cand2024_RS_div.zip';

const sourceDirArg = process.argv.find((arg) => arg.startsWith('--source-dir='));
const SOURCE_DIR = resolve(
  sourceDirArg?.split('=')[1] ?? '../jsoneleicao/foto_cand2024_RS_div',
);

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function meaningfulWords(value) {
  return normalize(value).split(' ').filter((word) => word.length > 2);
}

function parsePhotoFilename(fileName) {
  const match = /^(.*?) \((.*?)\) - (.*?) - (.*?)\.(jpe?g)$/i.exec(fileName);
  if (!match) return null;
  const [, name, party, previousPosition, municipality, ext] = match;
  return {
    name,
    normalizedName: normalize(name),
    party: party.toUpperCase(),
    previousPosition,
    municipality,
    ext: ext.toLowerCase(),
  };
}

function publicPhotoFileName(candidate, ext) {
  return `${candidate.slug}.${ext}`;
}

function scoreCandidatePhoto(candidate, photo) {
  if (photo.party !== candidate.party.toUpperCase()) return null;

  const fullName = normalize(candidate.full_name);
  const ballotName = normalize(candidate.ballot_name);
  const ballotWords = meaningfulWords(candidate.ballot_name);
  const fullWords = meaningfulWords(candidate.full_name);
  const photoWords = new Set(photo.normalizedName.split(' '));

  if (fullName && fullName === photo.normalizedName) return { score: 100, reason: 'full_name_exact_party' };
  if (fullName && photo.normalizedName.includes(fullName)) return { score: 90, reason: 'full_name_contained_party' };
  if (ballotName && photo.normalizedName.includes(ballotName)) return { score: 80, reason: 'ballot_name_contained_party' };
  if (ballotWords.length >= 2 && ballotWords.every((word) => photoWords.has(word))) return { score: 70, reason: 'ballot_words_party' };
  if (fullWords.length >= 2 && fullWords.every((word) => photoWords.has(word))) return { score: 60, reason: 'full_words_party' };

  return null;
}

function main() {
  if (!existsSync(SOURCE_DIR)) {
    throw new Error(`Diretório de fotos TSE não encontrado: ${SOURCE_DIR}`);
  }

  const candidates = JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8'));
  const photos = readdirSync(SOURCE_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const metadata = parsePhotoFilename(entry.name);
      if (!metadata) return null;
      return { ...metadata, fileName: entry.name, path: resolve(SOURCE_DIR, entry.name) };
    })
    .filter(Boolean);

  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const matches = [];
  const ambiguous = [];

  for (const candidate of candidates) {
    const scored = photos
      .map((photo) => {
        const result = scoreCandidatePhoto(candidate, photo);
        return result ? { ...result, photo } : null;
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || a.photo.name.localeCompare(b.photo.name));

    if (scored.length === 0) {
      candidate.photo_url = null;
      candidate.photo_source_url = null;
      continue;
    }

    const topScore = scored[0].score;
    const top = scored.filter((item) => item.score === topScore);
    if (top.length > 1) {
      candidate.photo_url = null;
      candidate.photo_source_url = null;
      ambiguous.push({
        tse_candidate_id: candidate.tse_candidate_id,
        slug: candidate.slug,
        full_name: candidate.full_name,
        party: candidate.party,
        options: top.map((item) => ({
          source_file: item.photo.fileName,
          previous_position: item.photo.previousPosition,
          municipality: item.photo.municipality,
          reason: item.reason,
        })),
      });
      continue;
    }

    const match = top[0];
    const ext = extname(match.photo.fileName).slice(1).toLowerCase();
    const targetFile = publicPhotoFileName(candidate, ext);
    copyFileSync(match.photo.path, resolve(OUT_DIR, targetFile));

    candidate.photo_url = `/photos/tse-2024-rs/${targetFile}`;
    candidate.photo_source_url = OFFICIAL_SOURCE_URL;
    matches.push({
      tse_candidate_id: candidate.tse_candidate_id,
      slug: candidate.slug,
      full_name: candidate.full_name,
      party: candidate.party,
      photo_url: candidate.photo_url,
      photo_source_url: candidate.photo_source_url,
      source_file: basename(match.photo.fileName),
      official_source: OFFICIAL_SOURCE_URL,
      match_reason: match.reason,
      previous_position: match.photo.previousPosition,
      previous_municipality: match.photo.municipality,
    });
  }

  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(candidates, null, 2)}\n`);
  writeFileSync(REPORT_PATH, `${JSON.stringify({
    generated_at: new Date().toISOString(),
    source_url: OFFICIAL_SOURCE_URL,
    source_dir: SOURCE_DIR,
    strategy: '2026 public candidates matched against official TSE 2024 publishable RS photos by normalized name + party; ambiguous matches are left without photo.',
    total_candidates: candidates.length,
    matched: matches.length,
    ambiguous: ambiguous.length,
    unmatched: candidates.length - matches.length - ambiguous.length,
    matches,
    ambiguous,
  }, null, 2)}\n`);

  console.log(`✅ Fotos oficiais aplicadas: ${matches.length}`);
  console.log(`⚠️ Ambíguas ignoradas: ${ambiguous.length}`);
  console.log(`Sem match: ${candidates.length - matches.length - ambiguous.length}`);
  console.log(`Arquivos: ${OUT_DIR}`);
  console.log(`Relatório: ${REPORT_PATH}`);
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exit(1);
}
