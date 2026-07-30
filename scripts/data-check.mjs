import { loadPublicCandidateSnapshot } from './public-candidate-snapshot.mjs';

function main() {
  const candidates = loadPublicCandidateSnapshot();
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
}

main();
