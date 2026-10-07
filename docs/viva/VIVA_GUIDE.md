# Atentiv — Comprehensive Viva Voce Guide
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0  
**Format:** For every core technical concept: What it is, Why it exists, Input, Processing, Output, and a Concrete Example.

---

## 1. System Architecture
- **What it is:** A decoupled, local-first browser extension architecture comprising a background Service Worker orchestrator, isolated Content Scripts, and three React UI presentation contexts (`sidepanel.html`, `dashboard.html`, `options.html`).
- **Why it exists:** To enable non-intrusive cognitive attention tracking without remote cloud dependencies, adhering strictly to Manifest V3 security boundaries.
- **Input:** Browser lifecycle events (`tabs.onActivated`, `webNavigation.onCommitted`, `idle.onStateChanged`).
- **Processing:** Asynchronous serial queue dispatches events through `SessionManager`, `WorkstreamEngine`, and `RuleEngine`.
- **Output:** Structured state persistence in IndexedDB and IPC updates to open extension pages.
- **Example:** User switches from GitHub to Reddit; architecture intercepts event, flushes active dwell to GitHub record, resolves category distance, updates CSP, and broadcasts updated score to Side Panel.

---

## 2. Manifest V3 (MV3)
- **What it is:** The modern Chrome Extension platform specification mandating declarative permissions, background service workers instead of persistent background pages, and strict Content Security Policies (`script-src 'self'`).
- **Why it exists:** Browser vendor requirement to enhance security, privacy, and memory footprint across the browser ecosystem.
- **Input:** `manifest.json` declaration file with scoped permissions (`tabs`, `storage`, `idle`, `alarms`, `sidePanel`).
- **Processing:** Browser isolates extension execution into an ephemeral background execution environment.
- **Output:** Extension runs safely without permission to execute arbitrary remote code or leak memory via persistent background pages.
- **Example:** Background operations suspend during idle periods and instantly rehydrate state from IndexedDB when `chrome.alarms` or tab events fire.

---

## 3. Background Service Worker
- **What it is:** The headless JavaScript event-driven worker running in the browser's extension runtime (`background.js`).
- **Why it exists:** Serves as the central state coordinator, persistence engine, and mathematical calculation core for Atentiv.
- **Input:** Browser tab, window, navigation, and idle events.
- **Processing:** Manages the active session timer, calculates dwell transitions, coordinates Workstream clustering, and persists records into Dexie.js.
- **Output:** Canonical session state and responses to UI message queries.
- **Example:** Tab activation event triggers `SessionManager.switchActiveTab(newTabId)`.

---

## 4. Content Script
- **What it is:** An isolated JavaScript script injected into supported web documents (`content.js`).
- **Why it exists:** Inspects DOM metadata (page title, headings, meta tags) and listens for audible media playback states that cannot be detected purely via toolbar APIs.
- **Input:** DOM tree of active HTTP/HTTPS webpage.
- **Processing:** Extracts sanitized text features, tokens, and media state; transmits payloads via `chrome.runtime.sendMessage`.
- **Output:** Lightweight feature packet `{ title, tokens, isAudible, hasMedia }`.
- **Example:** Extracts video title from YouTube page DOM to detect if "lecture" keyword is present.

---

## 5. Dexie.js
- **What it is:** A lightweight, promise-based wrapper library around the browser's native IndexedDB API.
- **Why it exists:** Replaces complex, verbose IDB callback boilerplate with clean, type-safe transactional queries and reactive live queries.
- **Input:** TypeScript schema definitions and data manipulation commands.
- **Processing:** Manages object stores, compound indices (`[domain+start_time]`), and ACID transactions.
- **Output:** High-throughput local storage operations with zero blocking of the browser UI thread.
- **Example:** `await db.sessions.where('workstream_id').equals(wsId).toArray()`.

---

## 6. IndexedDB
- **What it is:** The standard transactional NoSQL key-value and object store embedded in modern web browsers.
- **Why it exists:** Provides persistent, client-side, high-capacity local storage compliant with the Zero Data Egress privacy mandate.
- **Input:** Serialized JavaScript objects representing sessions, workstreams, rules, and snapshots.
- **Processing:** B-tree indexed storage isolated to the extension's origin sandbox (`chrome-extension://...`).
- **Output:** Durable offline persistence surviving browser restarts.
- **Example:** Retains 30 days of active browsing dwell records without communicating with any remote database.

---

