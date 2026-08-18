const VOTE_LABELS = new Map([
  ['SIM', 'sim'],
  ['NÃO', 'nao'],
  ['NAO', 'nao'],
  ['ABSTENÇÃO', 'abstencao'],
  ['ABSTENCAO', 'abstencao'],
  ['OBSTRUÇÃO', 'obstrucao'],
  ['OBSTRUCAO', 'obstrucao'],
  ['AUSENTE', 'ausente'],
  ['ART. 17', 'ausente'],
]);

function decodeHtml(value) {
  return String(value)
    .replace(/&#(x[0-9a-f]+|[0-9]+);/gi, (_, code) => {
      const number = code.toLowerCase().startsWith('x')
        ? Number.parseInt(code.slice(1), 16)
        : Number.parseInt(code, 10);
      return Number.isFinite(number) ? String.fromCodePoint(number) : _;
    })
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function cellText(value) {
  return decodeHtml(String(value).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function key(value) {
  return cellText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function normalizeHistoricalVote(value) {
  return VOTE_LABELS.get(key(value)) ?? null;
}

export function parseHistoricalNominalRows(html, { targetUf = null, candidateName = null } = {}) {
  if (typeof html !== 'string' || html.trim() === '') throw new Error('HTML oficial ausente');
  const rows = [];
  for (const match of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr\s*>/gi)) {
    const cells = [...match[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td\s*>/gi)].map((cell) => cellText(cell[1]));
    if (cells.length < 3) continue;
    const [name, uf, rawVote] = cells;
    const vote = normalizeHistoricalVote(rawVote);
    if (!name || !uf || !vote) continue;
    if (targetUf && key(uf) !== key(targetUf)) continue;
    if (candidateName && key(name) !== key(candidateName)) continue;
    rows.push({ name, uf: key(uf), raw_vote: rawVote, vote });
  }
  return rows;
}

export function parseHistoricalNominalCandidate(html, candidateName, targetUf = 'RS') {
  const rows = parseHistoricalNominalRows(html, { candidateName, targetUf });
  if (rows.length > 1) throw new Error(`Mais de uma linha nominal para ${candidateName}`);
  return rows[0] ?? null;
}
