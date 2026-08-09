## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-05-18 - Stable Labels for ARIA Switches
**Learning:** Using alternating action verbs (like "Ativar modo escuro" / "Ativar modo claro") as the `aria-label` for a `role="switch"` creates confusing screen reader output (e.g., "Ativar modo escuro, switch, on"). The state is already communicated by `aria-checked`.
**Action:** Always use a stable noun or feature name (like "Modo escuro") for the `aria-label` of a switch, and rely on `aria-checked` to communicate its current state.
