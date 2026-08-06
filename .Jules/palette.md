## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2025-08-06 - Improve focus rings and disabled context on Compare Page
**Learning:** Adding `focus-visible` styles enhances keyboard navigation for disabled or interactive elements, while tooltips on disabled interactive elements prevent user confusion on limit boundaries.
**Action:** Always ensure custom button elements have proper `focus-visible` styling (often with matching border radius utilities like `rounded-full` or `rounded-sm`) and that a `title` attribute is present when a user action is disabled to explain why.
