## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2026-08-11 - [Information Exposure in ErrorBoundary]
**Vulnerability:** Raw error messages (e.g., `error.message`) were being exposed to the frontend in production environments within the ErrorBoundary component, leading to Information Exposure vulnerabilities (CWE-209).
**Learning:** Error boundaries must gracefully handle errors without leaking sensitive internal details or stack traces to end users in production.
**Prevention:** Use a conditional check on `import.meta.env.DEV` to show the real error message only in development, and a generic, safe error message to end-users in production.
