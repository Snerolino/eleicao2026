## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-09-01 - [A11y ARIA Labels and Broken Tests]
**Learning:** Adding descriptive `aria-label` attributes to previously plain text buttons (like `Ver candidatos`) can break existing UI tests if those tests relied on generic role/name queries that suddenly match multiple elements or stop matching due to new attributes.
**Action:** When modifying accessible names (`aria-label`) in UI components, proactively search for and update corresponding assertions in the `src/components/__tests__` and `src/pages/__tests__` directories to prevent test regressions. Use specific Regexes (e.g., `/^Deputado Estadual .*$/i`) to target exact buttons instead of loose strings.

## 2024-10-07 - [A11y Context on Generic Links and Icon Buttons]
**Learning:** Icon-only buttons or heavily truncated text links (like generic "fonte ↗" or "Ver perfil →") often have an `aria-label` for screen readers, but lack context for sighted mouse users. Relying purely on surrounding visual context isn't always enough and can lead to ambiguity.
**Action:** Always complement the `aria-label` with a native `title` attribute using the same dynamic context string (e.g. `title={\`Ver perfil de \${candidate.full_name}\`}`) to provide an accessible tooltip on hover for sighted users.

## 2024-10-07 - [Repository Hygiene]
**Learning:** Running `pnpm install`, `pnpm build`, or `pnpm test` may trigger data generation scripts that unexpectedly modify internal JSON state files or create `pnpm-lock.yaml`.
**Action:** Always check `git status` before committing and use `git restore` to revert any unintentional modifications to files outside the direct scope of the UX enhancement, especially data or lockfiles.
