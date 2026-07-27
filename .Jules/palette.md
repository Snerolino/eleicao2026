## 2024-07-26 - Accessible Clear Button and Focus Management
**Learning:** In the `CandidateSearch` component, clearing the search query using the "✕" button didn't return focus to the input field, forcing users to click or tab back to start a new search. Additionally, screen readers could potentially read out the "✕" character redundantly alongside the `aria-label`.
**Action:** Always return focus to the input field after a "clear" action. Wrap visual-only characters like "✕" in `<span aria-hidden="true">` when the parent element already has a descriptive `aria-label`.
