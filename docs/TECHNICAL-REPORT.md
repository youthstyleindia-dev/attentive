# Cognitive Stream: Detailed Technical Stack and Architecture Report

**Project:** Browser attention and workstream management extension  
**Release:** Prototype 0.1.0  
**Prepared:** September 23, 2026  
**Audience:** Project teammates, supervisors, reviewers, and future maintainers  
**Basis:** Inspection of the implemented source code, dependency lockfile, manifest, and recorded tests. Proposed improvements are identified separately from implemented features.

## 1. Executive explanation

Cognitive Stream is a browser extension that records approximate foreground browsing time, assigns pages to workstreams, displays behavioral analytics, and saves groups of tabs with notes so users can resume work.

The application runs locally in the browser. It has a frontend and a background processing layer, but no deployed web server. There is no Express server, Python backend, REST API, cloud database, authentication service, or AI inference service in the current implementation.

The frontend is React with TypeScript. The background layer is a TypeScript program compiled to JavaScript and run as a Chrome Manifest V3 extension service worker. Storage uses Chrome's extension storage APIs. Browser events supply the activity signals. A deterministic rule engine assigns workstreams, and arithmetic formulas produce the dashboard metrics.

Node.js, npm, Vite, esbuild, TypeScript, and test tools are development dependencies. An end user loading the already-built extension does not need Node.js or an npm server running.

A precise project description is:

> Cognitive Stream is a local-first browser extension prototype built with React, TypeScript, and Chrome Manifest V3. It uses browser events and Chrome storage to provide rule-based workstream grouping, transparent behavioral analytics, and saved task contexts.

## 2. Full stack at a glance

Versions below are the installed versions inspected in this project, not claims about the latest available releases. package.json specifies compatible ranges; package-lock.json pins the resolved dependency tree.

| Layer | Implemented technology | Installed version or configuration | Responsibility |
|---|---|---|---|
| User interface | React | 19.3.0 | Render views, forms, metrics, tables, and dialogs |
| Browser UI rendering | React DOM | 19.3.0 | Mount React into the HTML document |
| Programming language | TypeScript | 5.9.3 | Typed application and background code |
| Page structure | HTML5 and TSX | index.html + main.tsx | Root document and declarative interface markup |
| Styling | Plain CSS | Custom stylesheet | Responsive layout, typography, colors and charts |
| Icons | Lucide React | 0.468.0 | Locally bundled SVG icons |
| Extension architecture | Chrome Manifest V3 | Minimum Chrome 120 | Permissions, worker registration and entry points |
| Background processing | Extension service worker | ES module | Event handling, collection, grouping and persistence |
| Durable storage | chrome.storage.local | Key: state | Visits, workstreams, snapshots and preferences |
| Temporary tracking state | chrome.storage.session | Key: active | Live interval checkpoint |
| Internal communication | chrome.runtime messaging | Request/response messages | UI-to-worker operations |
| Activity input | Tabs, windows and idle APIs | Browser-provided | Active page and eligibility signals |
| Periodic checkpoint | chrome.alarms | 0.5-minute period | Approximately 30-second reconciliation |
| Frontend tooling | Vite | 6.4.3 | Development preview and frontend production bundle |
| Worker bundling | esbuild | 0.25.12 | Bundle background.ts into background.js |
| Package tooling | Node.js + npm | Built in Node 24.16.0 / npm 11.13.0 environment | Install dependencies and execute scripts |
| Type declarations | @types/chrome, @types/react, @types/react-dom, @types/node | See lockfile | Editor assistance and compile-time API types |
| Unit/integration tests | Node test runner + tsx | tsx 4.23.15 | Execute TypeScript test files |
| Browser automation | Playwright | 1.63.0 | Load the real extension in isolated Chromium |
| Formatting | Prettier | 3.9.8 | Consistent source formatting |

Not used: Next.js, Redux, React Router, Tailwind, Bootstrap, Chart.js, MongoDB, PostgreSQL, Firebase, Supabase, Flask, FastAPI, Express, TensorFlow, ONNX, vector databases, or an LLM API.

## 3. Architecture and execution environments

