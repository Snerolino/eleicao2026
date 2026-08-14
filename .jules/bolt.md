## 2023-10-27 - [Short-circuit eval in filter]
**Learning:** In lists filtering logic where multiple fields are checked (like in `HomePage.tsx`), calling expensive string normalizations upfront on all fields causes a massive slowdown (e.g. 15x slower).
**Action:** Order checks from cheapest (e.g., party string matching, number string matching) to most expensive (e.g., unicode string normalization), using short-circuit evaluation (returning early) to skip the expensive checks whenever possible. Also memoize derived properties computations across lists when they re-render.
## 2024-05-19 - [Deferred Search Input]
**Learning:** Using `useDeferredValue` for a search query that filters a large list (`filterCandidates` on all candidates) improves typing responsiveness. Crucially, any downstream grouping or mapping logic that depends on the filtered results should be wrapped in `useMemo` so it doesn't unnecessarily re-compute on every single keystroke.
**Action:** When filtering complex lists, wrap the query passed to the filter function with `useDeferredValue` and use `useMemo` for any derived computations based on the filtered output. Ensure UI elements showing counts sync with the deferred query to prevent visual mismatches.

## 2026-08-14 - Prevent O(N) re-renders when updating React Router search parameters
**Learning:** In large selectable lists dependent on `useSearchParams`, passing the router's navigate/setParams directly to inline handlers within the map loop causes full O(N) list re-renders on selection change.
**Action:** Always extract list items into a `React.memo` component. Use `setSearchParams((prev) => ...)` with the functional updater to avoid capturing the parameters array, and wrap the list's generic toggle handler in `useCallback`. Ensure tests handle `decodeURIComponent` when expecting string URLs from `setSearchParams` changes.
