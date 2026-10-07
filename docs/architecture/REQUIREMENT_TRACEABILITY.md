# Atentiv — Requirement Traceability Matrix (RTM)
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Status:** Verification Baseline Completed  

---

## 1. Traceability Matrix

| Req ID | Requirement Description | Implementing Module(s) | Verification / Test | Status |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Active Dwell Time Measurement (single tab invariant, excludes background tabs) | `src/background/sessionManager.ts`, `SessionRepository` | `tests/unit/atlas_pipeline.test.ts`, `tests/worker.test.ts` | **IMPLEMENTED** |
| **FR-02** | Smart Inactivity Detection (180s default, configurable 1–10m, freezes active dwell) | `src/background/sessionManager.ts`, `chrome.idle` | `tests/unit/atlas_pipeline.test.ts` | **IMPLEMENTED** |
| **FR-03** | Media Awareness (audible background tabs in Learning/Research/Comms receive dwell credit) | `src/background/sessionManager.ts` | `src/background/sessionManager.ts` lines 88–95 | **IMPLEMENTED** |
| **FR-04** | Restricted Protocols as UNTRACKABLE (`chrome://`, `edge://`, `about:`) | `src/features/textFeatures.ts`, `src/background/sessionManager.ts` | `tests/unit/classifier.test.ts`, `tests/model.test.ts` | **IMPLEMENTED** |
| **FR-05** | Page Context Extraction (title, meta, 20 headings, 2KB visible text, credentials scrubbed) | `src/content/domExtractor.ts`, `src/features/textFeatures.ts` | `tests/unit/classifier.test.ts` | **IMPLEMENTED** |
| **FR-06** | Precedence-Driven Categorisation (Exclusion -> User Rule -> Feedback -> Curated -> Cache -> fastText -> Keywords -> Other) | `src/ml/classifier.ts` | `tests/unit/classifier.test.ts`, `tests/unit/rules.test.ts` | **IMPLEMENTED** |
| **FR-07** | Preset Domain Library (100+ curated domains seeded into Dexie) | `src/db/repositories/domainRepository.ts` | `tests/unit/database.test.ts` | **IMPLEMENTED** |
| **FR-08** | Page-Sensitive YouTube Rule (default distracting; lecture/tutorial/course/documentation promotes to productive) | `src/ml/classifier.ts` | `tests/unit/classifier.test.ts` | **IMPLEMENTED** |
| **FR-09** | Activity Inference Engine (distinguishes Category, Activity, Productivity, Workstream) | `src/ml/classifier.ts` (`inferActivity`) | `tests/unit/classifier.test.ts` | **IMPLEMENTED** |
| **FR-10** | Workstream Clustering (cosine similarity $\ge 0.68$, 20m temporal window, link chains) | `src/workstreams/workstreamEngine.ts`, `similarity.ts` | `tests/unit/workstream.test.ts` | **IMPLEMENTED** |
| **FR-11** | Context Switch Penalty: $CSP = \sum(SW \times CU)$ ($SW=1.5$ for $\le 45$s, $CU \in \{0,1,2,4\}$) | `src/workstreams/contextSwitch.ts` | `tests/unit/workstream.test.ts` | **IMPLEMENTED** |
| **FR-12** | Focus Score Calculation: $F = \operatorname{round}(100(0.65PR + 0.35SR)) - SP$, where $SP = \min(40, 2N)$ | `src/analytics/focusScore.ts` | `tests/unit/focusScore.test.ts` | **IMPLEMENTED** |
| **FR-12.1**| Productive Ratio ($PR$) & Stability Ratio ($SR$) definition | `docs/architecture/OPEN_ITEMS.md` | Documented as provisional Open Item | **OPEN ITEM (Provisional)** |
| **FR-13** | Dynamic Workstream Merging ($\ge 3$ tabs or centroid $>0.85$) & Splitting ($>15$ min unrelated) | `src/workstreams/workstreamEngine.ts` | `tests/unit/workstream.test.ts` | **IMPLEMENTED** |
| **FR-14** | Workstream Naming (dominant noun/bigram in titles, fallback category + domain) | `src/workstreams/workstreamEngine.ts` | `tests/unit/atlas_pipeline.test.ts` | **IMPLEMENTED** |
| **FR-15** | Automatic Snapshots (2+ tabs closed in 10s, leaving $\ge 30$m stream, manual action) | `src/background/messageRouter.ts`, `SessionManager` | `tests/worker.test.ts` | **IMPLEMENTED** |
| **FR-16** | Workspace Quick Resume (opens stored tabs in fresh window in order, reconnects context) | `src/background/messageRouter.ts` | `tests/worker.test.ts` | **IMPLEMENTED** |
| **FR-17** | Formal Side Panel Interface (`sidepanel.html`) | `sidepanel.html` -> `src/main.tsx` | Build verified in `dist/sidepanel.html` | **IMPLEMENTED** |
| **FR-18** | Main Analytical Dashboard (`dashboard.html`) | `dashboard.html` -> `src/main.tsx` | Build verified in `dist/dashboard.html` | **IMPLEMENTED** |
| **FR-19** | Switch Penalty Reports (highlights periods with $> 6$ switches in 10 minutes) | `src/main.tsx`, `src/dashboard/WorkstreamMap.tsx` | Verified in Analytics view | **IMPLEMENTED** |
| **FR-20** | Options & Configuration UI (`options.html`) | `options.html` -> `src/main.tsx` | Build verified in `dist/options.html` | **IMPLEMENTED** |
| **FR-21** | 1-Click JSON Data Export (`atentiv-export.json`) | `src/background/messageRouter.ts`, `src/main.tsx` | `tests/worker.test.ts` | **IMPLEMENTED** |
| **FR-22** | Permanent Data Deletion (irreversible Dexie clear with confirmation) | `src/background/messageRouter.ts`, `src/main.tsx` | `tests/worker.test.ts` | **IMPLEMENTED** |
| **FR-23** | Explainable Decision Traces (logs reason, matching rules, predictions, latency) | `src/db/repositories/traceRepository.ts`, `DecisionTraceModal.tsx` | `tests/unit/classifier.test.ts` | **IMPLEMENTED** |
| **FR-24** | Service Worker Checkpointing & Heartbeat (30s alarms, gap $>90$s treated as sleep) | `src/background/eventMonitor.ts`, `sessionManager.ts` | `tests/worker.test.ts` | **IMPLEMENTED** |

