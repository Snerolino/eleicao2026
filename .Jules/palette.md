## 2026-07-27 - [A11y Context on Generic Links]
**Learning:** Screen readers struggle with generic links like "Ver dossiê completo" or "fonte da foto" when repeated across lists of candidate cards or dossiers.
**Action:** Always append dynamic contextual information (e.g. `aria-label="Ver dossiê completo de ${candidate.full_name}"`) and hide decorative visual indicators like arrows (`<span aria-hidden="true">→</span>`) from screen readers.

## 2024-05-24 - [Switch Component A11y and Redundant Labels]
**Learning:** For components using `role="switch"`, using alternating action verbs in the `aria-label` (e.g. "Ativar X", "Desativar X") is an anti-pattern. Furthermore, mixing explicit `aria-label`s with visually hidden text (`sr-only` spans) inside the same button creates redundant, conflicting announcements for screen readers.
**Action:** When using `role="switch"`, give the button a stable noun as the `aria-label` and rely entirely on the `aria-checked` boolean state to communicate its status. Remove nested visually hidden text elements if an explicit `aria-label` is already applied.
