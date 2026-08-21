## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2026-08-21 - Prevent XSS in External Links
**Vulnerability:** External URLs dynamically rendered into `href` tags were not sanitized, posing an XSS risk if the data source contains malicious payloads like `javascript:alert(1)`.
**Learning:** React's built-in XSS protection (escaping content) does not cover attributes like `href`. External URLs must be explicitly validated against safe protocols (http/https).
**Prevention:** Always use the `sanitizeUrl` utility from `@/utils/url` to validate user-provided or externally sourced URLs before rendering them in anchor tags. Gracefully degrade to text or non-interactive spans if the URL is invalid.
