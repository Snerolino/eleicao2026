## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2026-08-25 - [A11y Context on Switch Role]
**Learning:** For UI components using 'role="switch"', including both a redundant hidden span (`<span className="sr-only">`) and an alternating `aria-label` creates conflicting or duplicated screen reader announcements.
**Action:** Use a stable noun for the `aria-label` (e.g., `aria-label="Modo escuro"`) and rely solely on `aria-checked` to communicate state changes, avoiding visually hidden text inside the interactive element.
