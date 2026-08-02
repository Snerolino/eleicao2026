import { Outlet } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DemoBanner } from '@/components/states';
import { PageJumpControls } from '@/components/PageJumpControls';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export function AppShell() {
  return (
    <div className="min-h-dvh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-[var(--color-ink)] focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Ir para o conteúdo principal
      </a>

      {!isSupabaseConfigured && <DemoBanner />}
      <SiteHeader />
      <Outlet />
      <PageJumpControls />
      <SiteFooter />
      <div id="page-end" aria-hidden="true" />
    </div>
  );
}
