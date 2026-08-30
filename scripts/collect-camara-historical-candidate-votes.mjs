#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const prospecting = JSON.parse(readFileSync(resolve(root, 'data/legislative-import/camara/historical-candidate-prospecting-v1.json'), 'utf8'));

const targetIds = new Map();
for (const m of prospecting.matches ?? []) {
  for (const id of m.camara_ids ?? []) {
    targetIds.set(String(id), m.tse_candidate_id);
  }
}

// Extra deputies running for Senate, Governor or other positions
targetIds.set("156190", "210002547819"); // Marcel van Hattem (Senador - NOVO)
targetIds.set("74400", "210002533584");  // Paulo Pimenta (Senador - PT)
targetIds.set("204416", "210002547816"); // Sanderson (Senador - PL)
targetIds.set("220552", "210002547857"); // Luciano Zucco (Governador - PL)
targetIds.set("220551", "210002547857"); // Luciano Zucco (Governador - PL)
targetIds.set("73482", "210002533583");  // Henrique Fontana (Outro - PT)
targetIds.set("141492", "210002533581"); // Manuela DÁvila (Senador - PCdoB)
targetIds.set("73478", "210002535918");  // Beto Albuquerque (Outro - PSB)
targetIds.set("73893", "210002537050");  // Enio Bacci (Outro - UNIÃO)

const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026];

async function collectAll() {
  const allVotes = [];
  const sourceArchives = [];

  for (const year of years) {
    const url = `https://dadosabertos.camara.leg.br/arquivos/votacoesVotos/json/votacoesVotos-${year}.json`;
    console.log(`[Câmara Historical] Baixando ${url}...`);
    try {
      const response = await fetch(url, {
        headers: { accept: 'application/json', 'user-agent': 'eleicao2026-camara-history/1.0' },
        signal: AbortSignal.timeout(180000),
      });
      if (!response.ok) {
        console.warn(`[Câmara Historical] Falha ao baixar ano ${year}: HTTP ${response.status}`);
        continue;
      }
      const bodyText = await response.text();
      const sha256 = createHash('sha256').update(bodyText).digest('hex');
      const bytes = Buffer.byteLength(bodyText);
      const json = JSON.parse(bodyText);
      const rows = json.dados ?? [];

      sourceArchives.push({ year, url, sha256, bytes, rows: rows.length });
      console.log(`[Câmara Historical] Ano ${year}: ${rows.length} registros processados.`);

      for (const row of rows) {
        const depId = String(row.deputado_?.id || row.idDeputado || row.deputado_id || '');
        const tse = targetIds.get(depId);
        if (!tse) continue;

        const rawVal = String(row.voto ?? row.tipoVoto ?? '').trim();
        const value = ({
          Sim: 'sim',
          'Não': 'nao',
          'Abstenção': 'abstencao',
          Ausente: 'ausente',
          'Obstrução': 'obstrucao',
          'Artigo 17': 'abstencao',
        })[rawVal] || (rawVal.toLowerCase() === 'não' || rawVal.toLowerCase() === 'nao' ? 'nao' : 'sim');

        const votacaoId = String(row.idVotacao || row.id_votacao || '');
        allVotes.push({
          candidate_tse_id: tse,
          deputy_id: `camara-deputado-${depId}`,
          event_external_id: `camara-votacao-${votacaoId}`,
          value,
          recorded_at: row.dataHoraVoto || row.dataRegistroVoto || `${year}-01-01T00:00:00`,
          source_url: `https://dadosabertos.camara.leg.br/api/v2/votacoes/${votacaoId}/votos`,
        });
      }
    } catch (err) {
      console.error(`[Câmara Historical] Erro no ano ${year}:`, err.message);
    }
  }

  // Deduplicação por (candidate_tse_id, event_external_id, value)
  const dedup = [...new Map(allVotes.map((v) => [`${v.candidate_tse_id}|${v.event_external_id}|${v.value}`, v])).values()];

  const result = {
    schema_version: '1.0.0',
    packet_type: 'camara_historical_candidate_votes',
    remote_apply: false,
    years,
    source_archives: sourceArchives,
    totals: {
      target_camara_ids: targetIds.size,
      nominal_vote_events: new Set(dedup.map((v) => v.event_external_id)).size,
      api_vote_pages: sourceArchives.length,
      candidate_vote_rows: dedup.length,
    },
    votes: dedup,
  };

  const output = resolve(root, 'data/legislative-import/camara/historical-candidate-votes-v1.json');
  mkdirSync(resolve(root, 'data/legislative-import/camara'), { recursive: true });
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(`✅ Coleta concluída com sucesso: ${dedup.length} votos nominais em ${output}`);
}

collectAll();
