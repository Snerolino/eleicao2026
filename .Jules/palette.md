## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2026-08-04 - Keyboard Shortcut Visual Hint
**Learning:** Adding a global keyboard shortcut (like `/` to focus search) is great for power users, but adding a visual hint (`<kbd>/</kbd>`) within the search input greatly increases discoverability for all users. It's important to hide this visual hint with `aria-hidden="true"` so it doesn't cause redundant or confusing announcements for screen reader users who already know how to navigate to forms.
**Action:** When implementing keyboard shortcuts for common actions, include a visual indicator if possible, but always consider the screen reader experience and hide visual-only hints.
