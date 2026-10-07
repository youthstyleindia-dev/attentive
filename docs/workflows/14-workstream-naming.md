# Workflow 14 — Workstream Naming Heuristics
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-14)

## 1. Naming Hierarchy
1. **Dominant Noun / Bigram:** Most frequent meaningful noun phrase extracted from page titles (e.g. "Python Debugging", "Transformer Architecture").
2. **Category + Domain Fallback:** If noun phrases are ambiguous (e.g. "Technology — GitHub").
3. **Generic Fallback:** "General Browsing" or "Research Session #".

The derived name is displayed in the Side Panel, logged in `tab_sessions.workstream_name`, and used as default workspace snapshot title.
