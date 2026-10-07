import os

os.makedirs("docs/diagrams", exist_ok=True)

class_diag = """# Atentiv — Class & Domain Model Diagram
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

```mermaid
classDiagram
    class SessionManager {
        +currentSession: SessionRecord
        +activeTabId: number
        +trackingState: TrackingState
        +initFromStorage(): Promise~void~
        +handleTabActivated(tabId: number): Promise~void~
        +handleTabClosed(tabId: number): Promise~void~
        +handleIdleState(state: IdleState): Promise~void~
        +reconcile(): Promise~void~
    }

    class EventMonitor {
        +setupListeners(): void
        +onActivated(activeInfo): void
        +onUpdated(tabId, changeInfo, tab): void
        +onRemoved(tabId): void
    }

    class WorkstreamEngine {
        +activeWorkstreams: Map~string, Workstream~
        +assignTabToWorkstream(tab: TabContext): Promise~string~
        +computeCentroid(tokens: string[]): Vector
        +cosineSimilarity(v1: Vector, v2: Vector): number
        +checkSplitOrMerge(): Promise~void~
    }

    class Classifier {
        +classify(url: string, title: string): ClassificationResult
        +applyOverrides(domain: string): ProductivityType
        +evaluateYouTube(title: string): ProductivityType
    }

    class FocusScoreEngine {
        +computeScore(stats: SessionStats): FocusScoreResult
        +calculateCSP(switches: SwitchEvent[]): number
        +calculatePR(dwells: DwellBreakdown): number
        +calculateSR(csp: number): number
    }

    class SessionRepository {
        +create(session: SessionRecord): Promise~string~
        +updateDwell(id: string, dwell: number): Promise~void~
        +updateIdle(id: string, idle: number): Promise~void~
        +close(id: string): Promise~void~
        +getRecent(limit: number): Promise~SessionRecord[]~
    }

    class SnapshotRepository {
        +capture(workstreamId: string): Promise~string~
        +restore(snapshotId: string): Promise~void~
        +getAll(): Promise~SnapshotRecord[]~
    }

    class DexieDatabase {
        +sessions: Table
        +workstreams: Table
        +rules: Table
        +exclusions: Table
        +snapshots: Table
    }

    EventMonitor --> SessionManager : dispatches events
    SessionManager --> WorkstreamEngine : clusters tabs
    SessionManager --> Classifier : resolves category
    SessionManager --> SessionRepository : persists dwell
    SessionManager --> FocusScoreEngine : computes F, CSP
    SessionRepository --> DexieDatabase : manages records
    SnapshotRepository --> DexieDatabase : manages snapshots
```
"""

dfd = """# Atentiv — Data Flow Diagram (DFD Level 0 & Level 1)
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

```mermaid
flowchart TD
    User([User]) <-->|Browser Interactions / Tabs| Chromium[Chromium Browser Engine]
    
    subgraph Atentiv Extension Sandbox
        Chromium -->|Tabs, Idle, Navigation Events| SW[Background Service Worker]
        Chromium <-->|DOM Metadata, Audio State| CS[Content Script]
        CS -->|Title Tokens & Media Signal| SW
        
        SW -->|Token & URL Parsing| FE[Feature Extractor]
        FE -->|Vector Representation| ML[Local Classifier & Workstream Engine]
        
        ML -->|Category & Workstream ID| SE[Session & Focus Engine]
        SE -->|Dwell Time & CSP Updates| IDB[(Dexie.js / IndexedDB)]
        
        IDB -->|Stored Aggregates & History| MR[Message Router]
        MR <-->|IPC Queries / Live HUD Data| UI[Presentation Layer: Side Panel / Dashboard / Options]
    end

    UI -->|Visual Feedback: Focus Ring, Workstream Map| User
```
"""

use_cases = """# Atentiv — Formal Use Case Models
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

```mermaid
flowchart LR
    User([Knowledge Worker])
    
    subgraph Atentiv Platform
        UC1((UC-01: Automatic Attention Tracking))
        UC2((UC-02: Workstream Clustering))
        UC3((UC-03: Media-Aware Audio Crediting))
        UC4((UC-04: Real-Time Focus HUD Review))
        UC5((UC-05: Deep Analytics & CSP Audit))
        UC6((UC-06: Quick Resume Snapshot))
        UC7((UC-07: Custom Rule Definition))
        UC8((UC-08: Data Export & Purge))
    end
    
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC7
    User --> UC8
```
"""

seq_diag = """# Atentiv — System Sequence Diagrams
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

### Tab Activation & Dwell Calculation Sequence

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser as Chromium Tabs API
    participant SW as Background Service Worker
    participant Engine as SessionManager
    participant DB as IndexedDB (Dexie)
    participant UI as Side Panel HUD

    User->>Browser: Switches to new Tab (Tab 2)
    Browser->>SW: tabs.onActivated(tabId=2)
    SW->>Engine: switchActiveTab(tabId=2)
    
    rect rgb(30, 35, 50)
        Note over Engine,DB: Close Previous Session (Tab 1)
        Engine->>Engine: Compute active dwell for Tab 1
        Engine->>DB: sessionRepository.close(tab1SessionId)
    end
    
    rect rgb(40, 30, 50)
        Note over Engine,DB: Initialize New Session (Tab 2)
        Engine->>Engine: Inspect URL & Protocol
        alt Restricted URL (chrome://)
            Engine->>Engine: Set trackingState = UNTRACKABLE
            Engine->>UI: Broadcast UNTRACKABLE (Score = —)
        else Supported Webpage
            Engine->>Engine: Classifier & Workstream Assignment
            Engine->>DB: sessionRepository.create(tab2Session)
            Engine->>UI: Broadcast Active State & Focus Score
        end
    end
    
    UI-->>User: Update Live Focus Ring & Workstream Tag
```
"""

with open("docs/diagrams/CLASS_DIAGRAM.md", "w") as f:
    f.write(class_diag)
with open("docs/diagrams/DATA_FLOW_DIAGRAM.md", "w") as f:
    f.write(dfd)
with open("docs/diagrams/USE_CASES.md", "w") as f:
    f.write(use_cases)
with open("docs/diagrams/SEQUENCE_DIAGRAMS.md", "w") as f:
    f.write(seq_diag)

print("Generated docs/diagrams/ successfully.")
