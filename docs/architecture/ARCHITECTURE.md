# Atentiv — System Architecture Specification
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Status:** Approved Canonical Architecture  
**Execution:** Zero-Server, Local-First, Manifest V3  

---

## 1. Architectural Philosophy & Principles

Atentiv is designed as an on-device, context-aware productivity companion built directly into the Chromium web browser. Its architectural principles are non-negotiable:

1. **Zero-Server Guarantee:** No browsing history, URLs, titles, headings, or biometric timing data leave the client. There are no remote APIs, telemetry, analytics SDKs, or cloud synchronization services.
2. **Local-First Persistence:** All session state, workstream graphs, and decision traces reside exclusively within browser-native IndexedDB via Dexie.js (v4.4+).
3. **Task-Centric Analytics:** Browsing attention is structured around cohesive, evolving tasks ("Workstreams") rather than raw tab counts.
4. **Distinction Between Browser Events and Cognitive Attention:** Tab switching is an infrastructure event; context switching is a cognitive friction event evaluated via semantic similarity, workstream continuity, and category unrelatedness.

---

## 2. High-Level System Architecture

```
                    ┌─────────────────────────┐
                    │      HUMAN USER         │
                    └────────────┬────────────┘
                                 │ Interacts with DOM / Browser
                                 ▼
                    ┌─────────────────────────┐
                    │    CHROMIUM BROWSER     │
                    └──────┬───────────┬──────┘
                           │           │
         Tabs, Windows,    │           │ DOM Mutation, Title,
         Idle, Alarms      ▼           ▼ Headings, Media State
             ┌─────────────────┐   ┌────────────────────┐
             │  BROWSER EVENT  │   │   CONTENT SCRIPT   │
             │     MONITOR     │   │   (domExtractor &  │
             │(eventMonitor.ts)│   │  Shadow DOM HUD)   │
             └────────┬────────┘   └─────────┬──────────┘
                      │                      │
                      │ Port/Message Channel │
                      ▼                      ▼
             ┌──────────────────────────────────────────┐
             │       ATLAS BACKGROUND SERVICE WORKER    │
             │         (sessionManager.ts & router)     │
             └────────────────────┬─────────────────────┘
                                  │
           ┌──────────────────────┼──────────────────────┐
           ▼                      ▼                      ▼
 ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
 │ PRIVACY & RULES   │  │ INTELLIGENCE & ML │  │ WORKSTREAM & CSP  │
 │ • ExclusionEngine │  │ • Curated Domains │  │ • Cosine Vector   │
 │ • RuleEngine      │  │ • fastText WASM   │  │ • Dynamic Merge   │
 │ • Sensitive Scrub │  │ • YouTube Parser  │  │ • FR-11 CSP Engine│
 └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
           │                      │                      │
           └──────────────────────┼──────────────────────┘
                                  ▼
             ┌──────────────────────────────────────────┐
             │         FOCUS CALCULATOR (FR-12)         │
             │   F = round(100·(0.65PR + 0.35SR)) - SP   │
             └────────────────────┬─────────────────────┘
                                  │
                                  ▼
             ┌──────────────────────────────────────────┐
             │       LOCAL PERSISTENCE LAYER            │
             │        (Dexie.js / IndexedDB)            │
             │ tab_sessions | workstreams | snapshots   │
             └────────────────────┬─────────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│   SIDE PANEL     │    │  MAIN DASHBOARD  │    │ OPTIONS / CONFIG │
│ (sidepanel.html) │    │ (dashboard.html) │    │  (options.html)  │
│ • Live Focus     │    │ • Time Charts    │    │ • Domain Rules   │
│ • Active Stream  │    │ • Constellation  │    │ • Exclusions     │
│ • Quick Resume   │    │ • CSP Reports    │    │ • Export/Delete  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 3. ATLAS Subsystem Decomposition

The internal orchestration engine is labeled **ATLAS** (*Atentiv Tab Lifecycle and Activity-State System*). It comprises the following cohesive subsystems:

### 3.1 Browser Event Monitor (`src/background/eventMonitor.ts`)
- Subscribes to `chrome.tabs.onActivated`, `onUpdated`, `onRemoved`, `onCreated`.
- Subscribes to `chrome.windows.onFocusChanged`.
- Subscribes to `chrome.idle.onStateChanged`.
- Runs a 30-second heartbeat alarm (`atentiv-heartbeat`). If the gap between alarms exceeds 90 seconds, the excess duration is formally attributed to system sleep and excluded from active dwell time.

### 3.2 Session Manager (`src/background/sessionManager.ts`)
- Enforces the single active tab invariant: at most one ordinary tab accumulates active dwell time at any given instant.
- Handles the **180-second Inactivity Threshold**: pauses dwell accumulation when user input ceases and updates `idle_time`.
- Credits qualifying audible background tabs playing educational media under FR-03 conditions.
- Flags internal browser pages (`chrome://`, `edge://`, `about:`) as `UNTRACKABLE`.
- Persists checkpoints to `chrome.storage.session` to ensure resilience against Service Worker suspension.

### 3.3 Multi-Stage Intelligence Pipeline (`src/ml/classifier.ts`)
Executes strictly in order of precedence:
1. **Privacy Filter:** Checks domain against Exclusion List. If matched: tracking halts completely.
2. **Explicit User Rules:** User-defined pattern matches (`domain_exact`, `title_contains`, `url_prefix`).
3. **User Feedback Overrides:** Historic user corrections.
4. **Preset Domain Knowledge:** Curated dictionary of 100+ standard academic, engineering, and distraction domains.
5. **Inference Cache:** 24-hour cache for identical URL/title combinations.
6. **fastText WASM Model:** Local SIMD-accelerated linear classifier generating 16-dimensional sentence embeddings.
7. **Keyword Dictionary Fallback:** Heuristic keyword scoring across domain taxonomies.
8. **Default Fallback:** Category "Other" (Neutral productivity).

### 3.4 Workstream & Clustering Engine (`src/workstreams/workstreamEngine.ts`)
- Grouping criteria: cosine similarity $\ge 0.68$, temporal window within 20 minutes, navigation link chains.
- Workstream Merge: triggers when $\ge 3$ tabs are shared across streams or centroid cosine similarity exceeds $0.85$.
- Workstream Split: triggers when an unrelated topic is sustained for $> 15$ continuous active minutes.

### 3.5 Context Switch & Focus Engine (`src/workstreams/contextSwitch.ts` & `src/analytics/focusScore.ts`)
- Evaluates Context Switch Penalty according to FR-11:
  $$CSP = \sum (SW \times CU)$$
- Calculates Focus Score according to FR-12.1:
  $$F = \operatorname{round}(100 \times (0.65PR + 0.35SR)) - SP$$
  where $SP = \min(40, 2N)$ and bounds are strictly clamped to $[0, 100]$.

---

## 4. Formal Interface Contracts

As mandated by SRS Revision 3.1, Atentiv provides three formal HTML user interfaces:

| Interface File | Primary Responsibilities |
| :--- | :--- |
| `sidepanel.html` | Pinned vertical companion showing Live Focus Score gauge, active workstream card, and quick resume workspace list. |
| `dashboard.html` | Full-tab analytics center featuring hourly switch bar charts, donut category breakdown, D3 workstream link graphs, and high-penalty switch reports. |
| `options.html` | User configuration interface for managing domain productivity rules, adding privacy exclusions, exporting JSON data, and triggering permanent data wipe. |

In addition, an optional glassmorphic HUD is injected into the active page DOM under a private Shadow DOM root (`#atentiv-v3`) for seamless in-page toggling.
