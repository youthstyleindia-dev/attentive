# Regression Testing Specification — Atentiv

## Scope
Regression test suite ensures that subsequent updates and architectural changes do not re-introduce fixed defects across the tracking engine, ML classification, workstream clustering, and UI components.

## Automated Regression Gates (53 Tests)

### 1. Inactivity & Media Continuity (FR-03, FR-04)
- **180s Default Inactivity Boundary**: Active dwell halts at 180s without input; idle time accumulates separately.
- **Audio Learning Exception**: Audible educational media continues dwell time without false idle trigger.

### 2. Context Switching & CSP (FR-11, FR-12)
- **Rapid Switch Penalty**: Switches ≤45s apply `SW = 1.5`; switches >45s apply `SW = 1.0`.
- **Category Unrelatedness (CU)**: 0 (same WS), 1 (same category), 2 (related), 4 (unrelated).
- **SP Cap**: Focus Score deduction `SP = min(40, N * 2)` strictly bounded to 40 points maximum.

### 3. Untrackable Browser Protocols (SI-03)
- `chrome://`, `edge://`, `about:` marked `UNTRACKABLE`.
- Zero active dwell, zero session records, zero focus penalty.
- Toolbar click on restricted protocols spawns 420x680 popup window without errors.

### 4. Zero Data Egress (NFR-SEC-01)
- Source code grep audit enforces 0 outbound network requests (`fetch`, `XMLHttpRequest`, `WebSocket`, telemetry APIs).

### 5. Multi-Tab Auto-Activation (FR-01)
- New tabs broadcast `NEW_TAB_CREATED` to active HUD overlays to update Open Tabs without manual refresh.