```text
USER'S CHROMIUM BROWSER
│
├── Browser events
│   ├── Active tab changed / active page updated
│   ├── Tab removed / browser focus changed
│   ├── Idle state changed
│   └── Periodic alarm
│              │
│              ▼
├── Manifest V3 service worker — background.ts
│   ├── Serialize incoming operations
│   ├── Checkpoint the previous activity interval
│   ├── Check tracking, focus, idle state and exclusions
│   ├── Sanitize URL and classify current page
│   ├── Handle settings and saved contexts
│   └── Write local/session storage
│              ▲                    │
│       runtime messages            │ storage change events
│              │                    ▼
├── React extension dashboard — main.tsx
│   ├── Overview and calculated metrics
│   ├── Workstream rule editor
│   ├── Context save / resume
│   └── Privacy settings and JSON export
│
└── Extension storage
    ├── local.state: durable project data
    └── session.active: current tracking checkpoint
```

Three environments must be distinguished:

1. **Development environment:** Node.js executes npm scripts, Vite, the compiler, and tests on the developer's machine.
2. **Extension runtime:** Chrome executes the packaged React page and extension worker. This is where actual tab tracking operates.
3. **Website preview:** Vite serves the dashboard at localhost. It uses sample data because a normal webpage does not have this extension's privileged runtime.

The localhost preview is a convenience for UI development. It is not the application's backend and does not receive browsing telemetry.

## 4. Frontend in detail

### 4.1 React and React DOM

React describes the interface as a function of current state. React DOM mounts the App component into the root element in index.html. When application state changes, React updates the rendered interface. React's state and event model provides the basic interaction mechanism; see the [official React introduction](https://react.dev/learn).

The current UI is mostly implemented in a single App component. This keeps a small prototype straightforward, but it should eventually be split into views, reusable components, and hooks for easier team development.

### 4.2 State management

The implementation uses useState rather than a global state library. Different state variables represent:

- The latest persisted application state received from the worker.
- The selected view and date range.
- Whether the UI is displaying demo data.
- Open dialog, error message, and status notice.
- Temporary form values for workspace names, notes, rules, exclusions and focus goals.
- The current time used to update the focus countdown.

useEffect establishes a storage-change listener in live mode and removes it when the mode changes or the component unmounts. Another effect updates the displayed clock every second. That UI timer is not the background tracking clock.

A page state variable selects the view. There is no React Router and no server-side routing. Navigation does not load a separate backend page.

### 4.3 Interface views

| View | What users see | Main operations |
|---|---|---|
| Overview | Focus score, active time, switches, penalty, distribution chart, recent trail | Select Today or Last 7 days, start/end focus intention, export |
| Workstreams | Existing groups and their matching rules | Edit names, domains and keywords |
| Context resume | Saved workspace cards, notes and tab summaries | Save current-window tabs, restore, delete snapshot |
| Settings | Tracking and privacy controls | Enable/pause, edit exclusions, export, delete activity |

The activity table displays up to the latest 30 matching segments. The underlying retained dataset can be larger. The interface currently edits the preset workstreams; it does not offer full create/delete/reorder management for arbitrary groups.

### 4.4 TypeScript and TSX

TypeScript adds compile-time checks to JavaScript. For example, a Visit must have timestamps, a URL, a stream ID and a transition flag. TSX lets React markup and TypeScript expressions appear in the same source file.

TypeScript is not a runtime validator. Invalid stored data or malformed messages can still reach code unless explicit validation is added. This distinction matters because the prototype currently trusts its own UI messages more than a production application should.

### 4.5 CSS and chart rendering

The layout uses plain CSS: Grid for metric cards and columns, Flexbox for controls and rows, and media queries for narrow screens. Colors, spacing, modal overlays and typography are custom styles.

The time-distribution chart is a CSS conic gradient. Each stream receives an angular share proportional to its duration, and a white circular center creates the donut appearance. There is no charting dependency, chart canvas, or graph-analysis engine.

Lucide supplies icons as React-rendered SVG. Icons are packaged locally instead of downloaded at runtime. The application uses a system font stack.

### 4.6 Demo mode

Outside an installed extension, the app defaults to demo mode. Inside the extension, users can explicitly enter or leave demo mode. demoState() generates an illustrative activity dataset and a saved context.

