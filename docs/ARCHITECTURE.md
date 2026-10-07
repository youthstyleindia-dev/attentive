# Atentiv System Architecture

## 1. System Overview & Design Philosophy

**Atentiv** is a privacy-first, on-device browser attention intelligence and context recovery engine built on Chrome Extensions Manifest V3 (MV3). It monitors user browsing patterns, classifies web activities in real time using a quantized WebAssembly fastText ML model, dynamically clusters sessions into coherent workstreams, estimates behavioral focus scores, and provides explainable decision traces and context resume capabilities.

### Core Architecture Tenets
1. **100% On-Device Processing**: Zero external analytics, cloud databases, or remote LLM inference APIs. No user data, URLs, or browsing tokens ever leave the user's browser.
2. **Sub-15ms Real-Time Inference**: Model classification, feature normalization, rule matching, and workstream assignment execute strictly within active browser tab transitions (< 0.1ms fastText inference latency).
3. **Multi-Stage Decision Hierarchy**: Deterministic privacy filters and explicit user rules strictly supersede machine learning predictions.
4. **Resilient Ephemeral-to-Durable Storage**: Chrome Extension Service Worker lifecycle resilience via `chrome.storage.session` for active dwell-time checkpoints, backed by Dexie.js IndexedDB for durable analytical stores.

---

## 2. High-Level Component Topology

```
+----------------------------------------------------------------------------------------------------+
|                                    ATENTIV EXTENSION (MV3)                                         |
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  +--------------------------------+                 +-------------------------------------------+  |
|  |     Content Script Pipeline    |                 |        Sidepanel & Dashboard UI           |  |
|  |   (src/content/pageContext.ts) |                 |            (src/main.tsx)                 |  |
|  | - URL & DOM metadata harvest   |                 | - Real-time Focus Score gauge             |  |
|  | - Sensitive credential scrub   |                 | - Workstream Map & cluster graph          |  |
|  | - Lightweight text extraction  |                 | - Context Resume & snapshot restore       |  |
|  +--------------------------------+                 | - Explainable Decision Trace inspector    |  |
|                  |                                  | - User Feedback & override editor         |  |
|                  v (chrome.runtime.sendMessage)     +-------------------------------------------+  |
|  +----------------------------------------------------------------------------------------------+  |
|  |                             Background Service Worker Core                                   |  |
|  |                                  (src/background.ts)                                         |  |
|  |                                                                                              |  |
|  |  +-------------------------+    +--------------------------+    +-------------------------+  |  |
|  |  |      Event Monitor      |    |      Session Manager     |    |     Message Router      |  |  |
|  |  |  (eventMonitor.ts)      |--->|   (sessionManager.ts)    |<---|   (messageRouter.ts)    |  |  |
|  |  | - Tab switch / update   |    | - Dwell accumulation     |    | - UI IPC dispatch       |  |  |
|  |  | - Window focus / blur   |    | - Idle state freezing    |    | - CRUD action dispatch  |  |  |
|  |  | - Heartbeat alarm (30s) |    | - Context switch audit   |    | - JSON backup / export  |  |  |
|  |  +-------------------------+    +--------------------------+    +-------------------------+  |  |
|  |                                               |                                              |  |
|  |                                               v                                              |  |
|  |  +----------------------------------------------------------------------------------------+  |  |
|  |  |                           Classification & Inference Engine                            |  |  |
|  |  |                                  (src/ml/classifier.ts)                                |  |  |
|  |  |                                                                                        |  |  |
|  |  |  [Stage 1: Privacy Exclusion Engine]  -> Checks sensitive domains, protocols, exclusions  |  |  |
|  |  |  [Stage 2: Exact User Rule Engine]    -> Priority-ordered user domain overrides          |  |  |
|  |  |  [Stage 3: High-Priority Rules]       -> System curated domain & path patterns           |  |  |
|  |  |  [Stage 4: Curated Domain Knowledge] -> Pre-indexed offline taxonomy cache (~100+ domains)|  |  |
|  |  |  [Stage 5: fastText WASM Inference]  -> 1.80MB .ftz model running offline via WebAssembly|  |  |
|  |  |  [Stage 6: Activity Taxonomy Rule]   -> 9-category deterministic activity mapping        |  |  |
|  |  |  [Stage 7: Contextual Productivity]  -> Task-dependent productivity score assignment    |  |  |
|  |  +----------------------------------------------------------------------------------------+  |  |
|  |                                               |                                              |  |
|  |                                               v                                              |  |
|  |  +----------------------------------------------------------------------------------------+  |  |
|  |  |                         Online Workstream Clustering Engine                            |  |  |
|  |  |                             (src/workstreams/workstreamEngine.ts)                      |  |  |
|  |  | - Multi-factor similarity: Domain match + Category match + Embedding Cosine + Decay   |  |  |
|  |  | - Context switch evaluator: Penalty score calculation and thrashing detection         |  |  |
|  |  +----------------------------------------------------------------------------------------+  |  |
|  +----------------------------------------------------------------------------------------------+  |
|                                                  |                                                 |
|                                                  v                                                 |
|  +----------------------------------------------------------------------------------------------+  |
|  |                                Local Persistence Tier (IndexedDB)                            |  |
|  |                                       (src/db/database.ts)                                   |  |
|  |  - tab_sessions      - activities        - workstreams       - workstream_events             |  |
|  |  - snapshots         - rules             - decision_traces   - user_feedback                 |  |
|  |  - domains           - focus_metrics     - feature_snapshots - model_manifest - model_registry|  |
|  +----------------------------------------------------------------------------------------------+  |
+----------------------------------------------------------------------------------------------------+
```

