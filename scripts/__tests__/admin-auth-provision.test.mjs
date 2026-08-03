// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const scriptPath = join(root, 'scripts/create-admin-user.mjs');

describe('create-admin-user', () => {
  it('provisiona usuário Auth/admin sem fallback inseguro nem segredos versionados', () => {
    expect(existsSync(scriptPath)).toBe(true);

    const content = readFileSync(scriptPath, 'utf8');

    expect(content).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(content).toMatch(/ADMIN_EMAIL/);
    expect(content).toMatch(/ADMIN_PASSWORD/);
    expect(content).toMatch(/auth\.admin\.createUser|auth\.admin\.inviteUserByEmail/);
    expect(content).toMatch(/editor_roles/);
    expect(content).toMatch(/upsert/);
    expect(content).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY\s*\|\|\s*.*VITE_SUPABASE_ANON_KEY/);
    expect(content).not.toMatch(/ADMIN_PASSWORD\s*=\s*['"][^'"]+['"]/);
    expect(content).not.toMatch(/console\.log\([^)]*(SERVICE|PASSWORD|TOKEN|KEY)/i);
  });
});
