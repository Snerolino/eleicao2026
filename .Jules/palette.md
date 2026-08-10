## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2026-08-10 - [UI Switch Accessibility]
**Learning:** When using `role="switch"`, the `aria-label` should be a stable noun describing the switch's purpose (e.g., 'Theme' or 'Alternar tema'), relying on `aria-checked` to communicate the current state, rather than using dynamic alternating action verbs (like 'Ativar modo escuro' / 'Ativar modo claro'). This prevents screen readers from redundantly announcing state changes and avoids confusing users.
**Action:** Use static nouns for `aria-label` on switches and rely entirely on `aria-checked` for state communication.
