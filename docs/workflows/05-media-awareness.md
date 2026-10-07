# Workflow 05 — Media Playback & Background Audio
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
