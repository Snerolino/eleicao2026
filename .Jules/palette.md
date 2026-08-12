## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-12 - [Stable ARIA Labels for Role Switch Components]
**Learning:** Alternating action verbs in `aria-label` (e.g. 'Ativar modo escuro' vs 'Ativar modo claro') combined with `role="switch"` creates contradictory and confusing screen reader announcements like 'Ativar modo escuro, switch, on'. Redundant `<span className="sr-only">` inside the button can also conflict with `aria-label`.
**Action:** For UI components using `role="switch"`, always use a stable noun for the `aria-label` (e.g. 'Modo de cor') and rely solely on `aria-checked` to communicate the 'on/off' state. Do not include redundant `sr-only` text if the label is sufficient.
