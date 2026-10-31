ATENTIV — FULL STRUCTURED IMPLEMENTATION & PRODUCT REPORT
Latest SRS 3.1 Alignment + End-to-End Development Blueprint
Purpose: this report is the human-readable companion to the Antigravity implementation prompt. It is written so the project can be explained to a guide/evaluator from requirements → architecture → workflow → algorithms → data → UI → testing.

1. Executive Summary
Atentiv is a privacy-preserving, context-aware browser extension for browsing analytics and productivity enhancement.

Its purpose is not merely to count how long a user spends on websites or how many tabs are open. It attempts to understand a browsing session as a sequence of related tasks called Workstreams and uses active Dwell Time, categorisation, Context Switch Penalty and Focus Score to describe the user's browsing behaviour.

The current SRS requires a Zero-Server, Local-First architecture. Persistent data is held in browser IndexedDB. The three formal interfaces are Side Panel, Dashboard and Options Page.

The latest SRS revision is the baseline for implementation. Earlier Version 2.0 ideas must not silently override current Version 3.0/3.1 decisions.

2. Product Definition
2.1 Problem
Modern browsing generates:

many tabs,
unrelated activities,
frequent switching,
lost context,
difficulty resuming a task,
privacy concerns when analytics are sent to a server.
2.2 Atentiv's response
Atentiv:

measures active Dwell Time,
pauses when the user is inactive,
recognizes qualifying media,
categorises pages,
records navigation relationships,
groups related pages into Workstreams,
distinguishes tab switches from task/context switches,
computes CSP,
computes Focus Score,
saves Workstream snapshots,
restores them,
shows live and historical analytics,
keeps the data local.
3. Requirements Authority
Latest SRS:

Revision history includes Version 3.1 stakeholder resolutions.
Version 3.0 is the formal IEEE-format submission revision.
The latest decisions supersede older ambiguous Version 2.0 wording where specified.
Some items remain [To Be Specified].
The implementation must therefore maintain explicit requirement traceability.

4. High-Level Architecture
                    USER
                      |
                      v
             CHROMIUM BROWSER
                      |
          +-----------+-----------+
          |                       |
          v                       v
 Browser Event Monitor       Content Script
          |                       |
          +-----------+-----------+
                      |
                      v
               BACKGROUND ENGINE
                    / ATLAS
                      |
        +-------------+-------------+
        |             |             |
        v             v             v
   Tracking       Intelligence    Workspace
        |             |             |
        |       +-----+---------+   |
        |       |     |         |   |
        |      Rules  ML    Workstream
        |             |      / Context
        |             |         |
        +-------------+---------+
                      |
                      v
              ANALYTICS / FOCUS
                      |
                      v
                 REPOSITORIES
                      |
                      v
                 DEXIE.JS
                      |
                      v
                  INDEXEDDB
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
       SIDEPANEL  DASHBOARD    OPTIONS
5. ATLAS
ATLAS is an internal architectural label:

Atentiv Tab Lifecycle and Activity-State System

It can be explained as the coordination layer that turns:
browser events + page context + classification + activity + workstream + metrics

into:

live state + persisted analytics + UI state.

It is not an external library or framework.

6. Formal UIs
Side Panel
File:
sidepanel.html

Purpose:
persistent quick view.

Required:

Live Focus Score,
Active Workstream,
Quick Resume.
Dashboard
File:
dashboard.html

Purpose:
historical analytics.

Required:

Activity Time Charts,
Workstream Maps,
Switch Penalty Reports.
Options
File:
options.html

Purpose:
configuration and data ownership.

Required:

domain category customization,
productivity customization,
Exclusion List,
export,
delete.
7. Optional HUD Concept
A Compact/Full HUD can be present as an additional product-quality interaction layer if implemented.

Compact HUD:

quick view,
current Focus,
current Workstream,
activity,
status.
Full HUD:

expanded view,
richer analysis,
workstream details,
warnings,
actions.
It must not replace the formal three-interface SRS structure.

8. Workflow 01 — Startup and Recovery
Trigger
Extension starts or Service Worker is recreated.

Inputs
current browser state,
persisted checkpoint,
IndexedDB,
settings,
rules,
exclusions.
Processing
Initialize
→ DB open
→ Load settings
→ Load rules
→ Load exclusions
→ Load checkpoint
→ Reconcile browser
→ Recover session
→ Ready
Failure
If recovery is impossible:
do not manufacture a session.

9. Workflow 02 — Tab Lifecycle
Events:

create,
activate,
navigate,
remove,
window focus.
Key rule
At most one ordinary active tab receives ordinary Dwell Time.

Dwell formula
Dwell = active end timestamp - active start timestamp - paused periods
SRS stores Dwell Time in seconds.

10. Workflow 03 — Inactivity
Default threshold:

