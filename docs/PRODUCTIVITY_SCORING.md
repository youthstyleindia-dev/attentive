# Atentiv Focus Score & Productivity Algorithm

This document defines the mathematical formulation, dwell-time weighting, and penalty modeling used to compute the **Atentiv Focus Score** in `src/scoring/focusScore.ts` and `src/model.ts`.

---

## 1. Focus Score Objective

The Atentiv Focus Score is a bounded integer metric ($0 \le \text{Score} \le 100$) designed to objectively quantify deep, uninterrupted work without superficial gamification. It evaluates active dwell time against task goals and penalizes attention fragmentation.

---

## 2. Mathematical Formulation

The overall Focus Score is computed as:

$$\text{Focus Score} = \max\left(0, \min\left(100, \text{round}\left(S_{\text{base}} + B_{\text{goal}} - P_{\text{switch}}\right)\right)\right)$$

### 2.1 Base Productivity Score ($S_{\text{base}}$)
Based on the proportion of active time spent in productive, neutral, and distracting sessions:

$$S_{\text{base}} = \frac{1.0 \cdot T_{\text{productive}} + 0.5 \cdot T_{\text{neutral}} + 0.0 \cdot T_{\text{distracting}}}{T_{\text{total}}} \times 80$$

Where:
- $T_{\text{productive}}$: Total active dwell milliseconds classified as productive.
- $T_{\text{neutral}}$: Total active dwell milliseconds classified as neutral.
- $T_{\text{distracting}}$: Total active dwell milliseconds classified as distracting.
- $T_{\text{total}} = T_{\text{productive}} + T_{\text{neutral}} + T_{\text{distracting}}$.
- If $T_{\text{total}} = 0$, the base score defaults to 0 with explanation: `"Baseline — no active dwell recorded"`.

### 2.2 Intention & Goal Bonus ($B_{\text{goal}}$)
When a user sets an active focus intention (e.g., *"Finish technical documentation"* with a target workstream):
- If active dwell is spent within the target workstream during the goal window:
  $$B_{\text{goal}} = \min\left(20, 20 \times \frac{T_{\text{goal\_stream}}}{T_{\text{goal\_total}}}\right)$$
- If no focus intention is set, $B_{\text{goal}}$ scales proportionally with general productive dwell (up to 20 points).

### 2.3 Context Switch Penalty ($P_{\text{switch}}$)
Frequent transitions between disparate workstreams cause cognitive fragmentation:

$$P_{\text{switch}} = \min\left(40, \sum_{k=1}^{N_{\text{switches}}} p_k\right)$$

Where each switch penalty $p_k$:
- Base workstream switch: $p_k = 5$ points.
- Cross-category switch (e.g. `Computers` $\rightarrow$ `Entertainment`): $p_k = 8$ points.
- Rapid thrashing penalty (< 60s dwell in previous stream): $p_k = 12$ points.
- Total penalty cap: $\sum p_k \le 40$ points.

---

## 3. Active Dwell Time vs. Passive Idle Tracking

Unlike naive browser extensions that measure tab open duration, Atentiv differentiates between **active engagement** and **passive abandonment**:

1. **Active Tick Interval**:
   - Dwell is tracked in intervals up to 60 seconds per checkpoint.
   - Requires focused browser window and active foreground tab.
2. **Idle State Freezing**:
   - When `chrome.idle.queryState(60)` returns `"idle"` or `"locked"` (no user input for $\ge 60$s), dwell time accumulation is immediately frozen.
   - The session record preserves its existing active dwell duration and records idle duration separately.
3. **Graceful Tab Switching**:
   - Tab switching triggers immediate session reconciliation, closing the previous tab's active interval and timestamping the switch.
