## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2026-08-29 - [A11y Context on Switch Role Buttons]
**Learning:** For UI components using 'role="switch"', the 'aria-label' must be a stable noun (e.g., "Alternância de tema") rather than alternating action verbs based on state (like "Ativar modo escuro" / "Ativar modo claro"). The state is properly communicated to screen readers via the 'aria-checked' attribute.
**Action:** Always use a stable noun for the 'aria-label' on switch components and rely on 'aria-checked' to convey the current state.
