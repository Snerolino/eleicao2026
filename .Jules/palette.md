## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-16 - [A11y Context on Switch Elements]
**Learning:** For UI components using `role="switch"`, using an alternating `aria-label` based on state (e.g., "Ativar modo escuro" vs "Ativar modo claro") alongside `aria-checked` can create confusing and overly verbose screen reader announcements. Furthermore, placing visually hidden text (e.g., `<span className="sr-only">`) inside interactive elements that already have an explicit `aria-label` creates redundant or conflicting screen reader announcements.
**Action:** Use a stable noun for the `aria-label` of a switch (e.g., `aria-label="Modo escuro"`) and rely on `aria-checked` to communicate its current state. Ensure no redundant `sr-only` spans are included inside an element that already provides an explicit `aria-label`.
