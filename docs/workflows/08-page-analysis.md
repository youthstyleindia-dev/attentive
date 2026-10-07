# Workflow 08 — Page Context Extraction & Sanitization
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-05)

## 1. Extracted DOM Signals
- Document `title` (sanitized and trimmed).
- Open Graph description (`meta[property="og:description"]`).
- Up to 20 $H1$–$H3$ headings.
- Up to 2 KB of visible body text from `<main>` or `<article>`.

## 2. Security & Sanitization
- Form input values, passwords, keystrokes, and session cookies are strictly never read.
- Sensitive query parameters (`?auth=`, `?token=`, `?password=`, `?key=`) and URL fragments (`#`) are scrubbed before storage.
- Extracted text is lowercased, punctuation-normalized, and stripped of HTML tags.
