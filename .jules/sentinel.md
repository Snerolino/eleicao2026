## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2024-05-27 - [XSS via Impact Matrix Sources]
**Vulnerability:** Unsanitized dynamically injected URLs directly into `href` elements in ImpactMatrixPage sources.
**Learning:** External source URLs defined in methodologies/JSON files need to be sanitized using utility functions before being rendered directly in anchor tags, especially when displaying elements directly from array iteration over API data or config.
**Prevention:** Always wrap dynamically generated URLs with `sanitizeUrl()` inside a `href` attribute, and ensure robust conditional rendering (e.g., returning fallback elements when URL validation fails).
