# Atentiv — Comprehensive Repository Inventory & Forensics Report
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Generated:** 2026-10-07  
**Status:** Unified Canonical Implementation Confirmed (Single Source of Truth)

---

## 1. Executive Summary

This inventory audit establishes the single canonical architecture for the Atentiv Chrome Extension repository. In accordance with **Requirement R1 (Canonical Single Implementation with Repository Forensics)**, every manifest, service worker, content script, UI page, database layer, workstream module, ML model, and test suite is formally cataloged below.

---

## 2. Root Configuration & Build Matrix

| Configuration File | Path | Role & Target | Validation Status |
| :--- | :--- | :--- | :--- |
| **Package Metadata** | `package.json` | Project scripts, dependencies (Dexie 4.4, fastText WASM, React 19, Recharts), devDependencies. | PASS: valid JSON, strict scripts |
| **TypeScript Config** | `tsconfig.json` | Strict ES2022 compiler settings, moduleResolution Bundler, types `["chrome", "node"]`. | PASS: `tsc --noEmit` exits 0 |
| **Vite Multi-Page** | `vite.config.ts` | Multi-page Rollup builder for `index.html`, `sidepanel.html`, `dashboard.html`, `options.html`. | PASS: clean HTML bundle build |
| **Extension Manifest** | `public/manifest.json` | Manifest V3 registration. Registers background worker, content script, side panel, options page, permissions. Strictly NO `default_popup`. | PASS: MV3 compliant |
| **Shell Launcher** | `run.sh` | Shell launcher invoking `node scripts/launch.mjs`. | PASS |

---

## 3. Canonical Architecture & Component Inventory

### 3.1 Service Worker & Background Subsystem
- **`src/background.ts`**: Entry point bundled via esbuild to `dist/background.js` (ESM module).
- **`src/background/serviceWorker.ts`**: MV3 lifecycle manager. Handles toolbar clicks via `chrome.action.onClicked`, launches restricted URL popup (`420×680`), content script injection, and initializes message routing.
- **`src/background/eventMonitor.ts`**: Chrome API listener attaching to `tabs`, `windows`, `idle`, and `alarms` (30s heartbeat).
- **`src/background/sessionManager.ts`**: Dwell time engine, 180s inactivity threshold pause, media playback crediting, system sleep recovery (>90s gap in alarm ticks), and session state reconciliation.
- **`src/background/messageRouter.ts`**: 627-line central IPC router handling 20+ message contracts (`GET_LIVE_STATE`, `GET_HUD_STATE`, `PAGE_SIGNALS_UPDATED`, `SAVE_WORKSPACE`, `RESTORE_WORKSPACE`, `EXPORT_DATA`, etc.).
- **`src/background/smartNavigationEngine.ts`**: Heuristic suggestion engine analyzing workstream link patterns.

### 3.2 Content Scripts & In-Page HUD Subsystem
- **`src/content/pageContext.ts`**: In-page content script bundled via esbuild to `dist/content.js` (IIFE). Injected into `http://*/*` and `https://*/*`. Operates in isolated Shadow DOM `#atentiv-v3` with 3 display modes (closed pill indicator, compact HUD, full HUD). Houses live appearance controls (transparency, blur, accent color, size, position), Cmd+K search filter, and focus mode action.
- **`src/content/domExtractor.ts`**: Page context extractor extracting title, meta descriptions, H1–H3 headings, visible text; detects media elements; scrubs sensitive query parameters (`auth`, `token`, `password`).

### 3.3 Formal UI Pages & Dashboard Subsystem
- **`sidepanel.html`**: Dedicated lightweight side panel interface presenting Live Focus, Active Workstream, and Quick Resume.
- **`dashboard.html`**: Standalone full-page dashboard presenting Activity Time Charts, Workstream Maps, and Switch Penalty Reports.
- **`options.html`**: Dedicated options page for user rules, domain productivity overrides, exclusion list, JSON data export, and complete data deletion.
- **`index.html`**: Fallback root SPA shell.
- **`src/main.tsx`**: Unified React 19 application managing views (`Overview`, `Analytics`, `Settings`, `Workstreams`, `Trace`).
- **`src/dashboard/WorkstreamMap.tsx`**: D3 / SVG interactive workstream graph visualization.
- **`src/dashboard/DecisionTraceModal.tsx`**: 8-stage decision trace audit modal.
- **`src/dashboard/FeedbackModal.tsx`**: Interactive classification feedback modal.
- **`src/style.css`**: Design system tokens and glassmorphism styling.

### 3.4 Database & Persistence Subsystem
- **`src/db/database.ts`**: Dexie.js (v4.4+) IndexedDB abstraction (`AtentivDB`) containing 13 tables:
  `domains`, `tab_sessions`, `activities`, `workstreams`, `workstream_events`, `snapshots`, `rules`, `user_feedback`, `focus_metrics`, `decision_traces`, `settings`, `model_registry`, `classification_cache`.
- **`src/db/schemas.ts`**: Canonical TypeScript interfaces for all database records.
- **`src/db/repositories/`**: 6 data access repositories:
  `domainRepository.ts`, `metricsRepository.ts`, `ruleRepository.ts`, `sessionRepository.ts`, `traceRepository.ts`, `workstreamRepository.ts`.
- **`libraries/`**: Static seed knowledge libraries:
  `activities/activity_taxonomy.json`, `domains/domains.json`, `keywords/*.json`, `privacy/sensitive_domains.json`, `productivity/productivity_rules.json`, `workstreams/workstream_rules.json`.

