# Workflow 22 — Main Analytics Dashboard
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-18, UIR-02)

## 1. File Path
`dashboard.html` (rendered via React 19).

## 2. Analytical Visualizations
- **Activity Time Charts:** Hourly switch frequency bars and category dwell breakdown.
- **Workstream Maps:** D3 constellation graph connecting domains as nodes and navigation paths as edges.
- **Switch Penalty Reports:** Highlighted amber/red time periods where $> 6$ context switches occurred within 10 minutes.
- **Strict Data Reconciliation:** All chart totals match stored IndexedDB seconds within exact mathematical rounding.
