# Workflow 06 — Trackability & Restricted Pages
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-04)

## 1. Restricted Protocols
- `chrome://` (e.g. `chrome://extensions`)
- `edge://` (e.g. `edge://settings`)
- `chrome-extension://`
- `about:blank`, `about:config`

## 2. System State: UNTRACKABLE
When an active tab navigates to a restricted protocol:
- State is explicitly flagged as `UNTRACKABLE`.
- Zero content script injection is attempted.
- Zero dwell time or session records are generated.
- No context switch penalty is assessed.
- No false Focus Score deduction is applied (Focus is NOT set to 0).
- UI displays: *"Tracking unavailable on internal browser page. Atentiv will resume automatically on a supported webpage."*
