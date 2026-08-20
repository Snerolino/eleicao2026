## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2023-10-24 - [Keyboard Focus States in Error Components]
**Learning:** Error Boundary and Error State components often overlook keyboard focus states on their primary actions ("Retry" or "Reload"), breaking accessibility for keyboard users trying to recover from an error.
**Action:** Always ensure fallback and error UI elements inherit the standard focus-visible styles (e.g. `focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]`).
