import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(process.cwd());
const DIST_DIR = resolve(ROOT, 'dist');
const SNAPSHOT_MANIFEST_PATH = resolve(ROOT, 'data/tse-source-manifest.json');
const PACKAGE_PATH = resolve(ROOT, 'package.json');

function safeString(value, fallback = '') {
  return String(value ?? fallback).trim();
}

function currentGitSha() {
  const envSha = safeString(process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || process.env.SOURCE_VERSION);
  if (/^[0-9a-f]{7,40}$/i.test(envSha)) return envSha;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}

function releaseIdFrom(sha, builtAt) {
  const shortSha = safeString(sha, 'unknown').slice(0, 7);
  const stamp = safeString(builtAt).replace(/[-:.]/g, '');
  return `${shortSha}-${stamp}`;
}

export function buildReleaseMetadata({
  gitSha = currentGitSha(),
  builtAt = new Date().toISOString(),
  packageVersion,
  snapshotManifest,
} = {}) {
  const [source] = Array.isArray(snapshotManifest) ? snapshotManifest : [];
  const snapshot = source
    ? {
        scope: source.scope,
        sha256: source.sha256,
        row_count: source.row_count,
        created_at: source.created_at,
      }
    : null;

  // Versão incremental para acompanhar novidades via "Versão xx.xxx".
  // No CI (checkout shallow), `git rev-list --count` = 1 — usa
  // GITHUB_RUN_NUMBER (sequencial por push) como fallback determinístico.
  // Localmente, usa o contador real de commits.
  const ciRunNumber = process.env.GITHUB_RUN_NUMBER;
  const commitCount = (() => {
    try {
      const count = Number.parseInt(
        execFileSync('git', ['rev-list', '--count', 'HEAD'], { encoding: 'utf8' }).trim(),
        10,
      );
      // checkout shallow no CI retorna 1 — trata como "não disponível"
      return count > 1 ? count : (ciRunNumber ? Number.parseInt(ciRunNumber, 10) : 0);
    } catch {
      return ciRunNumber ? Number.parseInt(ciRunNumber, 10) : 0;
    }
  })();
  const incrementalVersion = commitCount
    ? `0.2.${commitCount}`
    : (packageVersion ?? '0.2.0');

  return {
    release_id: releaseIdFrom(gitSha, builtAt),
    sha: gitSha,
    short_sha: safeString(gitSha).slice(0, 7),
    version: incrementalVersion,
    built_at: builtAt,
    snapshot,
  };
}

function main() {
  const packageJson = JSON.parse(readFileSync(PACKAGE_PATH, 'utf8'));
  const snapshotManifest = existsSync(SNAPSHOT_MANIFEST_PATH)
    ? JSON.parse(readFileSync(SNAPSHOT_MANIFEST_PATH, 'utf8'))
    : [];
  const metadata = buildReleaseMetadata({
    packageVersion: packageJson.version,
    snapshotManifest,
  });

  mkdirSync(DIST_DIR, { recursive: true });
  writeFileSync(resolve(DIST_DIR, 'release.json'), `${JSON.stringify(metadata, null, 2)}\n`);
  console.log(`✅ release.json (${metadata.release_id})`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
