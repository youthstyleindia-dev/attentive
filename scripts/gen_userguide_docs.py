import os

os.makedirs("docs/user-guide", exist_ok=True)

faq_content = """# Atentiv — Frequently Asked Questions (FAQ)
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

---

### 1. Why does opening a tab not immediately mean active time?
Opening a tab merely instantiates an HTML document inside the browser's tab strip. In modern browsing, users regularly open dozens of tabs in the background without reading or interacting with them. Counting raw tab open duration would severely distort productivity measurements. Atentiv only registers active time when a tab is in the focused foreground window and actively viewed by the user.

### 2. What is Dwell Time?
Dwell Time is the verified, accumulated duration during which a tab was actively focused, visible in the foreground, and experiencing user interaction (or active audible educational media playback) before an inactivity timeout or tab switch event occurred.

### 3. Why is a background tab not counted?
Background tabs do not receive human visual cognitive attention. Except for audible educational media (audited under FR-03), background tabs are dormant and produce no productive or distracting human dwell time.

### 4. What happens when I stop touching the computer?
After 180 seconds (3 minutes by default, configurable from 1 to 10 minutes in Options) without mouse, keyboard, or touch input, the browser flags an idle state via `chrome.idle.queryState`. Atentiv immediately freezes active dwell time accumulation and attributes all subsequent elapsed time to `idle_time`.

### 5. Why is a YouTube lecture productive but entertainment distracting?
Under FR-09, YouTube defaults to distracting (-1). However, Atentiv parses the page document title and metadata. When titles match educational and technical keywords (`lecture`, `tutorial`, `course`, `documentation`, `programming`, `code`), the classification engine promotes the page to productive (+1).

### 6. Why doesn't every tab switch reduce my score?
Switching between tabs within the same project (e.g., from an ArXiv paper to a coding editor or Python documentation) is natural knowledge work, not distraction. Atentiv computes Category Unrelatedness ($CU$). If you switch within the same Workstream or between related categories ($CU = 0$ or $CU = 1$), the penalty is negligible or zero.

### 7. What is the difference between tab switch and context switch?
A **tab switch** is simply an event where the active browser tab ID changes. A **context switch** is a cognitive discontinuity where the user transitions between unrelated tasks or opposing productivity categories (e.g., from Python coding to Instagram Reels, where $CU = 4$).

### 8. What is a Workstream?
A Workstream is an automatically clustered cognitive task thread that groups semantically and temporally related tabs (e.g., "Research on Transformers", "Tax Return Filing", "Bug Fix #402").

### 9. How does Atentiv decide Workstream membership?
Workstream membership uses TF-IDF vector similarity and temporal locality:
1. Feature vector extracted from page title and URL tokens.
2. Centroid cosine similarity threshold $\ge 0.68$.
3. Temporal window $\le 20$ minutes between tab interactions.
4. Auto-merges if $>3$ tabs share common links or centroid similarity $>0.85$.
5. Splits into a new Workstream after 15 continuous active minutes on an unrelated topic.

### 10. Why is a page untrackable?
A page is untrackable if browser security sandboxing forbids content script injection and monitoring (e.g., `chrome://`, `chrome-extension://`, `edge://`, `about:blank`, or the Chrome Web Store).

### 11. What happens on chrome:// pages?
The session engine detects restricted internal schemes, stops active dwell timers, sets the state to `UNTRACKABLE`, and displays a clean empty state (`—` score) in the HUD rather than corrupting your history or penalizing your score.

### 12. How does CSP work?
Context Switch Penalty ($CSP$) quantifies cognitive fragmentation:
$$CSP = \sum (SW \\times CU)$$
where $SW = 1.5$ for rapid switches ($\le 45$ seconds dwell) and $1.0$ otherwise, and $CU \\in \\{0, 1, 2, 4\\}$ reflects semantic category distance.

### 13. How is Focus Score calculated?
Production formula:
$$F = \\operatorname{round}(100(0.65PR + 0.35SR)) - SP$$
where $SP = \\min(40, N \\times 2)$, with $N$ being qualifying context switches. If tracked time is zero, $F$ displays `—` (no data).

### 14. What is PR?
PR (Productive Ratio) is the ratio of active productive dwell time relative to total tracked time. In SRS Revision 3.1, the exact baseline formula is officially marked `[To Be Specified]`; Atentiv uses provisional formula $PR = \\frac{T_{\\text{prod}}}{T_{\\text{prod}} + T_{\\text{neutral}} + T_{\\text{distract}}}$.

### 15. What is SR?
SR (Stability Ratio) measures attention continuity across workstreams. In SRS Revision 3.1, this is officially marked `[To Be Specified]`; Atentiv provisionally calculates $SR = 1.0 - \\min(1.0, \\frac{CSP}{100})$.

### 16. What happens if there is not enough data for PR/SR?
When no active sessions have accumulated ($T = 0$), the Focus Score is undefined. Atentiv displays an uncorrupted empty state with a dash (`—`), explicitly indicating that tracking will commence as you browse.

### 17. Can I override a classification?
Yes. In the Options page (`options.html`) or Rules overlay, you can define custom domain rules assigning any domain to Productive, Neutral, or Distracting. Custom rules take precedence over the FastText machine learning classifier.

### 18. What happens when I exclude a domain?
Excluded domains (e.g., banking portals, healthcare intranets) are immediately ignored by event listeners. No URLs, dwell time, tab titles, or sessions are ever recorded or written to IndexedDB.

### 19. What happens to old data when I add an exclusion?
Adding an exclusion stops all future tracking on that domain. To purge previously recorded sessions for that domain, use the "Purge Domain Data" button in Options.

### 20. How does Quick Resume work?
Quick Resume inspects your most recently active Workstream or saved snapshot and restores its exact tab configuration, active tab selection, and associated metadata in a single click.

### 21. What exactly gets restored?
Tab URLs, tab titles, tab pin states, and the designated active tab ID. Tab histories, form inputs, and authentication tokens are never recorded or restored.

### 22. Where is my data stored?
All data is stored exclusively in your local browser sandbox via IndexedDB using Dexie.js (`atentiv_db`).

### 23. Is IndexedDB encrypted?
No. The SRS Revision 3.1 explicitly specifies plain-text IndexedDB protected by browser and operating system profile sandboxing, along with strict query parameter and auth token stripping. Atentiv does NOT make false claims of application-level AES encryption.

### 24. Does Atentiv send data to a server?
No. Atentiv adheres to a strict Zero Data Egress model. There are no remote backends, telemetry servers, or cloud APIs. The network tab shows 0 outbound requests.

### 25. What happens if the database write fails?
Atentiv wraps all database writes in transactional try-catch blocks with an in-memory queue fallback, logging the warning to the background console without crashing the browser or interrupting user browsing.

### 26. How long are sessions retained?
By default, session records are retained locally for 30 days. You can configure retention periods or trigger manual purges in Options.

### 27. How do I export?
Navigate to `options.html` -> Data Management, and click **Export Data**. A complete JSON dump of your domains, rules, workstreams, and activity logs will be downloaded locally.

### 28. How do I permanently delete everything?
Navigate to `options.html` -> Data Management, click **Delete All Data**, and confirm the safety modal. All IndexedDB tables are wiped clean immediately.

### 29. What browsers are supported?
Google Chrome (v116+), Microsoft Edge (v116+), Brave (v1.57+), and any Chromium-based browser supporting Manifest V3 with the Side Panel API.
"""

