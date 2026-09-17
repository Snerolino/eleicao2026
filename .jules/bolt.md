## 2023-10-27 - [Short-circuit eval in filter]
**Learning:** In lists filtering logic where multiple fields are checked (like in `HomePage.tsx`), calling expensive string normalizations upfront on all fields causes a massive slowdown (e.g. 15x slower).
**Action:** Order checks from cheapest (e.g., party string matching, number string matching) to most expensive (e.g., unicode string normalization), using short-circuit evaluation (returning early) to skip the expensive checks whenever possible. Also memoize derived properties computations across lists when they re-render.
## 2024-05-19 - [Deferred Search Input]
**Learning:** Using `useDeferredValue` for a search query that filters a large list (`filterCandidates` on all candidates) improves typing responsiveness. Crucially, any downstream grouping or mapping logic that depends on the filtered results should be wrapped in `useMemo` so it doesn't unnecessarily re-compute on every single keystroke.
**Action:** When filtering complex lists, wrap the query passed to the filter function with `useDeferredValue` and use `useMemo` for any derived computations based on the filtered output. Ensure UI elements showing counts sync with the deferred query to prevent visual mismatches.
## 2025-01-20 - [Regex Caching in O(N) Filters]
**Learning:** Using an O(N) filtering mechanism with expensive Regex evaluations (e.g. `hasPreviousMandate` evaluating `MANDATE_KEYWORDS_REGEX` against multiple claims) severely blocks the UI during typing or filtering large sets. Repeated calls across component boundaries compound this cost unnecessarily.
**Action:** Always memoize derived checks on immutable reference objects (like candidate data) that do expensive calculations (like Regex) using a `WeakMap`. This pattern upgrades the time complexity of the check from O(N * complexity) to O(1) for all subsequent reads and UI updates.
## 2025-02-13 - [Hoisting Constant Arrays]
**Learning:** In React components, allocating constant arrays (like `SUMMARY_PRIORITY` in `CandidateCard.tsx`) inside the render function causes the array to be re-created on every render, adding garbage collection overhead, particularly when rendering long lists.
**Action:** Always hoist static reference types (like constant arrays or configuration objects) outside the render function to the module scope to prevent unnecessary memory reallocation.
