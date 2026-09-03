## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2026-09-03 - [Information Exposure via Error Messages]
**Vulnerability:** Raw database or client error messages (`error.message`) were being exposed to users via the UI.
**Learning:** Directly passing structured error payloads from backend/clients to the UI exposes internal logic (table names, rules). This is known as Information Exposure (CWE-209).
**Prevention:** Catch errors, log them securely (e.g. via console.error on frontend or standard logger on backend), and only return generic, safe messages to the end user.
