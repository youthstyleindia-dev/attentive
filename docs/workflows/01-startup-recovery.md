# Workflow 01 — Startup & Service Worker Recovery
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-24)

## 1. Trigger
Extension starts, browser boots, or Manifest V3 Service Worker is recreated from idle suspension.

## 2. Inputs
- Current Chromium window and active tab state (`chrome.tabs.query`, `chrome.windows.getLastFocused`).
- Ephemeral timer checkpoint in `chrome.storage.session`.
- Persistent local settings and rules in IndexedDB via Dexie.js.

## 3. Processing Sequence
1. Service Worker awakens and initializes Dexie database (`db.open()`).
2. Seeds curated default domain library into IndexedDB if not already present.
3. Loads user preferences, active user rules, and domain exclusion list into memory.
4. Reads `chrome.storage.session` to inspect `activeCheckpoint`:
   - If a checkpoint exists and matches the currently active tab: resumes active dwell time accumulation without losing state.
   - If a checkpoint exists but browser state shows a different tab or window: closes previous session safely, persists accumulated dwell, and starts new interval.
5. Sets up 30-second recurring heartbeat alarm (`atentiv-heartbeat`).
   - If heartbeat gap exceeds 90 seconds (indicating machine sleep): excess time is classified as system sleep and excluded from active dwell time.
6. Reconciles state with current active tab; marks system ready.

## 4. Failure Modes & Edge Cases
- **Database Open Failure:** If IndexedDB fails to initialize, ATLAS enters local buffer mode, queues up to 50 records in memory, and retries every 15 seconds.
- **Corrupted Checkpoint:** If checkpoint data is corrupted or null, ATLAS falls back cleanly to a fresh session without manufacturing false dwell time.
