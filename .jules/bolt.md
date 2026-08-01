## 2023-10-27 - [Short-circuit eval in filter]
**Learning:** In lists filtering logic where multiple fields are checked (like in `HomePage.tsx`), calling expensive string normalizations upfront on all fields causes a massive slowdown (e.g. 15x slower).
**Action:** Order checks from cheapest (e.g., party string matching, number string matching) to most expensive (e.g., unicode string normalization), using short-circuit evaluation (returning early) to skip the expensive checks whenever possible. Also memoize derived properties computations across lists when they re-render.

## 2023-10-27 - [React.memo on list items]
**Learning:** In pages like `HomePage.tsx` that render large lists of cards and sections, typing in a search input causes the entire list to re-render because the parent state changes. This is extremely slow.
**Action:** Wrap individual components that take stable props in `React.memo` (like `CargoSection` and `CandidateCard`) to avoid unnecessary re-renders when the parent components update their state.
