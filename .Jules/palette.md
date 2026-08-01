## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.
## 2025-02-12 - Accessible "Clickable Cards"
**Learning:** Using an absolutely positioned `<Link>` (like `after:inset-0`) to make an entire card clickable is great for interaction, but creates double focus states for keyboard users.
**Action:** Always add `focus-visible:outline-none` to the stretching `<Link>` and instead use `focus-within:ring-*` on the parent `<article>` to provide a clear, single focus indicator for the entire card bounding box.
