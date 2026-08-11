## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-11 - [Accessible Toggle Switches]
**Learning:** Components using `role="switch"` shouldn't change their `aria-label` based on state (like 'Ativar modo escuro' vs 'Ativar modo claro'). Screen readers expect a stable noun for the label, relying on `aria-checked` to communicate the current state.
**Action:** Use a static noun for `aria-label` on switches (e.g., 'Modo escuro') and avoid redundant visually-hidden state text when `aria-checked` handles the semantics.