Demo data is kept in the UI and does not replace live storage. Mutation actions are disabled in the demo; export produces a JSON file marked as demo. Entering demo mode does not itself disable live tracking if the user previously enabled it.

## 5. Background layer: the extension's backend equivalent

### 5.1 What it is

background.ts contains the local processing layer. It listens for browser events, checks what is eligible to record, updates stored intervals, and processes requests from the dashboard.

Calling this the “backend” is acceptable for explaining the separation of responsibilities, provided the team says **extension background service worker**, not Node.js server. It runs in Chrome, not on a cloud machine, and has no HTTP endpoints.

### 5.2 Worker lifecycle

Chrome extension workers are event-driven and may be terminated when inactive. They should not rely on ordinary in-memory variables for durable application state. The prototype therefore stores the current interval checkpoint in session storage and the accumulated records in local storage. See [Chrome's service-worker lifecycle documentation](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle).

The worker's queue variable exists only during a worker instance. Persisted data survives normal worker suspension. The implementation does not provide database transactions or a durable operation queue.

### 5.3 Events handled

| Event | Reason for handling it |
|---|---|
| action.onClicked | Open the extension dashboard in a tab |
| runtime.onInstalled | Initialize state if absent and create the periodic alarm |
| runtime.onStartup | Clear stale active tracking state and recreate the alarm |
| alarms.onAlarm | Checkpoint activity periodically |
| tabs.onActivated | Reconcile after a tab switch |
| tabs.onUpdated | Reconcile relevant active-page URL changes or completed loading |
| tabs.onRemoved | Recheck the active browser context |
| windows.onFocusChanged | Stop/start eligibility as browser focus changes |
| idle.onStateChanged | Recheck activity when idle state changes |
| runtime.onMessage | Process dashboard requests |

### 5.4 Reconciliation sequence

The central reconcile() function performs these steps:

1. Read the persisted State and previous Active checkpoint.
2. Determine an end timestamp for the previous interval, capped at one minute after its last checkpoint.
3. Update its existing Visit record or insert a new record.
4. Prune visits outside the retention policy.
5. Check that tracking is enabled and the idle query reports active.
6. Check that the last-focused browser window is actually focused.
7. Obtain its active tab; reject incognito and unsupported URLs.
8. Reject excluded domains.
9. Classify the remaining page using the current rules.
10. Continue the old interval if tab, sanitized URL, stream and checkpoint continuity match; otherwise create a new interval.
11. Write State to local storage and Active to session storage.

This measures approximate foreground browser activity, not reading comprehension or attention. Someone can look away while the browser remains active. Idle detection may also count an initial period without interaction before the threshold is reached; it does not establish the precise instant cognitive engagement stopped.

### 5.5 Serialization and error handling

Browser events can arrive close together. The Promise queue chains operations so two handlers in the same worker do not both modify state from conflicting reads. Each operation finishes before the next queued operation begins.

This reduces lost updates, but it is not transactional storage. Local-state and session-checkpoint writes are separate operations. A crash or storage failure between them is not protected by an atomic transaction.

Message handlers return either a state response or a string error. UI errors are displayed to the user; non-message queue failures are logged. The code returns true from the message listener so it can reply asynchronously.

## 6. Chrome APIs and permissions

| API / permission | Actual use | Boundary |
|---|---|---|
| tabs | Read tab metadata, find the active tab, collect workspace tabs, reopen URLs | Does not read DOM text or form values |
| storage | Read/write settings, visits, snapshots and checkpoint | Local extension data, not a hosted database |
| idle | Query idle status with a 60-second threshold and respond to state changes | Device interaction proxy, not eye tracking |
| alarms | Periodic reconciliation every approximately 30 seconds | Browser scheduling is not exact real-time timing |
| windows | Inspect focus and react to focus changes | No separate windows permission listed in the manifest |
| runtime | Extension messaging, lifecycle and resource URLs | Internal message protocol, not a public REST API |
| action | Open the dashboard from the toolbar icon | No popup UI is defined |

The tabs permission exposes sensitive tab metadata such as URL and title; it is not needed merely to create tabs. This implementation requests it because classification and snapshots depend on metadata. See the [official Tabs API reference](https://developer.chrome.com/docs/extensions/reference/api/tabs).

No history, scripting, notifications, downloads, or broad host_permissions entry is declared. There are no content scripts. Incognito is explicitly set to not_allowed. The manifest's script policy restricts extension scripts to packaged resources.

Opening the toolbar icon creates a dashboard tab. The same page is registered as the extension options page. The minimum Chrome version in the manifest is 120; Edge uses compatible Chromium APIs, but a separate Edge validation was not recorded.

## 7. Storage and data model

### 7.1 Why Chrome storage

Chrome storage is an asynchronous extension-specific key-value API. It is available to extension contexts and can emit change events. local persists application data; session keeps in-memory extension-session data and is cleared on events such as browser restart or extension reload. See the [official storage documentation](https://developer.chrome.com/docs/extensions/reference/api/storage).

The code uses neither window.localStorage nor a relational database. It does not use chrome.storage.sync, so the app does not intentionally synchronize its records between devices.

### 7.2 State record

The object under local key state contains:

| Field | Type | Meaning |
|---|---|---|
| enabled | boolean | Whether collection is enabled |
| streams | Stream[] | Classification rules and presentation metadata |
| visits | Visit[] | Recorded activity segments |
| snapshots | Snapshot[] | Saved workspace contexts |
| excluded | string | Comma-separated excluded domains |
| goal | string | Current focus intention |
| goalEnd | number | Focus-session deadline in epoch milliseconds |
| goalStream | string | Target workstream ID |

### 7.3 Entity fields

**Stream:** id identifies the group; name and color drive presentation; domains and keywords contain comma-separated rule values. Streams are linked to visits by the stream ID.

**Visit:** id is a UUID for the interval; tabId records the browser tab; title and url identify the page; stream stores its assigned group; start and end define the time interval; switched records whether the interval began with a qualifying cross-stream transition. A Visit is a segment, not necessarily a unique webpage or a single navigation event.

**Snapshot:** id, name, note, created timestamp, and a list of title/URL entries. It is a collection of reopenable addresses, not a serialized browser session.

**Active:** temporary id, tabId, url, title, stream, since, checkpoint and switched. since is the segment's start; checkpoint is the latest successful observation. The same id lets reconciliation update a Visit instead of creating duplicate records for every alarm.

### 7.4 Retention and capacity

Visits older than the 30-day cutoff are removed during reconciliation, and only the last 5,000 remain. Retention is enforced when the worker processes activity, not by an independent secure-erasure service. Records crossing the cutoff can be retained as segments, while reporting clips durations to the selected time window.

There are at most 30 snapshots and at most 30 saved tabs per snapshot. Saving more snapshots drops the oldest from the array. Snapshots do not expire by age.

Chrome storage.local has a documented default size limit; the project does not request unlimitedStorage. Record-count limits reduce growth but do not guarantee fitting within a byte quota if titles, URLs or notes are unusually large. The current implementation rewrites the full State object, which is simple but increasingly expensive as data grows.

## 8. Workstream classification algorithm

Classification is deterministic, local, and rule-based. It is not a trained ML model.

For each stream:

```text
stream score = 5 × number of matching domain rules
             + 1 × number of matching keyword rules
```

Domains match the exact hostname or a subdomain. A rule for github.com matches github.com and docs.github.com, but not fakegithub.com. Users should enter domains rather than full URLs.

Keywords are lowercased, split on commas, and matched as substrings against hostname plus page title. Page body text, URL path semantics, and DOM metadata are not analyzed. A keyword can match inside a larger word. Duplicate or overlapping rules can contribute multiple points.

The stream with the greatest positive score wins. Ties keep the earlier stream in the array. No positive score means Unsorted. A domain contributes a strong weight but is not an absolute override: enough keyword matches in another stream can exceed it.

Example: a GitHub page with “research” in its title might score 5 for the development domain rule and 1 for a research keyword. It will normally enter development, subject to any additional matches.

Rules apply when activity is classified. Existing recorded labels are not retrospectively rewritten, although reconciliation may start a newly classified segment. This preserves historical assignments but means edits do not recalculate past analytics.

## 9. Metrics and formulas

### 9.1 Reporting windows

Today begins at local midnight. Last 7 days is a rolling seven-day interval ending now, not seven complete calendar dates.

For every overlapping visit:

```text
included duration = max(0, min(visit.end, range.end)
                           - max(visit.start, range.start))
```

Durations are accumulated by stream and summed into total active browser time. Time outside the range does not inflate the total.

### 9.2 Context switches

A switch is recorded when a new eligible interval changes stream relative to the previous active checkpoint and the checkpoint gap is at most 60 seconds. A new tab in the same stream does not count. Starting from no active checkpoint does not count.

Idle periods, excluded/internal pages, browser focus loss, and some state mutations can reset continuity. In particular, non-read UI requests clear the active checkpoint as part of mutation handling. The resulting metric should therefore be described as recorded workstream transitions, not a complete cognitive task-switch count.

A switch is attributed to the new interval's start. It is counted in a report only when that start is within the selected range.

### 9.3 Switch penalty

```text
penalty = min(40, 2 × recorded switches)
```

The penalty is a score deduction in points. It is not lost time, a monetary cost, or an experimentally measured recovery delay. The coefficient 2 and cap 40 are prototype design choices.

### 9.4 Focus Score

```text
target time = time in the selected goal stream, if a focus session is active
              otherwise time in the largest-duration stream

focus score = round(max(0, 100 × target time / total time - penalty))
```

With no recorded active time, the score is null and displayed as a dash.

Example: 60 minutes of total activity, 45 minutes in the dominant stream, and 4 switches gives a share of 75%, a penalty of 8, and a Focus Score of 67.

If an active goal targets a stream with only 15 of those minutes, the same calculation becomes 25 − 8 = 17. Selecting a goal changes the target used for the whole displayed range; it does not isolate only the minutes since the timer started.

When the timer expires, the dashboard returns to dominant-stream scoring. There is no separately stored per-session score history. Unsorted can also be the dominant stream. A high score can therefore reflect concentration in one category without showing that the activity was productive or aligned with the user's goals.

### 9.5 Timing limitations

Alarms request roughly 30-second checkpoints. When a long gap occurs, the old interval ends no later than its last checkpoint plus 60 seconds, limiting overcount after sleep or suspension. This is a heuristic and can still overcount or undercount.

The browser being focused and the system being active do not prove the person is attending to the page. The implementation does not measure gaze, comprehension, mental fatigue, emotions, or distraction intent.

## 10. Focus sessions and Context Resume

A focus session saves an intention, target stream and deadline. The UI calculates remaining time from the stored deadline, so it does not depend on a permanently running second-by-second worker timer. Available presets are 15, 25, 45 and 60 minutes. Sessions can be ended early.

The feature does not block websites, send completion notifications, or persist a separate session history. Its primary purpose is intention-setting and temporary selection of the score target.

Saving a workspace queries tabs in the current window, rejects incognito and non-HTTP(S) pages, applies exclusions, sanitizes URLs, and saves up to 30 entries with a user note.

Restoring a snapshot creates background tabs for its saved addresses. It does not restore scroll position, page form state, cookies, login sessions, tab groups, navigation history or the original window arrangement. Repeated restore actions can create duplicate tabs. Partial failure is not rolled back.

Since saved URLs have queries and fragments removed, a search-results page or query-driven application may not reopen its exact original state. This is an explicit privacy-versus-fidelity tradeoff.

## 11. Internal request protocol

These are extension messages, not HTTP routes:

| Message type | Input | Effect |
|---|---|---|
| read | type | Reconcile and return the latest state |
| settings | enabled, excluded | Update collection preference and exclusions |
| streams | streams | Replace workstream rule array |
| goal | goal, stream, end | Save or end focus intention |
| save | name, note | Capture eligible current-window tabs |
| deleteSnapshot | id | Remove one saved context |
| restore | id | Open snapshot URLs in background tabs |
| clear | type | Clear visits/snapshots, disable tracking and reset goal text/deadline |

The UI sends chrome.runtime.sendMessage and receives a state object or error. It also listens for storage changes so background updates can refresh the view.

A representative flow is: click Enable tracking → send settings message → worker finalizes current interval → updates enabled → clears stale Active → stores state → reconciles again → replies → React renders the new status.

The clear operation retains workstream rules and exclusion preferences. It does not erase exported JSON files from disk. Export is handled directly in the UI using a Blob, an object URL and a download link; no downloads permission is needed for this implementation. Import is not implemented.

## 12. Privacy, security and their limits

Implemented protections include default-off tracking, pause, domain exclusions, disabled incognito, removal of query/fragment/credential URL fields, local storage, packaged scripts, and no page-content collection.

The extension has no implemented cloud uploads or telemetry endpoints. This does not mean every action is offline: resuming a saved tab causes the browser to visit that website normally. Installing development packages also requires network access unless dependencies are already cached.

Stored titles and URL paths may contain sensitive information. Local storage is not an application-level encrypted vault. Device compromise, access to the browser profile, or an exported file can expose records. Export files contain the selected dataset and should be handled accordingly.

Exclusion changes affect future collection and future workspace saves. They do not automatically remove old visits or old snapshots. Restoring an already saved context is not filtered again against the current exclusion list.

React displays titles and notes as text rather than injecting raw HTML. Runtime message schemas, field-length validation, storage migrations and defensive handling of corrupted state remain areas for improvement. There are no content scripts or externally connectable entries, but internal messages are still worth validating.

## 13. Build and deployment

The build command runs three sequential stages:

```text
tsc --noEmit
    Check application/test TypeScript; do not output JS.

vite build
    Bundle the React dashboard and stylesheet into dist.
    Copy the public manifest into the output.

esbuild src/background.ts --bundle --format=esm --outfile=dist/background.js
    Produce the independent extension-worker bundle.
```

TypeScript is configured with strict checking, ES2022 targeting, ESNext modules, bundler resolution and the React JSX transform. Type declaration packages provide compile-time knowledge of browser, React and Node APIs; they are not runtime services.

The resulting dist folder contains the manifest, dashboard HTML, frontend assets and worker script. Chrome executes those packaged files. No production hosting URL is required.

Development workflow:

```sh
npm ci
npm run dev
```

The preview supports interface work on sample data. For live tracking:

```sh
npm run build
```

Then load dist through chrome://extensions → Developer mode → Load unpacked. After changing source code, rebuild and reload the extension. Reload existing dashboard pages as needed so they use the latest assets.

The project is distributed as source plus an unpacked build. No store submission, automatic update service, code-signing distribution process, deployment pipeline or CI configuration has been implemented.

## 14. Testing and recorded evidence

| Check | Evidence in this project | Limit |
|---|---|---|
| Static checking / build | TypeScript and production build passed | Does not prove behavioral correctness |
| Model tests | Sanitization, exclusion boundaries, classification, interval clipping, empty score and penalty bounds | Selected deterministic examples |
| Worker integration test | Mocked opt-in, activity transition, idle gap, save, restore, delete | Browser APIs are simulated in this test |
| Real browser test | MV3 extension loaded in isolated Chromium; foreground activity, demo, rules dialog, tracking toggle, sanitized snapshot, goal and deletion checked | Scripted workflow, not a long field study |
| Responsive check | 390px viewport did not overflow horizontally | Not a comprehensive accessibility audit |
| UI review | Desktop dashboard screenshot inspected | Not a usability study |

Six Node-based tests passed during implementation. The real-browser script also passed without page errors in the checked workflow. These are previously recorded results, not a new test run performed solely for this report.

Reproduce using npm test, then npm run build, npx playwright install chromium, and npm run test:browser. The browser test uses an isolated temporary profile, serves its test webpage through request interception, and removes the profile afterward.

Not established: scientific validity of the score, user productivity gains, long-term reliability, maximum-capacity performance, full keyboard/screen-reader accessibility, every sleep/wake scenario, or Edge-specific behavior.

## 15. Source-code map

Paths here are relative to the project root inside the downloadable project.

| File | Purpose | Suggested team owner |
|---|---|---|
| src/main.tsx | React dashboard, forms, messaging, calculated views and export | Frontend |
| src/style.css | Layout, styles and responsive behavior | Frontend / design |
| src/background.ts | Browser event processing, storage mutations and saved contexts | Extension / background |
| src/model.ts | Shared types, initial state, sanitization, grouping, metrics and demo data | Algorithms / data |
| public/manifest.json | Extension configuration and permissions | Extension / release |
| index.html | Dashboard root document | Frontend |
| package.json | Dependencies and developer commands | Tooling / release |
| package-lock.json | Exact dependency resolution | Shared, reviewed with upgrades |
| tsconfig.json | Type-checking configuration | Tooling |
| tests/model.test.ts | Pure-function tests | Algorithms / QA |
| tests/worker.test.ts | Mocked worker integration test | Background / QA |
| tests/browser.mjs | Actual Chromium extension workflow | QA |
| dist/ | Generated installable extension | Build output; edit source instead |
| docs/PROJECT.md | Project framing, scope and reference register | Research / documentation |
| docs/TESTING.md | Validation record | QA |

These owners are suggested responsibilities, not assigned people. Agree on message contracts and shared types before several teammates change the frontend and worker simultaneously.

## 16. Why this stack fits the prototype

React makes a multi-view interactive dashboard manageable. TypeScript lets the frontend, model and worker share data definitions. Manifest V3 supplies browser integration without an external agent. Chrome storage avoids operating a database for a small local dataset. Vite and esbuild provide a short development/build workflow. Rule-based grouping is explainable, inexpensive and easy to demonstrate.

The tradeoffs are deliberate: browser-specific APIs, approximate timing, limited context restoration, rules instead of semantic understanding, and simple storage instead of a queryable database. These are appropriate constraints for an academic prototype, but they should not be presented as proof of a production-ready attention-analysis system.

## 17. Improvements in priority order

**Near-term engineering:** split the large App component; define a typed message union; validate messages and stored data at runtime; enforce length and byte limits; add storage schema versions; show clearer operation-specific success/failure states; test more lifecycle and multi-window cases; improve dialog focus management and accessibility.

**Data and reporting:** consider IndexedDB if visits grow substantially; add session-specific records and metrics; make score coefficients configurable; allow explicit corrections to workstream labels; add deliberate snapshot URL-fidelity options; deduplicate restored tabs; expand data export and add validated import.

**Research:** run a consented usability evaluation; compare rule labels with participant labels; assess resumption time with and without notes; examine whether the score is understandable and useful. Predictive or cognitive claims require separate evidence.

**Optional advanced features:** local embeddings, ONNX/WebAssembly inference, semantic topic grouping, continuation prediction, richer task trails, or cloud synchronization. None is part of this version. Each would introduce new evaluation, performance, permission or privacy requirements.

Do not add a remote backend merely to make the stack sound larger. A backend becomes useful only if requirements change to include accounts, shared workspaces, cross-device synchronization or centrally managed analytics.

## 18. Questions teammates may be asked

**What is the backend?** A local Manifest V3 extension service worker written in TypeScript and bundled to JavaScript. There is no hosted application server.

**Where is the database?** Chrome extension storage on the user's device. It is a key-value store, not SQL or MongoDB.

**Is Node.js running while the extension is used?** No. Node.js is for development, builds and tests.

**Is this AI?** The current implementation is rule-based. It has no trained model, embeddings, LLM or model inference.

**Does it read all webpage content?** No. It uses tab title/URL metadata and browser state, without content scripts or DOM extraction.

**Is the Focus Score scientifically validated?** No. Its transparent formula summarizes recorded workstream concentration and transitions. It does not directly measure attention.

**Can the extension work without internet?** Its local logic and dashboard can operate without a backend connection; websites opened or resumed may require internet.

**Why does localhost show only sample data?** An ordinary webpage does not have the installed extension's privileged browser APIs.

**Does it recover a complete session?** No. It reopens saved sanitized URLs and displays the user's note.

**What did testing prove?** The checked code paths, build and browser workflow worked in the test environment. Testing did not prove productivity benefits or exhaustive reliability.

## 19. Technical sources and scope of evidence

The implementation explanations in this report come primarily from the project's actual source and lockfile. Official documentation was consulted for platform behavior:

- [React: Quick Start](https://react.dev/learn)
- [Chrome extension service worker lifecycle](https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/lifecycle)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Chrome Tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs)

The supplied research-paper register is in PROJECT.md. Its paper-specific claims and bibliographic metadata have not been independently verified as part of this technical report. Research inspiration, implemented behavior, and demonstrated evaluation results should remain clearly separated in the team's presentation.