## 7. FastText Model (Local Classifier)
- **What it is:** A compact, word-embedding and subword n-gram text classification model compiled for client-side evaluation.
- **Why it exists:** Categorizes page visits into semantic domains (Technology, Research, Social Media, Entertainment) completely offline without sending URLs to external APIs.
- **Input:** Sanitized URL tokens and page title strings.
- **Processing:** Generates character n-grams, computes vector dot products against class weight matrices, and applies softmax.
- **Output:** Predicted category and confidence score.
- **Example:** String "numpy array tutorial" is classified into "Technology" with 0.94 confidence.

---

## 8. WebAssembly (WASM)
- **What it is:** A high-performance, low-level binary instruction format running in web environments.
- **Why it exists:** Executes compute-heavy linear algebra (vector embeddings, dot products) at near-native speed without latency spikes.
- **Input:** Binary WASM bytecode and shared memory array buffers.
- **Processing:** SIMD-accelerated numerical matrix multiplications.
- **Output:** Fast inference results returned to the JavaScript runtime in < 5ms.
- **Example:** FastText WASM runtime classifies page tokens in 3.2 milliseconds.

---

## 9. Workstream
- **What it is:** An automatically detected semantic cluster of tabs and browsing sessions representing a unified user goal or project.
- **Why it exists:** Modern knowledge workers multitask across many open tabs; Workstreams structure this chaos into coherent task threads.
- **Input:** Document title tokens, sanitized domain paths, and temporal access sequences.
- **Processing:** Centroid cosine clustering with threshold 0.68, 20-minute temporal window, auto-merge at >3 tabs or similarity >0.85, and split after 15 min on unrelated topics.
- **Output:** Workstream record with unique ID, centroid vector, tab collection, and human-readable label.
- **Example:** A Google Search on "React hooks", an MDN documentation page, and a StackOverflow question are automatically grouped into Workstream "React Hooks Development".

---

## 10. Dwell Time
- **What it is:** The continuous duration that a user actively focuses on a single web document in the foreground window.
- **Why it exists:** Pure page-load count or tab open duration is misleading; dwell time accurately reflects real human visual cognitive engagement.
- **Input:** Timestamp of tab activation and subsequent deactivation or idle trigger.
- **Processing:** Clamped accumulation: $\Delta t = \min(t_{\text{exit}} - t_{\text{enter}}, T_{\text{idle}})$.
- **Output:** Integer dwell duration in seconds stored in session records.
- **Example:** User views research paper for 4 minutes with continuous scrolling -> Active Dwell = 240 seconds.

---

## 11. Inactivity & Sleep
- **What it is:** State detection mechanism monitoring user physical interaction (mouse, keyboard) and system sleep/suspend.
- **Why it exists:** Prevents idle or forgotten tabs from accumulating artificial productivity hours while the user is away.
- **Input:** Browser idle queries via `chrome.idle.queryState(inactivityThreshold)`.
- **Processing:** If state transitions to `idle` or `locked`, active dwell accumulation freezes; time elapsed is categorized as `idle_time`. Default threshold is 180s (configurable 1-10 min).
- **Output:** State transitions: `ACTIVE` -> `IDLE` -> `SUSPENDED`.
- **Example:** User walks away for lunch for 45 minutes; Atentiv records 180s active dwell and 42 minutes idle time.

---

## 12. Media Awareness (FR-03)
- **What it is:** Logic detecting active HTML5 video/audio playback in background tabs.
- **Why it exists:** Educational lectures and webinars are often listened to in the background while taking notes elsewhere.
- **Input:** Tab `audible` property and semantic category.
- **Processing:** If tab is audible AND category is Learning, Research, or Communication, dwell time continues accruing during background playback.
- **Output:** Dwell credit granted during background state.
- **Example:** User listens to an MIT OpenCourseWare lecture in Tab A while taking notes in Tab B; Tab A receives legitimate productive dwell credit.

---

## 13. Context Switch Penalty (CSP)
- **What it is:** A mathematical metric quantifying cognitive fragmentation caused by rapid or distant task switching.
- **Why it exists:** Frequent switching incurs high cognitive switching costs (attention residue) that impairs deep work.
- **Input:** Sequence of tab switch events, switch dwell durations, and category transitions.
- **Processing:** $CSP = \sum (SW \times CU)$.
- **Output:** Numerical penalty score reflecting cognitive disruption.
- **Example:** Rapid switch from IDE to Twitter ($SW = 1.5, CU = 4$) adds $6.0$ to CSP.

---

