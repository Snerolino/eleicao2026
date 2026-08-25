## 2026-07-27 - [XSS via URL scheme mitigation]
**Vulnerability:** External URLs dynamically rendered into `href` tags could include malicious protocols like `javascript:` causing Cross-Site Scripting (XSS).
**Learning:** Even static/database provided URLs should be validated against allowed protocols since external URLs could be injected via untrusted sources.
**Prevention:** Always parse and sanitize URLs before rendering them as external links using native URL constructor checking.
## 2026-08-25 - [Missing Imports During Security Fixes]
**Vulnerability:** A previous fix applied a `sanitizeUrl` utility but failed to include the necessary import statement in all modified files.
**Learning:** Security fixes that apply utilities globally must ensure the import statement is correctly added to every modified file to prevent ReferenceErrors and build breakages.
**Prevention:** Always run the project's build command (`pnpm build`) and typechecker after applying fixes to guarantee all necessary dependencies are imported and properly typed before submitting.
