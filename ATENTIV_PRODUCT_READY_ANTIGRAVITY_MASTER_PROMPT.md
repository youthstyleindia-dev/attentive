<USER_REQUEST>
I went through the **latest SRS Revision 3.1 / Submission Version 3.0** and built the implementation package around that version rather than the older Atentiv definitions.

The latest SRS is explicit about the product scope, formal interfaces, technology stack, tracking rules, inactivity, media, Workstreams, CSP, Focus Score, snapshots, persistence, privacy, retention, and testing expectations. Pasted text Pasted text

## Download the full package

Atentiv_Product_Ready_Delivery_Package.zip[**Atentiv Product-Ready Delivery Package — ZIP**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery_Package.zip)

Inside it are **35 structured files**, including:

:chatgpt-content-reference{index="15"}[**Master Antigravity implementation prompt**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery/ATENTIV_PRODUCT_READY_ANTIGRAVITY_MASTER_PROMPT.md)

:chatgpt-content-reference{index="16"}[**Full structured implementation report**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery/ATENTIV_FULL_STRUCTURED_IMPLEMENTATION_REPORT.md)

:chatgpt-content-reference{index="17"}[**Architecture document**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery/docs/architecture/ARCHITECTURE.md)

:chatgpt-content-reference{index="18"}[**Open SRS items**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery/docs/architecture/OPEN_ITEMS.md)

:chatgpt-content-reference{index="19"}[**Testing matrix**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery/docs/testing/TEST_MATRIX.md)

:chatgpt-content-reference{index="20"}[**Viva guide**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery/docs/viva/VIVA_GUIDE.md)

:chatgpt-content-reference{index="21"}[**User FAQ**](sandbox:/mnt/data/Atentiv_Product_Ready_Delivery/docs/user-guide/FAQ.md)

### What I specifically corrected

The prompt now uses the **latest SRS values**, not the earlier assumptions.

**Inactivity:** 3 minutes by default, configurable from 1–10 minutes. Pasted text

**Media:** background audible media can receive Dwell Time treatment only under the FR-03 conditions for Learning, Research, or Communication. Pasted text

**Workstream:** cosine threshold **0.68**, 20-minute temporal window, merge at **more than 3 tabs** or centroid similarity **>0.85**, and split after **15 continuous active minutes** on an unrelated topic. Pasted text

**CSP:**

\[
CSP=\sum(SW\times CU)
\]

with:

\[
SW=1.5\quad\text{for switches ≤45 seconds}
\]

and

\[
CU=
\begin{cases}
0 & \text{same Workstream/same tab}\\
1 & \text{same category}\\
2 & \text{related categories}\\
4 & \text{unrelated categories}
\end{cases}
\]

Pasted text

**Focus Score:** the current production formula is:

\[
F=\operatorname{round}(100(0.65PR+0.35SR))-SP
\]

where:

\[
SP=\min(40,N\times2)
\]

The important unresolved point is that **PR and SR are still `[To Be Specified]` in the SRS**. The prompt explicitly tells Antigravity not to invent definitions and pretend they came from the SRS. Pasted text

**YouTube:** default distracting, but educational page titles such as lecture/tutorial/course/documentation can promote the page to productive. Pasted text

**Restricted browser pages:** `chrome://` / `edge://` should be treated as untrackable rather than generating fake focus or dwell. The SRS specifically excludes these protocols through browser security constraints. Pasted text

**Snapshot:** the prompt follows the exact three automatic triggers and the specified saved metadata, rather than the older simplified snapshot model. Pasted text

**Formal UI:** the project still needs the three separate interfaces:
`sidepanel.html`, `dashboard.html`, and `options.html`. Pasted text

**Privacy:** the latest SRS explicitly says activity logs are plain text in IndexedDB with browser/OS isolation and sensitive-value scrubbing, not application-level encryption. Pasted text

### The scenarios covered

The master prompt makes Antigravity explicitly test cases such as:

```text
YouTube lecture ↔ PDF
        ↓
same Workstream
low CSP
no false warning
```

versus:

```text
GitHub → Instagram → GitHub → entertainment YouTube
        ↓
unrelated switching
        ↓
higher CU
        ↓
rapid SW
        ↓
higher CSP
        ↓
possible warning
```

and:

```text
Tab opened
   ↓
user walks away
   ↓
3-minute threshold
   ↓
PAUSED / INACTIVE
   ↓
no additional active Dwell Time
```

as well as:

```text
chrome://extensions
   ↓
UNTRACKABLE
   ↓
no fake timer
no fake score
no fake activity
```

These scenarios are deliberately aligned with the SRS rather than treating every tab switch as a productivity problem. Pasted text Pasted text

### The final file structure

The package is organized so you can both **build the product** and **explain it to your mam**:

```text
Atentiv_Product_Ready_Delivery/
│
├── ATENTIV_PRODUCT_READY_ANTIGRAVITY_MASTER_PROMPT.md
├── ATENTIV_FULL_STRUCTURED_IMPLEMENTATION_REPORT.md
├── README.md
│
└── docs/
    ├── architecture/
    │   ├── ARCHITECTURE.md
    │   ├── REPOSITORY_INVENTORY.md
    │   ├── CONSOLIDATION_REPORT.md
    │   ├── FINAL_DELIVERY_REPORT.md
    │   ├── REQUIREMENT_TRACEABILITY.md
    │   ├── OPEN_ITEMS.md
    │   └── DATA_FLOW.md
    │
    ├── workflows/
    │   ├── 01-startup-recovery.md
    │   ├── 02-tab-lifecycle.md
    │   ├── 03-dwell-time.md
    │   ├── 04-inactivity.md
    │   ├── 05-media-awareness.md
    │   ├── 06-trackability.md
    │   ├── 07-privacy-exclusion.md
    │   ├── 08-page-analysis.md
    │   ├── 09-categorisation.md
    │   ├── 10-user-rules.md
    │   ├── 11-activity-inference.md
    │   ├── 12-workstream-links.md
    │   ├── 13-workstream-grouping.md
    │   ├── 14-workstream-naming.md
    │   ├── 15-context-switch.md
    │   ├── 16-csp.md
    │   ├── 17-focus-score.md
    │   ├── 18-warning-system.md
    │   ├── 19-snapshot-save.md
    │   ├── 20-snapshot-restore.md
    │   ├── 21-side-panel.md
    │   ├── 22-dashboard.md
    │   ├── 23-options.md
    │   └── 24-export-delete.md
    │
    ├── testing/
    │   └── TEST_MATRIX.md
    │
    ├── user-guide/
    │   └── FAQ.md
    │
    └── viva/
        └── VIVA_GUIDE.md
```

One thing to be clear about: **this package is the implementation blueprint and execution prompt; it does not mean the codebase itself has already been fully developed.** The Antigravity prompt is specifically written to make Antigravity inspect the existing repository, implement/fix the system, run the tests, and report actual completion rather than claiming success without verification.
Loading older messages…












FocusScore
=
100
(
0.65
P
+
0.35
S
)
−
Penalty
 


F
=
(
P
−
U
T
×
100
)
−
C
S
P
 
P
U
T
C
S
P



FocusScore
=
100
×
(
0.65
P
+
0.35
S
)
−
Penalty

P
S


P
∈
[
0
,
1
]

S
∈
[
0
,
1
]




P
=
productive time
total tracked time
 

P
=
70
100
=
0.70
 






0.65
P

P
=
0.70

0.65
×
0.70
=
0.455



S

S







65
%

35
%





P
=
0.70

S
=
0.80

0.65
P
=
0.65
(
0.70
)
=
0.455

0.35
S
=
0.35
(
0.80
)
=
0.28

0.455
+
0.28
=
0.735

0.735
×
100
=
73.5

P
e
n
a
l
t
y
=
8

F
o
c
u
s
S
c
o
r
e
=
73.5
−
8
F
o
c
u
s
S
c
o
r
e
=
65.5
 

65.5
/
100
 






P
e
n
a
l
t
y
=
f
(
context switches
)



100
(
0.65
(
0.9
)
+
0.35
(
0.9
)
)
=
100
(
0.585
+
0.315
)
=
90

P
e
n
a
l
t
y
=
2

F
o
c
u
s
=
90
−
2
=
88



F
o
c
u
s
=
90
−
25
=
65



0.65
+
0.35
=
1
P
S


P
=
0
,
S
=
0
100
(
0.65
(
0
)
+
0.35
(
0
)
)
=
0
P
=
1
,
S
=
1
100
(
0.65
+
0.35
)
=
100

0
≤
100
(
0.65
P
+
0.35
S
)
≤
100


B
a
s
e
S
c
o
r
e
=
10

P
e
n
a
l
t
y
=
20

F
o
c
u
s
S
c
o
r
e
=
10
−
20
=
−
10


F
o
c
u
s
S
c
o
r
e
=
max

(
0
,
min

(
100
,
F
o
c
u
s
S
c
o
r
e
)
)


−
10
→
0

105
→
100

P
=
productive time
tracked time
 

S
=
f
(
context continuity, switches, session stability
)
B
=
0.65
P
+
0.35
S
B

B
100
=
100
B
 
P
e
n
a
l
t
y
=
f
(
unrelated context switches
)
F
=
100
(
0.65
P
+
0.35
S
)
−
P
e
n
a
l
t
y
 
F
=
max

(
0
,
min

(
100
,
F
)
)
 



P
=
72
120
=
0.60
 

S
=
0.75

0.65
(
0.60
)
=
0.39
0.35
(
0.75
)
=
0.2625

0.39
+
0.2625
=
0.6525
100
(
0.6525
)
=
65.25

P
e
n
a
l
t
y
=
7

65.25
−
7
=
58.25

58.25
/
100
 








S
=
1
−
normalized_switch_rate

normalized switch rate
=
0.2

S
=
1
−
0.2
=
0.8
S


S
=
w
1
(
workstream continuity
)
+
w
2
(
session continuity
)
+
w
3
(
switch stability
)
  
  
 
S


F
=
(
P
−
U
T
×
100
)
−
C
S
P
 
 
















































F
=
(
P
−
U
T
×
100
)
−
C
S
P
 











F
=
round

(
100
(
0.65
P
R
+
0.35
S
R
)
)
−
S
P

S
P
=
min

(
40
,
N
×
2
)

(
(
P
−
U
)
/
T
×
100
)
−
C
S
P





C
S
P
=
∑
(
S
W
×
C
U
)
























C
S
P
=
∑
(
S
W
×
C
U
)

S
W
=
1.5
for switches ≤45 seconds

