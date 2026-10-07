# Cognitive Stream — prototype project report

## Problem statement

People spread research and project work across many browser tabs. A flat history can make it hard to understand how work unfolded or to recover context after an interruption. This project explores whether a local activity dashboard, simple workstream labels, and saved context notes can make browser work easier to review and resume.

## Proposed solution and objectives

Implement a browser-only extension that captures foreground page activity with explicit opt-in; groups it into editable workstreams; summarizes time and transitions; and lets a user save and reopen a task context. The user is the authority on intent. The prototype does not equate every switch with distraction.

## Architecture

Browser events → serialized service-worker queue → previous interval checkpoint → current foreground/idle/exclusion check → rule classification → local storage → React dashboard.

The worker registers listeners at module load. Persistent intervals are held in local storage and the live checkpoint in session storage. Alarms checkpoint approximately every 30 seconds. Startup clears stale session state. Mutations pass through the worker to avoid competing UI writes. State is capped and pruned on reconciliation.

The dashboard has four views: Overview, Workstreams, Context resume, and Settings. In a normal web preview it runs exclusively on generated sample data; inside Chrome it communicates with the worker. Sample data is not written to live storage.

## Data model

- Stream: ID, name, color, comma-separated domains and keywords.
- Visit: ID, tab ID, sanitized URL, title, stream ID, start/end timestamps, transition flag.
- Snapshot: ID, name, resume note, creation time, sanitized title/URL entries.
- Preferences: tracking flag, excluded domains, focus target/intention/deadline.

## Algorithms

Classification: an exact/subdomain match contributes 5 points; each keyword found in hostname or page title contributes 1 point. Highest score wins; ties follow listed stream order. No matches → Unsorted. Rules affect future activity only.

Active time: sum interval intersections with the selected time window. Browser focus, idle status and exclusions determine eligibility. Checkpoints cap long gaps at 60 seconds.

Context switch: transition between different workstreams during contiguous recorded activity; same-stream tab changes do not count. Idle/internal-page gaps break continuity. A switch is a behavioral observation, not a judgment of productivity.

Penalty = min(40, 2 × switches). Focus score = max(0, round(100 × target active time / total active time − penalty)). The target is the active focus-session stream, otherwise the dominant stream. Empty data has no score. The focus target applies to the selected dashboard time range, not a separately retained focus-session history.

## Scope comparison

| Prior direction | Prototype response | Limit |
|---|---|---|
| Organize pages/tasks | Editable local workstream rules | No learned semantic clustering |
| Re-find information | Saved tabs and user-written resume notes | No navigation-tree recovery |
| Behavioral feedback | Time share, switch count, heuristic score | No validated measure of cognition |
| Privacy | Browser-local storage and opt-in capture | Local titles/paths can still be sensitive |

The prototype combines these capabilities for a small academic demonstration. It does not claim improved accuracy, productivity, or scientific superiority over the cited research.

## Need for end users

A student can keep a paper-reading context separate from development, see a rough distribution of time, and leave a reminder before a break. A developer can save a debugging workspace without relying on memory alone. Local processing avoids sending browsing records to an external service.

## Evaluation plan

Use a scripted sequence across two workstreams, an idle period, a background browser period, an excluded domain and a save/resume action. Compare expected vs recorded durations with tolerance for checkpoints. Verify same-stream transitions are not penalized, worker restart does not lose data, and exporting/deleting works. A future consented user study could assess usability and resumption time; none has been conducted for this project.

## Academic presentation outline (white background)

1. Title and team members
2. Problem statement and example user journey
3. Literature themes: tab overload, task grouping, task resumption, behavioral feedback
4. Paper-by-paper relevance and verification status
5. Comparison with prior approaches, without superiority claims
6. Scope, objectives and exclusions
7. Proposed solution and architecture
8. Common technology stack
9. Transparent rule and score formulas
10. Privacy, permissions and retention
11. Prototype demonstration and tests
12. Limitations, future evaluation and references

## Reference register

Entries 1–8 below came from the supplied brief. Their detailed metadata, study statistics, summaries and claims have NOT been independently verified here. Verify publisher records before using them as academic evidence. Do not present proposed enhancements as features of the cited systems. Member attribution was not supplied and must be added by the team.

1. Roy Adrian Rutishauser and Thomas Fritz. “From Tabs to Structures: Understanding and Supporting Web Page Management.” CHI 2026, April 2026 (as supplied). https://doi.org/10.1145/3772318.3791979 — relevant to page organization and overload.
2. Elin Rønby Pedersen, Karl Gyllstrom, Shengyin Gu, Peter Jin Hong. “Automatic Generation of Research Trails in Web History.” IUI 2010, pp. 369–372, February 2010 (as supplied). https://doi.org/10.1145/1719970.1720033 — relevant to task trails.
3. Dan Morris, Meredith Ringel Morris, Gina Venolia. “SearchBar: A Search-Centric Web History for Task Resumption and Information Re-finding.” CHI 2008, pp. 1207–1216, April 2008 (as supplied). https://doi.org/10.1145/1357054.1357242 — relevant to task resumption.
4. Eugene Agichtein, Ryen W. White, Susan T. Dumais, Paul N. Bennett. “Search, Interrupted: Understanding and Predicting Search Task Continuation.” SIGIR 2012, August 2012 (as supplied). https://www.microsoft.com/en-us/research/publication/search-interrupted-understanding-and-predicting-search-task-continuation/ — prediction is future work, not implemented.
5. Maria Wirzberger et al. “Optimal feedback improves behavioral focus during self-regulated computer-based work.” Scientific Reports, 2024 (as supplied). https://doi.org/10.1038/s41598-024-53388-3 — behavioral feedback motivation; our formula is independent and unvalidated.
6. Joseph Chee Chang et al. “Tabs.do: Task-Centric Browser Tab Management.” UIST 2021 (as supplied). https://doi.org/10.1145/3472749.3474777 — task-centric organization, not a benchmark reproduced here.
7. Joseph Chee Chang et al. “When the Tab Comes Due: Challenges of Managing Browser Tabs.” CHI 2021 (as supplied). https://doi.org/10.1145/3411764.3445585 — problem framing.
8. Andy Cockburn and Bruce McKenzie. “What Do Web Users Do? An Empirical Analysis of Web Use.” International Journal of Human-Computer Studies, year given as 2000 in the brief; verify publication year, volume and pages before citation. No verified URL supplied.

Implementation tutorials / official documentation (not research papers):

9. Google Chrome Developers. “Handle events with service workers.” https://developer.chrome.com/docs/extensions/get-started/tutorial/service-worker-events — event handling and persistence; accessed September 2026.
10. Google Chrome Developers. “About extension service workers.” https://developer.chrome.com/docs/extensions/develop/concepts/service-workers — event-driven extension background architecture; accessed September 2026.
11. Google Chrome Developers. “Migrate to a service worker.” https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers — alarms and persistent state; accessed September 2026.

The research register supports follow-up academic writing; it is not a completed verified literature review or a PPT deliverable.
