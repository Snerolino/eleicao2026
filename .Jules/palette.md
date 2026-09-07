## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-09-01 - [A11y ARIA Labels and Broken Tests]
**Learning:** Adding descriptive `aria-label` attributes to previously plain text buttons (like `Ver candidatos`) can break existing UI tests if those tests relied on generic role/name queries that suddenly match multiple elements or stop matching due to new attributes.
**Action:** When modifying accessible names (`aria-label`) in UI components, proactively search for and update corresponding assertions in the `src/components/__tests__` and `src/pages/__tests__` directories to prevent test regressions. Use specific Regexes (e.g., `/^Deputado Estadual .*$/i`) to target exact buttons instead of loose strings.

## 2026-09-07 - [Decorative Text and Test Fragility]
**Learning:** Wrapping decorative text nodes (like '●' or '✕') inside  spans is a great accessibility improvement. However, this often breaks existing tests that rely on exact string matching across the entire text node.
**Action:** When updating component text structure to hide decorative characters, always update the corresponding React Testing Library queries (e.g. ) to use a regex (e.g. ) instead of an exact string match to prevent test breakage.

## 2024-09-07 - [Decorative Text and Test Fragility]
**Learning:** Wrapping decorative text nodes (like '●' or '✕') inside `aria-hidden="true"` spans is a great accessibility improvement. However, this often breaks existing tests that rely on exact string matching across the entire text node.
**Action:** When updating component text structure to hide decorative characters, always update the corresponding React Testing Library queries (e.g. `getByText`) to use a regex (e.g. `/offline/i`) instead of an exact string match to prevent test breakage.
