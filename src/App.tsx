import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import { AppShell } from '@/components/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { LoadingSkeleton } from '@/components/states';

const ImpactMatrixPage = lazy(() => import('@/pages/ImpactMatrixPage').then((m) => ({ default: m.ImpactMatrixPage })));

function LazyFallback() {
  return <LoadingSkeleton label="Carregando página" />;
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route
              path="/candidatos/:slug"
              element={
                <Suspense fallback={<LazyFallback />}><CandidateDossierPage /></Suspense>
              }
            />
            <Route
              path="/comparar"
              element={
                <Suspense fallback={<LazyFallback />}><ComparePage /></Suspense>
              }
            />
            <Route
              path="/metodologia"
              element={
                <Suspense fallback={<LazyFallback />}><MethodologyPage /></Suspense>
              }
            />
            <Route
              path="/impacto"
              element={
                <Suspense fallback={<LazyFallback />}><ImpactMatrixPage /></Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense fallback={<LazyFallback />}><AdminPage /></Suspense>
              }
            />
            <Route path="*" element={<Suspense fallback={<LazyFallback />}><NotFoundPage /></Suspense>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}