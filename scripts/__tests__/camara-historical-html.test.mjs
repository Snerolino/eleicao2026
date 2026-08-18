// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  normalizeHistoricalVote,
  parseHistoricalNominalCandidate,
  parseHistoricalNominalRows,
} from '../lib/camara-historical-html.mjs';

const HTML = readFileSync('fixtures/legislative-import/camara-historical-nominal.html', 'utf8');

describe('parser HTML nominal histórico da Câmara', () => {
  it('normaliza rótulos oficiais e rejeita texto não nominal', () => {
    expect(normalizeHistoricalVote('Não')).toBe('nao');
    expect(normalizeHistoricalVote('ABSTENÇÃO')).toBe('abstencao');
    expect(normalizeHistoricalVote('Presente sem voto individual')).toBeNull();
  });

  it('extrai somente linhas td completas e filtra UF', () => {
    expect(parseHistoricalNominalRows(HTML, { targetUf: 'RS' })).toEqual([
      { name: 'Henrique Fontana', uf: 'RS', raw_vote: 'Não', vote: 'nao' },
      { name: 'Maria do Rosário', uf: 'RS', raw_vote: 'Sim', vote: 'sim' },
    ]);
  });

  it('reconcilia nome exato sem fuzzy matching', () => {
    expect(parseHistoricalNominalCandidate(HTML, 'HENRIQUE FONTANA')).toMatchObject({
      name: 'Henrique Fontana', uf: 'RS', vote: 'nao',
    });
    expect(parseHistoricalNominalCandidate(HTML, 'Henrique Fontana Júnior')).toBeNull();
  });

  it('falha fechado para HTML ausente e rejeita duplicidade exata', () => {
    expect(() => parseHistoricalNominalRows('')).toThrow(/HTML oficial ausente/);
    const duplicate = HTML.replace('</table>', '<tr><td>Henrique Fontana</td><td>RS</td><td>Sim</td></tr></table>');
    expect(() => parseHistoricalNominalCandidate(duplicate, 'Henrique Fontana')).toThrow(/Mais de uma linha/);
  });
});
