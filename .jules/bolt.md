## 2023-10-27 - [Short-circuit eval in filter]
**Learning:** In lists filtering logic where multiple fields are checked (like in `HomePage.tsx`), calling expensive string normalizations upfront on all fields causes a massive slowdown (e.g. 15x slower).
**Action:** Order checks from cheapest (e.g., party string matching, number string matching) to most expensive (e.g., unicode string normalization), using short-circuit evaluation (returning early) to skip the expensive checks whenever possible. Also memoize derived properties computations across lists when they re-render.
## 2024-05-19 - [Deferred Search Input]
**Learning:** Using `useDeferredValue` for a search query that filters a large list (`filterCandidates` on all candidates) improves typing responsiveness. Crucially, any downstream grouping or mapping logic that depends on the filtered results should be wrapped in `useMemo` so it doesn't unnecessarily re-compute on every single keystroke.
**Action:** When filtering complex lists, wrap the query passed to the filter function with `useDeferredValue` and use `useMemo` for any derived computations based on the filtered output. Ensure UI elements showing counts sync with the deferred query to prevent visual mismatches.
## 2025-01-20 - [Regex Caching in O(N) Filters]
**Learning:** Using an O(N) filtering mechanism with expensive Regex evaluations (e.g. `hasPreviousMandate` evaluating `MANDATE_KEYWORDS_REGEX` against multiple claims) severely blocks the UI during typing or filtering large sets. Repeated calls across component boundaries compound this cost unnecessarily.
**Action:** Always memoize derived checks on immutable reference objects (like candidate data) that do expensive calculations (like Regex) using a `WeakMap`. This pattern upgrades the time complexity of the check from O(N * complexity) to O(1) for all subsequent reads and UI updates.
## 2025-02-28 - [O(N) Prioritization in Claims]\n**Learning:** Using chained declarative  and  on arrays during render creates unnecessary O(N log N) overhead and array allocations, which impacts rendering performance for complex candidate cards.\n**Action:** Replace declarative sorting for prioritization with a single-pass O(N) iterative loop to find the best match based on a priority index array.
## 2025-02-28 - [O(N) Prioritization in Claims]
**Learning:** Using chained declarative `.find()` and `.sort()` on arrays during render creates unnecessary O(N log N) overhead and array allocations, which impacts rendering performance for complex candidate cards.
**Action:** Replace declarative sorting for prioritization with a single-pass O(N) iterative loop to find the best match based on a priority index array.
## 2025-02-28 - [O(N) Extraction from Known Domain Arrays]
**Learning:** Extracting an ordered subset from a  using  based on  against a known canonical array is slow (O(N log N) with repeated  lookups).
**Action:** Iterate or filter over the *known canonical array* (O(N)) and check for presence in the  (O(1)), turning sorting into an O(N) extraction.
## 2025-02-28 - [O(N) Extraction from Known Domain Arrays]
**Learning:** Extracting an ordered subset from a `Set` using `[...set].sort()` based on `indexOf` against a known canonical array is slow (O(N log N) with repeated `indexOf` lookups).
**Action:** Iterate or filter over the *known canonical array* (O(N)) and check for presence in the `Set` (O(1)), turning sorting into an O(N) extraction.