---

## 3. Detailed Component Architecture

### 3.1 Content Script Pipeline (`src/content/`)
- Injected on `document_idle` to minimize page load overhead.
- Harvests high-signal, non-PII text representations:
  - Document Title (`document.title`)
  - Meta Description (`meta[name="description"]`, `meta[property="og:description"]`)
  - Primary Content Headings (`h1`, `h2`, `h3`)
- Sanitizes all query strings, authentication tokens, hashes, and session IDs before dispatching to the background worker.

### 3.2 Background Service Worker Core (`src/background/`)
Under Chrome Manifest V3, background service workers are ephemeral and can be terminated after 30 seconds of inactivity. Atentiv overcomes this with:
1. **`EventMonitor`**: Listens to `chrome.tabs.onActivated`, `chrome.tabs.onUpdated`, `chrome.windows.onFocusChanged`, and `chrome.idle.onStateChanged`.
2. **`SessionManager`**: 
   - Manages active dwell timing with sub-second accuracy.
   - Saves checkpoint snapshots to `chrome.storage.session` on every heartbeat.
   - Synchronizes durable session state to IndexedDB (`tab_sessions`).
   - Pauses dwell accumulation when `chrome.idle.queryState` returns `idle` or `locked`.
   - Reconciles transitions seamlessly when the user switches tabs or windows.
3. **`MessageRouter`**: Type-safe IPC router handling requests from the popup/sidepanel UI, including rule mutations, workspace restores, and data wipes.

### 3.3 Multi-Stage Classification Pipeline (`src/ml/classifier.ts`)
The classifier runs a 7-stage deterministic fallback hierarchy:
1. **Stage 1 (Privacy Exclusion)**: Checks `libraries/privacy/sensitive_domains.json` and user-configured blacklist. If matched, URL is excluded from tracking and storage immediately.
2. **Stage 2 (Exact User Rules)**: Checks user-defined domain and path overrides stored in `rules` repository.
3. **Stage 3 (High-Priority Rules)**: Checks pattern-matching and regular expression rules.
4. **Stage 4 (Curated Domain Knowledge)**: Instant sub-millisecond lookup in `libraries/domains/domains.json` (covers developer docs, repositories, learning platforms, streaming, and social).
5. **Stage 5 (fastText WebAssembly Inference)**: Compiles composite feature text (`domain + title + headings + meta`) and runs inference against the 1.80MB quantized `.ftz` fastText binary (`fastText.common.wasm`), yielding multi-label probabilities across 11 standard web categories.
6. **Stage 6 (Activity Inference)**: Maps category and keyword features into one of 9 controlled activity categories (`Coding`, `Research`, `Documentation`, `Communication`, etc.).
7. **Stage 7 (Contextual Productivity)**: Evaluates current workstream intention and overrides to classify the session as `productive`, `neutral`, or `distracting`.