3 minutes / 180 seconds

Configurable:

1–10 minutes

Sequence:

Active
 ↓
No keyboard/mouse input
 ↓
Idle time
 ↓
Threshold crossed
 ↓
PAUSED / INACTIVE
 ↓
Dwell stops increasing
 ↓
User activity returns
 ↓
Resume
The idle period is not counted as active Dwell Time.

11. Workflow 04 — Sleep
Sleep/locked state:

pause timer,
suspend metric calculations,
persist checkpoint,
resume on wake.
Fallback:
30-second alarms heartbeat.

If heartbeat gap >90 sec:
excess gap is treated as system sleep.

12. Workflow 05 — Media Awareness
The SRS makes a specific exception for media.

Background media may count toward Dwell Time when:

audible,
media-playing,
effective category is Learning / Research / Communication.
Example:

PDF notes in foreground
YouTube lecture audio in background
Atentiv should not mark this simply as inactivity when the media criteria are satisfied.

Entertainment audio should not automatically become productive.

13. Workflow 06 — Restricted Pages
Examples:

chrome://extensions
edge:// pages
State:
UNTRACKABLE

The product should not:

scan,
classify,
log,
reduce Focus,
count Dwell,
create Workstream membership.
This directly addresses the current screenshot bug.

14. Workflow 07 — Privacy / Exclusions
Order:

Is domain excluded?
  |
 YES ----------------> STOP
  |
 NO
  v
Continue extraction
An excluded domain contributes no:

sessions,
link relationships,
title/heading scan,
snapshot membership,
analytics.
When added to the Exclusion List:
previous activity sessions and decision traces for the domain are removed immediately as specified.

15. Workflow 08 — Page Extraction
Extract:

title,
og:description,
up to 20 H1-H3 headings,
up to 2 KB of visible main/article text.
No password/form/keystroke capture.

Dynamic page:
MutationObserver with debounce + feature hash.

16. Workflow 09 — Categorisation Precedence
Authoritative sequence:

1 Exclusion
2 User rule
3 User feedback
4 Curated domain
5 Cache
6 fastText
7 Keyword scoring
8 Other / Neutral
This ordering prevents a generic ML prediction from overriding an explicit user decision.

17. Workflow 10 — YouTube
Default:

category depends on implementation,
productivity default is distracting.
Promotion:
titles containing:

lecture,
tutorial,
course,
documentation
can move the effective productivity toward productive.

Example:

YouTube: "Machine Learning Lecture 7"
→ Learning / Productive
YouTube: "Comedy Compilation"
→ Entertainment / Distracting
User rules override.

18. Workflow 11 — Activity Inference
Separate from category.

Example:

Category = Technology
Activity = Debugging
Productivity = Productive
Workstream = Python Debugging
This separation is necessary for a context-aware product.

19. Workflow 12 — Link Relationships
Example:

Google Search
      |
      v
StackOverflow
      |
      v
GitHub
Store source → destination relationship with timestamps and Workstream context.

Unknown source:
do not fabricate.

20. Workflow 13 — Workstream Grouping
A Workstream is one logical task.

Canonical example:

Google
StackOverflow
GitHub
Python documentation
can be one Workstream.

SRS grouping inputs:

link connectivity,
semantic similarity,
shared category/activity,
temporal proximity,
absence of unrelated distraction blocks.
Threshold:
cosine >= 0.68

Temporal window:
20 minutes

Merge:

3 shared tabs
OR

centroid cosine >0.85
Split:

unrelated topic >15 continuous active minutes.
21. Workflow 14 — Workstream Naming
Naming:

dominant meaningful noun/bigram,
category + active domain,
General Browsing / Task Session #.
Example:
"Python Debugging"

22. Workflow 15 — Tab Switch vs Context Switch
Tab Switch:
browser event.

Context Switch:
change of task context.

Example:

YouTube lecture
↔ PDF
can be related and stay within one Workstream.

Example:

GitHub
↔ Instagram
can be unrelated and increase context cost.

23. Workflow 16 — CSP
Formula:

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
CSP=∑(SW×CU)
Switch Weight:

1.5 for switch <=45 seconds,
1.0 otherwise.
Category Unrelatedness:

0 same Workstream/same tab,
1 same category,
2 related categories,
4 unrelated categories.
Missing category:
CU=2.

The detailed CSP and the Focus Score's SP are different metrics.

24. Workflow 17 — Focus Score
Current SRS formula:

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
F=round(100(0.65PR+0.35SR))−SP
with:

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
SP=min(40,N×2)
where:

PR = Productive Ratio,
SR = Stability Ratio,
N = number of Context Switches.
Clamp:
0–100.

Important open point
The SRS does not define PR and SR; they remain [To Be Specified].

