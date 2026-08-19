// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { loadHistoricalInputs, runHistoricalWriter, validateHistoricalContract } from '../apply-camara-historical-resolved.mjs';

describe('FED-27 writer histórico Câmara', () => {
  it('valida o envelope resolvido e planeja somente os 84 votos elegíveis', async () => {
    const inputs = loadHistoricalInputs();
    const contract = validateHistoricalContract(inputs);
    expect(contract.counts).toEqual({ propositions: 2, versions: 6, events: 6, votes: 84 });
    const report = await runHistoricalWriter({ inputs });
    expect(report).toMatchObject({
      mode: 'dry-run',
      remote_apply: false,
      planned: {
        legislative_propositions: 2,
        proposition_versions: 6,
        voting_events: 6,
        legislative_votes: 84,
      },
      votes_touched: 0,
      impact_touched: false,
      editorial_touched: false,
      rpc_called: false,
    });
  });

  it('não instancia cliente remoto nem promove identidades bloqueadas no dry-run', async () => {
    const inputs = loadHistoricalInputs();
    const report = await runHistoricalWriter({ inputs, apply: false, sb: null });
    expect(report.local_contract_verified).toMatchObject({ eligible_candidates: 18, blocked_identities: 8 });
    expect(report.inserted.legislative_votes).toBe(0);
  });
});
