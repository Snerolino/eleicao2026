// @vitest-environment node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '..', '..');
const envelopePath = resolve(root, 'data/legislative-import/camara/plp-230-2025-votacao-2580259-24-marcel-van-hattem.json');
const sourcesPath = resolve(root, 'data/legislative-import/camara/plp-230-2025-votacao-2580259-24-sources.json');

function collectEnvelopeUrls(envelope) {
  const urls = [];
  for (const proposition of envelope.propositions) {
    urls.push(proposition.official_url);
    for (const version of proposition.versions) {
      urls.push(version.source);
      for (const event of version.voting_events) urls.push(event.source);
    }
  }
  for (const vote of envelope.votes) urls.push(vote.source);
  return [...new Set(urls.map((url) => url.trim().toLowerCase()))].sort();
}

describe('source references do pacote real PLP 230/2025', () => {
  it('cobre exatamente as URLs oficiais usadas no envelope real', () => {
    const envelope = JSON.parse(readFileSync(envelopePath, 'utf8'));
    const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'));

    expect(sources.schema_version).toBe('1.0.0');
    expect(sources.sources.map((source) => source.key.trim().toLowerCase()).sort()).toEqual(collectEnvelopeUrls(envelope));
  });

  it('usa somente fontes oficiais públicas da Câmara com hashes sha256 únicos', () => {
    const sources = JSON.parse(readFileSync(sourcesPath, 'utf8'));
    const hashes = new Set();

    for (const source of sources.sources) {
      expect(source.source_name).toMatch(/^Câmara dos Deputados/);
      expect(source.source_category).toBe('oficial');
      expect(source.url).toBe(source.key);
      expect(source.url).toMatch(/^https:\/\/(dadosabertos\.camara\.leg\.br|www\.camara\.leg\.br)\//);
      expect(source.title).toMatch(/PLP 230\/2025|Votação 2580259-24|Substitutivo 1 PLEN/);
      expect(source.content_hash).toMatch(/^sha256:[0-9a-f]{64}$/);
      expect(source.hash_method).toMatch(/^(canonical-json-v1|raw-bytes-v1)$/);
      expect(hashes.has(source.content_hash)).toBe(false);
      hashes.add(source.content_hash);
      expect(JSON.stringify(source)).not.toMatch(/service_role|apikey|Authorization|Bearer/i);
    }
  });
});
