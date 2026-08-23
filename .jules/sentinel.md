## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2024-05-18 - [ErrorBoundary Information Exposure]
**Vulnerability:** The `<ErrorBoundary>` component directly rendered `error.message` to the UI in all environments, which could leak internal stack traces or sensitive error strings to end-users (Information Exposure - CWE-209).
**Learning:** React Error Boundaries should fail securely and render generic fallback messages instead of technical details in production. This repo uses Vite, meaning `import.meta.env.DEV` should be leveraged for conditional rendering. Also, tests for this component previously incorrectly mocked this using `vi.stubEnv('DEV', false)` instead of `''`.
**Prevention:** Always wrap error detail UI in `import.meta.env.DEV` conditions, providing generic fallback text in the false path. In tests, remember to stub environment variables using valid string arguments per Vitest typing rules (`vi.stubEnv('DEV', '')` or `'true'`).
