## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2024-05-24 - [Fix Information Exposure in ErrorBoundary]
**Vulnerability:** Information Exposure (CWE-209) via `ErrorBoundary` components leaking raw `error.message` to the frontend UI.
**Learning:** `ErrorBoundary` components can accidentally expose sensitive information or technical details if `error.message` is rendered unconditionally in the DOM, potentially aiding an attacker.
**Prevention:** Avoid leaking raw error messages (e.g., `error.message` or stack traces) to the frontend in production environments. Always provide generic, safe error messages to end-users instead and conditionally render details using `import.meta.env.DEV`.
