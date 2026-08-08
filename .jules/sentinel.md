## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2026-08-05 - [Reverse Tabnabbing Mitigation]
**Vulnerability:** External links opening in a new tab (`target="_blank"`) without `noopener` in `rel` allow the new page to access `window.opener`.
**Learning:** Even if `noreferrer` is present, `noopener` should be explicitly declared for broad browser protection against reverse tabnabbing.
**Prevention:** Always use `rel="noreferrer noopener"` together when using `target="_blank"`.
