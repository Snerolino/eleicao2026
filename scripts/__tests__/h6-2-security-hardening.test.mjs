import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const headers = readFileSync(join(root, 'public/_headers'), 'utf8');
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const sourceScript = readFileSync(join(root, 'scripts/insert-fontes-oficiais.mjs'), 'utf8');

function headerValue(name) {
  const match = headers.match(new RegExp(`^\\s*${name}:\\s*(.+)$`, 'mi'));
  return match?.[1]?.trim() ?? '';
}

describe('H6.2 headers, dependências e hardening editorial', () => {
  it('public/_headers aplica políticas seguras compatíveis com PWA em modo CSP enforce', () => {
    expect(headerValue('Content-Security-Policy')).toContain("default-src 'self'");
    expect(headerValue('Content-Security-Policy')).toContain('https://*.supabase.co');
    expect(headerValue('Content-Security-Policy')).toContain('https://*.supabase.in');
    expect(headerValue('Content-Security-Policy')).toContain('https://cloudflareinsights.com');
    expect(headerValue('Content-Security-Policy')).toContain('https://*.cloudflareinsights.com');
    expect(headerValue('Content-Security-Policy')).toContain('worker-src');
    expect(headerValue('Content-Security-Policy')).toContain('manifest-src');
    expect(headerValue('Content-Security-Policy')).not.toContain('upgrade-insecure-requests');
    expect(headerValue('Content-Security-Policy-Report-Only')).toBe('');
    expect(headerValue('X-Content-Type-Options')).toBe('nosniff');
    expect(headerValue('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(headerValue('X-Frame-Options')).toBe('DENY');
    expect(headerValue('Permissions-Policy')).toMatch(/camera=\(\), microphone=\(\), geolocation=\(\)/);
  });

  it('package expõe auditoria de dependências sem atualização em massa automática', () => {
    expect(packageJson.scripts['security:audit']).toContain('npm audit');
    expect(packageJson.scripts['security:audit']).toContain('--audit-level=high');
    expect(packageJson.scripts['security:audit']).toContain('--omit=dev');
    expect(packageJson.scripts['security:audit']).not.toMatch(/audit fix|update|upgrade/i);
  });

  it('script de fontes oficiais não faz fallback para anon nem publica claim direto', () => {
    expect(sourceScript).toMatch(/SUPABASE_SERVICE_ROLE_KEY/);
    expect(sourceScript).toMatch(/service role obrigat[oó]ri/i);
    expect(sourceScript).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY\s*\|\|\s*env\.VITE_SUPABASE_ANON_KEY/);
    expect(sourceScript).not.toMatch(/status:\s*['"]published['"]/);
    expect(sourceScript).not.toMatch(/published_at:/);
    expect(sourceScript).toMatch(/status:\s*['"]pending_review['"]/);
  });

  it('documenta H6.2, CSP enforce e pendência humana de publicação editorial', () => {
    const qa = readFileSync(join(root, 'docs/qa/h6-2-seguranca-headers-editorial.md'), 'utf8');
    expect(qa).toMatch(/Content-Security-Policy/);
    expect(qa).toMatch(/enforce/i);
    expect(qa).toMatch(/npm run security:audit/);
    expect(qa).toMatch(/pending_review/);
    expect(qa).toMatch(/interven[cç][aã]o humana/i);
  });
});
