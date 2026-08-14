## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2024-05-18 - [Switch Role Accessibility]
**Learning:** For components using `role="switch"`, having both a dynamic `aria-label` ("Ativar modo escuro" / "Ativar modo claro") AND a dynamic `<span className="sr-only">` inside creates redundant and confusing announcements for screen readers.
**Action:** Use a stable noun for the `aria-label` (e.g., "Alternar tema") and rely solely on the `aria-checked` attribute to communicate the current state to assistive technologies. Remove redundant visually hidden text inside such controls.