Therefore documentation must explicitly show that this is an implementation-decision point unless the repository contains an approved definition.

25. Work Periods / Ranges
Supported ranges:

Today,
Last 7 Days,
Active Workstream Session.
Today:
local day from 00:00:00.

Live UI:
live interpolation every second.

Database-backed aggregate:
refresh every 5 seconds.

26. Warning System
Formal report threshold
More than 6 Context Switches in a 10-minute window.

Optional live intervention
Recommended:
3 unrelated switches in 60 seconds.

This should be configurable and not confused with the formal dashboard threshold.

Cooldown
Recommended starting point:
5 minutes.

27. Warning Cases
Rapid unrelated switching
Example:
coding → social → coding → entertainment.

Possible output:

"Focus Interrupted — several unrelated switches detected."

Inactivity
"Tracking paused — no input beyond threshold."

Untrackable
"Tracking unavailable on this browser page."

Workstream instability
Repeated A→B→A→B if evidence shows true task instability.

28. Study Scenario
The product must NOT punish normal study behaviour.

Scenario:

Lecture
→ PDF
→ Lecture
→ PDF
Expected:

tab switches >0,
same Workstream where evidence supports,
CU low/zero,
CSP low,
no false warning.
29. Distraction Scenario
GitHub
→ Instagram
→ GitHub
→ entertainment YouTube
→ Instagram
Expected:

high unrelatedness,
rapid SW where <=45 sec,
CSP increases,
SP increases with switch count,
Focus may decrease,
warning after configured condition,
formal Dashboard report when >6 switches/10 min.
30. Snapshot Workflow
Automatic triggers:

2+ tabs of Workstream closed within 10 sec,
leaving Workstream after >=30 continuous active minutes,
manual Take Snapshot.
Snapshot:

ID,
title,
saved tabs,
active tab index,
timestamp.
Saved tab:

URL,
title,
favicon,
category.
Excluded domains never enter snapshot.

31. Restore Workflow
One selection:

read snapshot,
create/open target window,
open tabs in stored order,
reconnect them logically.
No scroll/form restoration.

32. Data Model
domains
domain
category
productivity_type
keywords
tab_sessions
session_id
url
start_time
end_time
dwell_time
idle_time
workstream_name
snapshots
snapshot_id
title
saved_tabs
active_tab_index
timestamp
user_rules
rule_id
name
enabled
priority
condition
action
created_at
exclusions
domain
added_at
reason
33. Persistence
Persistent storage:
IndexedDB.

Abstraction:
Dexie.js.

No server synchronization.

Data survives browser restart.

34. Retention
Activity sessions:
30 days by default.

Midnight maintenance.

Domain rules and Exclusions:
retained until user deletes them.

Snapshot retention:
still unspecified by SRS unless separately resolved.

35. Export
File:
atentiv-export.json

Must include stored sessions, Workstreams, decision traces, metrics and other data.

Local only.

36. Delete All
Confirmation required.

Text should explicitly state:
"This action cannot be undone."

After confirmation:
all stored data removed.

37. Privacy Model
The latest SRS supersedes the old "encrypted logs" statement.

Activity logs:
plain text in IndexedDB.

Protection:

OS profile controls,
extension origin isolation,
sensitive-value scrubbing.
Never claim encryption without an actual application-level encryption layer.

38. Technology Roles
TypeScript
Type-safe implementation language.

React
Formal UI rendering for Side Panel/Dashboard/Options.

Vite
Frontend/build pipeline.

esbuild
Service Worker and Content Script bundling.

Dexie
Developer-friendly IndexedDB abstraction.

IndexedDB
Actual local persistent database.

fastText
Local webpage category classifier.

WASM
Browser runtime for compiled fastText.

SVG/Canvas
Meters, timelines, charts and maps.

lucide-react
UI icons.

39. Error Handling
ML fails
Use deterministic fallback.

DB write fails
Buffer + retry.

Page inaccessible
UNTRACKABLE.

Worker restarts
Recover.

Snapshot URL fails
Continue remaining tabs and report failure.

40. Performance Targets
SRS:

background processing <=60 MB RAM,
tab tracking <15 ms,
persisted recovery <=50 ms excluding web-page load.
These must be measured, not merely stated.

41. Accessibility
WCAG 2.1 AA.

All interactive controls keyboard-operable.

Focus order and status messaging must be deliberate.

42. Recommended Source Structure
src/
  background/
  content/
  intelligence/
  domain/
  persistence/
  workspace/
  ui/
  shared/

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
43. Requirement Traceability
Each requirement should map to:

implementation module,
test,
UI if relevant,
status.
Status:

Implemented
Partially Implemented
Not Implemented
To Be Specified / Blocked
44. Product-Readiness Criteria
A product-ready Atentiv must:

