# Atentiv — Viva Voce: Architecture Questions & Answers
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

---

### Q1: Why did you choose Manifest V3 instead of Manifest V2?
**Answer:** Chrome deprecated Manifest V2. Manifest V3 is the modern mandatory web standard for Chromium extensions. It provides stronger security by disabling `eval()` and remote code execution, reduces background resource usage via event-driven service workers, and introduces dedicated native APIs like `chrome.sidePanel`.

### Q2: How does the Service Worker survive browser termination without losing active timers?
**Answer:** Service workers in MV3 are ephemeral. Atentiv writes the timestamp of the current active session entry directly to `chrome.storage.session` and IndexedDB upon tab activation. When an event wakes the Service Worker, `SessionManager.initFromStorage()` rehydrates the in-memory timer from storage, ensuring zero dwell time is lost across service worker shutdowns.

### Q3: What is the purpose of the 3 separate HTML files (`sidepanel.html`, `dashboard.html`, `options.html`)?
**Answer:** The SRS explicitly mandates three distinct user entry points:
1. `sidepanel.html`: Persistent, narrow in-browser companion for live HUD tracking.
2. `dashboard.html`: Full-window studio for deep historical analytics, graphs, and switch audits.
3. `options.html`: Extension configuration portal for custom rules, exclusions, and data export/purge.
Using dedicated HTML entry points prevents UI bloat and ensures optimal memory usage.
