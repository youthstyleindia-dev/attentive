# Workflow 04 — Inactivity Detection & Auto-Pause
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-02)

## 1. Specification Baseline
- **Default Inactivity Threshold:** 3 minutes (180 seconds).
- **Configurable Range:** 1 to 10 minutes (60s to 600s).

## 2. Sequence of Operation
1. User interacts with page: active dwell accumulates.
2. User ceases keyboard and mouse input.
3. Once inactivity exceeds the configured threshold (default 180s):
   - Timer automatically pauses.
   - ATLAS state transitions from `TRACKING` to `INACTIVE`.
   - Paused duration is excluded from active Dwell Time.
   - Excess duration is credited separately to `tab_sessions.idle_time`.
4. User resumes activity (moves mouse or presses key):
   - ATLAS transitions back to `TRACKING`.
   - Active dwell accumulation resumes seamlessly.

## 3. Non-Retroactivity Invariant
The period from last activity to threshold crossing is NOT retroactively counted as active dwell time.
