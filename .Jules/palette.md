## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2026-08-18 - [Screen Reader Clarity on External Links]
**Learning:** Screen readers read out decorative Unicode characters like "↗" (North East Arrow) in external links, creating awkward UX. Additionally, generic link texts like "Fonte:" or "fonte ↗" lack context when accessed outside the visual flow.
**Action:** Always wrap decorative arrow characters in `<span aria-hidden="true">` and provide descriptive, contextual `aria-label`s on generic external links to improve clarity for screen reader users.
