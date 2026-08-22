## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2024-08-18 - [Fix XSS Vulnerability in ImpactMatrixPage]
**Vulnerability:** User-provided URLs from JSON payloads (`assessment.sources`) were directly interpolated into `href` tags in `src/pages/ImpactMatrixPage.tsx` without sanitization, creating an XSS risk.
**Learning:** External links dynamically loaded into anchors can execute JavaScript (e.g. `javascript:alert(1)`) if not explicitly validated against an allowlist of safe protocols (like `http:` and `https:`). The codebase provides `@/utils/url` -> `sanitizeUrl` precisely for this purpose.
**Prevention:** Always sanitize dynamically loaded external URLs using `sanitizeUrl(url)` before passing them into the `href` attribute. If the result is falsy, handle it gracefully by rendering a non-interactive element or text fallback to prevent broken UI and unsafe `href` strings. Also, ensure `target="_blank"` links include `rel="noreferrer noopener"` to mitigate reverse tabnabbing.
