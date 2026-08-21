## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-05-14 - Improve ThemeToggle Switch Accessibility
**Learning:** Found an `aria-label` that changed with the component state (`Ativar modo escuro` vs `Ativar modo claro`) on a button using `role="switch"`. Also there was a hidden span inside with similar text. For `role="switch"`, it's better to use a stable noun for `aria-label` (like "Modo escuro") and rely solely on `aria-checked` to convey the current state. Redundant `.sr-only` text alongside `aria-label` creates confusing double announcements for screen readers.
**Action:** Used a stable noun for `aria-label` and removed the `.sr-only` span inside `ThemeToggle.tsx`.
