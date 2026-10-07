# Atentiv — Architecture Consolidation & Version Reconciliation Report
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Generated:** 2026-10-07  
**Version:** v1.0.1 (Single Source of Truth)  
**Status:** Canonical Consolidation Complete

---

## 1. Absolute Rule: One Canonical Atentiv

In accordance with Section 0 of the Master Engineering Prompt and Requirement R1:
1. **Single Source of Truth:** All active extension code, background logic, content scripts, UI interfaces, database models, and ML pipelines reside in `src/`.
2. **Quarantine Isolation:** All historical prototypes, previous variation experiments, and deprecated mocks are quarantined under `legacy/`.
3. **Redundancy Elimination:** The redundant duplicate directory `archive/` (an identical copy of `legacy/`) and duplicate root-level reports have been consolidated.
4. **Import Guarantee:** `grep -rn "legacy/" src/` returns 0 hits. No active production or test file imports from `legacy/`.

---

## 2. End-to-End Canonical Data Pipeline

```
Browser Event (Tab Switch, Navigation, Idle Change, 30s Alarms Heartbeat)
    ↓
Browser Event Monitor (src/background/eventMonitor.ts)
    ↓
Session Manager / Dwell Engine (src/background/sessionManager.ts)
    ↓
1. Privacy Check (src/privacy/exclusionEngine.ts) → Excluded: discard & purge historical traces
    ↓
2. User Priority Rules (src/rules/ruleEngine.ts) → Explicit user domain/pattern rules
    ↓
3. User Feedback Overrides (db.user_feedback) → Historical user corrections
    ↓
4. Curated Domain Library (DomainRepository / libraries/domains/domains.json) → 100+ vetted domains
    ↓
5. Inference Cache (src/ml/inferenceCache.ts) → 24h exact match cache
    ↓
6. Local fastText ML Model (src/ml/modelLoader.ts → public/models/atentiv-page-category.ftz)
    ↓
7. Keyword Scoring Fallback (libraries/keywords/*.json) → Bag-of-words TF-IDF
    ↓
8. Default Neutral Fallback ("Other")
    ↓
Activity Inference & Contextual Productivity Evaluation (YouTube Educational Promotion)
    ↓
Workstream Formation (src/workstreams/workstreamEngine.ts: Cosine >= 0.68, 20m window, merge/split)
    ↓
Context Switch Detection (src/workstreams/contextSwitch.ts: CU in {0,1,2,4}, SW = 1.5 if <=45s else 1.0)
    ↓
Context Switch Penalty: CSP = sum(SW * CU)
    ↓
Focus Score Engine (src/analytics/focusScore.ts):
    F = round(100 * (0.65 * PR + 0.35 * SR)) - min(40, 2N), clamped 0-100; T=0 displays '—'
    ↓
Dexie IndexedDB Repositories (13 tables: tab_sessions, workstreams, rules, traces, metrics, snapshots)
    ↓
Formal User Interfaces:
├── Side Panel (sidepanel.html)
├── Standalone Dashboard (dashboard.html)
├── Options & Settings (options.html)
└── In-Page Shadow DOM HUD (#atentiv-v3)
```

---

## 3. Technology Alignment Matrix

| Architectural Domain | Canonical Technology | Verification Standard |
| :--- | :--- | :--- |
| **Language & Typings** | TypeScript 5.7+ Strict Mode | `tsc --noEmit` exits with 0 errors |
| **UI Framework** | React 19 + Recharts + Lucide React | Clean multi-page Vite bundle |
| **Styling System** | Unified CSS Glassmorphism (`src/style.css`) | Shadow DOM CSS variables (`--at-purple`, `--at-blur`, `--at-bg`) |
| **Background Runtime** | Manifest V3 Service Worker (ESM bundle via esbuild) | Runs in isolated background service worker context |
| **Content Script** | IIFE bundle via esbuild into Shadow DOM | Zero CSS bleed into host web pages |
| **Local Storage** | Dexie.js 4.4+ on IndexedDB | Plain-text sandboxed by Chrome origin isolation; zero remote egress |
| **On-Device ML** | fastText WASM SIMD (quantized 1.8MB `.ftz`) | Sub-15ms local page classification |

---

## 4. Reconciliation of SRS Revision 3.1 Parameters

| Parameter / Feature | Legacy / Ad-Hoc Prototype | Canonical SRS 3.1 Specification | Verification Status |
| :--- | :--- | :--- | :--- |
| **Inactivity Threshold** | Unspecified or ad-hoc timers | Exact 180 seconds default (configurable 1–10m); pauses dwell time | VERIFIED (`sessionManager.ts`) |
| **System Sleep Recovery** | Untracked clock jumps | 30s alarms heartbeat; gaps >90s detected as sleep and excluded | VERIFIED (`sessionManager.ts`) |
| **Media Playback** | Background tabs ignored | Background tabs playing audible audio in Learning/Research/Comms get dwell credit | VERIFIED (`sessionManager.ts`) |
| **Restricted Protocols** | Broken scripts on internal pages | `chrome://`, `edge://`, `about:` marked `UNTRACKABLE`; zero dwell or false penalties | VERIFIED (`textFeatures.ts`, `sessionManager.ts`) |
| **Context Switch Penalty** | Simple linear count | Exact formula: $CSP = \sum(SW \times CU)$; $SW=1.5$ for $\le 45$s, $CU \in \{0,1,2,4\}$ | VERIFIED (`contextSwitch.ts`) |
| **Focus Score Formula** | Unnormalized heuristic | $F = \operatorname{round}(100(0.65PR + 0.35SR)) - \min(40, 2N)$, clamped 0–100; $T=0$ yields `—` | VERIFIED (`focusScore.ts`) |
| **PR & SR Status** | Undocumented | Explicitly marked as SRS `[To Be Specified]` with provisional formulas documented | VERIFIED (`docs/architecture/OPEN_ITEMS.md`) |
| **YouTube Context Rule** | Static entertainment flag | Distracting by default; title terms (`lecture`, `tutorial`, `course`, `documentation`) promote to Productive | VERIFIED (`classifier.ts`) |
| **Workstream Clustering** | Ad-hoc domain grouping | Cosine similarity $\ge 0.68$, 20-min window, merge $>3$ tabs or centroid $>0.85$, split $>15$ min | VERIFIED (`workstreamEngine.ts`) |
| **Restricted Popup Window** | Broken sidePanel attempt | Click on restricted page opens `420×680` popup window running `sidepanel.html` | R5 implementation target |
| **HUD Appearance Controls** | Stubbed settings section | Live transparency slider (0–100%), blur slider, 7-color accent picker, size, position | R4 implementation target |
| **Auto-Activate Tabs** | Manual interaction required | `chrome.tabs.onCreated` triggers session reconcile and sends `NEW_TAB_CREATED` | R6 implementation target |

---

## 5. Verification Gates

1. **TypeScript Typecheck**: `npx tsc --noEmit` exits with 0 errors.
2. **Build Bundle**: `npm run build` produces `dist/sidepanel.html`, `dist/dashboard.html`, `dist/options.html`, `dist/index.html`, `dist/background.js`, `dist/content.js`.
3. **Automated Unit Tests**: `npm test` reports **30 / 30 PASS**.
4. **Privacy & Security Audit**: Zero outbound network requests (`fetch`, `XMLHttpRequest`, `WebSocket`, external endpoints).
5. **Distribution Packaging**: `atentiv-v1.0.1.zip` created under 5MB.
