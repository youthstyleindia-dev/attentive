# Workflow 17 — Focus Score Calculation Engine
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-12, FR-12.1)

## 1. Mathematical Formula
$$F = \operatorname{round}(100 \times (0.65 \times PR + 0.35 \times SR)) - SP$$

where:
$$SP = \min(40, N \times 2)$$
- $N$ = Number of context switches.
- $PR$ = Productive Ratio (provisional: $\text{Productive Time} / \text{Tracked Time}$).
- $SR$ = Stability Ratio (provisional: $\text{Dominant Workstream Time} / \text{Tracked Time}$).
- Clamping: $0 \le F \le 100$.

## 2. Boundary Condition: $T = 0$
When total active tracked time is zero:
- Focus Score is NOT computed.
- UI displays "No data available" (never false 0).
