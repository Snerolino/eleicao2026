## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-23 - [Redundant A11y on Switch Controls]
**Learning:** Using alternating action verbs in `aria-label` (e.g. 'Ativar modo escuro' vs 'Ativar modo claro') and nesting visually hidden `sr-only` text inside components with `role="switch"` creates redundant and conflicting screen reader announcements.
**Action:** Always use a stable noun for `aria-label` on switch controls (e.g., 'Modo escuro'), rely on `aria-checked` to communicate state changes dynamically, and do not nest visually hidden fallback text inside elements that already have an explicit `aria-label`.
