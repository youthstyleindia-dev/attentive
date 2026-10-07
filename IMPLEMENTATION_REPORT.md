# IMPLEMENTATION_REPORT.md — Atentiv Production HUD

## 1. Root Cause of the Old New Tab Behavior

**Two bugs in `src/background/serviceWorker.ts`:**

```
// BUG 1: This made EVERY toolbar click open the Side Panel (index.html)
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

// BUG 2: This opened Atentiv as a new tab
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("index.html") });
});
```

## 2. How It Was Removed

Both lines eliminated. Replaced with:

```typescript
chrome.action.onClicked.addListener(async (_tab) => {
  // 1. Query active tab
  // 2. On restricted pages → graceful fallback to sidePanel.open()
  // 3. On normal pages → inject content.js → send TOGGLE_ATENTIV_HUD
});
```

Permissions added to manifest.json: `activeTab`, `scripting` (for `executeScript`).

## 3. Compact HUD Architecture

**State:** `mode = "compact"`

**Visual:**
- Fixed position, `right: 16px; top: 16px`
- Width: 380px, max-height: calc(100vh - 32px)
- `backdrop-filter: blur(var(--at-blur))` — real frosted glass
- Background: `rgba(8,8,22,var(--at-bg-alpha))` — highly transparent by default
- Animation: `slideInRight` 0.22s cubic-bezier

**Sections:**
| Section | Data Source |
|---|---|
| Current Tab | `GET_HUD_STATE → currentTab` + `document.title` + `location.hostname` |
| Focus Ring | `GET_HUD_STATE → todayMetrics.score` |
| Session Timer | Timestamp-based (`Date.now() - sessionStartMs`) |
| Recent Tabs | `GET_HUD_STATE → recentTabs` (IndexedDB sessions) |

## 4. Full HUD Architecture

**State:** `mode = "full"`

**Visual:**
- Centered overlay, `min(1380px, 100vw-24px)` × `min(860px, 100vh-24px)`
- Three-column grid: `220px 1fr 290px`
- Same glass CSS variables as compact

**Left column:**
- 9-item text navigation
- Tracking status + session timer + focus ring
- Pause / Open Dashboard

**Center column (scrollable):**
- Current Activity card
- Today at a Glance (4-cell grid)
- Workstreams list
- Recent Activity list

**Right column:**
- Open Tabs (from `chrome.tabs.query()`, live)
- Group By selector (Workstream/Productivity/None)
- Tab Groups derived from workstream↔domain matching
- Quick Actions (Snapshot, Focus, Pause, Dashboard)

## 5. Settings Architecture

**State:** `settingsOpen = true` (overlaid on current mode)

**Visual:**
- `min(820px, 100vw-48px)` × `min(580px, 100vh-80px)` glass sheet
- `backdrop-filter: blur(48px)`, `rgba(10,10,30,0.78)`
- Left nav (9 sections) + right content area

**Live controls:**
- `HUD Transparency` slider → updates `--at-bg` CSS variable instantly
- `Blur Intensity` slider → updates `--at-blur` CSS variable instantly
- Both persist via `chrome.storage.local` (`atentiv_hud_prefs`)

**Sections:** General, Tracking, Privacy, Rules, Workstreams, Appearance, Shortcuts, Data, About

## 6. Data Source for Each UI Section

| Section | Source |
|---|---|
| Current Activity | `GET_HUD_STATE` → `SessionManager.getActiveCheckpoint()` |
| Dwell Timer | `Date.now() - dwellStart` (display only, timestamp-anchored) |
| Focus Score | `MetricsRepository.getTodaySummary()` → `focusScore` |
| Today Metrics | `MetricsRepository.getTodaySummary()` |
| Workstreams | `WorkstreamRepository.listActive(10)` |
| Recent Activity | `db.tab_sessions.orderBy("start_time").reverse().limit(8)` |
| Open Tabs | `chrome.tabs.query({})` (real-time) |
| Tab Groups | Derived from Workstream↔domain matching |
| Tracking Status | `chrome.storage.local.atentiv_settings.enabled` |
| Settings Prefs | `chrome.storage.local.atentiv_hud_prefs` |

## 7. Browser APIs Used

- `chrome.action.onClicked` — toolbar click
- `chrome.scripting.executeScript` — inject content script
- `chrome.tabs.sendMessage` — TOGGLE_ATENTIV_HUD
- `chrome.tabs.query` — open tabs list
- `chrome.tabs.update` — activate tab on click
- `chrome.runtime.sendMessage` — GET_HUD_STATE, TOGGLE_RECORDING, SAVE_WORKSPACE, OPEN_SIDEPANEL
- `chrome.storage.local` — settings persistence
- `chrome.storage.session` — active checkpoint
- `chrome.idle` — idle detection
- `chrome.alarms` — heartbeat
- `chrome.sidePanel` — dashboard fallback

## 8. IndexedDB Stores Used (via Dexie.js)

| Store | Purpose |
|---|---|
| `tab_sessions` | All browsing sessions, recent activity |
| `workstreams` | Detected workstream entities |
| `workstream_events` | Workstream transitions |
| `domains` | Domain library (productivity defaults) |
| `rules` | User-defined classification rules |
| `snapshots` | Saved workspace snapshots |
| `focus_metrics` | Aggregated daily focus scores |
| `decision_traces` | Classification decision trail |

## 9. Model

**FastText WASM** (`fasttext.wasm.js`)
- Type: Text classifier
- Version: Atentiv Page Classifier v1.0.0
- Size: ~4.2MB (model file)
- Runtime: WebAssembly, local-only
- Cold start: ~200-500ms
- Warm classification: <50ms
- Fallback: Domain library + user rules (model failure doesn't break extension)

## 10. Performance Measurements

| Metric | Value |
|---|---|
| Unit test suite (30 tests) | ~0.6s |
| Build time | ~6s |
| content.js bundle | 75.5KB |
| background.js bundle | 553KB |
| Extension package | 1.9MB |
| HUD open animation | 0.22s (cubic-bezier) |
| Data refresh interval | 5s |
| Timer tick | 1s |

## 11. Known Limitations

1. **Tab dwell time in right panel** — shows 0ms for most tabs because active dwell time is only tracked for the currently focused tab. Historical dwell times for other tabs would require session log join.
2. **Workstream detection** — requires actual browsing history in IndexedDB. Fresh installs show "No workstreams detected yet".
3. **Content script injection on first install** — user must navigate to a page (or refresh) after installing for content.js to be automatically injected via `content_scripts`. Toolbar click handles the case where it wasn't auto-injected via `scripting.executeScript`.
4. **Settings sections** — Tracking, Workstreams, Shortcuts, Data sections are scaffolded with "coming soon" placeholders. General, Privacy, Rules, and About are fully implemented.
5. **Focus Mode** — UI button wired but engine integration pending full focus session implementation.
