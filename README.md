# Atentiv — Privacy-Preserving Context-Aware Browsing Analytics

> **Important Architecture Notice:**  
> **This repository contains one canonical Atentiv implementation located in `src/`.** All historical prototypes are quarantined under `legacy/` (`legacy-atlas` and `legacy-tracker`). The redundant `archive/` duplicate clone has been completely removed. No active production or test code imports from `legacy/`.

**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Platform:** Chromium Browser Extension (Manifest V3)  
**Architecture:** Zero-Server, Local-First, On-Device Intelligence  

---

## 1. Overview

**Atentiv** is an intelligent browser companion built into Chromium that helps users browse mindfully, understand their attention patterns, overcome tab overload, and quantify context switching. Unlike traditional trackers that stream browsing histories to remote clouds, Atentiv executes 100% locally on-device.

### Key Capabilities
- **Active Dwell Time Tracking:** Measures actual active interaction time; background tabs and idle periods do not accumulate dwell time.
- **Smart Inactivity Detection:** Pauses active tracking after 3 minutes (180s default, configurable 1–10m) without keyboard/mouse input.
- **Media Awareness:** Background audible tabs playing educational content (Learning, Research, Communication) are credited without double-counting.
- **Context-Sensitive YouTube Rule:** YouTube defaults to distracting (-1), but is dynamically promoted to productive (+1) when titles contain qualifying education terms (`lecture`, `tutorial`, `course`, `documentation`).
- **Restricted Pages Protection:** Internal protocols (`chrome://`, `edge://`, `about:`) are marked `UNTRACKABLE` with zero false metrics or dwell time.
- **Automated Workstream Grouping:** Clusters related tabs into unified tasks via cosine similarity ($\ge 0.68$) and navigation link chains.
- **Mathematically Grounded Context Switch Penalty ($CSP$):**
  $$CSP = \sum (SW \times CU)$$
  where $SW = 1.5$ for rapid switches ($\le 45\text{s}$) and $CU \in \{0, 1, 2, 4\}$. Tab switches within the same workstream incur $CU = 0$ (zero penalty).
- **Predictable Focus Score ($F$):**
  $$F = \operatorname{round}(100 \times (0.65PR + 0.35SR)) - SP$$
  where $SP = \min(40, 2N)$ and $T=0$ displays `—` (no data available). PR and SR are explicitly maintained as provisional per SRS Revision 3.1.
- **Context Snapshot & Quick Resume:** Automatic snapshots (on closing 2+ tabs within 10s or leaving a 30m+ workstream) and 1-click restore into a fresh window.
- **Privacy & Data Ownership:** Plain-text IndexedDB protected by browser/OS origin isolation, sensitive-value scrubbing, 1-click JSON export, and permanent data deletion. Zero outbound network requests.

---

## 2. Formal User Interfaces & In-Page HUD

The product implements the three formal interfaces required by the SRS plus the interactive in-page HUD overlay:

1. **Side Panel (`sidepanel.html`):** Pinned sidebar providing the Live Focus Score meter, Active Workstream badge, and Quick Resume cards.
2. **Main Dashboard (`dashboard.html`):** Full-page analytical center providing Activity Time Charts, Workstream Maps, and Switch Penalty Reports (>6 switches/10 min).
3. **Options & Settings (`options.html`):** Dedicated controls for domain rules, productivity overrides, Exclusion List, JSON data export, and complete data deletion.
4. **Interactive In-Page HUD (Shadow DOM `#atentiv-v3`):** Accessible via toolbar icon for quick glance and real-time activity controls across 3 display modes (closed pill indicator, compact HUD, full HUD).

---

## 3. New Features & HUD Enhancements (Requirements R4–R7)

