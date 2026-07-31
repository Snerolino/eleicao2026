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

  return {
    release_id: releaseIdFrom(gitSha, builtAt),
    sha: gitSha,
    short_sha: safeString(gitSha).slice(0, 7),
    version: packageVersion ?? '0.0.0',
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
