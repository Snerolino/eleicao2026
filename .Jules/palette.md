## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2026-08-07 - [Smooth Scrolling for Anchor Links]
**Learning:** Hard-jumping anchor links disrupt user context, especially on tall pages with "back to top" buttons.
**Action:** Always add `scroll-smooth` to the HTML root when dealing with pages that have intra-page navigation or `#top` links.