- **Live Appearance Controls (R4):** Live-preview transparency slider (0–100%) and blur intensity slider (0–48px) modulating `--at-bg`, `--at-blur`, and `--at-surface` on `shadow.host`. 7-color accent picker live updating `--at-purple` and `--at-purple-l`. HUD size selector (`compact`, `default`, `large`), HUD position selector (`right`, `left`, `center`), theme toggle, and mini-indicator toggle. All preferences persist to `chrome.storage.local` under `atentiv_hud_prefs`.
- **Restricted Page Popup Window (R5):** Clicking the extension icon on internal restricted pages (`chrome://`, `edge://`, `about:`) creates a dedicated `420×680` popup window running `sidepanel.html`. Tracks popup window ID to focus if already open rather than creating duplicate windows.
- **Auto-Activate New Tabs (R6):** `chrome.tabs.onCreated` triggers immediate background session reconciliation and broadcasts `NEW_TAB_CREATED` to open HUDs, refreshing the Open Tabs list within 5 seconds without requiring manual interaction.
- **Focus Mode Background Tab Closer (R7a):** Focus Mode button (`#f-qa-focus`) queries the current window and closes all unpinned non-active tabs via `chrome.tabs.remove()`, preserving active and pinned tabs, and displaying a confirmation toast with the number of tabs closed.
- **Real-Time Live Search & Cmd+K Shortcut (R7b):** Full HUD search input (`#f-search-input`) filters both Open Tabs and Recent Activity in real-time. Global `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) shortcut expands HUD to Full mode and focuses the search input.
- **Quick Navigation Wireups (R7c, R7d):** "See all →" (`#c-see-all`) in compact mode switches directly to Full HUD view. "View all →" (`#f-ws-view-all`) in the Workstreams section highlights and switches to the Workstreams nav view.
- **Synchronized Header Pill Timer (R7e):** Header tracking pill timer (`#f-header-timer`) ticks every second synchronized with the session timer.
- **Zero Outbound Egress Privacy Standard (R9):** External Google favicon URLs replaced with offline local SVG/letter avatar generation, guaranteeing 100% zero outbound network requests across all runtime contexts.

---

## 4. Technology Stack

- **Runtime & Bundler:** TypeScript 5.7+ Strict Mode, Vite 6, esbuild.
- **UI Architecture:** React 19, Recharts, Lucide React, Native SVG Gauges.
- **Storage:** IndexedDB via Dexie.js 4.4+.
- **On-Device Machine Learning:** fastText compiled to WebAssembly (WASM SIMD) with local keyword dictionary fallback.
- **Network Footprint:** **Zero network requests.** No cloud APIs, no external telemetry, no remote analytics.

---

## 5. Getting Started

### Prerequisites
- Node.js 20+ (Node 22 recommended)
- Chromium-based browser (Chrome, Edge, Brave 120+)

### Build & Run
```bash
# Install dependencies
npm install

# Run unit and integration tests (30/30 tests)
npm test

# Build extension distribution
npm run build

# Package extension zip (< 5MB)
npm run package
```

### Loading the Unpacked Extension in Chrome
1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right).
3. Click **Load unpacked** and select the `dist/` directory.
4. Pin Atentiv to your toolbar.
5. Click the extension action to toggle the in-page HUD or open the Side Panel (`sidepanel.html`).

---

## 6. Repository Structure

```
.
├── src/
│   ├── background/         # Service worker, event monitor, session manager, router
│   ├── content/            # In-page context extractor and glassmorphic HUD
│   ├── intelligence/       # Rule resolution, domain knowledge, ML classifier
│   ├── workstreams/        # Vector similarity, clustering, context switch evaluator
│   ├── analytics/          # Focus score engine, CSP calculations
│   ├── db/                 # Dexie.js schemas and repository interfaces
│   ├── dashboard/          # D3 workstream maps and decision trace modals
│   ├── main.tsx            # Main application controller
│   └── style.css           # Theme & glassmorphic HUD design system
├── public/
│   ├── manifest.json       # Manifest V3 configuration
│   ├── models/             # Runtime quantized fastText model (.ftz) and manifest
│   └── wasm/               # Runtime fastText WebAssembly binary (.wasm)
├── model/                  # Python ML training workspace (scripts, configs, artifacts)
├── models/                 # Dataset repository (Parquet and text train/valid/test splits)
├── docs/
│   ├── architecture/       # Architecture, forensics, traceability, open items
│   ├── workflows/          # Detailed specs for all 25 SRS workflows
│   ├── testing/            # Test plan, matrix, regression, and scenario validations
│   ├── user-guide/         # User guide, FAQ (29 Q&As), troubleshooting
│   ├── viva/               # Comprehensive viva prep guide & defense Q&A (37 Q&As)
│   └── diagrams/           # Mermaid class, DFD, sequence, and use case diagrams
├── legacy/                 # Quarantined historical prototypes (not imported)
└── tests/                  # Automated unit, integration, and worker test suite
```

---

## 7. Packaging & Synchronization Targets

- **Production Package:** `atentiv-v1.0.1.zip` (< 5MB) in repository root.
- **Sync Targets:**
  - Directory: `/Users/divya/Documents/Atentiv-Variation-3/`
  - Archive: `/Users/divya/Documents/Atentiv-Variation-3.zip`

---

## 8. Verification and Compliance

- **Mathematical Correctness:** Verified unit test suite covers CSP, $SW$, $CU$, $SP$, and Focus Score boundaries.
- **Privacy Standard:** Zero remote server dependencies; sensitive query parameters (`auth`, `token`, `password`) are scrubbed before storage; zero outbound requests verified.
- **Academic Baseline:** Traceable directly to SPIT CSE Academic Year 2026–27 SRS Revision 3.1.
