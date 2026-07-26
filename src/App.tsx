import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { LoadingSkeleton } from '@/components/states';

const CandidateDossierPage = lazy(() =>
  import('@/pages/CandidateDossierPage').then((m) => ({
    default: m.CandidateDossierPage,
  }))
);
const ComparePage = lazy(() =>
  import('@/pages/ComparePage').then((m) => ({
    default: m.ComparePage,
  }))
);
const MethodologyPage = lazy(() =>
  import('@/pages/MethodologyPage').then((m) => ({
    default: m.MethodologyPage,
  }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  }))
);

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
              path="/candidatos/:id"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <CandidateDossierPage />
                </Suspense>
              }
            />
            <Route
              path="/comparar"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <ComparePage />
                </Suspense>
              }
            />
            <Route
              path="/metodologia"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <MethodologyPage />
                </Suspense>
              }
            />
            <Route
              path="*"
              element={
                <Suspense fallback={<LazyFallback />}>
                  <NotFoundPage />
                </Suspense>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
