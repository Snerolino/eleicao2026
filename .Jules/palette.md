## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-09-01 - [A11y ARIA Labels and Broken Tests]
**Learning:** Adding descriptive `aria-label` attributes to previously plain text buttons (like `Ver candidatos`) can break existing UI tests if those tests relied on generic role/name queries that suddenly match multiple elements or stop matching due to new attributes.
**Action:** When modifying accessible names (`aria-label`) in UI components, proactively search for and update corresponding assertions in the `src/components/__tests__` and `src/pages/__tests__` directories to prevent test regressions. Use specific Regexes (e.g., `/^Deputado Estadual .*$/i`) to target exact buttons instead of loose strings.

## 2024-05-24 - Search Input Accessibility (aria-label)
**Learning:** Found an accessibility issue pattern specific to this app's components: search input fields (e.g., in `CandidateDeclaredAssetsCard.tsx` and `CandidateNominalVotesList.tsx`) frequently rely solely on placeholder text for context without an explicitly associated `<label>` or `aria-label`, resulting in poor screen reader announcements.
**Action:** Always verify that input fields, especially isolated search bars without visible labels, include a descriptive `aria-label` attribute (e.g., `aria-label="Buscar bens"`) to ensure the input's purpose is properly communicated to assistive technologies.
