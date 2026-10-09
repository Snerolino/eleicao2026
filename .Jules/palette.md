## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-09-01 - [A11y ARIA Labels and Broken Tests]
**Learning:** Adding descriptive `aria-label` attributes to previously plain text buttons (like `Ver candidatos`) can break existing UI tests if those tests relied on generic role/name queries that suddenly match multiple elements or stop matching due to new attributes.
**Action:** When modifying accessible names (`aria-label`) in UI components, proactively search for and update corresponding assertions in the `src/components/__tests__` and `src/pages/__tests__` directories to prevent test regressions. Use specific Regexes (e.g., `/^Deputado Estadual .*$/i`) to target exact buttons instead of loose strings.
## 2024-10-09 - Native Tooltips for Icon-Only Buttons
**Learning:** While `aria-label` is sufficient for screen readers, sighted users navigating via mouse miss out on context for icon-only buttons (like theme toggles or search clear buttons). Adding a native `title` attribute provides an OS-level tooltip on hover, significantly improving the experience for mouse users without disrupting keyboard/screen reader accessibility.
**Action:** Always include a native tooltip using the `title` attribute for icon-only buttons or heavily truncated generic links, to provide context for sighted users on hover in addition to an `aria-label`.
