## 2024-07-28 - [Global Focus Styles]
**Learning:** Adding global base styles for raw HTML elements (`input:focus-visible`, `select:focus-visible`) in the central `theme.css` file is an effective and robust way to ensure keyboard accessibility (focus rings) across the entire application without needing to modify every individual component with utility classes.
**Action:** When identifying missing focus indicators, consider if a global style rule in the main stylesheet is a cleaner, more maintainable solution than scattering utility classes across many files.
