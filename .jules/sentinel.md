## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2025-02-27 - [Information Exposure in Error Boundaries]
**Vulnerability:** Raw error messages and stack traces (Information Exposure, CWE-209) can be leaked to end-users in production environments when using generic React ErrorBoundaries.
**Learning:** Developers often forget to differentiate between development and production environments when rendering error states in UI components, leading to potential exposure of internal application logic or sensitive data.
**Prevention:** Always conditionally render raw error details (like `error.message` or stack traces) using environment variables (e.g., `import.meta.env.DEV`) and provide safe, generic messages for production users.
