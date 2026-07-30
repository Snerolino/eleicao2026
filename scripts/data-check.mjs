import { loadPublicCandidateSnapshot } from './public-candidate-snapshot.mjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertPublicSnapshotHasNoSensitiveFields,
  TSE_SOURCE_MANIFEST_RELATIVE_PATH,
  validateDatasetSourceManifest,
} from './tse-ingest-contract.mjs';

const ROOT = resolve(import.meta.dirname, '..');

function main() {
  const candidates = loadPublicCandidateSnapshot();
  assertPublicSnapshotHasNoSensitiveFields(candidates);
  const manifest = JSON.parse(readFileSync(resolve(ROOT, TSE_SOURCE_MANIFEST_RELATIVE_PATH), 'utf8'));
  validateDatasetSourceManifest(manifest);
  const byPosition = candidates.reduce((acc, candidate) => {
    acc[candidate.position] = (acc[candidate.position] ?? 0) + 1;
    return acc;
  }, {});

  console.log('✅ Snapshot público válido');
  console.log(`   candidaturas: ${candidates.length}`);
  console.log(
    `   cargos: ${Object.entries(byPosition)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([position, count]) => `${position}=${count}`)
      .join(', ')}`,
  );
  console.log(`   fontes TSE: ${manifest.length}`);
}

main();
