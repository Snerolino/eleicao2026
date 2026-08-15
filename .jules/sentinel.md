## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2025-02-28 - Information Exposure in ErrorBoundary
**Vulnerability:** The global `ErrorBoundary` component was rendering the raw error message (`error.message`) in all environments.
**Learning:** React `ErrorBoundary` components can accidentally expose sensitive system details or raw stack traces (CWE-209) directly to users in production if they blindly render `error.message`.
**Prevention:** Always check the environment (e.g., `import.meta.env.DEV`) before exposing raw error strings, and provide a generic, safe fallback message for users in production to prevent Information Exposure vulnerabilities.
