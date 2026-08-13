## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2026-08-13 - [Information Exposure Prevention in ErrorBoundary]
**Vulnerability:** Raw error messages (`error.message`) could expose stack traces or internal implementation details to the frontend user if an unexpected error occurs in production.
**Learning:** React ErrorBoundary components should intercept and hide raw errors in production environments to prevent Information Exposure (CWE-209), showing a generic user-friendly message instead.
**Prevention:** Always wrap error message display logic in `import.meta.env.DEV` conditionals or similar environment checks to ensure details are only shown to developers.
