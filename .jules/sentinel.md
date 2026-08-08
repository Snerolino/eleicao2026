## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2026-08-08 - [Information Exposure in ErrorBoundary]
**Vulnerability:** The ErrorBoundary component rendered the raw `error.message` directly into the DOM for end-users, potentially exposing sensitive stack traces, field names, or server-side details.
**Learning:** React ErrorBoundaries must never blindly forward error objects to the UI, as they act as a catch-all for unexpected application crashes.
**Prevention:** Conditionally render error details only in development environments (`import.meta.env.DEV`), providing a safe, generic fallback message in production to mitigate CWE-209.
