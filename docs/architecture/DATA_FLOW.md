# Atentiv — System Data Flow Architecture
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Status:** Canonical End-to-End Flow  

---

## 1. End-to-End Browsing Activity Data Flow

```mermaid
flowchart TD
    UserActivity["User Navigates or Switches Tab"] --> BrowserAPI["chrome.tabs / chrome.windows Event"]
    BrowserAPI --> EventMonitor["EventMonitor (src/background/eventMonitor.ts)"]
    EventMonitor --> Reconcile["SessionManager.reconcile()"]
    
    Reconcile --> CheckUntrackable{"Is Protocol Restricted?\n(chrome://, edge://, about:)"}
    CheckUntrackable -- Yes --> SetUntrackable["Set State: UNTRACKABLE\nFreeze timers, no dwell, no score"]
    CheckUntrackable -- No --> CheckExclusion{"ExclusionEngine.check()\nIs Domain in Exclusion List?"}
    
    CheckExclusion -- Yes --> PurgeExclusion["STOP Extraction\nPurge Prior Sessions/Traces"]
    CheckExclusion -- No --> DomExtract["Content Script (domExtractor.ts)\nExtract Title, Headings, Visible Text\nScrub Query & Passwords"]
    
    DomExtract --> Precedence["Categorisation Precedence Pipeline\nUser Rule -> Feedback -> Curated -> Cache -> fastText WASM -> Keywords"]
    Precedence --> YouTubeCheck{"Domain is YouTube?"}
    YouTubeCheck -- Yes (Education Keywords) --> PromoteYT["Promoted to Productive (+1)"]
    YouTubeCheck -- No / Entertainment --> DefaultYT["Default Distracting (-1)"]
    
    PromoteYT --> WorkstreamEngine["WorkstreamEngine.assignWorkstream()\nCosine Similarity >= 0.68, 20m Window"]
    DefaultYT --> WorkstreamEngine
    
    WorkstreamEngine --> ContextEval["ContextSwitchEvaluator.evaluate()\nSW = 1.5 (<=45s), CU in {0, 1, 2, 4}"]
    ContextEval --> CSPEngine["CSP = sum(SW * CU)\nSP = min(40, 2N)"]
    
    CSPEngine --> FocusEngine["FocusScoreCalculator.compute()\nF = round(100·(0.65PR + 0.35SR)) - SP"]
    FocusEngine --> DexieDB["Dexie.js / IndexedDB (AtentivDB)\nSave Session, Traces, Workstreams, Events"]
    
    DexieDB --> UI["Formal UIs (Side Panel, Dashboard, Options, HUD)"]
```

---

## 2. Inactivity & Sleep Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Chrome Browser
    participant SM as SessionManager
    participant DB as Dexie / IndexedDB
    participant UI as Side Panel / Dashboard
    
    User->>Browser: Ceases Mouse & Keyboard Input
    loop Every Reconcile Tick
        Browser->>SM: idle.queryState(threshold: 180s)
    end
    Note over SM: 180 seconds elapsed with no input
    SM->>SM: Check tab.audible & Learning category
    alt Educational Media Playing
        SM->>DB: Credit media dwell time under FR-03
    else No Qualifying Media
        SM->>SM: Transition to INACTIVE / PAUSED
        SM->>DB: Accumulate idle_time (active dwell frozen)
        SM->>UI: Update badge: 'PAUSED — INACTIVE'
    end
    User->>Browser: Moves mouse / types key
    Browser->>SM: idle.queryState -> 'active'
    SM->>SM: Transition to TRACKING
    SM->>DB: Resume active dwell time accumulation
    SM->>UI: Update badge: 'TRACKING ACTIVE'
```

---

## 3. Snapshot Save & Restore Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Chrome Browser
    participant ATLAS as Background Service Worker
    participant DB as IndexedDB (snapshots table)
    participant SidePanel as sidepanel.html (Quick Resume)
    
    alt Trigger A: 2+ tabs closed within 10s
        Browser->>ATLAS: tabs.onRemoved (rapid tabs in workstream)
    else Trigger B: Leaving Workstream after >= 30m dwell
        Browser->>ATLAS: Switch away from sustained workstream
    else Trigger C: User Manual Action
        User->>ATLAS: Click 'Take Snapshot'
    end
    
    ATLAS->>Browser: Query tabs in current window
    ATLAS->>ATLAS: Filter out excluded domains & internal URLs
    ATLAS->>DB: Save SnapshotRecord (title, tabs, timestamp, workstream_id)
    DB->>SidePanel: Update Quick Resume list
    
    User->>SidePanel: Click 'Restore Workspace'
    SidePanel->>ATLAS: Send RESTORE_WORKSPACE {snapshot_id}
    ATLAS->>DB: Fetch SnapshotRecord
    ATLAS->>Browser: windows.create({ focused: true })
    loop For each saved tab in stored order
        ATLAS->>Browser: tabs.create({ url, active: index === activeTab })
    end
    ATLAS->>ATLAS: Reconnect tabs to existing Workstream context
```

---

## 4. Privacy & Data Deletion Data Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant OptionsUI as options.html
    participant Router as MessageRouter
    participant DB as IndexedDB
    participant Storage as chrome.storage
    
    User->>OptionsUI: Click 'Delete All Data'
    OptionsUI->>User: Display Modal: 'This action cannot be undone. Confirm?'
    User->>OptionsUI: Confirms deletion
    OptionsUI->>Router: Send DELETE_ALL_DATA
    Router->>DB: Clear tab_sessions, workstreams, snapshots, rules, traces
    Router->>Storage: Clear activeCheckpoint, reset settings
    Router->>Router: SessionManager.reconcile(reset: true)
    Router->>OptionsUI: Return { success: true }
    OptionsUI->>User: Show clean empty state ('No activity recorded yet')
```
