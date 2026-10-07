# Workflow 19 — Context Snapshot Generation
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-15, DR-03)

## 1. Automatic Triggers
A. Two or more tabs belonging to the active Workstream are closed within 10 seconds.
B. User switches away from a Workstream that has accumulated $\ge 30$ continuous active minutes.
C. User explicitly clicks "Take Snapshot" in UI.

## 2. Saved Metadata
- `snapshot_id`: Unique UUID.
- `title`: Workstream name with date.
- `saved_tabs`: Ordered list of `{ url, title, favicon, category }`.
- `active_tab_index`: Currently active tab index.
- `timestamp`: Creation date.
- Excluded domains are filtered out.
