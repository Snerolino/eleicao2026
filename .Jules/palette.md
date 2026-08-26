## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-26 - [ARIA Labels for Switch Roles]
**Learning:** For elements with `role="switch"`, dynamically changing the `aria-label` (e.g., from "Ativar modo escuro" to "Ativar modo claro") alongside `aria-checked` creates conflicting announcements for screen readers.
**Action:** Always use a stable noun for the `aria-label` (e.g., "Modo escuro") and rely entirely on `aria-checked` to communicate state, avoiding alternating action verbs or visually hidden redundant spans.
