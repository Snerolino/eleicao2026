## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2026-08-31 - [Keyboard Accessibility for Interactive Custom Elements]
**Learning:** Custom interactive elements (like tabs and collapsible headers) sometimes mistakenly use `focus:outline-none` to hide default browser outlines on click, inadvertently removing focus rings for keyboard users entirely.
**Action:** Never use `focus:outline-none` without providing an explicit fallback. Always apply the application's standard keyboard focus pattern (`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-institutional)]`) with a `rounded-sm` utility when creating or styling interactive custom elements.
