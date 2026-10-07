# Workflow 24 — Data Ownership: Export & Delete All
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-21, FR-22)

## 1. Local JSON Export
- Triggered via user action: generates `atentiv-export.json`.
- Exports all `tab_sessions`, `workstreams`, `rules`, `snapshots`, and `decision_traces`.
- Executes 100% locally with zero external network requests.

## 2. Irreversible Delete All
- Requires explicit user confirmation stating: *"This action cannot be undone."*
- Wipes all Dexie tables, resets `chrome.storage.session` and `chrome.storage.local`.
- Restores all UI components to clean empty state.
