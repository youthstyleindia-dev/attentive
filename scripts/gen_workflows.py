import os

workflows = [
    ('01-startup-recovery.md', 'Startup & Service Worker Recovery', '''# Workflow 01 — Startup & Service Worker Recovery
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-24)

## 1. Trigger
Extension starts, browser boots, or Manifest V3 Service Worker is recreated from idle suspension.

## 2. Inputs
- Current Chromium window and active tab state (`chrome.tabs.query`, `chrome.windows.getLastFocused`).
- Ephemeral timer checkpoint in `chrome.storage.session`.
- Persistent local settings and rules in IndexedDB via Dexie.js.

## 3. Processing Sequence
1. Service Worker awakens and initializes Dexie database (`db.open()`).
2. Seeds curated default domain library into IndexedDB if not already present.
3. Loads user preferences, active user rules, and domain exclusion list into memory.
4. Reads `chrome.storage.session` to inspect `activeCheckpoint`:
   - If a checkpoint exists and matches the currently active tab: resumes active dwell time accumulation without losing state.
   - If a checkpoint exists but browser state shows a different tab or window: closes previous session safely, persists accumulated dwell, and starts new interval.
5. Sets up 30-second recurring heartbeat alarm (`atentiv-heartbeat`).
   - If heartbeat gap exceeds 90 seconds (indicating machine sleep): excess time is classified as system sleep and excluded from active dwell time.
6. Reconciles state with current active tab; marks system ready.

## 4. Failure Modes & Edge Cases
- **Database Open Failure:** If IndexedDB fails to initialize, ATLAS enters local buffer mode, queues up to 50 records in memory, and retries every 15 seconds.
- **Corrupted Checkpoint:** If checkpoint data is corrupted or null, ATLAS falls back cleanly to a fresh session without manufacturing false dwell time.
'''),

    ('02-tab-lifecycle.md', 'Tab Lifecycle Management', '''# Workflow 02 — Tab Lifecycle Management
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-01)

## 1. Trigger
Browser events: `tabs.onCreated`, `tabs.onActivated`, `tabs.onUpdated`, `tabs.onRemoved`, `windows.onFocusChanged`.

## 2. Invariants
- **Single Active Tab Invariant:** At most ONE ordinary active tab accumulates active dwell time at any given instant.
- **Zero Background Accumulation:** Background tabs do NOT accumulate active dwell time.
- **Viewing Requirement:** A tab created in the background without being actively viewed receives 0 dwell time.

## 3. Processing Sequence
1. User activates tab B from tab A:
   - Tab A dwell time is finalized: active elapsed delta is added to accumulated dwell.
   - Tab A session is closed in IndexedDB with actual dwell time.
2. Tab B is inspected:
   - Validates URL protocol (`http://` or `https://`).
   - Checks Exclusion List.
   - Extracts page context and matches/assigns Workstream.
   - Starts new session record with `dwell_time = 0` and `start_time = now`.
   - Serializes checkpoint into `chrome.storage.session`.
3. Window blur:
   - When the browser window loses focus, active dwell accumulation is paused until focus returns.
'''),

    ('03-dwell-time.md', 'Active Dwell Time Measurement', '''# Workflow 03 — Active Dwell Time Measurement
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-01)

## 1. Purpose
To measure genuine human cognitive engagement with web pages rather than passive tab residency.

## 2. Mathematical Definition
$$\\text{Dwell Time} = \\sum (t_{\\text{active\\_end}} - t_{\\text{active\\_start}}) - \\sum t_{\\text{paused}}$$
Stored strictly in seconds in `tab_sessions.dwell_time`.

## 3. Exclusion Rules
The following durations are strictly excluded from Dwell Time:
- Time spent when the browser window is minimized or blurred.
- Time spent when the user has stepped away (inactivity $> 180\\text{s}$).
- Time spent during system sleep or machine hibernation.
- Time accumulated by background tabs (unless qualifying under FR-03 media awareness).
'''),

    ('04-inactivity.md', 'Inactivity Detection & Auto-Pause', '''# Workflow 04 — Inactivity Detection & Auto-Pause
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-02)

## 1. Specification Baseline
- **Default Inactivity Threshold:** 3 minutes (180 seconds).
- **Configurable Range:** 1 to 10 minutes (60s to 600s).

## 2. Sequence of Operation
1. User interacts with page: active dwell accumulates.
2. User ceases keyboard and mouse input.
3. Once inactivity exceeds the configured threshold (default 180s):
   - Timer automatically pauses.
   - ATLAS state transitions from `TRACKING` to `INACTIVE`.
   - Paused duration is excluded from active Dwell Time.
   - Excess duration is credited separately to `tab_sessions.idle_time`.
4. User resumes activity (moves mouse or presses key):
   - ATLAS transitions back to `TRACKING`.
   - Active dwell accumulation resumes seamlessly.

## 3. Non-Retroactivity Invariant
The period from last activity to threshold crossing is NOT retroactively counted as active dwell time.
'''),

    ('05-media-awareness.md', 'Media Playback & Background Audio', '''# Workflow 05 — Media Playback & Background Audio
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-03)

## 1. Specification Baseline
The SRS makes an explicit, narrow exception for background audible media.

## 2. Qualifying Conditions
A background tab can contribute dwell time ONLY when ALL three conditions are satisfied:
1. The tab is actively audible (`tab.audible === true`).
2. Media playback is actively underway.
3. The effective category of the page is **Learning**, **Research**, or **Communication** (e.g. video lecture, technical podcast, webinar).

## 3. Disqualification Rules
- Background entertainment media (music, gaming, comedies) does NOT receive dwell time credit.
- When educational background media plays simultaneously with a foreground tab, real-world time is not double-counted. Attributed time maintains strict mathematical coherence.
'''),

    ('06-trackability.md', 'Trackability & Restricted Pages', '''# Workflow 06 — Trackability & Restricted Pages
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-04)

## 1. Restricted Protocols
- `chrome://` (e.g. `chrome://extensions`)
- `edge://` (e.g. `edge://settings`)
- `chrome-extension://`
- `about:blank`, `about:config`

## 2. System State: UNTRACKABLE
When an active tab navigates to a restricted protocol:
- State is explicitly flagged as `UNTRACKABLE`.
- Zero content script injection is attempted.
- Zero dwell time or session records are generated.
- No context switch penalty is assessed.
- No false Focus Score deduction is applied (Focus is NOT set to 0).
- UI displays: *"Tracking unavailable on internal browser page. Atentiv will resume automatically on a supported webpage."*
'''),

    ('07-privacy-exclusion.md', 'Privacy Filter & Domain Exclusion', '''# Workflow 07 — Privacy Filter & Domain Exclusion
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-06, DR-05)

## 1. Evaluation Precedence
The Exclusion List is evaluated BEFORE any DOM extraction or text analysis takes place.

## 2. If Domain is Excluded:
- Page title, headings, and DOM are NEVER read or parsed.
- No activity session is created in `tab_sessions`.
- No link relationships or workstream memberships are assigned.
- The URL is completely excluded from snapshots.
- Zero analytics data is stored or presented.

## 3. Immediate Purge Guarantee
When a user adds a domain to the Exclusion List via Options:
- Existing `tab_sessions` for that domain are deleted immediately.
- Existing `decision_traces` for that domain are deleted immediately.
- Exclusion takes effect instantly for all future browsing.
'''),

    ('08-page-analysis.md', 'Page Context Extraction & Sanitization', '''# Workflow 08 — Page Context Extraction & Sanitization
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-05)

## 1. Extracted DOM Signals
- Document `title` (sanitized and trimmed).
- Open Graph description (`meta[property="og:description"]`).
- Up to 20 $H1$–$H3$ headings.
- Up to 2 KB of visible body text from `<main>` or `<article>`.

## 2. Security & Sanitization
- Form input values, passwords, keystrokes, and session cookies are strictly never read.
- Sensitive query parameters (`?auth=`, `?token=`, `?password=`, `?key=`) and URL fragments (`#`) are scrubbed before storage.
- Extracted text is lowercased, punctuation-normalized, and stripped of HTML tags.
'''),

    ('09-categorisation.md', 'Precedence-Driven Categorisation', '''# Workflow 09 — Precedence-Driven Categorisation
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-06)

## 1. Categorisation Precedence Order
Atentiv evaluates web pages through an 8-stage deterministic pipeline:
1. **Exclusion List:** Halts tracking if matched.
2. **Explicit User Rules:** Highest priority user pattern matches.
3. **User Feedback Overrides:** Historic user corrections.
4. **Preset Curated Domain Library:** 100+ vetted domain baselines.
5. **Inference Cache:** 24-hour exact content match cache.
6. **fastText WASM Model:** Local SIMD linear classifier (16-dim embeddings).
7. **Keyword Dictionary Scoring:** Fallback taxonomy keywords.
8. **Default Fallback:** Category "Other", Productivity "Neutral" (0).
'''),

    ('10-user-rules.md', 'User Rules & Custom Overrides', '''# Workflow 10 — User Rules & Custom Overrides
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-06, FR-20)

## 1. Rule Definition
- Unique UUID v4 `rule_id`.
- User priority between 100 and 200 (always superseding automated ML).
- Match conditions:
  - `domain_exact` (e.g. `github.com`)
  - `domain_contains` (e.g. `docs`)
  - `title_contains` (e.g. `lecture`)
  - `url_prefix` (e.g. `https://youtube.com/watch?v=`)
- Actions: assigned category, assigned productivity (`productive`, `neutral`, `distracting`), optional forced workstream.

## 2. Temporal Behavior
- Modifying a user rule applies immediately to future sessions.
- Historical sessions preserve historical classification unless "Re-calculate Today" is explicitly triggered.
'''),

    ('11-activity-inference.md', 'Activity Taxonomy Inference', '''# Workflow 11 — Activity Taxonomy Inference
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-09)

## 1. Orthogonal Separation
Atentiv strictly maintains separation between four concepts:
- **Category:** Domain/topic classification (e.g. `Technology`, `Education`, `Entertainment`).
- **Activity:** The specific action the user is performing (e.g. `Coding`, `Debugging`, `Reading`, `Lecture`).
- **Productivity:** Value orientation (`+1` Productive, `0` Neutral, `-1` Distracting).
- **Workstream:** The unified multi-tab project thread.

## 2. Deterministic Mapping Examples
- Google + "Python import error" $\\rightarrow$ Activity: `Research`
- StackOverflow + error keywords $\\rightarrow$ Activity: `Debugging`
- GitHub repo $\\rightarrow$ Activity: `Coding`
- YouTube + "Machine Learning Lecture" $\\rightarrow$ Activity: `Lecture`
'''),

    ('12-workstream-links.md', 'Navigation Link Relationships', '''# Workflow 12 — Navigation Link Relationships
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (DR-04)

## 1. Purpose
Tracks navigation provenance and referrers to establish connected threads of research.

## 2. Data Structure
Stored in IndexedDB `workstream_events` matching DR-04:
- `id`: Unique record ID.
- `workstream_id`: Assigned workstream.
- `session_id`: Source tab session ID.
- `entered_at`: Navigation entry timestamp.
- `exited_at`: Navigation exit timestamp.
- `duration`: Active duration.
- `previous_workstream_id`: Prior context if transition occurred.
- `switch_penalty`: Evaluated penalty points.
'''),

    ('13-workstream-grouping.md', 'Workstream Grouping & Clustering', '''# Workflow 13 — Workstream Grouping & Clustering
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-10, FR-13)

## 1. Clustering Parameters
- **Similarity Metric:** Cosine similarity on sentence embedding vectors.
- **Threshold:** Cosine similarity $\\ge 0.68$.
- **Temporal Proximity:** Within 20 minutes without intervening unrelated distraction blocks.
- **Navigation Links:** Direct hyperlinked navigation automatically binds child pages to parent workstream.

## 2. Dynamic Merge
Two workstreams merge into one when:
- They share $\\ge 3$ open or visited tabs, OR
- Centroid cosine similarity exceeds $0.85$.

## 3. Dynamic Split
A workstream splits when an unrelated topic is sustained for $> 15$ continuous active minutes.
'''),

    ('14-workstream-naming.md', 'Workstream Naming Heuristics', '''# Workflow 14 — Workstream Naming Heuristics
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-14)

## 1. Naming Hierarchy
1. **Dominant Noun / Bigram:** Most frequent meaningful noun phrase extracted from page titles (e.g. "Python Debugging", "Transformer Architecture").
2. **Category + Domain Fallback:** If noun phrases are ambiguous (e.g. "Technology — GitHub").
3. **Generic Fallback:** "General Browsing" or "Research Session #".

The derived name is displayed in the Side Panel, logged in `tab_sessions.workstream_name`, and used as default workspace snapshot title.
'''),

    ('15-context-switch.md', 'Tab Switch vs Context Switch', '''# Workflow 15 — Tab Switch vs Context Switch
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-11)

## 1. Core Distinction
- **Tab Switch:** Low-level browser event when active tab changes.
- **Context Switch:** Cognitive disruption when switching between unrelated tasks.

## 2. Invariance Principles
- Alternating between a YouTube ML lecture and a PDF research note within the same workstream is a tab switch, NOT an unrelated context switch ($CU = 0$).
- Alternating rapidly between GitHub and Instagram represents a true context switch with elevated cognitive penalty ($CU = 4$).
'''),

    ('16-csp.md', 'Context Switch Penalty (CSP)', '''# Workflow 16 — Context Switch Penalty (CSP)
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-11)

## 1. Mathematical Formula
$$CSP = \\sum (SW \\times CU)$$

## 2. Switch Weight ($SW$)
$$SW = \\begin{cases} 1.5 & \\text{if elapsed time since last switch} \\le 45\\text{ seconds} \\\\ 1.0 & \\text{otherwise} \\end{cases}$$

## 3. Category Unrelatedness ($CU$)
$$CU = \\begin{cases} 0 & \\text{same Workstream or same tab} \\\\ 1 & \\text{same category} \\\\ 2 & \\text{related categories or missing category} \\\\ 4 & \\text{unrelated categories} \\end{cases}$$

$CSP$ is strictly non-negative. If no context switches occur, $CSP = 0$.
'''),

    ('17-focus-score.md', 'Focus Score Calculation Engine', '''# Workflow 17 — Focus Score Calculation Engine
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-12, FR-12.1)

## 1. Mathematical Formula
$$F = \\operatorname{round}(100 \\times (0.65 \\times PR + 0.35 \\times SR)) - SP$$

where:
$$SP = \\min(40, N \\times 2)$$
- $N$ = Number of context switches.
- $PR$ = Productive Ratio (provisional: $\\text{Productive Time} / \\text{Tracked Time}$).
- $SR$ = Stability Ratio (provisional: $\\text{Dominant Workstream Time} / \\text{Tracked Time}$).
- Clamping: $0 \\le F \\le 100$.

## 2. Boundary Condition: $T = 0$
When total active tracked time is zero:
- Focus Score is NOT computed.
- UI displays "No data available" (never false 0).
'''),

    ('18-warning-system.md', 'Live Warning & Intervention Engine', '''# Workflow 18 — Live Warning & Intervention Engine
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-19)

## 1. Reporting vs Live Intervention
- **Formal Dashboard Report:** Highlights periods with $> 6$ Context Switches in a 10-minute window.
- **Live Intervention Policy:** Triggers non-intrusive alert when $3+$ unrelated switches occur within 60 seconds.

## 2. Behavioral Guidelines
- Cooldown period: minimum 5 minutes between warnings.
- Non-blocking, non-shaming, no forced navigation.
- Alert offers options: [Stay with Current Workstream] or [Dismiss].
'''),

    ('19-snapshot-save.md', 'Context Snapshot Generation', '''# Workflow 19 — Context Snapshot Generation
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-15, DR-03)

## 1. Automatic Triggers
A. Two or more tabs belonging to the active Workstream are closed within 10 seconds.
B. User switches away from a Workstream that has accumulated $\\ge 30$ continuous active minutes.
C. User explicitly clicks "Take Snapshot" in UI.

## 2. Saved Metadata
- `snapshot_id`: Unique UUID.
- `title`: Workstream name with date.
- `saved_tabs`: Ordered list of `{ url, title, favicon, category }`.
- `active_tab_index`: Currently active tab index.
- `timestamp`: Creation date.
- Excluded domains are filtered out.
'''),

    ('20-snapshot-restore.md', 'Workspace Quick Resume', '''# Workflow 20 — Workspace Quick Resume
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-16)

## 1. Execution
1. User clicks "Resume" in Side Panel or Snapshots tab.
2. Background engine creates a fresh Chromium browser window.
3. Opens saved tabs in their original sequence.
4. Activates the tab designated by `active_tab_index`.
5. Re-associates the opened tabs with the original Workstream thread.

## 2. Target Performance
Restoration of state executes in $\\le 50\\text{ms}$ (excluding web page network loading latency).
'''),

    ('21-side-panel.md', 'Side Panel Companion Interface', '''# Workflow 21 — Side Panel Companion Interface
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-17, UIR-01)

## 1. File Path
`sidepanel.html` (rendered via React 19).

## 2. Core Components
- **Live Focus Score Meter:** Radial SVG gauge updated live.
- **Active Workstream Card:** Displays current stream name, category badge, and active dwell time.
- **Quick Resume Section:** Cards for recently saved workspace snapshots with 1-click restore.
- **Responsive Standard:** Fits standard 320px–420px browser side panel widths with zero clipping or text truncation.
'''),

    ('22-dashboard.md', 'Main Analytics Dashboard', '''# Workflow 22 — Main Analytics Dashboard
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-18, UIR-02)

## 1. File Path
`dashboard.html` (rendered via React 19).

## 2. Analytical Visualizations
- **Activity Time Charts:** Hourly switch frequency bars and category dwell breakdown.
- **Workstream Maps:** D3 constellation graph connecting domains as nodes and navigation paths as edges.
- **Switch Penalty Reports:** Highlighted amber/red time periods where $> 6$ context switches occurred within 10 minutes.
- **Strict Data Reconciliation:** All chart totals match stored IndexedDB seconds within exact mathematical rounding.
'''),

    ('23-options.md', 'Options & Configuration Interface', '''# Workflow 23 — Options & Configuration Interface
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-20, UIR-03)

## 1. File Path
`options.html` (rendered via React 19).

## 2. Capabilities
- **Category Customization:** Create, edit, and toggle priority rules for domains and URLs.
- **Productivity Customization:** Designate domains as productive, neutral, or distracting.
- **Exclusion List Management:** Add sensitive domains for total exclusion.
- **Data Ownership Controls:** 1-click JSON export and permanent data wipe.
'''),

    ('24-export-delete.md', 'Data Ownership: Export & Delete All', '''# Workflow 24 — Data Ownership: Export & Delete All
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-21, FR-22)

## 1. Local JSON Export
- Triggered via user action: generates `atentiv-export.json`.
- Exports all `tab_sessions`, `workstreams`, `rules`, `snapshots`, and `decision_traces`.
- Executes 100% locally with zero external network requests.

## 2. Irreversible Delete All
- Requires explicit user confirmation stating: *"This action cannot be undone."*
- Wipes all Dexie tables, resets `chrome.storage.session` and `chrome.storage.local`.
- Restores all UI components to clean empty state.
''')
]

os.makedirs('docs/workflows', exist_ok=True)
for filename, title, content in workflows:
    path = os.path.join('docs/workflows', filename)
    with open(path, 'w') as f:
        f.write(content.strip() + '\n')
    print(f'Wrote {path}')

print('All 24 workflow files created successfully.')
