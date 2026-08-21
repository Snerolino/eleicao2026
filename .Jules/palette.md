## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2025-02-21 - ThemeToggle Switch Accessibility
**Learning:** For components using `role="switch"`, using an `aria-label` that represents an action ("Ativar modo escuro" / "Ativar modo claro") creates confusing screen reader announcements because the state is already conveyed via `aria-checked`. Furthermore, adding a visually hidden `span` (`sr-only`) inside a button that already has an `aria-label` causes redundant or conflicting announcements.
**Action:** Use a stable noun for the `aria-label` (e.g., "Modo escuro") and rely entirely on `aria-checked` to communicate state. Do not include nested visually hidden text for accessible names when an `aria-label` is already present.
