## 2023-10-27 - [Short-circuit eval in filter]
**Learning:** In lists filtering logic where multiple fields are checked (like in `HomePage.tsx`), calling expensive string normalizations upfront on all fields causes a massive slowdown (e.g. 15x slower).
**Action:** Order checks from cheapest (e.g., party string matching, number string matching) to most expensive (e.g., unicode string normalization), using short-circuit evaluation (returning early) to skip the expensive checks whenever possible. Also memoize derived properties computations across lists when they re-render.

## 2024-05-18 - [Memoizing list items on parent state changes]
**Learning:** In lists filtering logic where parent component state changes continuously (like the search query in `CandidateSearch`), memoizing the child list items (e.g. `CandidateCard` and `CandidatePhoto`) provides a massive performance boost by preventing React from recursively re-rendering the entire list tree.
**Action:** When mapping over items that remain stable (like from a query cache), wrap the rendered item components in `React.memo` to skip expensive re-renders.
