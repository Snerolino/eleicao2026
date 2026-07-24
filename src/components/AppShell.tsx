import { Outlet } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';
import { DemoBanner } from '@/components/states';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export function AppShell() {
  return (
    <div className="min-h-dvh">
      {!isSupabaseConfigured && <DemoBanner />}
      <SiteHeader />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
