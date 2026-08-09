## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2024-05-18 - [Prevent Information Exposure in Error Boundaries]
**Vulnerability:** The React ErrorBoundary component (`src/components/ErrorBoundary.tsx`) was displaying raw error messages (`error.message`) directly to end users.
**Learning:** By exposing raw error details, we run the risk of leaking sensitive application internals or stack traces to end users (Information Exposure/CWE-209). This is especially critical since error messages can unexpectedly contain sensitive data such as network request details or database error strings.
**Prevention:** Conditional rendering based on `import.meta.env.DEV` should be utilized to determine when to display raw error messages. In production environments, generic, secure fallback messages (e.g., "Um erro inesperado ocorreu.") must be presented instead to ensure we "fail securely" without leaking data.
