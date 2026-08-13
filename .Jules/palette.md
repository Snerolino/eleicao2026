## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-13 - [ThemeToggle Accessibility Fix]
**Learning:** For a toggle button utilizing `role="switch"`, dynamically changing the `aria-label` (e.g., between 'Activate light mode' and 'Activate dark mode') while the `aria-checked` state is also shifting can confuse screen readers. Moreover, embedding `<span className="sr-only">` inside a button that already possesses an `aria-label` creates redundant or conflicting announcements.
**Action:** Use a stable noun for the `aria-label` on `role="switch"` (like 'Dark theme') and rely exclusively on the `aria-checked` attribute to communicate the state. Always avoid nested visually hidden text within elements that provide explicit `aria-label`s.
