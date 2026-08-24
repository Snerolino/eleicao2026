## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-05-18 - [Standardizing Keyboard Focus on Fallback/Error State Buttons]
**Learning:** Buttons within fallback or error state views (like ErrorBoundary or ErrorState) are often missed when applying standard focus styles because they are rendered outside the primary application layout or appear only in edge cases. Without proper focus indicators, keyboard users may struggle to recover from errors.
**Action:** Always ensure that interactive elements within fallback, error, or generic state components (e.g. "Recarregar página" or "Tentar novamente" buttons) explicitly include the standard focus ring classes (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]`) to maintain consistent keyboard navigability during application recovery.