## 14. Switch Weight ($SW$)
- **What it is:** The temporal multiplier in the CSP formula reflecting switch velocity.
- **Why it exists:** Quick rapid switching is far more disruptive than switches after prolonged focus.
- **Input:** Active dwell duration on the departing tab ($t_{\text{dwell}}$).
- **Processing:** $SW = 1.5$ if $t_{\text{dwell}} \le 45\text{ seconds}$; $SW = 1.0$ if $t_{\text{dwell}} > 45\text{ seconds}$.
- **Output:** Multiplier scalar (1.0 or 1.5).
- **Example:** Departing tab after 20 seconds yields $SW = 1.5$.

---

## 15. Category Unrelatedness ($CU$)
- **What it is:** The semantic distance scalar in the CSP formula.
- **Why it exists:** Switching between related tools is low cost; jumping to an unrelated domain is high cost.
- **Input:** Source and target category / workstream IDs.
- **Processing:**
  - $CU = 0$: Same workstream or same tab.
  - $CU = 1$: Same category.
  - $CU = 2$: Related categories (e.g., Technology and Research).
  - $CU = 4$: Unrelated categories (e.g., Coding and Social Media).
- **Output:** Integer distance $\in \{0, 1, 2, 4\}$.
- **Example:** From Docs to ArXiv gives $CU = 1$; from Docs to Netflix gives $CU = 4$.

---

## 16. Focus Score ($F$)
- **What it is:** A normalized integer score from 0 to 100 representing cognitive performance and session stability.
- **Why it exists:** Provides users with a single, intuitive feedback metric to monitor their daily flow state.
- **Input:** Productive Ratio ($PR$), Stability Ratio ($SR$), and Context Switch Count ($N$).
- **Processing:** $F = \operatorname{round}(100(0.65PR + 0.35SR)) - SP$, where $SP = \min(40, N \times 2)$. If tracked time $T = 0$, $F$ is null (`—`).
- **Output:** Integer $0 \le F \le 100$ or null.
- **Example:** High productive ratio (0.85), high stability (0.90), 2 switches ($SP = 4$) yields $F = \operatorname{round}(100(0.5525 + 0.315)) - 4 = 87 - 4 = 83$.

---

## 17. Productive Ratio ($PR$)
- **What it is:** The proportion of active time spent on productive activities.
- **Why it exists:** Core component of cognitive score. Note: Official formula is marked `[To Be Specified]` in SRS Revision 3.1.
- **Input:** Sum of productive, neutral, and distracting dwell times.
- **Processing:** Provisional formula: $PR = \frac{T_{\text{prod}}}{T_{\text{prod}} + T_{\text{neutral}} + T_{\text{distract}}}$.
- **Output:** Decimal ratio $0.0 \le PR \le 1.0$.
- **Example:** 60 minutes productive out of 75 minutes total tracked yields $PR = 0.80$.

---

## 18. Stability Ratio ($SR$)
- **What it is:** A measure of attention retention and absence of erratic context switching.
- **Why it exists:** Captures flow state depth. Note: Official formula is marked `[To Be Specified]` in SRS Revision 3.1.
- **Input:** Context Switch Penalty ($CSP$) or switch frequency.
- **Processing:** Provisional formula: $SR = 1.0 - \min(1.0, \frac{CSP}{100})$.
- **Output:** Decimal ratio $0.0 \le SR \le 1.0$.
- **Example:** Moderate switching with $CSP = 20$ yields $SR = 0.80$.

---

## 19. Snapshots & Restore
- **What it is:** Complete serializations of an active Workstream's tab state.
- **Why it exists:** Allows users to offload mental context, close tab clutter, and resume complex multi-tab research tasks in one click.
- **Input:** Active window tabs matching a Workstream ID.
- **Processing:** Serializes URLs, titles, pin states, active tab ID, and timestamp into `snapshots` store.
- **Output:** Persistent snapshot record; restore opens exact tabs in a new browser window.
- **Example:** Saving "Tax Research" snapshot saves 6 tabs; clicking Quick Resume restores all 6 tabs with active tab focused.

---

## 20. Local-First Privacy & Zero Egress
- **What it is:** Architecture guaranteeing that zero browsing telemetry leaves the client machine.
- **Why it exists:** Browsing histories contain sensitive PII, medical queries, and proprietary code. Cloud transmission presents massive security liabilities.
- **Input:** Raw browsing activity.
- **Processing:** Local fastText inference, local Dexie.js persistence, sanitized parameter scrubbing. Zero outbound network sockets.
- **Output:** Complete analytics delivered with 100% data sovereignty.
- **Example:** Network DevTools displays zero network requests originating from extension ID.
