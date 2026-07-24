import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { CandidateDossierPage } from '@/pages/CandidateDossierPage';
import { HomePage } from '@/pages/HomePage';
import { MethodologyPage } from '@/pages/MethodologyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route
            path="/candidatos/:id"
            element={<CandidateDossierPage />}
          />
          <Route
            path="/metodologia"
            element={<MethodologyPage />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