### 3.4 Workstream & Context Engine (`src/workstreams/`)
- Dynamically clusters discrete tab sessions into semantic task buckets (e.g., "Frontend Architecture", "Machine Learning Evaluation").
- Computes multi-factor similarity incorporating:
  - Exact domain match score ($w_d = 0.35$)
  - Category match score ($w_c = 0.25$)
  - fastText sentence vector cosine similarity ($w_v = 0.25$)
  - Temporal exponential decay score ($w_t = 0.15$, $\lambda = 0.001$)
- Evaluates context switches: assigns penalty scores based on workstream distance and rapid thrashing intervals (< 60s).

### 3.5 Database & Storage Architecture (`src/db/`)
- Powered by **Dexie.js** wrapping browser-native IndexedDB (`AtentivDB` v2).
- 16 distinct object stores including `browser_events`, `activity_segments`, `tab_switch_events`, and `tab_sessions`.
- Ephemeral active dwell state stored in `chrome.storage.session`.
- Zero cloud endpoints or network synchronization.

### 3.6 ATLAS State Machine & Pure Tab Switch Invariance (`src/atlas/`)
- **ATLAS State Machine**: Manages 5 discrete states (`STOPPED`, `RECORDING`, `IDLE_CANDIDATE`, `IDLE`, `PAUSED`). Inactivity $\ge 180\text{s}$ cleanly halts active dwell timers, accumulating separate `idle_seconds` without penalizing as unproductive.
- **Pure Tab Switch Invariant**: A Context Switch occurs strictly when $\text{activeTabId}_t \neq \text{activeTabId}_{t-1}$. Invariance is guaranteed: workstream or semantic reclassifications never trigger a switch count.
- **Switch Burden Metric**: A separate qualitative friction index ($0\text{--}100$) captures cognitive overhead without altering deterministic switch counts.

### 3.7 In-Page 5-Tier Glassmorphic HUD (`src/content/pageContext.ts`)
Injected via Shadow DOM (`backdrop-filter: blur(20px)`), completely isolated from host webpage CSS:
- **Tier 1: Compact View**: Minimal floating glass icon displaying live status dot and focus score (`◉ 82`).
- **Tier 2: Hover Preview**: Instant tooltip card showing recording status, focus score, domain, and equalizer sparkline.
- **Tier 3: Expanded Panel**: Full control center with Current Tab details, Productivity dropdown, active dwell timer, Smart Navigation cards, and Recent Tabs feed.
- **Tier 4: Smart Navigation Flyout**: Detail popup showing candidate tabs with `Open All ▶` and single-click switching.
- **Tier 5: Distraction Notification**: Non-intrusive alert on unproductive domains with 2.5s grace period and 3 actions (`[Leave]`, `[Keep]`, `[Mark Productive]`).

### 3.8 Smart Navigation & Tab Deduplication (`src/background/smartNavigationEngine.ts`)
- Evaluates candidate destinations across active workstreams, context resume snapshots, and recent history.
- Pre-queries open tabs in the current window (`chrome.tabs.query({ currentWindow: true })`).
- If a target URL or matching apex domain + path is already open, focuses the existing tab instead of creating redundant duplicates.

### 3.9 Scenic New Tab Experience & Floating Navigation Dock (`src/main.tsx`)
- Provides an optional nature landscape launchpad with live clock (`10:24 AM`), personalized greeting, Google search bar with quick shortcuts (`GitHub`, `Docs`, `YouTube`, `Notion`), and circular SVG Focus Gauge (`Today's Focus: 82/100`).
- Features a bottom floating glass dock (`Home`, `Analytics`, `Workstreams`, `Resume`, `Sites`) for seamless 1-click workspace switching.

### 3.10 Uncoupled Focus Score & Active Coverage
- **Focus Score**: $100 \times \frac{P}{P + U}$ (idle time is uncoupled from the denominator).
- **Active Coverage**: $100 \times \frac{P + U + N}{P + U + N + I}$ (transparent computer presence indicator).
- **Net Productive Time**: $P - U$.
