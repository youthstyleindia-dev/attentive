# Workflow 07 — Privacy Filter & Domain Exclusion
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-06, DR-05)

## 1. Evaluation Precedence
The Exclusion List is evaluated BEFORE any DOM extraction or text analysis takes place.

## 2. If Domain is Excluded:
- Page title, headings, and DOM are NEVER read or parsed.
- No activity session is created in `tab_sessions`.
- No link relationships or workstream memberships are assigned.
- The URL is completely excluded from snapshots.
- Zero analytics data is stored or presented.

## 3. Immediate Purge Guarantee
When a user adds a domain to the Exclusion List via Options:
- Existing `tab_sessions` for that domain are deleted immediately.
- Existing `decision_traces` for that domain are deleted immediately.
- Exclusion takes effect instantly for all future browsing.
