# Atentiv — Requirement Traceability & Verification Test Matrix
**Document Version:** 1.0.0 (SRS Revision 3.1 / Submission Version 3.0 Baseline)

---

| Requirement ID | Specification Clause | Test Category | Automated Test File | Manual Verification Scenario | Verification Status |
|---|---|---|---|---|---|
| **FR-01** | Real-time Tab Lifecycle Tracking | Unit & E2E | `tests/sessionManager.test.ts` | Open new tab, verify active session record created | **VERIFIED** |
| **FR-02** | Active Dwell Time Accumulation | Unit | `tests/sessionManager.test.ts` | Stay on tab 30s, verify dwell increments by 30s | **VERIFIED** |
| **FR-03** | Media-Aware Audio Dwell Treatment | Unit | `tests/mediaAwareness.test.ts` | Play YouTube lecture in background tab with audio | **VERIFIED** |
| **FR-04** | Inactivity Timeout (Default 180s) | Unit & System | `tests/idleState.test.ts` | Idle for 3 min, confirm state switches to IDLE | **VERIFIED** |
| **FR-05** | Restricted Protocol Isolation | Unit & E2E | `tests/restrictedPages.test.ts` | Open `chrome://extensions`, verify status is UNTRACKABLE | **VERIFIED** |
| **FR-06** | Zero Egress Local Privacy Guard | Security / Unit | `tests/privacyEgress.test.ts` | Monitor network devtools, verify 0 network requests | **VERIFIED** |
| **FR-07** | Sensitive URL Parameter Scrubbing | Unit | `tests/textFeatures.test.ts` | Browse `site.com?token=123&user=abc`, verify DB strips queries | **VERIFIED** |
| **FR-08** | FastText Category Inference | Unit | `tests/classifier.test.ts` | Classify tech doc, verify Category = Technology | **VERIFIED** |
| **FR-09** | YouTube Context-Sensitive Promotion | Unit | `tests/classifier.test.ts` | Test YouTube video title with 'lecture' vs 'gaming' | **VERIFIED** |
| **FR-10** | Workstream TF-IDF Vector Clustering | Unit | `tests/workstreamEngine.test.ts` | Cosine similarity >= 0.68 clusters into same workstream | **VERIFIED** |
| **FR-11** | Context Switch Penalty (CSP) Engine | Unit | `tests/contextSwitch.test.ts` | Rapid switch (<=45s, CU=4) verifies SW=1.5 multiplier | **VERIFIED** |
| **FR-12** | Focus Score Computation | Unit | `tests/focusScore.test.ts` | Compute $F = \operatorname{round}(100(0.65PR+0.35SR))-SP$ | **VERIFIED** |
| **FR-13** | Rapid Switching Warning Trigger | System | `tests/warningEngine.test.ts` | Trigger >6 context switches in 10 minutes | **VERIFIED** |
| **FR-14** | Multi-Tab Workstream Snapshot | Unit & DB | `tests/snapshotRepository.test.ts` | Trigger snapshot, verify tab URLs, titles, and active ID saved | **VERIFIED** |
| **FR-15** | Quick Resume One-Click Restore | Integration | `tests/snapshotRestore.test.ts` | Click restore, verify tabs reopen in new window | **VERIFIED** |
| **FR-16** | Side Panel HUD Visualization | E2E | `tests/uiRender.test.ts` | Open `sidepanel.html`, verify Focus Ring and Workstream list | **VERIFIED** |
| **FR-17** | Analytics Dashboard Interface | E2E | `tests/uiRender.test.ts` | Open `dashboard.html`, verify trend charts and switch report | **VERIFIED** |
| **FR-18** | Options, Rule Management & Data Purge | Integration | `tests/optionsEngine.test.ts` | Add rule, trigger export, trigger permanent delete | **VERIFIED** |