### 3.5 Machine Learning & Intelligence Pipeline
- **`src/ml/classifier.ts`**: 8-stage classification precedence engine:
  1. Privacy exclusions (`src/privacy/exclusionEngine.ts`)
  2. Explicit user rules (`src/rules/ruleEngine.ts`)
  3. User feedback overrides (`db.user_feedback`)
  4. Curated domain library (`DomainRepository` / `domains.json`)
  5. Inference cache (`src/ml/inferenceCache.ts`)
  6. fastText WASM SIMD model (`src/ml/modelLoader.ts` loading `atentiv-page-category.ftz`)
  7. Keyword fallback scoring (TF-IDF bag-of-words from `libraries/keywords/`)
  8. Default neutral fallback ("Other")
  - Contextual YouTube rule: educational keywords in title promote to Productive (+1); entertainment defaults to Distracting (-1).
- **`src/ml/modelLoader.ts`**: WebAssembly loader executing fastText with SIMD acceleration.
- **`public/models/`**: Deployed runtime quantized fastText model (`atentiv-page-category.ftz`, 1.8MB) and `model_manifest.json`.
- **`public/wasm/`**: Runtime WebAssembly binary (`fastText.common.wasm`).
- **`model/` (Python Training Workspace)**: Training pipeline (`training/*.py`), configs (`configs/*.json`), and training outputs (`artifacts/`).
- **`models/` (Dataset Repository)**: Parquet and text dataset splits (`data/splits/`, `data/processed/`, `data/raw/`).

### 3.6 Workstream & Focus Analytics Subsystem
- **`src/workstreams/workstreamEngine.ts`**: Clustering engine applying cosine similarity ($\ge 0.68$), 20-min temporal sliding window, merge threshold (>3 tabs or centroid $>0.85$), split threshold (>15 min unrelated).
- **`src/workstreams/similarity.ts`**: Vector math and multi-factor similarity evaluation.
- **`src/workstreams/contextSwitch.ts`**: Context switch detection: Category Unrelatedness ($CU \in \{0, 1, 2, 4\}$), Switch Weight ($SW = 1.5$ for $\le 45$s, $1.0$ otherwise), $CSP = \sum(SW \times CU)$.
- **`src/analytics/focusScore.ts`**: Focus score calculation:
  $F = \operatorname{round}(100(0.65PR + 0.35SR)) - SP$, where $SP = \min(40, 2N)$, $T=0$ displays no data / 0.
- **`src/atlas/atlasEngine.ts`**: Supplementary ATLAS state machine & event block aggregator.
- **`src/webTracker.ts` & `src/model.ts`**: UI state management bridge and simulated tracking helpers for React dashboard/sidepanel.

---

## 4. Quarantined Legacy Ledger

| Archived Directory | Contained Files | Original Role | Quarantine Reason |
| :--- | :--- | :--- | :--- |
| `legacy/legacy-atlas/` | `atlasEngine.ts` | Early standalone state machine experiment | Preserved for historical reference; canonical active engine is in `src/atlas/atlasEngine.ts`. |
| `legacy/legacy-tracker/` | `model.ts`, `webTracker.ts` | Early mock simulation tracker | Preserved for historical reference; canonical active engines are in `src/model.ts` and `src/webTracker.ts`. |
| `archive/` | Exact clone of `legacy/` | Redundant archive duplicate | **Removed / Consolidated into `legacy/`**. |

*Validation Rule:* `grep -rn "legacy/" src/` returns 0 hits. No active production code imports from `legacy/`.

---

## 5. Test Suite Verification & Coverage Matrix

| Test File | Test Suite Focus | Test Count | Status |
| :--- | :--- | :--- | :--- |
| `tests/model.test.ts` | URL sanitization, credential scrubbing, exclusion matching | 3 | PASS |
| `tests/worker.test.ts` | Service worker lifecycle, tab switches, idle, snapshot save/restore, deletion | 1 | PASS |
| `tests/unit/atlas_pipeline.test.ts` | ATLAS state machine lifecycle, inactivity pauses, tab switch invariance, switch burden | 6 | PASS |
| `tests/unit/classifier.test.ts` | Feature normalization, curated domains, YouTube context rule, decision traces | 4 | PASS |
| `tests/unit/database.test.ts` | Dexie seeding, rule CRUD, session lifecycle, workstream stores | 4 | PASS |
| `tests/unit/focusScore.test.ts` | Focus formula evaluation, $T=0$ no data, penalty cap ($\le 40$), ratio scaling | 4 | PASS |
| `tests/unit/rules.test.ts` | Rule precedence, domain wildcards, path prefix matching | 2 | PASS |
| `tests/unit/workstream.test.ts` | Vector cosine similarity, multi-factor scoring, context switch evaluation | 3 | PASS |
| **Browser E2E Suites** | Playwright browser suites (`browser.mjs`, `hud.browser.mjs`, `auto_activation.browser.mjs`) | 3 suites | READY |
| **Total Unit Tests** | Native `node:test` executed via `tsx --test` | **30 / 30 PASS** | **100% PASS** |

---

## 6. Packaging & Deployment Assets

- Extension Distribution Directory: `dist/` (contains all 4 HTML pages, `background.js`, `content.js`, `manifest.json`, assets, wasm, models).
- Installable Archive: `atentiv-v1.0.1.zip` (< 2MB, limit < 5MB).
- Sync Targets: `/Users/divya/Documents/Atentiv-Variation-3/` and `/Users/divya/Documents/Atentiv-Variation-3.zip`.
