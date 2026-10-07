# Atentiv — Viva Voce: Security & Privacy Questions
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

---

### Q1: Is IndexedDB encrypted in Atentiv?
**Answer:** No. SRS Revision 3.1 explicitly specifies plain-text IndexedDB protected by operating system and browser profile sandboxing. Atentiv does NOT make false claims of AES-256 application-level database encryption.

### Q2: How does Atentiv protect sensitive query parameters and tokens?
**Answer:** Before any URL is passed to the classifier or stored in IndexedDB, `sanitizeUrl()` strips all query parameters (e.g., `?token=...`, `?auth=...`, `?session=...`), basic authentication credentials, and URI fragments. Only the origin and sanitized path are retained.

### Q3: What happens when a user adds a domain to the Exclusion List?
**Answer:** The domain is stored in the `exclusions` table. All event listeners in the background monitor check this list before recording. If a tab's domain matches an excluded entry, all tracking, timers, classification, and storage operations are completely skipped.
