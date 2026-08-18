## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2026-08-14 - [Information Exposure in ErrorBoundary]
**Vulnerability:** Raw error messages (`error.message`) or stack traces could be leaked to the frontend via `ErrorBoundary` components.
**Learning:** In production environments, exposing internal details can lead to Information Exposure vulnerabilities (CWE-209).
**Prevention:** Conditionally render sensitive error details using `import.meta.env.DEV`, and provide safe, generic messages for production users.
