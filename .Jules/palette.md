## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-27 - [A11y Context on Switch Roles]
**Learning:** Using alternating action verbs (e.g. "Ativar modo escuro" / "Ativar modo claro") as the `aria-label` on elements with `role="switch"` is confusing, as screen readers announce the label alongside the `aria-checked` state (e.g., "Ativar modo escuro, switch, off"). Additionally, visually hidden text (`sr-only`) placed inside an element that already has an explicit `aria-label` creates redundant or conflicting announcements.
**Action:** For UI components using `role="switch"`, always use a stable noun for the `aria-label` (e.g. "Alternar tema") and rely on `aria-checked` to communicate state. Avoid placing `.sr-only` text alongside explicit `aria-label`s.