have one active implementation,
survive worker restart,
track active time correctly,
pause correctly,
handle media,
understand Workstreams,
compute CSP correctly,
compute Focus consistently,
explain states,
avoid false warnings,
keep data local,
have working snapshots,
have working export/delete,
have real analytics,
have no hard-coded demo metrics,
have clean documentation,
pass critical tests.
45. Recommended Demo Story
Tell the evaluator this story:

User starts browsing.
Atentiv automatically tracks the active page.
Page context is extracted locally.
Exclusion check happens.
User rules/domain/ML classify page.
Activity is inferred.
Productivity is assigned.
Workstream is identified.
User moves to a related page.
Tab switch is detected but not automatically treated as a context switch.
User opens a relevant lecture/PDF sequence.
Same Workstream remains.
User becomes inactive.
Dwell pauses.
User returns.
Dwell resumes.
User rapidly switches into unrelated social content.
CSP increases.
Warning can appear.
Dashboard shows the switch period.
User leaves a major Workstream.
Snapshot is saved.
Quick Resume restores it.
Options allow user to modify rules, exclude private domains, export or delete all data.
That is the clearest demonstration of why Atentiv is more than a website timer.

46. Final Implementation Principle
Atentiv should understand:

PAGE
  ↓
CATEGORY
  ↓
ACTIVITY
  ↓
PRODUCTIVITY
  ↓
WORKSTREAM
  ↓
CONTEXT
  ↓
CSP
  ↓
FOCUS
  ↓
USER INTERFACE
The project is successful when these layers remain separate but work together.



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





















ATENTIV — CANONICAL ARCHITECTURE
Browser APIs / DOM
       ↓
Browser Event Monitor + Content Script
       ↓
Background Engine / ATLAS
       ↓
Privacy → Rules → Domain → Cache → fastText → Keyword fallback
       ↓
Activity → Productivity → Workstream → Context/CSP → Focus
       ↓
Snapshot + Analytics
       ↓
Repositories → Dexie → IndexedDB
       ↓
Side Panel / Dashboard / Options
Formal UIs
sidepanel.html
dashboard.html
options.html
Core local-first rule
No external Atentiv server or analytics.

Key distinction
Tab switch != Context Switch.

Focus
Current FR-12 formula with PR/SR open item.



0
Focus Score: 0
chatgpt.com Productive
Workstream
Open All
Tab 1
Focus 0 ATENTIV — OPEN ITEMS
OI-01 — Productive Ratio (PR)
Current SRS FR-12.1 references PR but does not define it. Search repository for an approved stakeholder/project decision. Otherwise document a provisional implementation clearly.
OI-02 — Stability Ratio (SR)
Current SRS FR-12.1 references SR but does not define it. Same handling as PR.
OI-03 — Workspace Snapshot Retention
DR-12 leaves whether the 30-day retention applies to snapshots as [To Be Specified].
OI-04 — Academic submission constraints
OR-05 remains [To Be Specified]. ATENTIV — USER FAQ
Why doesn't opening a tab automatically mean I spent time on it?
Because Atentiv measures active Dwell Time. Merely having a tab open is not the same as actively using it.
What happens when I stop using the computer?
After the configured inactivity threshold (3 minutes by default), active Dwell Time pauses. Idle time is excluded.
Does every tab switch reduce my Focus Score?
No. A tab switch is only a browser event. Related pages can remain within the same Workstream and have low/zero Category Unrelatedness.
Why can YouTube be productive?
YouTube is distracting by default, but titles such as lecture, tutorial, course or documentation can indicate educational use. A user rule can override this.
What is a Workstream?
A Workstream is a connected group of pages belonging to one task.
What happens on chrome:// pages?
Atentiv marks them UNTRACKABLE. It does not scan or count them as productivity or distraction.
Is my browsing history sent to a server?
No. Atentiv is Zero-Server and Local-First.
Is IndexedDB encrypted?
Not by default. The latest SRS specifies plain-text IndexedDB protected by browser/OS isolation and sensitive-value scrubbing.
What happens when I add a domain to the Exclusion List?
The domain is ignored completely. Existing activity sessions and decision traces for that domain are deleted according to the SRS.
What does CSP mean?
Context Switch Penalty. It increases with rapid and/or unrelated Context Switches.
How is Focus Score calculated?
Current SRS FR-12 uses:
F = round(100 × (0.65PR + 0.35SR)) − SP
with SP = min(40, N×2). PR/SR remain [To Be Specified] in the SRS.
What does Quick Resume do?
It restores a saved Workspace Snapshot by opening its saved tabs in order.
What is restored?
URLs, page titles, favicon/category metadata, active tab index and Workstream association. In-page scroll/form state is not restored.


</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-10-06T23:17:28+05:30.
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from Gemini 3.8 Flash (Medium) to Gemini 3.8 Flash (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>