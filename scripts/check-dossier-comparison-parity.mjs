import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4184';
const candidates = JSON.parse(readFileSync(new URL('../data/public-candidates.json', import.meta.url)));
const candidate = candidates.find((row) => row.tse_candidate_id === '210002533934');
const peer = candidates.find((row) => row.tse_candidate_id === '210002533902');
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {}) });
try {
  const page = await browser.newPage();
  const labels = () => page.getByRole('group').evaluateAll((elements, name) =>
    elements.map((element) => element.getAttribute('aria-label')).filter((label) => label?.includes(`para ${name}:`)), candidate.full_name);
  await page.goto(`${base}/candidatos/${candidate.slug}`);
  await page.waitForFunction((name) => [...document.querySelectorAll('[role="group"]')].some((element) => element.getAttribute('aria-label')?.includes(`para ${name}:`)), candidate.full_name, { timeout: 60000 });
  const individual = await labels();
  await page.goto(`${base}/comparar?candidatos=${candidate.id},${peer.id}`);
  await page.waitForFunction((name) => [...document.querySelectorAll('[role="group"]')].some((element) => element.getAttribute('aria-label')?.includes(`para ${name}:`)), candidate.full_name, { timeout: 60000 });
  const expand = page.getByRole('button', { name: /Expandir todos/ });
  if (await expand.count()) await expand.click();
  const comparison = await labels();
  const differences = [...individual.filter((label) => !comparison.includes(label)), ...comparison.filter((label) => !individual.includes(label))];
  const result = { candidate: candidate.full_name, individualCount: individual.length, comparisonCount: comparison.length, differences, individual, comparison };
  console.log(JSON.stringify(result, null, 2));
  if (individual.length < 14 || comparison.length !== individual.length || differences.length) throw new Error('Dossiê e comparação divergentes');
} finally {
  await browser.close();
}
