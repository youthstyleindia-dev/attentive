# Workflow 02 — Tab Lifecycle Management
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-01)

## 1. Trigger
Browser events: `tabs.onCreated`, `tabs.onActivated`, `tabs.onUpdated`, `tabs.onRemoved`, `windows.onFocusChanged`.

## 2. Invariants
- **Single Active Tab Invariant:** At most ONE ordinary active tab accumulates active dwell time at any given instant.
- **Zero Background Accumulation:** Background tabs do NOT accumulate active dwell time.
- **Viewing Requirement:** A tab created in the background without being actively viewed receives 0 dwell time.

## 3. Processing Sequence
1. User activates tab B from tab A:
   - Tab A dwell time is finalized: active elapsed delta is added to accumulated dwell.
   - Tab A session is closed in IndexedDB with actual dwell time.
2. Tab B is inspected:
   - Validates URL protocol (`http://` or `https://`).
   - Checks Exclusion List.
   - Extracts page context and matches/assigns Workstream.
   - Starts new session record with `dwell_time = 0` and `start_time = now`.
   - Serializes checkpoint into `chrome.storage.session`.
3. Window blur:
   - When the browser window loses focus, active dwell accumulation is paused until focus returns.
