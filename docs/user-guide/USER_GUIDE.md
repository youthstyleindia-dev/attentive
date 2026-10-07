# Atentiv — User Manual & Operations Guide
**Document Version:** 1.0.0 (SRS Revision 3.1 Baseline)

---

## 1. Introduction
Atentiv is an intelligent, zero-egress cognitive productivity companion that operates entirely inside your Chromium browser. It models user attention, clusters related browsing sessions into Workstreams, quantifies cognitive switching penalties, and preserves flow states without cloud telemetry.

---

## 2. The Three User Interfaces

### 2.1 Side Panel (`sidepanel.html`)
The primary companion interface during active browsing:
- **Live Focus Ring:** Visualizes real-time focus percentage ($0-100\%$).
- **Active Dwell Display:** Live counter showing active minutes in the foreground tab.
- **Current Workstream Card:** Displays active task cluster with semantic tag chips.
- **Quick Controls:** Pause tracking, capture manual snapshot, or launch full dashboard.

### 2.2 Dashboard (`dashboard.html`)
Full-screen analytics and cognitive audit studio:
- **Workstream Graph:** Interactive topological map of tab links and semantic connections.
- **Attention Distribution:** Breakdown of Productive, Neutral, and Distracting dwell time.
- **Context Switch Penalty Log:** Audit log of switches exceeding threshold with itemized $SW \times CU$ breakdown.
- **Snapshot Manager:** Review and restore saved workstream sessions.

### 2.3 Options (`options.html`)
Configuration and data governance hub:
- **Inactivity Timer:** Slider to adjust idle cutoff from 1 to 10 minutes (default 3 minutes).
- **Custom Rules:** Map any domain to Productive, Neutral, or Distracting.
- **Exclusion List:** Add domains to bypass tracking completely.
- **Data Governance:** Export JSON records or execute permanent zero-trace deletion.