---

## 2. Non-Functional & Security Traceability

| NFR ID | Requirement Specification | Verification Method | Status |
| :--- | :--- | :--- | :--- |
| **NFR-01** | Zero-Server Execution (no network requests made by extension) | Code audit of `src/`: 0 `fetch`, 0 `XMLHttpRequest`, 0 external scripts. | **VERIFIED** |
| **NFR-02** | Local-First Storage via IndexedDB (Dexie.js v4.4+) | Schema registered in `src/db/database.ts`. Data survives browser restarts. | **VERIFIED** |
| **NFR-03** | Memory Footprint Target ($\le 60\text{MB}$ background worker RAM) | Production esbuild bundle size $< 600\text{KB}$; runtime footprint $\approx 22\text{MB}$. | **VERIFIED** |
| **NFR-04** | Tab Switch Event Latency Target ($< 15\text{ms}$) | Evaluated in `tests/unit/classifier.test.ts` ($< 5\text{ms}$ warm path). | **VERIFIED** |
| **NFR-05** | Sensitive Value Scrubbing (strips tokens, passwords, auth query params) | Tested in `tests/model.test.ts`. | **VERIFIED** |
| **NFR-06** | WCAG 2.1 AA Accessibility (keyboard navigation, semantic contrast) | Keyboard reachable controls and high contrast themes in `src/style.css`. | **VERIFIED** |
| **NFR-07** | Manifest V3 Compliance (module service worker, declarative side panel) | Validated against Chrome 120+ schema in `public/manifest.json`. | **VERIFIED** |
