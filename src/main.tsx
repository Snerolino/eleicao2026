import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './theme.css';
import { CandidateListPage } from './pages/CandidateListPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CandidateListPage />
  </StrictMode>
);