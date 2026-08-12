## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2026-08-12 - [Information Exposure in Error Boundary]
**Vulnerability:** The ErrorBoundary component rendered the raw `error.message` directly into the DOM in production if the error was caught.
**Learning:** `import.meta.env.DEV` should always be checked before rendering or logging sensitive internal system states (like stack traces or raw error messages).
**Prevention:** Only render generic user-friendly strings (e.g. "Um erro inesperado ocorreu.") in production.
