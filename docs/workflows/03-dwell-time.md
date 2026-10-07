# Workflow 03 — Active Dwell Time Measurement
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-01)

## 1. Purpose
To measure genuine human cognitive engagement with web pages rather than passive tab residency.

## 2. Mathematical Definition
$$\text{Dwell Time} = \sum (t_{\text{active\_end}} - t_{\text{active\_start}}) - \sum t_{\text{paused}}$$
Stored strictly in seconds in `tab_sessions.dwell_time`.

## 3. Exclusion Rules
The following durations are strictly excluded from Dwell Time:
- Time spent when the browser window is minimized or blurred.
- Time spent when the user has stepped away (inactivity $> 180\text{s}$).
- Time spent during system sleep or machine hibernation.
- Time accumulated by background tabs (unless qualifying under FR-03 media awareness).
