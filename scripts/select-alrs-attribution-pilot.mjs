#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const inputPath = resolve(root, 'artifacts/reprocess-impact-v2/release-inventory.json');
const outputPath = resolve(root, 'data/legislative-import/alrs/alrs-attribution-pilot-v1.json');

function readInventory() {
  try { return JSON.parse(readFileSync(inputPath, 'utf8')); } catch (error) {
    throw new Error(`release inventory unavailable: ${error.message}`);
  }
}

export function selectPilot(inventory, { limit = 10, min = 5 } = {}) {
  const eligible = (inventory.inventory ?? [])
    .filter((item) => item.state === 'impact_ready_for_review' || item.state === 'impact_release_ready')
    .filter((item) => item.house === 'alrs')
    .filter((item) => item.identity_status === 'exact')
    .filter((item) => item.event_status === 'isolated')
    .filter((item) => item.candidate_ids?.length > 0)
    .sort((a, b) => String(a.occurred_at).localeCompare(String(b.occurred_at)) || a.inventory_key.localeCompare(b.inventory_key));
  const selected = eligible.slice(0, limit);
  return {
    schema_version: '1.0.0',
    packet_type: 'alrs_attribution_pilot',
    mode: selected.length >= min ? 'pending_review' : 'blocked_no_eligible_items',
    remote_apply: false,
    public_approval: false,
    source_inventory_count: inventory.inventory_count ?? inventory.inventory?.length ?? 0,
    eligible_count: eligible.length,
    selected_count: selected.length,
    min_required: min,
    items: selected,
  };
}

if (process.argv[1]?.endsWith('select-alrs-attribution-pilot.mjs')) {
  try {
    const pilot = selectPilot(readInventory());
    mkdirSync(resolve(root, 'data/legislative-import/alrs'), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(pilot, null, 2)}\n`);
    console.log(JSON.stringify({ output: 'data/legislative-import/alrs/alrs-attribution-pilot-v1.json', mode: pilot.mode, selected_count: pilot.selected_count, remote_apply: false }));
  } catch (error) {
    console.error(`PILOT_BLOCKED: ${error.message}`);
    process.exit(2);
  }
}