user_guide = """# Atentiv — User Manual & Operations Guide
**Document Version:** 1.0.0 (SRS Revision 3.1 Baseline)

---

## 1. Introduction
Atentiv is an intelligent, zero-egress cognitive productivity companion that operates entirely inside your Chromium browser. It models user attention, clusters related browsing sessions into Workstreams, quantifies cognitive switching penalties, and preserves flow states without cloud telemetry.

---

## 2. The Three User Interfaces

### 2.1 Side Panel (`sidepanel.html`)
The primary companion interface during active browsing:
- **Live Focus Ring:** Visualizes real-time focus percentage ($0-100\\%$).
- **Active Dwell Display:** Live counter showing active minutes in the foreground tab.
- **Current Workstream Card:** Displays active task cluster with semantic tag chips.
- **Quick Controls:** Pause tracking, capture manual snapshot, or launch full dashboard.

### 2.2 Dashboard (`dashboard.html`)
Full-screen analytics and cognitive audit studio:
- **Workstream Graph:** Interactive topological map of tab links and semantic connections.
- **Attention Distribution:** Breakdown of Productive, Neutral, and Distracting dwell time.
- **Context Switch Penalty Log:** Audit log of switches exceeding threshold with itemized $SW \\times CU$ breakdown.
- **Snapshot Manager:** Review and restore saved workstream sessions.

### 2.3 Options (`options.html`)
Configuration and data governance hub:
- **Inactivity Timer:** Slider to adjust idle cutoff from 1 to 10 minutes (default 3 minutes).
- **Custom Rules:** Map any domain to Productive, Neutral, or Distracting.
- **Exclusion List:** Add domains to bypass tracking completely.
- **Data Governance:** Export JSON records or execute permanent zero-trace deletion.
"""

troubleshooting = """# Atentiv — Troubleshooting Guide
**Document Version:** 1.0.0

---

## Common Issues & Resolutions

### 1. Focus Score Displays "—" (Dash)
- **Cause:** No active browsing sessions have accumulated yet, or the current active page is a restricted browser URL (`chrome://`).
- **Resolution:** Navigate to an external HTTP/HTTPS website (e.g., Wikipedia, GitHub, MDN). Active dwell accumulation will begin immediately.

### 2. Side Panel Does Not Open
- **Cause:** Chromium version is older than v116, or the Side Panel permission was disabled.
- **Resolution:** Right-click the extension icon in the toolbar and select "Open side panel". Ensure your browser is updated to Chromium 116 or newer.

### 3. YouTube Tutorial Marked as Distracting
- **Cause:** Video title did not contain recognized educational keywords.
- **Resolution:** Open `options.html` -> Rules, and create a rule assigning `youtube.com` or specific channels to Productive, or use the Decision Trace modal to submit feedback.

### 4. Background Audio Not Accruing Dwell Time
- **Cause:** Media tab was muted or was classified under an entertainment category.
- **Resolution:** Under FR-03, background audio dwell time is only credited when the tab is audible AND categorized under Learning, Research, or Communication.
"""

with open("docs/user-guide/FAQ.md", "w") as f:
    f.write(faq_content)
with open("docs/user-guide/USER_GUIDE.md", "w") as f:
    f.write(user_guide)
with open("docs/user-guide/TROUBLESHOOTING.md", "w") as f:
    f.write(troubleshooting)

print("Generated docs/user-guide/ successfully.")
