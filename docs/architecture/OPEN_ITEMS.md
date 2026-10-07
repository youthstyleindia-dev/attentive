# Atentiv — Open SRS Items & Resolution Register
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Status:** Formally Registered Implementation Strategy  

---

## 1. Overview

In accordance with strict academic engineering principles, this document catalogs the exact requirements where the current SRS states `[To Be Specified]`. **The implementation team does not fabricate or misrepresent these open items as being finalized in the SRS.** Instead, transparent provisional formulas and fallback policies are established, clearly flagged as implementation assumptions.

---

## 2. Register of Open Items

### OI-01: Productive Ratio ($PR$) Definition
- **SRS Reference:** FR-12.1
- **SRS Status:** `[To Be Specified]`
- **Analysis:** The formula specifies $F = \operatorname{round}(100(0.65PR + 0.35SR)) - SP$, but does not define how $PR$ is derived from session time or activity blocks.
- **Provisional Implementation Assumption:**
  $$PR = \frac{\text{Total Productive Dwell Time (seconds)}}{\text{Total Tracked Active Dwell Time (seconds)}}$$
  where:
  - Total Tracked Time = $\text{Productive Time} + \text{Neutral Time} + \text{Distracting Time}$.
  - $PR \in [0.0, 1.0]$.
  - If Total Tracked Time $= 0$, $PR = 0.0$ and score calculation is suspended ($T=0$ no data state).

---

### OI-02: Stability Ratio ($SR$) Definition
- **SRS Reference:** FR-12.1
- **SRS Status:** `[To Be Specified]`
- **Analysis:** The formula includes $SR$ as the 35% component of base focus, but the exact metric (workstream continuity vs session duration vs switch stability) is not codified in the specification text.
- **Provisional Implementation Assumption:**
  Atentiv provides two transparent, switchable strategies:
  1. **Dominant Workstream Continuity (Default Strategy):**
     $$SR = \frac{\text{Active Dwell Time in Dominant Workstream (seconds)}}{\text{Total Tracked Active Dwell Time (seconds)}}$$
     Rewards sustained concentration in a single cohesive task.
  2. **Switch Stability Invariance (Alternative Strategy):**
     $$SR = \max\left(0.0, 1.0 - \frac{\text{Unrelated Context Switches}}{\max(1, \text{Total Browsing Sessions})}\right)$$
     Directly penalizes task fragmentation.

---

### OI-03: Workspace Snapshot Retention Policy
- **SRS Reference:** DR-12
- **SRS Status:** `[To Be Specified]`
- **Analysis:** The SRS specifies a 30-day automatic retention cleanup for activity session records (`tab_sessions`), but leaves snapshot retention unspecified.
- **Provisional Implementation Assumption:**
  - Workspace Snapshots are treated as **user-curated workspaces** and are **retained indefinitely** until the user explicitly deletes them or executes "Delete All Data".
  - This prevents accidental loss of saved research sessions and project tabs during routine 30-day midnight maintenance.

---

### OI-04: Academic Submission Constraints & Benchmark Scope
- **SRS Reference:** OR-05
- **SRS Status:** `[To Be Specified]`
- **Analysis:** Target browser RAM and classification latencies are listed as non-functional targets ($\le 60\text{MB}$ background RAM, $< 15\text{ms}$ tracking latency, $\le 50\text{ms}$ state restore), but exact evaluation criteria across memory-constrained hardware remain unspecified.
- **Provisional Implementation Assumption:**
  - Evaluated on macOS/Chromium test suites with actual measured latencies documented in `docs/testing/PERFORMANCE_TESTS.md`.
  - Latencies not measured in production environments are explicitly designated as "target" rather than confirmed.

---

## 3. Configuration & Strategy Interface

All provisional calculations are cleanly encapsulated in `src/analytics/focusScore.ts` and `src/workstreams/contextSwitch.ts`, allowing examiners and stakeholders to adjust weights or definitions without restructuring core persistence or ATLAS lifecycle state machines.
