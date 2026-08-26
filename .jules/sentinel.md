## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.

## 2024-05-20 - [Fix XSS Vulnerabilities in Dynamic Links]
**Vulnerability:** Dynamic `href` attributes in `src/pages/ImpactMatrixPage.tsx` and `src/pages/AdminPage.tsx` were directly populated from JSON payloads without validation, exposing the application to XSS via `javascript:` or `data:` URIs.
**Learning:** Even internal toolings or pre-parsed data arrays (like `p2-microbatch-2-editorial-review-pack.json` or matrix components) can be potential vectors if the original extraction pipeline allows untrusted source URLs.
**Prevention:** Always wrap external dynamic URLs in `sanitizeUrl` (which restricts protocols to HTTP/HTTPS) and provide a non-interactive fallback for invalid inputs to prevent empty/broken attributes.
