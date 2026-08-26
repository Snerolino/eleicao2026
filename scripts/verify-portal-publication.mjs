#!/usr/bin/env node
const baseUrl = process.env.PORTAL_URL || 'https://rs.votopraquem.org';
const checks = [];
async function check(path, label) {
  const url = `${baseUrl}${path}`;
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { accept: 'application/json,text/html' } });
    const body = await response.text();
    checks.push({ label, url, status: response.status, ok: response.ok, bytes: Buffer.byteLength(body), content_type: response.headers.get('content-type') });
    return response.ok;
  } catch (error) {
    checks.push({ label, url, status: null, ok: false, error: String(error?.message ?? error) });
    return false;
  }
}
const homepageOk = await check('/', 'portal_home');
const releaseOk = await check('/release.json', 'portal_release');
const result = { schema_version: '1.0.0', packet_type: 'portal_publication_verification', publication_state: homepageOk && releaseOk ? 'published_verified' : 'publication_blocked', remote_apply: false, checks };
console.log(JSON.stringify(result));
if (!homepageOk || !releaseOk) process.exit(1);
