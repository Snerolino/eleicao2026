## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-09-01 - [A11y ARIA Labels and Broken Tests]
**Learning:** Adding descriptive `aria-label` attributes to previously plain text buttons (like `Ver candidatos`) can break existing UI tests if those tests relied on generic role/name queries that suddenly match multiple elements or stop matching due to new attributes.
**Action:** When modifying accessible names (`aria-label`) in UI components, proactively search for and update corresponding assertions in the `src/components/__tests__` and `src/pages/__tests__` directories to prevent test regressions. Use specific Regexes (e.g., `/^Deputado Estadual .*$/i`) to target exact buttons instead of loose strings.

## 2026-09-04 - [A11y Hiding Decorative Text Indicators]
**Learning:** Decorative text characters used as UI icons (e.g., '✕' for clear, '★' / '☆' for save states, '●' / '○' for online statuses) are read aloud by screen readers (e.g., "star", "multiplication x"), which creates redundant or confusing announcements when the interactive element already has an explicit `aria-label` or accessible text.
**Action:** Always wrap these decorative text characters in a `<span aria-hidden="true">` to prevent screen reader redundancy while maintaining their visual presence. Also, update any tests using exact text matches (`getByText('○ offline')`) to use regex matches (`getByText(/offline/i)`) since the DOM node boundaries are split.
