# Workflow 12 — Navigation Link Relationships
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (DR-04)

## 1. Purpose
Tracks navigation provenance and referrers to establish connected threads of research.

## 2. Data Structure
Stored in IndexedDB `workstream_events` matching DR-04:
- `id`: Unique record ID.
- `workstream_id`: Assigned workstream.
- `session_id`: Source tab session ID.
- `entered_at`: Navigation entry timestamp.
- `exited_at`: Navigation exit timestamp.
- `duration`: Active duration.
- `previous_workstream_id`: Prior context if transition occurred.
- `switch_penalty`: Evaluated penalty points.
