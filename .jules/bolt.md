## 2023-10-27 - [Short-circuit eval in filter]
**Learning:** In lists filtering logic where multiple fields are checked (like in `HomePage.tsx`), calling expensive string normalizations upfront on all fields causes a massive slowdown (e.g. 15x slower).
**Action:** Order checks from cheapest (e.g., party string matching, number string matching) to most expensive (e.g., unicode string normalization), using short-circuit evaluation (returning early) to skip the expensive checks whenever possible. Also memoize derived properties computations across lists when they re-render.

## 2024-05-18 - [Deferring expensive client-side filtering]
**Learning:** In the `HomePage`, filtering a large list of candidates synchronously blocks the main thread, making the search input feel sluggish. By using React 18's `useDeferredValue` for the search query, the input updates immediately (fast UI response) while the expensive filtering and list re-rendering happens in the background.
**Action:** Use `useDeferredValue` on inputs that drive expensive client-side filtering or rendering operations to maintain a responsive UI.
