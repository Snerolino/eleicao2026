// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { resolveExistingSources, validateSourceInput } from '../apply-camara-q1-sources.mjs';

const url = 'https://example.gov/source';
const hash = `sha256:${'a'.repeat(64)}`;
const id = '123e4567-e89b-12d3-a456-426614174000';
const input = {
  schema_version: '1.0.0',
  sources: [{ source_name: 'Oficial', source_category: 'oficial', url, title: 'Fonte', content_hash: hash }],
};
const manifest = { schema_version: '1.0.0', urls: [{ url, status: 200, bytes: 12, sha256: hash }] };

describe('writer de source_references Câmara', () => {
  it('valida catálogo e manifesto por URL/hash', () => {
    expect(validateSourceInput(input, manifest)).toEqual(input.sources);
  });

  it('rejeita hash divergente no manifesto', () => {
    expect(() => validateSourceInput(input, { ...manifest, urls: [{ ...manifest.urls[0], sha256: `sha256:${'b'.repeat(64)}` }] })).toThrow('não coincide');
  });

  it('rejeita manifesto HTTP não verificável', () => {
    expect(() => validateSourceInput(input, { ...manifest, urls: [{ ...manifest.urls[0], status: 504 }] })).toThrow('manifesto de fonte inválido');
  });

  it('resolve somente UUIDs remotos com hash exato', () => {
    expect(resolveExistingSources(input.sources, [{ id, url, content_hash: hash }])).toEqual(new Map([[url, id]]));
  });

  it('falha fechado para referência ausente, UUID inválido ou hash divergente', () => {
    expect(() => resolveExistingSources(input.sources, [])).toThrow('ausentes');
    expect(() => resolveExistingSources(input.sources, [{ id: 'not-a-uuid', url, content_hash: hash }])).toThrow('UUID');
    expect(() => resolveExistingSources(input.sources, [{ id, url, content_hash: `sha256:${'c'.repeat(64)}` }])).toThrow('divergente');
  });
});
