# Atentiv — Troubleshooting Guide
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