C
U
=
{
0
same Workstream/same tab
1
same category
2
related categories
4
unrelated categories
  
  
 


F
=
round

(
100
(
0.65
P
R
+
0.35
S
R
)
)
−
S
P

S
P
=
min

(
40
,
N
×
2
)

















ATENTIV — PRODUCT-READY MASTER ANTIGRAVITY PROMPT
Full End-to-End Implementation, Reconciliation, Testing, UX, Workstream, Focus, Privacy and Delivery
Authority: Latest Atentiv SRS Revision 3.1 / Submission Version 3.0
You are the principal engineer for the EXISTING Atentiv repository.

Your assignment is to finish the project as a coherent, end-to-end, development-ready product-quality academic implementation by TOMORROW'S DEMONSTRATION DEADLINE.

This is NOT permission to create another prototype.

This is a repository-first execution task:

inspect first,
reconcile versions,
implement against the latest SRS,
fix actual bugs,
complete all critical workflows,
test every case,
document what is complete,
clearly isolate anything still unspecified.
Do not merely produce a plan. Make the changes in the repository.

===============================================================================
0. ABSOLUTE RULE: ONE CANONICAL ATENTIV
===============================================================================

The repository may contain several versions of Atentiv.

Before editing:

Inventory the complete repository.
Find all duplicate implementations.
Find all manifests and entry points.
Find all background/service workers.
Find all content scripts.
Find all Side Panels.
Find all Dashboards.
Find all Options pages.
Find all HUD implementations.
Find all tracking/session implementations.
Find all workstream implementations.
Find all Focus Score implementations.
Find all databases/Dexie layers.
Find all classifiers/ML runtimes.
Find all snapshot implementations.
Find all test suites.
Find all documentation and diagrams.
Determine which implementation is actually active by checking:

manifest references,
package scripts,
build entry points,
imports,
runtime wiring,
actual extension load path,
recent git history if available.
Do not determine "latest" from filenames alone.

Then classify each duplicate as:
KEEP
MERGE
REPLACE
ARCHIVE
REMOVE

Preserve useful historical work under legacy/.

There must be ONE active canonical implementation.

At the end:
README must clearly state:
"This repository contains one canonical Atentiv implementation. Previous prototypes are archived under legacy/."

No archived code may be imported by the active build.

===============================================================================

SOURCE OF TRUTH
The latest Atentiv SRS Revision 3.1 is the authoritative requirements baseline.

Follow these groups:

FR-01 to FR-24
UIR-01 to UIR-07
SI-01 to SI-09
NFR-* requirements
DR-01 to DR-15
SC-01 to SC-09
OR-01 to OR-05
Appendix A
Appendix B
Appendix C
The SRS is more authoritative than older design notes.

Do not silently downgrade or replace current SRS requirements with assumptions from Version 2.0.

Where the SRS explicitly says [To Be Specified], do not fabricate a claim that the SRS defines the missing value.

===============================================================================
2. NON-NEGOTIABLE PRODUCT PRINCIPLES
===============================================================================

Atentiv is:

a Manifest V3 browser extension,
Zero-Server,
Local-First,
on-device,
privacy-preserving,
context-aware,
focused on active browsing,
Workstream-oriented rather than tab-count-only.
Atentiv shall NOT:

upload browsing history,
send page titles to a server,
use cloud analytics,
use third-party telemetry,
use remote ML inference,
require an account,
synchronize data to a server,
silently collect excluded data.
The browser may load normal webpages on the user's behalf. Those browser network requests are not Atentiv telemetry.

===============================================================================
3. REQUIRED TECHNOLOGY STACK
===============================================================================

Use the technology choices in the latest SRS:

TypeScript 5.7+ strict mode
React 19
Vite 6
esbuild for Service Worker and Content Script
CSS Modules
CSS Custom Properties
Shadow DOM root #atentiv-v3 where injected HUD exists
native SVG/Canvas for gauges, timelines and charts
lucide-react
Dexie.js 4.4+
IndexedDB
fastText compiled to WebAssembly SIMD
Do not add remote infrastructure.

===============================================================================
4. FORMAL USER INTERFACES
===============================================================================

The latest SRS requires exactly three formal user interfaces:

sidepanel.html
dashboard.html
options.html
Side Panel:

Live Focus Score
Active Workstream
Quick Resume
Dashboard:

Activity Time Charts
Workstream Maps
Switch Penalty Reports
Options:

category customization
productivity customization
Exclusion List
export
delete
A Compact/Full HUD may exist as an additional interaction layer ONLY if it does not replace the three formal SRS interfaces.

If an older implementation makes toolbar click open a New Tab:

inspect it,
preserve an optional New Tab experience only if it does not conflict,
ensure the normal extension action does not incorrectly redirect to a New Tab.
===============================================================================
5. FIRST TASK — REPOSITORY FORENSICS
===============================================================================

Create:
docs/architecture/REPOSITORY_INVENTORY.md

Include:

active manifest
active Service Worker
active Content Script
active Side Panel
active Dashboard
active Options page
active HUD if present
active database layer
active classifier
active Workstream implementation
active Focus implementation
test entry points
duplicated/legacy files
unresolved conflicts
Do not modify architecture until this report exists.

===============================================================================
6. CANONICAL ARCHITECTURE
===============================================================================

Use this logical architecture:

USER
↓
CHROMIUM BROWSER
↓
Browser Event Monitor
↓
Background Engine / Service Worker
↓
Local Database
↓
Side Panel / Dashboard / Options

Internally the Background Engine may be organized as:

ATLAS
Atentiv Tab Lifecycle and Activity-State System

ATLAS is an internal architecture/orchestration term.
It is NOT:

an npm package,
framework,
external engine,
cloud service,
ML model.
Recommended decomposition:

BrowserEventMonitor
SessionManager
PrivacyManager
RuleEngine
DomainLibrary
PageAnalyzer
MLClassifier
ActivityEngine
ProductivityEngine
WorkstreamEngine
ContextSwitchEngine
FocusEngine
SnapshotManager
AnalyticsEngine
WarningEngine if implemented
===============================================================================
7. ARCHITECTURE DEPENDENCY DIRECTION
===============================================================================

Enforce:

Browser APIs
↓
Background/Event layer
↓
Domain/Intelligence layer
↓
Repositories
↓
Dexie
↓
IndexedDB

UI:
UI
↓
application/query service
↓
domain/analytics
↓
repositories
↓
Dexie
↓
IndexedDB

Do NOT:

let every React component query IndexedDB independently,
create multiple database abstractions,
create multiple competing business-logic engines.
===============================================================================
8. LIVE STATE
===============================================================================

Use one canonical live state model.

Suggested:

type TrackingState =
  | "TRACKING"
  | "INACTIVE"
  | "PAUSED"
  | "SYSTEM_SLEEP"
  | "UNTRACKABLE"
  | "NO_ACTIVE_SESSION";

interface LiveAtentivState {
  trackingState: TrackingState;
  activeTabId?: number;
  domain?: string;
  title?: string;
  category?: string;
  activityType?: string;
  productivityType?: -1 | 0 | 1;
  activeWorkstreamId?: string;
  activeWorkstreamName?: string;
  activeDwellSeconds: number;
  idleSeconds: number;
  contextSwitchCount: number;
  csp: number;
  focusScore?: number;
  mediaPlaying?: boolean;
}
Adapt it to actual implementation, do not duplicate types.

===============================================================================
9. WORKFLOW 01 — STARTUP / SERVICE WORKER RECOVERY
===============================================================================

On extension start:

initialize Service Worker,
initialize Dexie,
load settings,
load rules,
load exclusions,
load timer checkpoint,
load pending write buffer if supported,
recover active tab/session state,
recover current Workstream,
initialize classifier/model metadata,
reconcile with current browser state,
mark system ready.
Because MV3 Service Workers can stop:

timer correctness cannot depend only on RAM,
persist timer checkpoint,
use browser alarms heartbeat,
recover after restart.
Latest SRS:

continuous checkpointing,
expected maximum tracked-activity loss is 30 seconds,
heartbeat every 30 seconds,
if the heartbeat gap exceeds 90 seconds, classify excess gap as system sleep and exclude it from Dwell Time.
===============================================================================
10. WORKFLOW 02 — TAB LIFECYCLE
===============================================================================

Handle:

tab created
tab activated
tab updated/navigation
tab removed
window focus changed
idle state changed
media state
Rules:

at most one ordinary active tab accumulates ordinary Dwell Time at any instant,
background tabs do not accumulate ordinary Dwell Time,
a tab that has only been created but not actively viewed does not receive active dwell,
navigation ends the old URL interval and begins a new page interval,
window blur pauses active timing,
tab removal closes any active interval safely.
Avoid negative or undefined durations.

===============================================================================
11. WORKFLOW 03 — TRACKABILITY / RESTRICTED PAGES
===============================================================================

Restricted browser protocols such as:

chrome://
edge://
must be treated as UNTRACKABLE.
For an untrackable page:

no content-script extraction,
no page keyword scan,
no normal activity session,
no Dwell Time,
no link relationship,
no snapshot inclusion,
no productivity deduction,
no false Focus Score.
UI example:

"Tracking unavailable on this browser page.
Atentiv will resume automatically on a supported webpage."

Do not call this an inactivity failure.

Differentiate:
UNTRACKABLE
vs
PAUSED
vs
INACTIVE
vs
NO_ACTIVE_SESSION.

===============================================================================
12. WORKFLOW 04 — INACTIVITY / "TAB OPEN BUT USER DOES NOTHING"
===============================================================================

The latest SRS is explicit:

Default Inactivity Threshold:
3 minutes = 180 seconds.

Configurable range:
1–10 minutes.

Logic:

page/tab is active,
user interacts,
active Dwell Time accumulates,
no keyboard/mouse activity,
once threshold is exceeded and no qualifying media playback exists,
timer pauses,
paused time is excluded from Dwell Time,
metric calculation is suspended during the pause,
idle time can be recorded separately as idle_time,
when activity resumes, active timing resumes.
Critical:
The period from last activity to threshold crossing must not be retroactively counted as active dwell.

Do not simply keep incrementing a timer for the whole wall-clock interval.

Use timestamps.

===============================================================================
13. WORKFLOW 05 — SYSTEM SLEEP
===============================================================================

When system/browser reports sleep/locked state:

pause Dwell Time,
suspend metric calculation,
record sufficient checkpoint state,
resume after wake.
Heartbeat fallback:

Chrome alarms every 30 seconds,
if gap >90 seconds, excess is considered system sleep and excluded.
===============================================================================
14. WORKFLOW 06 — MEDIA PLAYBACK
===============================================================================

FR-03 is an explicit exception.

Atentiv must detect media state in foreground/background tabs where browser APIs permit.

A background tab can contribute media playback time to Dwell Time ONLY when:

tab is audible,
media is playing,
effective category is Learning, Research, or Communication.
Examples:

lecture
podcast
meeting
Do NOT:

count all background tabs,
classify every YouTube video as productive,
automatically make media productive,
double count the same real-world time.
If media state cannot be determined:
treat it as not playing media.

===============================================================================
15. WORKFLOW 07 — NO DOUBLE COUNTING
===============================================================================

The analytics model must maintain mathematically coherent time.

If:

PDF foreground = 10 minutes
educational YouTube background = 10 minutes
do not blindly count 20 minutes of total human elapsed time.

Represent:

primary tab activity,
media-assisted state,
actual attributed time,
workstream association.
Ensure dashboard totals reconcile to stored session records.

===============================================================================
16. WORKFLOW 08 — PRIVACY CHECK
===============================================================================

The Exclusion List is checked BEFORE page extraction.

If excluded:
STOP.

Do not:

read title,
scan headings,
scan visible text,
create Dwell Time,
create activity session,
create link relationship,
include in snapshot,
display analytic data.
When user adds domain to Exclusion List:

delete previously stored activity session records for that domain,
delete classification decision traces for that domain,
apply exclusion immediately to future activity.
===============================================================================
17. WORKFLOW 09 — PAGE EXTRACTION
===============================================================================

For permitted accessible pages:

title
og:description
up to 20 H1-H3 headings
up to 2 KB visible text from main/article where accessible
Local processing:

strip markup,
normalize punctuation,
lowercase/stem as implemented,
remove English stop words for keyword scoring.
Never capture:

passwords,
form values,
typed keystrokes,
unnecessary HTML,
secrets.
MutationObserver:

debounce,
feature hash,
re-analyze only when meaningful page context changes.
===============================================================================
18. WORKFLOW 10 — CATEGORISATION PRECEDENCE
===============================================================================

Use EXACT latest SRS precedence:

Exclusion List
Explicit user rule
User feedback override
Preset domain list
Inference cache for identical content
local fastText model
keyword dictionary scoring
default category "Other" with neutral productivity
Do not move ML ahead of rules.

===============================================================================
19. WORKFLOW 11 — DOMAIN CLASSIFICATION
===============================================================================

Bundled domain data:

100 curated domains,

category,
default productivity,
default activity.
Examples:

GitHub → productive
arXiv → productive
StackOverflow → productive
Wikipedia → neutral
mail → neutral
Reddit/social/Netflix/Instagram → distracting
YouTube → distracting by default
Use SRS examples exactly where relevant.

===============================================================================
20. WORKFLOW 12 — YOUTUBE RULE
===============================================================================

YouTube default:

distracting (-1)
Promote to productive (+1) when title contains qualifying education terms such as:

lecture
tutorial
course
documentation
This is page-sensitive classification.

Example:

"YouTube — Machine Learning Lecture"
→ likely Learning / Productive

"YouTube — Funny Compilation"
→ Entertainment / Distracting

Do not make the domain rule alone decide all YouTube pages.

User rule can override it.

===============================================================================
21. WORKFLOW 13 — USER FEEDBACK / OVERRIDE
===============================================================================

User rules:

category
productivity value
optional activity/workstream action where supported
Rule conditions:

domain_exact
domain_contains
title_contains
url_prefix
Rules:

UUID v4 rule_id
priority 100–200
enabled
created_at
Historical sessions keep historical classification.
A changed rule applies immediately to future sessions.
If "Re-calculate Today" exists, only today's records are re-scored.

===============================================================================
22. WORKFLOW 14 — ACTIVITY INFERENCE
===============================================================================

Separate:
CATEGORY
ACTIVITY
PRODUCTIVITY
WORKSTREAM

Examples:

Google + "Python import error" → Research
StackOverflow + specific error → Debugging
GitHub repository → Development
YouTube ML lecture → Learning
documentation page → Reading/Research
Keep activity inference explainable and deterministic where possible.

===============================================================================
23. WORKFLOW 15 — LINK RELATIONSHIPS
===============================================================================

Record navigation chains.

Example:
Google result → StackOverflow → GitHub

Store relationship fields based on DR-04:

id
workstream_id
session_id
entered_at
exited_at
duration
previous_workstream_id
switch_penalty
If source unknown:

do not fabricate it,
no relationship is stored,
destination may start a chain.
Excluded source/destination:

do not store relationship.
===============================================================================
24. WORKFLOW 16 — WORKSTREAM GROUPING
===============================================================================

Workstream = set of pages related to one task.

FR-06 requirements:

automatic assignment,
one Workstream maximum per tracked page at a time.
For the canonical example:
Google search
→ StackOverflow
→ GitHub
→ Python documentation

ALL FOUR must be able to belong to one Workstream.

Use:

link connectivity,
semantic title-vector similarity,
cosine similarity >= 0.68,
shared category/activity,
activation temporal proximity within 20 minutes,
no intervening unrelated distraction block.
Merge:

3 shared tabs
OR

centroid cosine similarity >0.85.
Split:

unrelated topic sustained for >15 continuous active minutes.
A page without link relationship is not assigned to a Workstream until connected.

Do not substitute older thresholds without documenting a formal change.

===============================================================================
25. WORKFLOW 17 — WORKSTREAM NAMING
===============================================================================

Every Workstream needs a descriptive name.

Naming order:

most frequent meaningful noun/bigram in titles,
fallback category + active domain,
final fallback "General Browsing" or "Task Session #".
The name is used in:

Side Panel,
tab_sessions.workstream_name,
Snapshot title basis.
===============================================================================
26. WORKFLOW 18 — TAB SWITCH VS CONTEXT SWITCH
===============================================================================

NEVER equate a tab event with a Context Switch.

Tab switch:
browser event.

Context Switch:
task/attention context change represented by the user's page sequence.

Examples:
YouTube lecture ↔ PDF
→ may be same Workstream
→ low/zero CU

GitHub ↔ Instagram
→ likely unrelated
→ high CU

All context decisions must consider:

previous category
current category
previous Workstream
current Workstream
activity
relation/link evidence
timing
===============================================================================
27. WORKFLOW 19 — CSP
===============================================================================

Use exact FR-11 formula:

CSP = Σ(SW × CU)

Switch Weight:

SW = 1.5 if <=45 seconds since previous switch
SW = 1.0 otherwise
Category Unrelatedness:

CU = 0 same Workstream or same tab
CU = 1 same category
CU = 2 related categories
CU = 4 unrelated categories
Missing category:

treat as neutral,
CU = 2.
CSP must never be negative.

No Context Switches:
CSP = 0.

Store switch_penalty per switch as required.

===============================================================================
28. WORKFLOW 20 — FOCUS SCORE
===============================================================================

Production formula is FR-12.1:

F = round(100 × (0.65 × PR + 0.35 × SR)) − SP

SP = min(40, N × 2)

where:

PR = Productive Ratio
SR = Stability Ratio
N = Context Switch count.
Clamp:
0 <= F <= 100.

IMPORTANT:
PR and SR are explicitly [To Be Specified] in the current SRS.

Do NOT invent and claim the SRS defined them.

Search the repository for an approved stakeholder/project definition.

If none exists:

create a clear strategy interface/configuration,
document the provisional definition,
mark it as "Implementation Assumption — SRS leaves this unspecified",
do not rewrite the SRS.
Also preserve:

CSP as the detailed FR-11 metric,
SP as the FR-12 score deduction.
Do not confuse CSP and SP.

FR-12:
same input → same score.

T = 0:
do not calculate score,
UI says no data available.

===============================================================================
29. WORKFLOW 21 — EXAMPLE / STUDY SCENARIO
===============================================================================

Scenario:

09:00 Google ML search
09:05 research PDF
09:15 YouTube ML lecture
09:30 PDF
09:45 GitHub
10:00 Instagram
10:00:30 GitHub
10:01 Instagram
10:01:30 GitHub

Expected:
First educational/technical sequence can form one Workstream.
PDF ↔ lecture should NOT automatically be considered harmful.
Instagram/GitHub rapid unrelated switching can increase CSP.
SW = 1.5 for <=45 second switches.
Formal Dashboard report highlights windows with >6 switches in 10 minutes.

Do not trigger a live warning merely because a user alternated related tabs.

===============================================================================
30. WORKFLOW 22 — LIVE WARNING SYSTEM
===============================================================================

The SRS formally defines a Dashboard report threshold:
more than 6 Context Switches in a 10-minute window.

A live intervention is an additional UX behaviour and must not replace FR-19.

Build one WarningEngine.

Warning types:

RAPID_CONTEXT_SWITCH
DISTRACTION_SPIKE
WORKSTREAM_INSTABILITY
INACTIVITY
UNTRACKABLE
Recommended live warning:
3+ unrelated context switches within 60 seconds.

This is an implementation policy, not an SRS requirement.

Warning cooldown:
recommended starting value 5 minutes.

No blocking.
No forced navigation.
No shame.

Example:

"Focus Interrupted
You have switched between unrelated contexts several times in the last minute.
Current Workstream: Python Debugging"

Actions:
[Stay with this Workstream]
[Dismiss]

===============================================================================
31. WORKFLOW 23 — FORMAL SWITCH PENALTY REPORT
===============================================================================

Dashboard:
if >6 Context Switches occur within 10 minutes:
highlight period amber/red.

Show:

period start
period end
number of switches
CSP
relevant Workstream/categories
If nothing qualifies:
"No high-penalty periods were found."

===============================================================================
32. WORKFLOW 24 — AUTOMATIC SNAPSHOT
===============================================================================

Automatic snapshot triggers:
A. two or more tabs of active Workstream closed within 10 seconds,
OR
B. user leaves Workstream that had >=30 minutes continuous Dwell Time,
OR
C. user selects "Take Snapshot."

Snapshot:

snapshot_id
title
saved_tabs
active_tab_index
timestamp
SavedTab:

url
title
favicon URL
category tag
Do not include excluded domains.

Do not capture:

window layout,
scroll position,
form content,
unless the SRS is changed.
===============================================================================
33. WORKFLOW 25 — RESTORE
===============================================================================

One user selection:
→ read snapshot
→ create/open a new browser window as required
→ open URLs in stored order
→ reconnect them to the Workstream.

If a URL fails:

continue other tabs,
tell the user which tab failed.
Do not claim in-page state restoration.

50ms requirement excludes webpage load time.

===============================================================================
34. WORKFLOW 26 — SIDE PANEL
===============================================================================

sidepanel.html:

Mandatory:

Live Focus Score,
Active Workstream,
Quick Resume.
Updates:

storage changes immediately,
live clock/session duration every 1 second.
No data:
"no data available."

No Workstream:
"no Active Workstream."

Ensure narrow Side Panel layout is responsive.

No clipped labels.
No overflow.
Keyboard accessible.

===============================================================================
35. WORKFLOW 27 — DASHBOARD
===============================================================================

dashboard.html:

A. Activity Time Charts

category time
Today hourly
Last 7 Days daily
Required chart types:

hourly context-switch frequency bar chart,
pie/donut by Workstream or domain,
horizontal-bar domain timeline.
Totals MUST equal persisted dwell_time aggregates.

B. Workstream Maps

domains as nodes/clusters,
link relationships as edges,
expandable page-title flyout.
C. Switch Penalty Reports

highlight >6 Context Switches / 10-minute window,
show time span and CSP.
No data:
clear no-data state.

===============================================================================
36. WORKFLOW 28 — OPTIONS
===============================================================================

options.html:

create/edit/delete category rule,
productivity customisation,
exclusion list,
export,
delete all.
Domain validation:
reject invalid domains.

Delete All:
requires confirmation that explicitly says it cannot be undone.

===============================================================================
37. WORKFLOW 29 — EXPORT
===============================================================================

One explicit user action.

Output:
atentiv-export.json

Contains:

sessions,
Workstreams,
decision traces,
metrics,
all necessary persisted entities.
No network.

Cancel/failure:
do not change stored data.

===============================================================================
38. WORKFLOW 30 — DELETE ALL
===============================================================================

After confirmation:
delete all system data:

domains,
tab_sessions,
snapshots,
link relationships/workstream events,
user rules,
exclusions,
Workstreams,
activities,
focus metrics,
decision traces,
caches,
warning state,
settings as appropriate,
persisted timer checkpoint.
After success:

clear in-memory state,
UI shows clean state.
Failure:
tell user data may remain.

===============================================================================
39. DATA MODEL
===============================================================================

Canonical persisted entities must match DR requirements.

Domains:
domain, category, productivity_type, keywords.

Tab sessions:
session_id, url, start_time, end_time, dwell_time, idle_time, workstream_name.

Snapshots:
snapshot_id, title, saved_tabs, active_tab_index, timestamp.

Link/workstream event:
id, workstream_id, session_id, entered_at, exited_at, duration, previous_workstream_id, switch_penalty.

User rules:
rule_id, name, enabled, priority, condition, action, created_at.

Exclusion:
domain, added_at, reason.

Validate:

unique IDs,
valid dates,
nonnegative durations,
productivity in -1/0/+1.
===============================================================================
40. DATA RETENTION
===============================================================================

Activity sessions:
30 days by default.

Maintenance:
midnight cleanup.

Do not auto-delete domain rules/exclusions.

Snapshot retention is [To Be Specified] unless the repository has a formally approved project decision.

===============================================================================
41. FAILED WRITE / BUFFER
===============================================================================

If IndexedDB write fails:

preserve old records,
buffer up to 50 pending records,
retry every 15 seconds,
Settings shows warning badge,
browsing continues.
Never overwrite existing good records with failed writes.

===============================================================================
42. PERFORMANCE
===============================================================================

Target:

<=60MB background RAM,
tab tracking <15ms,
restoration of persisted snapshot/timer state <=50ms, excluding webpage network load.
Measure.

Do not fabricate.

If a target is not achieved, report it.

===============================================================================
43. SCALABILITY
===============================================================================

Support up to 100,000 activity session records.

Use indexed Dexie queries/ranges.

Do not load the entire history into RAM.

===============================================================================
44. SECURITY AND PRIVACY
===============================================================================

According to latest SRS:

activity logs are plain-text in IndexedDB,
protected by browser extension origin isolation and OS profile controls,
sensitive values scrubbed.
Scrub:

passwords,
tokens,
?auth=,
?token=,
form input values.
Do not claim encryption unless it is separately and actually implemented.

===============================================================================
45. NO EXTERNAL NETWORK
===============================================================================

Audit and remove:

analytics SDK,
telemetry,
crash reporting,
remote fonts,
remote images,
CDN dependencies,
remote inference,
remote API calls.
UI must load no external resources.

===============================================================================
46. ACCESSIBILITY
===============================================================================

WCAG 2.1 AA.

Every interactive control:

keyboard operable,
visible focus,
semantic label,
logical tab order.
Dialogs:

focus trap where appropriate,
ESC behaviour where appropriate,
aria labels,
accessible status messaging.
===============================================================================
47. ERROR STATES
===============================================================================

Do not represent every problem as zero.

Examples:

No data:
"no data available."

Untrackable:
"tracking unavailable."

Inactive:
"paused — inactive."

User paused:
"paused."

System sleep:
"paused — system sleep."

ML failure:
"local fallback mode."

DB write issue:
"pending local save."

===============================================================================
48. CURRENT SCREENSHOT BUG
===============================================================================

Fix the visible issue where:

tracking shows paused,
timer appears on chrome://extensions,
no active tab tracked,
Focus=0.
Correct behaviour:

chrome://extensions
→ UNTRACKABLE
→ no active dwell
→ no productivity downgrade
→ no fake Focus Score.

Also fix:

clipped navigation labels,
broken responsive layout,
inconsistent empty states,
fake demo metrics,
misleading status labels.
===============================================================================
49. UI QUALITY
===============================================================================

The UI must look finished, not like a prototype.

Use a coherent visual system:

dark premium interface if consistent with existing Atentiv branding,
clear hierarchy,
readable typography,
restrained glass effects,
consistent spacing,
consistent iconography,
meaningful loading states,
meaningful empty states,
clear status colors by semantic state,
no accidental text truncation.
Do not sacrifice usability for decoration.

===============================================================================
50. USER EXPERIENCE EXPLANATIONS
===============================================================================

Every important metric/action must have a small help explanation.

Examples:

Focus Score:
"Your current focus level, calculated from productive behaviour, stability and context switching."

Dwell Time:
"Active time Atentiv counts while you are engaged with a supported page."

CSP:
"Penalty generated by context switches; unrelated and rapid switches cost more."

Workstream:
"A connected group of pages that appears to belong to one task."

Excluded:
"This site is excluded and is not tracked or stored."

Do not expose technical jargon without a simple explanation.

===============================================================================
51. DECISION TRACE / EXPLAINABILITY
===============================================================================

When practical, store a local decision trace:

exclusion matched?
user rule matched?
user feedback matched?
domain matched?
cache matched?
ML result
ML confidence
keyword fallback
final category
activity
productivity
candidate Workstreams
final Workstream
switch decision
CSP contribution
warning trigger
This helps debugging and viva.

Do not store unnecessary raw page content.

===============================================================================
52. TESTING — UNIT
===============================================================================

Test:

dwell calculation,
inactivity threshold,
sleep/wake,
media state,
rule precedence,
domain lookup,
YouTube classification,
keyword scoring,
ML fallback,
link relationship,
Workstream threshold 0.68,
merge >3 tabs,
centroid >0.85,
split >15 continuous active minutes unrelated,
Workstream naming,
context switch,
SW values,
CU values,
CSP formula,
SP min(40,N*2),
Focus clamp,
T=0,
snapshots,
export,
deletion,
domain validation.
===============================================================================
53. TESTING — INTEGRATION
===============================================================================

Test:
Chrome event
→ session
→ page analysis
→ classification
→ activity
→ productivity
→ Workstream
→ context
→ CSP
→ Focus
→ IndexedDB
→ live UI.

Also test:

Service Worker restart,
database write failure,
warning cooldown,
exclusion after prior visits.
===============================================================================
54. TESTING — END TO END
===============================================================================

Create Playwright or equivalent E2E flows where practical.

Must include:

A. Supported page
B. Untrackable page
C. Inactivity
D. YouTube lecture
E. PDF lecture notes
F. Related tab switching
G. Unrelated rapid switching
H. Workstream formation
I. Workstream merge
J. Workstream split
K. Automatic snapshot
L. Quick Resume restore
M. Dashboard report
N. Options rule
O. Exclusion
P. Export
Q. Delete All
R. Worker restart/recovery

===============================================================================
55. TEST SCENARIO — YOUTUBE + PDF
===============================================================================

Required:

YouTube:
"Machine Learning Lecture"
→ classify Learning/Productive using title keyword rule.

PDF:
"Machine Learning Notes"
→ Research/Learning.

Switch repeatedly:
YouTube ↔ PDF.

Expected:

separate tab switches recorded,
same Workstream where evidence supports relation,
low/zero CU due to same Workstream,
low CSP,
no false distraction warning,
Dwell Time correct,
no overlap double counting.
===============================================================================
56. TEST SCENARIO — YOUTUBE ENTERTAINMENT
===============================================================================

YouTube:
"Funny Compilation"

Expected:

Entertainment
distracting by default
no learning promotion.
If user overrides YouTube as productive:
apply user rule.

===============================================================================
57. TEST SCENARIO — RAPID UNRELATED SWITCHING
===============================================================================

GitHub
→ Instagram
→ GitHub
→ Entertainment YouTube
→ Instagram
→ GitHub

Rapid intervals.

Expected:

context switches recorded,
SW=1.5 where <=45 sec,
CU high where unrelated,
CSP increases,
SP increases with N but caps at 40,
live warning only after configured warning condition,
no repeated spam during cooldown,
Dashboard report highlights if >6 switches/10min.
===============================================================================
58. TEST SCENARIO — TAB OPEN, USER DOES NOTHING
===============================================================================

Open page.
No interaction.

Before 3 minutes:
active timing continues according to SRS signals.

After >3 minutes:
pause.

Expected:

no additional Dwell Time during paused period,
idle_time increases separately,
metric calculations suspended,
UI says inactive/paused.
Resume after activity.

===============================================================================
59. TEST SCENARIO — MEDIA
===============================================================================

Play educational lecture in background.

No mouse/keyboard interaction.

Expected:

media detected,
inactivity pause exemption applies where FR-03 conditions are satisfied,
time attribution follows FR-03,
no double counting.
Try entertainment audio:
do not assume productive.

===============================================================================
60. TEST SCENARIO — RESTRICTED
===============================================================================

Open:
chrome://extensions

Expected:
UNTRACKABLE.

No:

title scan,
session,
dwell,
CSP,
focus deduction,
workstream.
===============================================================================
61. TEST SCENARIO — EXCLUSION
===============================================================================

Add example-sensitive.com to exclusion list.

Then visit it.

Expected:

no page extraction,
no session,
no links,
no snapshot,
no analytic value.
Previously stored records/traces for domain:
delete immediately as specified.

===============================================================================
62. TEST SCENARIO — SERVICE WORKER RESTART
===============================================================================

Start active session.

Persist checkpoint.

Stop/restart Worker.

Expected:

state recovered,
no duplicate session,
no negative duration,
no more than 30 seconds expected loss if actual environment supports requirement.
===============================================================================
63. TEST SCENARIO — DATABASE FAILURE
===============================================================================

Force a write failure in test environment.

Expected:

existing data preserved,
pending buffer up to 50,
retry every 15 sec,
UI badge/warning,
browsing unaffected.
===============================================================================
64. TEST SCENARIO — SNAPSHOT
===============================================================================

Create Workstream with multiple tabs.

Trigger:
two tabs closed within 10 seconds.

Expected:
automatic snapshot.

Then:
Quick Resume → restore.

Expected:
one selection,
new window,
saved order,
correct Workstream association.

===============================================================================
65. TEST SCENARIO — DASHBOARD RECONCILIATION
===============================================================================

For a selected period:
manually sum database dwell_time.

Dashboard total must exactly match the sum within expected formatting/rounding.

Same for:

categories,
Workstreams,
domain timeline.
===============================================================================
66. TEST SCENARIO — DELETE ALL
===============================================================================

Open Options.

Click Delete All.

Expected:
confirmation:
"This action cannot be undone."

Cancel:
no deletion.

Confirm:
all data cleared.

Restart extension:
clean empty state.

===============================================================================
67. TEST SCENARIO — EXPORT
===============================================================================

Export.

Expected:
atentiv-export.json

No network request.

Stored data remain unchanged.

Validate exported counts match database.

===============================================================================
68. DOCUMENTATION DELIVERABLES
===============================================================================

Create/update:

docs/architecture/

ARCHITECTURE.md
REPOSITORY_INVENTORY.md
CONSOLIDATION_REPORT.md
REQUIREMENT_TRACEABILITY.md
OPEN_ITEMS.md
DATA_FLOW.md
docs/workflows/

01-startup-recovery.md
02-tab-lifecycle.md
03-dwell-time.md
04-inactivity.md
05-media-awareness.md
06-trackability.md
07-privacy-exclusion.md
08-page-analysis.md
09-categorisation.md
10-user-rules.md
11-activity-inference.md
12-workstream-links.md
13-workstream-grouping.md
14-workstream-naming.md
15-context-switch.md
16-csp.md
17-focus-score.md
18-warning-system.md
19-snapshot-save.md
20-snapshot-restore.md
21-side-panel.md
22-dashboard.md
23-options.md
24-export-delete.md
docs/testing/

TEST_PLAN.md
TEST_MATRIX.md
E2E_SCENARIOS.md
PERFORMANCE_TESTS.md
PRIVACY_TESTS.md
docs/user-guide/

USER_GUIDE.md
FAQ.md
TROUBLESHOOTING.md
docs/viva/

VIVA_GUIDE.md
ARCHITECTURE_QUESTIONS.md
ALGORITHM_QUESTIONS.md
SECURITY_QUESTIONS.md
WORKSTREAM_QUESTIONS.md
docs/diagrams/

class diagram
DFD
use cases
sequence diagrams
===============================================================================
69. FILE STRUCTURE
===============================================================================

Adapt to the actual framework, but target:

src/
background/
content/
intelligence/
rules/
domains/
classifier/
activity/
productivity/
workstreams/
context-switch/
focus/
warnings/
analytics/
domain/
models/
types/
contracts/
persistence/
db/
repositories/
workspace/
snapshot/
restore/
ui/
sidepanel/
dashboard/
options/
hud/ # only if actually implemented
shared/
messaging/
constants/
utils/

tests/
unit/
integration/
e2e/

docs/
architecture/
workflows/
testing/
user-guide/
viva/
diagrams/

legacy/

===============================================================================
70. MESSAGING
===============================================================================

Centralize extension-internal message contracts.

Examples:

GET_LIVE_STATE
GET_FOCUS_SCORE
GET_ACTIVE_WORKSTREAM
GET_QUICK_RESUME
SAVE_SNAPSHOT
RESTORE_SNAPSHOT
SET_RULE
SET_EXCLUSION
EXPORT_DATA
DELETE_ALL
Do not spread arbitrary string messages throughout the project.

===============================================================================
71. UI-TO-DATA RULE
===============================================================================

UI is not the source of truth.

Source:
IndexedDB / Background Engine state.

UI:
presentation and interaction.

Never:

calculate business logic in a chart,
permanently hold analytics only in a component,
invent data when database is empty.
===============================================================================
72. EMPTY STATE QUALITY
===============================================================================

When no data:
show:

clear message,
why,
what user can do next.
Examples:
"No activity yet. Browse a supported webpage and Atentiv will begin tracking automatically."

"No saved workspaces yet. Save a Workstream or wait for an automatic snapshot."

"Focus Score unavailable because there is no tracked time."

"Tracking unavailable on Chrome internal pages."

===============================================================================
73. SETTINGS UX
===============================================================================

Settings should show clear descriptions:

Tracking:
"Automatically track supported webpages while enabled."

Inactivity Threshold:
"Pause active dwell after this many minutes without input."

Exclusions:
"Domains added here are ignored completely."

Productivity:
"Set how Atentiv treats a domain in future sessions."

Data:
"Export or permanently delete local data."

===============================================================================
74. USER FAQ MUST ANSWER SMALL QUESTIONS
===============================================================================

Create a FAQ that answers:

Why does opening a tab not immediately mean active time?
What is Dwell Time?
Why is a background tab not counted?
What happens when I stop touching the computer?
Why is a YouTube lecture productive but entertainment distracting?
Why doesn't every tab switch reduce my score?
What is the difference between tab switch and context switch?
What is a Workstream?
How does Atentiv decide Workstream membership?
Why is a page untrackable?
What happens on chrome:// pages?
How does CSP work?
How is Focus Score calculated?
What is PR?
What is SR?
What happens if there is not enough data for PR/SR?
Can I override a classification?
What happens when I exclude a domain?
What happens to old data when I add an exclusion?
How does Quick Resume work?
What exactly gets restored?
Where is my data stored?
Is IndexedDB encrypted?
Does Atentiv send data to a server?
What happens if the database write fails?
How long are sessions retained?
How do I export?
How do I permanently delete everything?
What browsers are supported?

Each answer must match the SRS/current implementation.

===============================================================================
75. VIVA EXPLANATION REQUIREMENT
===============================================================================

Prepare simple explanations for:

Architecture
MV3
Service Worker
Content Script
Dexie
IndexedDB
fastText
WASM
Workstream
Dwell Time
Inactivity
Media awareness
CSP
SW
CU
Focus Score
PR
SR
Snapshots
Local-first privacy
Exclusion list
Dashboard
Side Panel
Options

Every technical explanation should include:

what it is,
why it exists,
input,
processing,
output,
example.
===============================================================================
76. NO FALSE CLAIMS
===============================================================================

Never claim:

100% accuracy,
encryption,
all websites supported,
automatic retraining,
exact model performance,
performance targets achieved,
unless actually measured or implemented.
If not measured:
say "target" or "not yet verified."

If not implemented:
say "not implemented."

===============================================================================
77. FINAL BUILD/TYPECHECK/TEST GATE
===============================================================================

Do not declare completion until:

TypeScript typecheck passes,
production build passes,
tests pass or documented failures have explicit reasons,
extension loads successfully,
Service Worker runs,
Side Panel loads,
Dashboard loads,
Options loads,
content script loads on supported pages,
restricted pages are handled,
IndexedDB persists,
snapshots work,
export works,
delete works,
core test scenarios pass.
===============================================================================
78. FINAL DEMO CHECKLIST
===============================================================================

Before the demonstration:

Load extension.
Open a normal webpage.
Verify automatic tracking.
Open Side Panel.
Verify Live Focus.
Verify Workstream.
Open Google research.
Open relevant PDF.
Open YouTube lecture.
Alternate PDF/lecture.
Confirm no false high CSP.
Visit GitHub.
Visit Instagram.
Rapidly switch if demonstrating warning.
Show warning.
Show Dashboard.
Show Workstream Map.
Show Switch Penalty Report.
Show Options.
Add rule.
Add exclusion.
Demonstrate exclusion.
Save/trigger snapshot.
Quick Resume.
Restore.
Export.
Delete with confirmation.
Keep a clean demo browser profile so old test data do not confuse the evaluator.

===============================================================================
79. FINAL DELIVERY REPORT
===============================================================================

Create:

docs/architecture/FINAL_DELIVERY_REPORT.md

Include:

A. Canonical implementation path
B. Repository cleanup
C. Working modules
D. Workflows
E. Data model
F. Database
G. Classification
H. Activity
I. Workstream
J. Context/CSP
K. Focus
L. Warning system
M. Snapshot/restore
N. Side Panel
O. Dashboard
P. Options
Q. Privacy
R. Testing
S. Performance
T. Build/typecheck
U. Supported browsers
V. Open SRS items
W. Known limitations
X. Demo procedure

For every requirement:
IMPLEMENTED
PARTIALLY IMPLEMENTED
NOT IMPLEMENTED
BLOCKED / [TO BE SPECIFIED]

===============================================================================
80. EXECUTION ORDER
===============================================================================

Do not jump directly into UI polish.

Order:

PHASE 1 — repository inventory
PHASE 2 — version reconciliation
PHASE 3 — manifest/build audit
PHASE 4 — runtime bug fixes
PHASE 5 — session/timer correctness
PHASE 6 — inactivity/sleep
PHASE 7 — media awareness
PHASE 8 — privacy/exclusions
PHASE 9 — categorisation
PHASE 10 — activity
PHASE 11 — links/workstream
PHASE 12 — context/CSP
PHASE 13 — Focus Score
PHASE 14 — warning engine
PHASE 15 — snapshot/restore
PHASE 16 — Side Panel
PHASE 17 — Dashboard
PHASE 18 — Options
PHASE 19 — export/delete
PHASE 20 — explainability
PHASE 21 — tests
PHASE 22 — performance
PHASE 23 — documentation
PHASE 24 — final audit
PHASE 25 — final demo validation

===============================================================================
81. DEFINITION OF DONE
===============================================================================

Atentiv is DONE only when:

[ ] one canonical implementation exists
[ ] legacy versions are isolated
[ ] latest SRS is the baseline
[ ] three formal UIs exist
[ ] automatic tracking works
[ ] active dwell time is correct
[ ] inactivity is correct
[ ] sleep is correct
[ ] media awareness works
[ ] YouTube is context-sensitive
[ ] excluded domains are fully excluded
[ ] categorisation precedence is correct
[ ] link relationships are stored
[ ] Workstreams form correctly
[ ] Workstream thresholds match SRS
[ ] tab switch and context switch remain distinct
[ ] CSP matches FR-11
[ ] Focus matches FR-12
[ ] PR/SR ambiguity is documented
[ ] warning engine does not spam
[ ] snapshot conditions work
[ ] Quick Resume works
[ ] restore works
[ ] Dashboard totals reconcile
[ ] Workstream map matches links
[ ] switch report matches >6/10min threshold
[ ] Options work
[ ] export works
[ ] delete works
[ ] local-first privacy holds
[ ] no external Atentiv network requests
[ ] UI has real data
[ ] no fake metrics
[ ] accessibility implemented
[ ] build passes
[ ] typecheck passes
[ ] critical tests pass
[ ] final report exists
[ ] final README identifies canonical Atentiv

===============================================================================
82. FINAL RESPONSE FORMAT
===============================================================================

Return:

ATENTIV — FINAL DELIVERY STATUS

Canonical Version
Repository Cleanup
Tracking & Dwell Time
Inactivity & Sleep
Media
Privacy/Exclusion
Categorisation
Activity
Workstreams
Context Switch / CSP
Focus Score
Warning System
Snapshots
Side Panel
Dashboard
Options
Database
Export/Delete
Testing
Performance
Build/Typecheck
Documentation
Remaining SRS Open Items
Known Limitations
Demo Ready Status
Do not say "complete" if any required feature is not actually verified.



0
Focus Score: 0
chatgpt.com Productive
Workstream
Open All
Tab 1
Focus 0

Loading older messages…












FocusScore
=
100
(
0.65
P
+
0.35
S
)
−
Penalty
 


F
=
(
P
−
U
T
×
100
)
−
C
S
P
 
P
U
T
C
S
P



FocusScore
=
100
×
(
0.65
P
+
0.35
S
)
−
Penalty

P
S


P
∈
[
0
,
1
]

S
∈
[
0
,
1
]




P
=
productive time
total tracked time
 

P
=
70
100
=
0.70
 






0.65
P

P
=
0.70

0.65
×
0.70
=
0.455



S

S







65
%

35
%





P
=
0.70

S
=
0.80

0.65
P
=
0.65
(
0.70
)
=
0.455

0.35
S
=
0.35
(
0.80
)
=
0.28

0.455
+
0.28
=
0.735

0.735
×
100
=
73.5

P
e
n
a
l
t
y
=
8

F
o
c
u
s
S
c
o
r
e
=
73.5
−
8
F
o
c
u
s
S
c
o
r
e
=
65.5
 

65.5
/
100
 






P
e
n
a
l
t
y
=
f
(
context switches
)



100
(
0.65
(
0.9
)
+
0.35
(
0.9
)
)
=
100
(
0.585
+
0.315
)
=
90

P
e
n
a
l
t
y
=
2

F
o
c
u
s
=
90
−
2
=
88



F
o
c
u
s
=
90
−
25
=
65



0.65
+
0.35
=
1
P
S


P
=
0
,
S
=
0
100
(
0.65
(
0
)
+
0.35
(
0
)
)
=
0
P
=
1
,
S
=
1
100
(
0.65
+
0.35
)
=
100

0
≤
100
(
0.65
P
+
0.35
S
)
≤
100


B
a
s
e
S
c
o
r
e
=
10

P
e
n
a
l
t
y
=
20

F
o
c
u
s
S
c
o
r
e
=
10
−
20
=
−
10


F
o
c
u
s
S
c
o
r
e
=
max

(
0
,
min

(
100
,
F
o
c
u
s
S
c
o
r
e
)
)


−
10
→
0

105
→
100

P
=
productive time
tracked time
 

S
=
f
(
context continuity, switches, session stability
)
B
=
0.65
P
+
0.35
S
B

B
100
=
100
B
 
P
e
n
a
l
t
y
=
f
(
unrelated context switches
)
F
=
100
(
0.65
P
+
0.35
S
)
−
P
e
n
a
l
t
y
 
F
=
max

(
0
,
min

(
100
,
F
)
)
 



P
=
72
120
=
0.60
 

S
=
0.75

0.65
(
0.60
)
=
0.39
0.35
(
0.75
)
=
0.2625

0.39
+
0.2625
=
0.6525
100
(
0.6525
)
=
65.25

P
e
n
a
l
t
y
=
7

65.25
−
7
=
58.25

58.25
/
100
 








S
=
1
−
normalized_switch_rate

normalized switch rate
=
0.2

S
=
1
−
0.2
=
0.8
S


S
=
w
1
(
workstream continuity
)
+
w
2
(
session continuity
)
+
w
3
(
switch stability
)
  
  
 
S


F
=
(
P
−
U
T
×
100
)
−
C
S
P
 
 
















































F
=
(
P
−
U
T
×
100
)
−
C
S
P
 











F
=
round

(
100
(
0.65
P
R
+
0.35
S
R
)
)
−
S
P

S
P
=
min

(
40
,
N
×
2
)

(
(
P
−
U
)
/
T
×
100
)
−
C
S
P





C
S
P
=
∑
(
S
W
×
C
U
)
























C
S
P
=
∑
(
S
W
×
C
U
)

S
W
=
1.5
for switches ≤45 seconds

C
U
=
{
0
same Workstream/same tab
1
same category
2
related categories
4
unrelated categories
  
  
 


F
=
round

(
100
(
0.65
P
R
+
0.35
S
R
)
)
−
S
P

S
P
=
min

(
40
,
N
×
2
)

















ATENTIV — PRODUCT-READY MASTER ANTIGRAVITY PROMPT
Full End-to-End Implementation, Reconciliation, Testing, UX, Workstream, Focus, Privacy and Delivery
Authority: Latest Atentiv SRS Revision 3.1 / Submission Version 3.0
You are the principal engineer for the EXISTING Atentiv repository.

Your assignment is to finish the project as a coherent, end-to-end, development-ready product-quality academic implementation by TOMORROW'S DEMONSTRATION DEADLINE.

This is NOT permission to create another prototype.

This is a repository-first execution task:

inspect first,
reconcile versions,
implement against the latest SRS,
fix actual bugs,
complete all critical workflows,
test every case,
document what is complete,
clearly isolate anything still unspecified.
Do not merely produce a plan. Make the changes in the repository.

===============================================================================
0. ABSOLUTE RULE: ONE CANONICAL ATENTIV
===============================================================================

The repository may contain several versions of Atentiv.

Before editing:

Inventory the complete repository.
Find all duplicate implementations.
Find all manifests and entry points.
Find all background/service workers.
Find all content scripts.
Find all Side Panels.
Find all Dashboards.
Find all Options pages.
Find all HUD implementations.
Find all tracking/session implementations.
Find all workstream implementations.
Find all Focus Score implementations.
Find all databases/Dexie layers.
Find all classifiers/ML runtimes.
Find all snapshot implementations.
Find all test suites.
Find all documentation and diagrams.
Determine which implementation is actually active by checking:

manifest references,
package scripts,
build entry points,
imports,
runtime wiring,
actual extension load path,
recent git history if available.
Do not determine "latest" from filenames alone.

Then classify each duplicate as:
KEEP
MERGE
REPLACE
ARCHIVE
REMOVE

Preserve useful historical work under legacy/.

There must be ONE active canonical implementation.

At the end:
README must clearly state:
"This repository contains one canonical Atentiv implementation. Previous prototypes are archived under legacy/."

No archived code may be imported by the active build.

===============================================================================

SOURCE OF TRUTH
The latest Atentiv SRS Revision 3.1 is the authoritative requirements baseline.

Follow these groups:

FR-01 to FR-24
UIR-01 to UIR-07
SI-01 to SI-09
NFR-* requirements
DR-01 to DR-15
SC-01 to SC-09
OR-01 to OR-05
Appendix A
Appendix B
Appendix C
The SRS is more authoritative than older design notes.

Do not silently downgrade or replace current SRS requirements with assumptions from Version 2.0.

Where the SRS explicitly says [To Be Specified], do not fabricate a claim that the SRS defines the missing value.

===============================================================================
2. NON-NEGOTIABLE PRODUCT PRINCIPLES
===============================================================================

Atentiv is:

a Manifest V3 browser extension,
Zero-Server,
Local-First,
on-device,
privacy-preserving,
context-aware,
focused on active browsing,
Workstream-oriented rather than tab-count-only.
Atentiv shall NOT:

upload browsing history,
send page titles to a server,
use cloud analytics,
use third-party telemetry,
use remote ML inference,
require an account,
synchronize data to a server,
silently collect excluded data.
The browser may load normal webpages on the user's behalf. Those browser network requests are not Atentiv telemetry.

===============================================================================
3. REQUIRED TECHNOLOGY STACK
===============================================================================

Use the technology choices in the latest SRS:

TypeScript 5.7+ strict mode
React 19
Vite 6
esbuild for Service Worker and Content Script
CSS Modules
CSS Custom Properties
Shadow DOM root #atentiv-v3 where injected HUD exists
native SVG/Canvas for gauges, timelines and charts
lucide-react
Dexie.js 4.4+
IndexedDB
fastText compiled to WebAssembly SIMD
Do not add remote infrastructure.

===============================================================================
4. FORMAL USER INTERFACES
===============================================================================

The latest SRS requires exactly three formal user interfaces:

sidepanel.html
dashboard.html
options.html
Side Panel:

Live Focus Score
Active Workstream
Quick Resume
Dashboard:

Activity Time Charts
Workstream Maps
Switch Penalty Reports
Options:

category customization
productivity customization
Exclusion List
export
delete
A Compact/Full HUD may exist as an additional interaction layer ONLY if it does not replace the three formal SRS interfaces.

If an older implementation makes toolbar click open a New Tab:

inspect it,
preserve an optional New Tab experience only if it does not conflict,
ensure the normal extension action does not incorrectly redirect to a New Tab.
===============================================================================
5. FIRST TASK — REPOSITORY FORENSICS
===============================================================================

Create:
docs/architecture/REPOSITORY_INVENTORY.md

Include:

active manifest
active Service Worker
active Content Script
active Side Panel
active Dashboard
active Options page
active HUD if present
active database layer
active classifier
active Workstream implementation
active Focus implementation
test entry points
duplicated/legacy files
unresolved conflicts
Do not modify architecture until this report exists.

===============================================================================
6. CANONICAL ARCHITECTURE
===============================================================================

Use this logical architecture:

USER
↓
CHROMIUM BROWSER
↓
Browser Event Monitor
↓
Background Engine / Service Worker
↓
Local Database
↓
Side Panel / Dashboard / Options

Internally the Background Engine may be organized as:

ATLAS
Atentiv Tab Lifecycle and Activity-State System

ATLAS is an internal architecture/orchestration term.
It is NOT:

an npm package,
framework,
external engine,
cloud service,
ML model.
Recommended decomposition:

BrowserEventMonitor
SessionManager
PrivacyManager
RuleEngine
DomainLibrary
PageAnalyzer
MLClassifier
ActivityEngine
ProductivityEngine
WorkstreamEngine
ContextSwitchEngine
FocusEngine
SnapshotManager
AnalyticsEngine
WarningEngine if implemented
===============================================================================
7. ARCHITECTURE DEPENDENCY DIRECTION
===============================================================================

Enforce:

Browser APIs
↓
Background/Event layer
↓
Domain/Intelligence layer
↓
Repositories
↓
Dexie
↓
IndexedDB

UI:
UI
↓
application/query service
↓
domain/analytics
↓
repositories
↓
Dexie
↓
IndexedDB

Do NOT:

let every React component query IndexedDB independently,
create multiple database abstractions,
create multiple competing business-logic engines.
===============================================================================
8. LIVE STATE
===============================================================================

Use one canonical live state model.

Suggested:

type TrackingState =
  | "TRACKING"
  | "INACTIVE"
  | "PAUSED"
  | "SYSTEM_SLEEP"
  | "UNTRACKABLE"
  | "NO_ACTIVE_SESSION";

interface LiveAtentivState {
  trackingState: TrackingState;
  activeTabId?: number;
  domain?: string;
  title?: string;
  category?: string;
  activityType?: string;
  productivityType?: -1 | 0 | 1;
  activeWorkstreamId?: string;
  activeWorkstreamName?: string;
  activeDwellSeconds: number;
  idleSeconds: number;
  contextSwitchCount: number;
  csp: number;
  focusScore?: number;
  mediaPlaying?: boolean;
}
Adapt it to actual implementation, do not duplicate types.

===============================================================================
9. WORKFLOW 01 — STARTUP / SERVICE WORKER RECOVERY
===============================================================================

On extension start:

initialize Service Worker,
initialize Dexie,
load settings,
load rules,
load exclusions,
load timer checkpoint,
load pending write buffer if supported,
recover active tab/session state,
recover current Workstream,
initialize classifier/model metadata,
reconcile with current browser state,
mark system ready.
Because MV3 Service Workers can stop:

timer correctness cannot depend only on RAM,
persist timer checkpoint,
use browser alarms heartbeat,
recover after restart.
Latest SRS:

continuous checkpointing,
expected maximum tracked-activity loss is 30 seconds,
heartbeat every 30 seconds,
if the heartbeat gap exceeds 90 seconds, classify excess gap as system sleep and exclude it from Dwell Time.
===============================================================================
10. WORKFLOW 02 — TAB LIFECYCLE
===============================================================================

Handle:

tab created
tab activated
tab updated/navigation
tab removed
window focus changed
idle state changed
media state
Rules:

at most one ordinary active tab accumulates ordinary Dwell Time at any instant,
background tabs do not accumulate ordinary Dwell Time,
a tab that has only been created but not actively viewed does not receive active dwell,
navigation ends the old URL interval and begins a new page interval,
window blur pauses active timing,
tab removal closes any active interval safely.
Avoid negative or undefined durations.

===============================================================================
11. WORKFLOW 03 — TRACKABILITY / RESTRICTED PAGES
===============================================================================

Restricted browser protocols such as:

chrome://
edge://
must be treated as UNTRACKABLE.
For an untrackable page:

no content-script extraction,
no page keyword scan,
no normal activity session,
no Dwell Time,
no link relationship,
no snapshot inclusion,
no productivity deduction,
no false Focus Score.
UI example:

"Tracking unavailable on this browser page.
Atentiv will resume automatically on a supported webpage."

Do not call this an inactivity failure.

Differentiate:
UNTRACKABLE
vs
PAUSED
vs
INACTIVE
vs
NO_ACTIVE_SESSION.

===============================================================================
12. WORKFLOW 04 — INACTIVITY / "TAB OPEN BUT USER DOES NOTHING"
===============================================================================

The latest SRS is explicit:

Default Inactivity Threshold:
3 minutes = 180 seconds.

Configurable range:
1–10 minutes.

Logic:

page/tab is active,
user interacts,
active Dwell Time accumulates,
no keyboard/mouse activity,
once threshold is exceeded and no qualifying media playback exists,
timer pauses,
paused time is excluded from Dwell Time,
metric calculation is suspended during the pause,
idle time can be recorded separately as idle_time,
when activity resumes, active timing resumes.
Critical:
The period from last activity to threshold crossing must not be retroactively counted as active dwell.

Do not simply keep incrementing a timer for the whole wall-clock interval.

Use timestamps.

===============================================================================
13. WORKFLOW 05 — SYSTEM SLEEP
===============================================================================

When system/browser reports sleep/locked state:

pause Dwell Time,
suspend metric calculation,
record sufficient checkpoint state,
resume after wake.
Heartbeat fallback:

Chrome alarms every 30 seconds,
if gap >90 seconds, excess is considered system sleep and excluded.
===============================================================================
14. WORKFLOW 06 — MEDIA PLAYBACK
===============================================================================

FR-03 is an explicit exception.

Atentiv must detect media state in foreground/background tabs where browser APIs permit.

A background tab can contribute media playback time to Dwell Time ONLY when:

tab is audible,
media is playing,
effective category is Learning, Research, or Communication.
Examples:

lecture
podcast
meeting
Do NOT:

count all background tabs,
classify every YouTube video as productive,
automatically make media productive,
double count the same real-world time.
If media state cannot be determined:
treat it as not playing media.

===============================================================================
15. WORKFLOW 07 — NO DOUBLE COUNTING
===============================================================================

The analytics model must maintain mathematically coherent time.

If:

PDF foreground = 10 minutes
educational YouTube background = 10 minutes
do not blindly count 20 minutes of total human elapsed time.

Represent:

primary tab activity,
media-assisted state,
actual attributed time,
workstream association.
Ensure dashboard totals reconcile to stored session records.

===============================================================================
16. WORKFLOW 08 — PRIVACY CHECK
===============================================================================

The Exclusion List is checked BEFORE page extraction.

If excluded:
STOP.

Do not:

read title,
scan headings,
scan visible text,
create Dwell Time,
create activity session,
create link relationship,
include in snapshot,
display analytic data.
When user adds domain to Exclusion List:

delete previously stored activity session records for that domain,
delete classification decision traces for that domain,
apply exclusion immediately to future activity.
===============================================================================
17. WORKFLOW 09 — PAGE EXTRACTION
===============================================================================

For permitted accessible pages:

title
og:description
up to 20 H1-H3 headings
up to 2 KB visible text from main/article where accessible
Local processing:

strip markup,
normalize punctuation,
lowercase/stem as implemented,
remove English stop words for keyword scoring.
Never capture:

passwords,
form values,
typed keystrokes,
unnecessary HTML,
secrets.
MutationObserver:

debounce,
feature hash,
re-analyze only when meaningful page context changes.
===============================================================================
18. WORKFLOW 10 — CATEGORISATION PRECEDENCE
===============================================================================

Use EXACT latest SRS precedence:

Exclusion List
Explicit user rule
User feedback override
Preset domain list
Inference cache for identical content
local fastText model
keyword dictionary scoring
default category "Other" with neutral productivity
Do not move ML ahead of rules.

===============================================================================
19. WORKFLOW 11 — DOMAIN CLASSIFICATION
===============================================================================

Bundled domain data:

100 curated domains,

category,
default productivity,
default activity.
Examples:

GitHub → productive
arXiv → productive
StackOverflow → productive
Wikipedia → neutral
mail → neutral
Reddit/social/Netflix/Instagram → distracting
YouTube → distracting by default
Use SRS examples exactly where relevant.

===============================================================================
20. WORKFLOW 12 — YOUTUBE RULE
===============================================================================

YouTube default:

distracting (-1)
Promote to productive (+1) when title contains qualifying education terms such as:

lecture
tutorial
course
documentation
This is page-sensitive classification.

Example:

"YouTube — Machine Learning Lecture"
→ likely Learning / Productive

"YouTube — Funny Compilation"
→ Entertainment / Distracting

Do not make the domain rule alone decide all YouTube pages.

User rule can override it.

===============================================================================
21. WORKFLOW 13 — USER FEEDBACK / OVERRIDE
===============================================================================

User rules:

category
productivity value
optional activity/workstream action where supported
Rule conditions:

domain_exact
domain_contains
title_contains
url_prefix
Rules:

UUID v4 rule_id
priority 100–200
enabled
created_at
Historical sessions keep historical classification.
A changed rule applies immediately to future sessions.
If "Re-calculate Today" exists, only today's records are re-scored.

===============================================================================
22. WORKFLOW 14 — ACTIVITY INFERENCE
===============================================================================

Separate:
CATEGORY
ACTIVITY
PRODUCTIVITY
WORKSTREAM

Examples:

Google + "Python import error" → Research
StackOverflow + specific error → Debugging
GitHub repository → Development
YouTube ML lecture → Learning
documentation page → Reading/Research
Keep activity inference explainable and deterministic where possible.

===============================================================================
23. WORKFLOW 15 — LINK RELATIONSHIPS
===============================================================================

Record navigation chains.

Example:
Google result → StackOverflow → GitHub

Store relationship fields based on DR-04:

id
workstream_id
session_id
entered_at
exited_at
duration
previous_workstream_id
switch_penalty
If source unknown:

do not fabricate it,
no relationship is stored,
destination may start a chain.
Excluded source/destination:

do not store relationship.
===============================================================================
24. WORKFLOW 16 — WORKSTREAM GROUPING
===============================================================================

Workstream = set of pages related to one task.

FR-06 requirements:

automatic assignment,
one Workstream maximum per tracked page at a time.
For the canonical example:
Google search
→ StackOverflow
→ GitHub
→ Python documentation

ALL FOUR must be able to belong to one Workstream.

Use:

link connectivity,
semantic title-vector similarity,
cosine similarity >= 0.68,
shared category/activity,
activation temporal proximity within 20 minutes,
no intervening unrelated distraction block.
Merge:

3 shared tabs
OR

centroid cosine similarity >0.85.
Split:

unrelated topic sustained for >15 continuous active minutes.
A page without link relationship is not assigned to a Workstream until connected.

Do not substitute older thresholds without documenting a formal change.

===============================================================================
25. WORKFLOW 17 — WORKSTREAM NAMING
===============================================================================

Every Workstream needs a descriptive name.

Naming order:

most frequent meaningful noun/bigram in titles,
fallback category + active domain,
final fallback "General Browsing" or "Task Session #".
The name is used in:

Side Panel,
tab_sessions.workstream_name,
Snapshot title basis.
===============================================================================
26. WORKFLOW 18 — TAB SWITCH VS CONTEXT SWITCH
===============================================================================

NEVER equate a tab event with a Context Switch.

Tab switch:
browser event.

Context Switch:
task/attention context change represented by the user's page sequence.

Examples:
YouTube lecture ↔ PDF
→ may be same Workstream
→ low/zero CU

GitHub ↔ Instagram
→ likely unrelated
→ high CU

All context decisions must consider:

previous category
current category
previous Workstream
current Workstream
activity
relation/link evidence
timing
===============================================================================
27. WORKFLOW 19 — CSP
===============================================================================

Use exact FR-11 formula:

CSP = Σ(SW × CU)

Switch Weight:

SW = 1.5 if <=45 seconds since previous switch
SW = 1.0 otherwise
Category Unrelatedness:

CU = 0 same Workstream or same tab
CU = 1 same category
CU = 2 related categories
CU = 4 unrelated categories
Missing category:

treat as neutral,
CU = 2.
CSP must never be negative.

No Context Switches:
CSP = 0.

Store switch_penalty per switch as required.

===============================================================================
28. WORKFLOW 20 — FOCUS SCORE
===============================================================================

Production formula is FR-12.1:

F = round(100 × (0.65 × PR + 0.35 × SR)) − SP

SP = min(40, N × 2)

where:

PR = Productive Ratio
SR = Stability Ratio
N = Context Switch count.
Clamp:
0 <= F <= 100.

IMPORTANT:
PR and SR are explicitly [To Be Specified] in the current SRS.

Do NOT invent and claim the SRS defined them.

Search the repository for an approved stakeholder/project definition.

If none exists:

create a clear strategy interface/configuration,
document the provisional definition,
mark it as "Implementation Assumption — SRS leaves this unspecified",
do not rewrite the SRS.
Also preserve:

CSP as the detailed FR-11 metric,
SP as the FR-12 score deduction.
Do not confuse CSP and SP.

FR-12:
same input → same score.

T = 0:
do not calculate score,
UI says no data available.

===============================================================================
29. WORKFLOW 21 — EXAMPLE / STUDY SCENARIO
===============================================================================

Scenario:

09:00 Google ML search
09:05 research PDF
09:15 YouTube ML lecture
09:30 PDF
09:45 GitHub
10:00 Instagram
10:00:30 GitHub
10:01 Instagram
10:01:30 GitHub

Expected:
First educational/technical sequence can form one Workstream.
PDF ↔ lecture should NOT automatically be considered harmful.
Instagram/GitHub rapid unrelated switching can increase CSP.
SW = 1.5 for <=45 second switches.
Formal Dashboard report highlights windows with >6 switches in 10 minutes.

Do not trigger a live warning merely because a user alternated related tabs.

===============================================================================
30. WORKFLOW 22 — LIVE WARNING SYSTEM
===============================================================================

The SRS formally defines a Dashboard report threshold:
more than 6 Context Switches in a 10-minute window.

A live intervention is an additional UX behaviour and must not replace FR-19.

Build one WarningEngine.

Warning types:

RAPID_CONTEXT_SWITCH
DISTRACTION_SPIKE
WORKSTREAM_INSTABILITY
INACTIVITY
UNTRACKABLE
Recommended live warning:
3+ unrelated context switches within 60 seconds.

This is an implementation policy, not an SRS requirement.

Warning cooldown:
recommended starting value 5 minutes.

No blocking.
No forced navigation.
No shame.

Example:

"Focus Interrupted
You have switched between unrelated contexts several times in the last minute.
Current Workstream: Python Debugging"

Actions:
[Stay with this Workstream]
[Dismiss]

===============================================================================
31. WORKFLOW 23 — FORMAL SWITCH PENALTY REPORT
===============================================================================

Dashboard:
if >6 Context Switches occur within 10 minutes:
highlight period amber/red.

Show:

period start
period end
number of switches
CSP
relevant Workstream/categories
If nothing qualifies:
"No high-penalty periods were found."

===============================================================================
32. WORKFLOW 24 — AUTOMATIC SNAPSHOT
===============================================================================

Automatic snapshot triggers:
A. two or more tabs of active Workstream closed within 10 seconds,
OR
B. user leaves Workstream that had >=30 minutes continuous Dwell Time,
OR
C. user selects "Take Snapshot."

Snapshot:

snapshot_id
title
saved_tabs
active_tab_index
timestamp
SavedTab:

url
title
favicon URL
category tag
Do not include excluded domains.

Do not capture:

window layout,
scroll position,
form content,
unless the SRS is changed.
===============================================================================
33. WORKFLOW 25 — RESTORE
===============================================================================

One user selection:
→ read snapshot
→ create/open a new browser window as required
→ open URLs in stored order
→ reconnect them to the Workstream.

If a URL fails:

continue other tabs,
tell the user which tab failed.
Do not claim in-page state restoration.

50ms requirement excludes webpage load time.

===============================================================================
34. WORKFLOW 26 — SIDE PANEL
===============================================================================

sidepanel.html:

Mandatory:

Live Focus Score,
Active Workstream,
Quick Resume.
Updates:

storage changes immediately,
live clock/session duration every 1 second.
No data:
"no data available."

No Workstream:
"no Active Workstream."

Ensure narrow Side Panel layout is responsive.

No clipped labels.
No overflow.
Keyboard accessible.

===============================================================================
35. WORKFLOW 27 — DASHBOARD
===============================================================================

dashboard.html:

A. Activity Time Charts

category time
Today hourly
Last 7 Days daily
Required chart types:

hourly context-switch frequency bar chart,
pie/donut by Workstream or domain,
horizontal-bar domain timeline.
Totals MUST equal persisted dwell_time aggregates.

B. Workstream Maps

domains as nodes/clusters,
link relationships as edges,
expandable page-title flyout.
C. Switch Penalty Reports

highlight >6 Context Switches / 10-minute window,
show time span and CSP.
No data:
clear no-data state.

===============================================================================
36. WORKFLOW 28 — OPTIONS
===============================================================================

options.html:

create/edit/delete category rule,
productivity customisation,
exclusion list,
export,
delete all.
Domain validation:
reject invalid domains.

Delete All:
requires confirmation that explicitly says it cannot be undone.

===============================================================================
37. WORKFLOW 29 — EXPORT
===============================================================================

One explicit user action.

Output:
atentiv-export.json

Contains:

sessions,
Workstreams,
decision traces,
metrics,
all necessary persisted entities.
No network.

Cancel/failure:
do not change stored data.

===============================================================================
38. WORKFLOW 30 — DELETE ALL
===============================================================================

After confirmation:
delete all system data:

domains,
tab_sessions,
snapshots,
link relationships/workstream events,
user rules,
exclusions,
Workstreams,
activities,
focus metrics,
decision traces,
caches,
warning state,
settings as appropriate,
persisted timer checkpoint.
After success:

clear in-memory state,
UI shows clean state.
Failure:
tell user data may remain.

===============================================================================
39. DATA MODEL
===============================================================================

Canonical persisted entities must match DR requirements.

Domains:
domain, category, productivity_type, keywords.

Tab sessions:
session_id, url, start_time, end_time, dwell_time, idle_time, workstream_name.

Snapshots:
snapshot_id, title, saved_tabs, active_tab_index, timestamp.

Link/workstream event:
id, workstream_id, session_id, entered_at, exited_at, duration, previous_workstream_id, switch_penalty.

User rules:
rule_id, name, enabled, priority, condition, action, created_at.

Exclusion:
domain, added_at, reason.

Validate:

unique IDs,
valid dates,
nonnegative durations,
productivity in -1/0/+1.
===============================================================================
40. DATA RETENTION
===============================================================================

Activity sessions:
30 days by default.

Maintenance:
midnight cleanup.

Do not auto-delete domain rules/exclusions.

Snapshot retention is [To Be Specified] unless the repository has a formally approved project decision.

===============================================================================
41. FAILED WRITE / BUFFER
===============================================================================

If IndexedDB write fails:

preserve old records,
buffer up to 50 pending records,
retry every 15 seconds,
Settings shows warning badge,
browsing continues.
Never overwrite existing good records with failed writes.

===============================================================================
42. PERFORMANCE
===============================================================================

Target:

<=60MB background RAM,
tab tracking <15ms,
restoration of persisted snapshot/timer state <=50ms, excluding webpage network load.
Measure.

Do not fabricate.

If a target is not achieved, report it.

===============================================================================
43. SCALABILITY
===============================================================================

Support up to 100,000 activity session records.

Use indexed Dexie queries/ranges.

Do not load the entire history into RAM.

===============================================================================
44. SECURITY AND PRIVACY
===============================================================================

According to latest SRS:

activity logs are plain-text in IndexedDB,
protected by browser extension origin isolation and OS profile controls,
sensitive values scrubbed.
Scrub:

passwords,
tokens,
?auth=,
?token=,
form input values.
Do not claim encryption unless it is separately and actually implemented.

===============================================================================
45. NO EXTERNAL NETWORK
===============================================================================

Audit and remove:

analytics SDK,
telemetry,
crash reporting,
remote fonts,
remote images,
CDN dependencies,
remote inference,
remote API calls.
UI must load no external resources.

===============================================================================
46. ACCESSIBILITY
===============================================================================

WCAG 2.1 AA.

Every interactive control:

keyboard operable,
visible focus,
semantic label,
logical tab order.
Dialogs:

focus trap where appropriate,
ESC behaviour where appropriate,
aria labels,
accessible status messaging.
===============================================================================
47. ERROR STATES
===============================================================================

Do not represent every problem as zero.

Examples:

No data:
"no data available."

Untrackable:
"tracking unavailable."

Inactive:
"paused — inactive."

User paused:
"paused."

System sleep:
"paused — system sleep."

ML failure:
"local fallback mode."

DB write issue:
"pending local save."

===============================================================================
48. CURRENT SCREENSHOT BUG
===============================================================================

Fix the visible issue where:

tracking shows paused,
timer appears on chrome://extensions,
no active tab tracked,
Focus=0.
Correct behaviour:

chrome://extensions
→ UNTRACKABLE
→ no active dwell
→ no productivity downgrade
→ no fake Focus Score.

Also fix:

clipped navigation labels,
broken responsive layout,
inconsistent empty states,
fake demo metrics,
misleading status labels.
===============================================================================
49. UI QUALITY
===============================================================================

The UI must look finished, not like a prototype.

Use a coherent visual system:

dark premium interface if consistent with existing Atentiv branding,
clear hierarchy,
readable typography,
restrained glass effects,
consistent spacing,
consistent iconography,
meaningful loading states,
meaningful empty states,
clear status colors by semantic state,
no accidental text truncation.
Do not sacrifice usability for decoration.

===============================================================================
50. USER EXPERIENCE EXPLANATIONS
===============================================================================

Every important metric/action must have a small help explanation.

Examples:

Focus Score:
"Your current focus level, calculated from productive behaviour, stability and context switching."

Dwell Time:
"Active time Atentiv counts while you are engaged with a supported page."

CSP:
"Penalty generated by context switches; unrelated and rapid switches cost more."

Workstream:
"A connected group of pages that appears to belong to one task."

Excluded:
"This site is excluded and is not tracked or stored."

Do not expose technical jargon without a simple explanation.

===============================================================================
51. DECISION TRACE / EXPLAINABILITY
===============================================================================

When practical, store a local decision trace:

exclusion matched?
user rule matched?
user feedback matched?
domain matched?
cache matched?
ML result
ML confidence
keyword fallback
final category
activity
productivity
candidate Workstreams
final Workstream
switch decision
CSP contribution
warning trigger
This helps debugging and viva.

Do not store unnecessary raw page content.

===============================================================================
52. TESTING — UNIT
===============================================================================

Test:

dwell calculation,
inactivity threshold,
sleep/wake,
media state,
rule precedence,
domain lookup,
YouTube classification,
keyword scoring,
ML fallback,
link relationship,
Workstream threshold 0.68,
merge >3 tabs,
centroid >0.85,
split >15 continuous active minutes unrelated,
Workstream naming,
context switch,
SW values,
CU values,
CSP formula,
SP min(40,N*2),
Focus clamp,
T=0,
snapshots,
export,
deletion,
domain validation.
===============================================================================
53. TESTING — INTEGRATION
===============================================================================

Test:
Chrome event
→ session
→ page analysis
→ classification
→ activity
→ productivity
→ Workstream
→ context
→ CSP
→ Focus
→ IndexedDB
→ live UI.

Also test:

Service Worker restart,
database write failure,
warning cooldown,
exclusion after prior visits.
===============================================================================
54. TESTING — END TO END
===============================================================================

Create Playwright or equivalent E2E flows where practical.

Must include:

A. Supported page
B. Untrackable page
C. Inactivity
D. YouTube lecture
E. PDF lecture notes
F. Related tab switching
G. Unrelated rapid switching
H. Workstream formation
I. Workstream merge
J. Workstream split
K. Automatic snapshot
L. Quick Resume restore
M. Dashboard report
N. Options rule
O. Exclusion
P. Export
Q. Delete All
R. Worker restart/recovery

===============================================================================
55. TEST SCENARIO — YOUTUBE + PDF
===============================================================================

Required:

YouTube:
"Machine Learning Lecture"
→ classify Learning/Productive using title keyword rule.

PDF:
"Machine Learning Notes"
→ Research/Learning.

Switch repeatedly:
YouTube ↔ PDF.

Expected:

separate tab switches recorded,
same Workstream where evidence supports relation,
low/zero CU due to same Workstream,
low CSP,
no false distraction warning,
Dwell Time correct,
no overlap double counting.
===============================================================================
56. TEST SCENARIO — YOUTUBE ENTERTAINMENT
===============================================================================

YouTube:
"Funny Compilation"

Expected:

Entertainment
distracting by default
no learning promotion.
If user overrides YouTube as productive:
apply user rule.

===============================================================================
57. TEST SCENARIO — RAPID UNRELATED SWITCHING
===============================================================================

GitHub
→ Instagram
→ GitHub
→ Entertainment YouTube
→ Instagram
→ GitHub

Rapid intervals.

Expected:

context switches recorded,
SW=1.5 where <=45 sec,
CU high where unrelated,
CSP increases,
SP increases with N but caps at 40,
live warning only after configured warning condition,
no repeated spam during cooldown,
Dashboard report highlights if >6 switches/10min.
===============================================================================
58. TEST SCENARIO — TAB OPEN, USER DOES NOTHING
===============================================================================

Open page.
No interaction.

Before 3 minutes:
active timing continues according to SRS signals.

After >3 minutes:
pause.

Expected:

no additional Dwell Time during paused period,
idle_time increases separately,
metric calculations suspended,
UI says inactive/paused.
Resume after activity.

===============================================================================
59. TEST SCENARIO — MEDIA
===============================================================================

Play educational lecture in background.

No mouse/keyboard interaction.

Expected:

media detected,
inactivity pause exemption applies where FR-03 conditions are satisfied,
time attribution follows FR-03,
no double counting.
Try entertainment audio:
do not assume productive.

===============================================================================
60. TEST SCENARIO — RESTRICTED
===============================================================================

Open:
chrome://extensions

Expected:
UNTRACKABLE.

No:

title scan,
session,
dwell,
CSP,
focus deduction,
workstream.
===============================================================================
61. TEST SCENARIO — EXCLUSION
===============================================================================

Add example-sensitive.com to exclusion list.

Then visit it.

Expected:

no page extraction,
no session,
no links,
no snapshot,
no analytic value.
Previously stored records/traces for domain:
delete immediately as specified.

===============================================================================
62. TEST SCENARIO — SERVICE WORKER RESTART
===============================================================================

Start active session.

Persist checkpoint.

Stop/restart Worker.

Expected:

state recovered,
no duplicate session,
no negative duration,
no more than 30 seconds expected loss if actual environment supports requirement.
===============================================================================
63. TEST SCENARIO — DATABASE FAILURE
===============================================================================

Force a write failure in test environment.

Expected:

existing data preserved,
pending buffer up to 50,
retry every 15 sec,
UI badge/warning,
browsing unaffected.
===============================================================================
64. TEST SCENARIO — SNAPSHOT
===============================================================================

Create Workstream with multiple tabs.

Trigger:
two tabs closed within 10 seconds.

Expected:
automatic snapshot.

Then:
Quick Resume → restore.

Expected:
one selection,
new window,
saved order,
correct Workstream association.

===============================================================================
65. TEST SCENARIO — DASHBOARD RECONCILIATION
===============================================================================

For a selected period:
manually sum database dwell_time.

Dashboard total must exactly match the sum within expected formatting/rounding.

Same for:

categories,
Workstreams,
domain timeline.
===============================================================================
66. TEST SCENARIO — DELETE ALL
===============================================================================

Open Options.

Click Delete All.

Expected:
confirmation:
"This action cannot be undone."

Cancel:
no deletion.

Confirm:
all data cleared.

Restart extension:
clean empty state.

===============================================================================
67. TEST SCENARIO — EXPORT
===============================================================================

Export.

Expected:
atentiv-export.json

No network request.

Stored data remain unchanged.

Validate exported counts match database.

===============================================================================
68. DOCUMENTATION DELIVERABLES
===============================================================================

Create/update:

docs/architecture/

ARCHITECTURE.md
REPOSITORY_INVENTORY.md
CONSOLIDATION_REPORT.md
REQUIREMENT_TRACEABILITY.md
OPEN_ITEMS.md
DATA_FLOW.md
docs/workflows/

01-startup-recovery.md
02-tab-lifecycle.md
03-dwell-time.md
04-inactivity.md
05-media-awareness.md
06-trackability.md
07-privacy-exclusion.md
08-page-analysis.md
09-categorisation.md
10-user-rules.md
11-activity-inference.md
12-workstream-links.md
13-workstream-grouping.md
14-workstream-naming.md
15-context-switch.md
16-csp.md
17-focus-score.md
18-warning-system.md
19-snapshot-save.md
20-snapshot-restore.md
21-side-panel.md
22-dashboard.md
23-options.md
24-export-delete.md
docs/testing/

TEST_PLAN.md
TEST_MATRIX.md
E2E_SCENARIOS.md
PERFORMANCE_TESTS.md
PRIVACY_TESTS.md
docs/user-guide/

USER_GUIDE.md
FAQ.md
TROUBLESHOOTING.md
docs/viva/

VIVA_GUIDE.md
ARCHITECTURE_QUESTIONS.md
ALGORITHM_QUESTIONS.md
SECURITY_QUESTIONS.md
WORKSTREAM_QUESTIONS.md
docs/diagrams/

class diagram
DFD
use cases
sequence diagrams
===============================================================================
69. FILE STRUCTURE
===============================================================================

Adapt to the actual framework, but target:

src/
background/
content/
intelligence/
rules/
domains/
classifier/
activity/
productivity/
workstreams/
context-switch/
focus/
warnings/
analytics/
domain/
models/
types/
contracts/
persistence/
db/
repositories/
workspace/
snapshot/
restore/
ui/
sidepanel/
dashboard/
options/
hud/ # only if actually implemented
shared/
messaging/
constants/
utils/

tests/
unit/
integration/
e2e/

docs/
architecture/
workflows/
testing/
user-guide/
viva/
diagrams/

legacy/

===============================================================================
70. MESSAGING
===============================================================================

Centralize extension-internal message contracts.

Examples:

GET_LIVE_STATE
GET_FOCUS_SCORE
GET_ACTIVE_WORKSTREAM
GET_QUICK_RESUME
SAVE_SNAPSHOT
RESTORE_SNAPSHOT
SET_RULE
SET_EXCLUSION
EXPORT_DATA
DELETE_ALL
Do not spread arbitrary string messages throughout the project.

===============================================================================
71. UI-TO-DATA RULE
===============================================================================

UI is not the source of truth.

Source:
IndexedDB / Background Engine state.

UI:
presentation and interaction.

Never:

calculate business logic in a chart,
permanently hold analytics only in a component,
invent data when database is empty.
===============================================================================
72. EMPTY STATE QUALITY
===============================================================================

When no data:
show:

clear message,
why,
what user can do next.
Examples:
"No activity yet. Browse a supported webpage and Atentiv will begin tracking automatically."

"No saved workspaces yet. Save a Workstream or wait for an automatic snapshot."

"Focus Score unavailable because there is no tracked time."

"Tracking unavailable on Chrome internal pages."

===============================================================================
73. SETTINGS UX
===============================================================================

Settings should show clear descriptions:

Tracking:
"Automatically track supported webpages while enabled."

Inactivity Threshold:
"Pause active dwell after this many minutes without input."

Exclusions:
"Domains added here are ignored completely."

Productivity:
"Set how Atentiv treats a domain in future sessions."

Data:
"Export or permanently delete local data."

===============================================================================
74. USER FAQ MUST ANSWER SMALL QUESTIONS
===============================================================================

Create a FAQ that answers:

Why does opening a tab not immediately mean active time?
What is Dwell Time?
Why is a background tab not counted?
What happens when I stop touching the computer?
Why is a YouTube lecture productive but entertainment distracting?
Why doesn't every tab switch reduce my score?
What is the difference between tab switch and context switch?
What is a Workstream?
How does Atentiv decide Workstream membership?
Why is a page untrackable?
What happens on chrome:// pages?
How does CSP work?
How is Focus Score calculated?
What is PR?
What is SR?
What happens if there is not enough data for PR/SR?
Can I override a classification?
What happens when I exclude a domain?
What happens to old data when I add an exclusion?
How does Quick Resume work?
What exactly gets restored?
Where is my data stored?
Is IndexedDB encrypted?
Does Atentiv send data to a server?
What happens if the database write fails?
How long are sessions retained?
How do I export?
How do I permanently delete everything?
What browsers are supported?

Each answer must match the SRS/current implementation.

===============================================================================
75. VIVA EXPLANATION REQUIREMENT
===============================================================================

Prepare simple explanations for:

Architecture
MV3
Service Worker
Content Script
Dexie
IndexedDB
fastText
WASM
Workstream
Dwell Time
Inactivity
Media awareness
CSP
SW
CU
Focus Score
PR
SR
Snapshots
Local-first privacy
Exclusion list
Dashboard
Side Panel
Options

Every technical explanation should include:

what it is,
why it exists,
input,
processing,
output,
example.
===============================================================================
76. NO FALSE CLAIMS
===============================================================================

Never claim:

100% accuracy,
encryption,
all websites supported,
automatic retraining,
exact model performance,
performance targets achieved,
unless actually measured or implemented.
If not measured:
say "target" or "not yet verified."

If not implemented:
say "not implemented."

===============================================================================
77. FINAL BUILD/TYPECHECK/TEST GATE
===============================================================================

Do not declare completion until:

TypeScript typecheck passes,
production build passes,
tests pass or documented failures have explicit reasons,
extension loads successfully,
Service Worker runs,
Side Panel loads,
Dashboard loads,
Options loads,
content script loads on supported pages,
restricted pages are handled,
IndexedDB persists,
snapshots work,
export works,
delete works,
core test scenarios pass.
===============================================================================
78. FINAL DEMO CHECKLIST
===============================================================================

Before the demonstration:

Load extension.
Open a normal webpage.
Verify automatic tracking.
Open Side Panel.
Verify Live Focus.
Verify Workstream.
Open Google research.
Open relevant PDF.
Open YouTube lecture.
Alternate PDF/lecture.
Confirm no false high CSP.
Visit GitHub.
Visit Instagram.
Rapidly switch if demonstrating warning.
Show warning.
Show Dashboard.
Show Workstream Map.
Show Switch Penalty Report.
Show Options.
Add rule.
Add exclusion.
Demonstrate exclusion.
Save/trigger snapshot.
Quick Resume.
Restore.
Export.
Delete with confirmation.
Keep a clean demo browser profile so old test data do not confuse the evaluator.

===============================================================================
79. FINAL DELIVERY REPORT
===============================================================================

Create:

docs/architecture/FINAL_DELIVERY_REPORT.md

Include:

A. Canonical implementation path
B. Repository cleanup
C. Working modules
D. Workflows
E. Data model
F. Database
G. Classification
H. Activity
I. Workstream
J. Context/CSP
K. Focus
L. Warning system
M. Snapshot/restore
N. Side Panel
O. Dashboard
P. Options
Q. Privacy
R. Testing
S. Performance
T. Build/typecheck
U. Supported browsers
V. Open SRS items
W. Known limitations
X. Demo procedure

For every requirement:
IMPLEMENTED
PARTIALLY IMPLEMENTED
NOT IMPLEMENTED
BLOCKED / [TO BE SPECIFIED]

===============================================================================
80. EXECUTION ORDER
===============================================================================

Do not jump directly into UI polish.

Order:

PHASE 1 — repository inventory
PHASE 2 — version reconciliation
PHASE 3 — manifest/build audit
PHASE 4 — runtime bug fixes
PHASE 5 — session/timer correctness
PHASE 6 — inactivity/sleep
PHASE 7 — media awareness
PHASE 8 — privacy/exclusions
PHASE 9 — categorisation
PHASE 10 — activity
PHASE 11 — links/workstream
PHASE 12 — context/CSP
PHASE 13 — Focus Score
PHASE 14 — warning engine
PHASE 15 — snapshot/restore
PHASE 16 — Side Panel
PHASE 17 — Dashboard
PHASE 18 — Options
PHASE 19 — export/delete
PHASE 20 — explainability
PHASE 21 — tests
PHASE 22 — performance
PHASE 23 — documentation
PHASE 24 — final audit
PHASE 25 — final demo validation

===============================================================================
81. DEFINITION OF DONE
===============================================================================

Atentiv is DONE only when:

[ ] one canonical implementation exists
[ ] legacy versions are isolated
[ ] latest SRS is the baseline
[ ] three formal UIs exist
[ ] automatic tracking works
[ ] active dwell time is correct
[ ] inactivity is correct
[ ] sleep is correct
[ ] media awareness works
[ ] YouTube is context-sensitive
[ ] excluded domains are fully excluded
[ ] categorisation precedence is correct
[ ] link relationships are stored
[ ] Workstreams form correctly
[ ] Workstream thresholds match SRS
[ ] tab switch and context switch remain distinct
[ ] CSP matches FR-11
[ ] Focus matches FR-12
[ ] PR/SR ambiguity is documented
[ ] warning engine does not spam
[ ] snapshot conditions work
[ ] Quick Resume works
[ ] restore works
[ ] Dashboard totals reconcile
[ ] Workstream map matches links
[ ] switch report matches >6/10min threshold
[ ] Options work
[ ] export works
[ ] delete works
[ ] local-first privacy holds
[ ] no external Atentiv network requests
[ ] UI has real data
[ ] no fake metrics
[ ] accessibility implemented
[ ] build passes
[ ] typecheck passes
[ ] critical tests pass
[ ] final report exists
[ ] final README identifies canonical Atentiv

===============================================================================
82. FINAL RESPONSE FORMAT
===============================================================================

Return:

ATENTIV — FINAL DELIVERY STATUS

Canonical Version
Repository Cleanup
Tracking & Dwell Time
Inactivity & Sleep
Media
Privacy/Exclusion
Categorisation
Activity
Workstreams
Context Switch / CSP
Focus Score
Warning System
Snapshots
Side Panel
Dashboard
Options
Database
Export/Delete
Testing
Performance
Build/Typecheck
Documentation
Remaining SRS Open Items
Known Limitations
Demo Ready Status
Do not say "complete" if any required feature is not actually verified.



0
Focus Score: 0
chatgpt.com Productive
Workstream
Open All
Tab 1
Focus 0   
Loading older messages…












FocusScore
=
100
(
0.65
P
+
0.35
S
)
−
Penalty
 


F
=
(
P
−
U
T
×
100
)
−
C
S
P
 
P
U
T
C
S
P



FocusScore
=
100
×
(
0.65
P
+
0.35
S
)
−
Penalty

P
S


P
∈
[
0
,
1
]

S
∈
[
0
,
1
]




P
=
productive time
total tracked time
 

P
=
70
100
=
0.70
 






0.65
P

P
=
0.70

0.65
×
0.70
=
0.455



S

S







65
%

35
%





P
=
0.70

S
=
0.80

0.65
P
=
0.65
(
0.70
)
=
0.455

0.35
S
=
0.35
(
0.80
)
=
0.28

0.455
+
0.28
=
0.735

0.735
×
100
=
73.5

P
e
n
a
l
t
y
=
8

F
o
c
u
s
S
c
o
r
e
=
73.5
−
8
F
o
c
u
s
S
c
o
r
e
=
65.5
 

65.5
/
100
 






P
e
n
a
l
t
y
=
f
(
context switches
)



100
(
0.65
(
0.9
)
+
0.35
(
0.9
)
)
=
100
(
0.585
+
0.315
)
=
90

P
e
n
a
l
t
y
=
2

F
o
c
u
s
=
90
−
2
=
88



F
o
c
u
s
=
90
−
25
=
65



0.65
+
0.35
=
1
P
S


P
=
0
,
S
=
0
100
(
0.65
(
0
)
+
0.35
(
0
)
)
=
0
P
=
1
,
S
=
1
100
(
0.65
+
0.35
)
=
100

0
≤
100
(
0.65
P
+
0.35
S
)
≤
100


B
a
s
e
S
c
o
r
e
=
10

P
e
n
a
l
t
y
=
20

F
o
c
u
s
S
c
o
r
e
=
10
−
20
=
−
10


F
o
c
u
s
S
c
o
r
e
=
max

(
0
,
min

(
100
,
F
o
c
u
s
S
c
o
r
e
)
)


−
10
→
0

105
→
100

P
=
productive time
tracked time
 

S
=
f
(
context continuity, switches, session stability
)
B
=
0.65
P
+
0.35
S
B

B
100
=
100
B
 
P
e
n
a
l
t
y
=
f
(
unrelated context switches
)
F
=
100
(
0.65
P
+
0.35
S
)
−
P
e
n
a
l
t
y
 
F
=
max

(
0
,
min

(
100
,
F
)
)
 



P
=
72
120
=
0.60
 

S
=
0.75

0.65
(
0.60
)
=
0.39
0.35
(
0.75
)
=
0.2625

0.39
+
0.2625
=
0.6525
100
(
0.6525
)
=
65.25

P
e
n
a
l
t
y
=
7

65.25
−
7
=
58.25

58.25
/
100
 








S
=
1
−
normalized_switch_rate

normalized switch rate
=
0.2

S
=
1
−
0.2
=
0.8
S


S
=
w
1
(
workstream continuity
)
+
w
2
(
session continuity
)
+
w
3
(
switch stability
)
  
  
 
S


F
=
(
P
−
U
T
×
100
)
−
C
S
P
 
 
















































F
=
(
P
−
U
T
×
100
)
−
C
S
P
 











F
=
round

(
100
(
0.65
P
R
+
0.35
S
R
)
)
−
S
P

S
P
=
min

(
40
,
N
×
2
)

(
(
P
−
U
)
/
T
×
100
)
−
C
S
P





C
S
P
=
∑
(
S
W
×
C
U
)
























C
S
P
=
∑
(
S
W
×
C
U
)

S
W
=
1.5
for switches ≤45 seconds

C
U
=
{
0
same Workstream/same tab
1
same category
2
related categories
4
unrelated categories
  
  
 


F
=
round

(
100
(
0.65
P
R
+
0.35
S
R
)
)
−
S
P

S
P
=
min

(
40
,
N
×
2
)