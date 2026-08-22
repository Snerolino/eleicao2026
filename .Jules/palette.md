## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-22 - [ThemeToggle switch accessibility]
**Learning:** For UI components using `role="switch"`, using alternating action verbs in the `aria-label` (e.g., 'Ativar modo escuro' vs 'Ativar modo claro') combined with visually hidden text (`<span className="sr-only">`) creates redundant and confusing announcements for screen readers.
**Action:** Use a stable noun for the `aria-label` (e.g., 'Modo escuro'), rely on the `aria-checked` attribute to communicate the current state, and remove redundant visually hidden text inside the switch element.
