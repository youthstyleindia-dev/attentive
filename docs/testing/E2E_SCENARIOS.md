# Atentiv — End-to-End Test Scenarios
**Document Version:** 1.0.0 (SRS Revision 3.1 Baseline)

---

### Scenario E2E-01: Standard Research Workflow with PDF and Video
1. **Initial State:** Browser launched with Atentiv loaded. Active profile empty.
2. **Action 1:** User opens Google Search: `https://www.google.com/search?q=quantum+computing`.
   - *Verification:* Session created. Category inferred as "Search & Utilities". State = ACTIVE.
3. **Action 2:** User clicks link to ArXiv paper: `https://arxiv.org/abs/2301.00000`.
   - *Verification:* Workstream initiated ("Quantum Computing ArXiv"). Dwell timer starts. Category = "Research".
4. **Action 3:** User opens YouTube lecture: `https://youtube.com/watch?v=123` titled "Quantum Computing Lecture 1".
   - *Verification:* Audio starts playing. Because title contains "lecture", YouTube is promoted from Distracting (-1) to Productive (+1).
5. **Action 4:** User switches between ArXiv and YouTube tab every 2 minutes.
   - *Verification:* Category relatedness $CU = 1$ (Research & Learning). Tab switches do NOT incur extreme penalties ($CU \le 1$). Focus Score stays high (>80).

---

### Scenario E2E-02: Restricted Protocol & Idle Handling
1. **Action 1:** User navigates to `chrome://settings`.
   - *Verification:* Protocol detector triggers. Session marked `UNTRACKABLE`. Active dwell timer stops. HUD displays `—` (no data) with untrackable badge.
2. **Action 2:** User leaves computer untouched for 185 seconds (inactivity threshold = 180s).
   - *Verification:* `chrome.idle.onStateChanged` fires `'idle'`. Active dwell accumulation ceases. Session record writes `idle_time = 185`.

---

### Scenario E2E-03: Rapid Multitasking & Context Penalty Escalation
1. **Action:** User alternates between `github.com/repo` (Technology, Productive) and `instagram.com` (Social Media, Distracting) every 15 seconds for 8 switches.
2. **Verification:**
   - Switch intervals $\le 45\text{s} \implies SW = 1.5$.
   - Category difference (Technology vs Social Media) $\implies CU = 4$ (Unrelated).
   - Switch penalty increments by $1.5 \times 4 = 6.0$ per switch.
   - Total context switches in 10-minute sliding window exceeds 6.
   - High Frequency Switching Warning banner triggers with guidance to resume single-task focus.
