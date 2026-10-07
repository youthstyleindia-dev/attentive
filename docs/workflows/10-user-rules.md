# Workflow 10 — User Rules & Custom Overrides
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-06, FR-20)

## 1. Rule Definition
- Unique UUID v4 `rule_id`.
- User priority between 100 and 200 (always superseding automated ML).
- Match conditions:
  - `domain_exact` (e.g. `github.com`)
  - `domain_contains` (e.g. `docs`)
  - `title_contains` (e.g. `lecture`)
  - `url_prefix` (e.g. `https://youtube.com/watch?v=`)
- Actions: assigned category, assigned productivity (`productive`, `neutral`, `distracting`), optional forced workstream.

## 2. Temporal Behavior
- Modifying a user rule applies immediately to future sessions.
- Historical sessions preserve historical classification unless "Re-calculate Today" is explicitly triggered.
