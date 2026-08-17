## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2025-05-16 - Prevent XSS in Anchor Hrefs
**Vulnerability:** External URLs rendered dynamically into the `href` attribute of `<a>` tags without validation in `ImpactMatrixPage.tsx`. This created a Cross-Site Scripting (XSS) vulnerability.
**Learning:** React escapes text nodes, but it does NOT escape URLs in attributes. The codebase had external data bypassing safety checks.
**Prevention:** Always validate external URLs using the `@/utils/sanitizeUrl` utility (`sanitizeUrl`) to guarantee the protocol is safe (`http:` or `https:`) before rendering it into an `href`. Use `rel="noreferrer noopener"` to prevent reverse tabnabbing.
