# Context Switch & Productivity Evaluation Algorithm
## Pure Tab Switching, Switch Burden, and Decoupled Metrics

### 1. The Pure Tab Switch Invariant
In earlier iterations, context switches were conflated with ML semantic shifts and workstream boundary crossings. This introduced severe non-determinism: reading through a documentation page with dense terminology could spuriously trigger a "context switch" even if the user never touched a tab.

Under the ATLAS specification:
$$\text{ContextSwitch}(t) = 1 \iff \text{activeTabId}(t) \neq \text{activeTabId}(t-1)$$

**Invariant**:
- No change in workstream, topic, or ML model output can increment the Context Switch Counter.
- Navigating within an active tab (in-page SPA links, pushState) does **not** constitute a context switch.
- Pure tab switches are counted strictly upon `chrome.tabs.onActivated` or active window focus change.

---

### 2. Switch Burden Metric (Qualitative Friction)
While the context switch count is pure and deterministic, not all tab switches impose the same cognitive overhead. Switching from `react.dev` to `stackoverflow.com` while debugging React code is a low-friction tool switch, whereas jumping from `github.com` to `youtube.com` or `instagram.com` imposes significant disruption.

To capture this without altering the switch count, ATLAS computes an independent **Switch Burden Score** ($B \in [0, 100]$):

$$B = 100 \cdot \left( 0.25 \cdot \mathbf{1}(\text{domain}_{t} \neq \text{domain}_{t-1}) + 0.35 \cdot \mathbf{1}(\text{stream}_{t} \neq \text{stream}_{t-1}) + 0.25 \cdot \mathbf{1}(\text{category}_{t} \neq \text{category}_{t-1}) + 0.15 \cdot \min\left(1, \frac{10}{\Delta t}\right) \right)$$

#### Burden Classification
- **Low Burden ($B < 35$)**: Rapid switch within the same project/stream (e.g. documentation check).
- **Medium Burden ($35 \le B < 65$)**: Cross-tool switch within related domain or prolonged dwell.
- **High Burden ($B \ge 65$)**: Severe cognitive disruption crossing both workstream and domain boundaries, or rapid oscillating switches ($< 10\text{s}$).

---

### 3. Decoupled Focus Score & Active Coverage

#### A. Focus Score Formula
$$\text{Focus Score} = \begin{cases} 
100 \times \frac{T_{\text{productive}}}{T_{\text{productive}} + T_{\text{unproductive}}}, & \text{if } T_{\text{productive}} + T_{\text{unproductive}} > 0 \\
85, & \text{if fresh / baseline}
\end{cases}$$

- **Uncoupled from Idle Time**: Inactivity is **never** added to the denominator. If a user works productively for 4 hours and steps away for 45 minutes, their Focus Score remains 100%, accurately reflecting their attention quality while browsing.
- **Uncoupled from Neutral Sites**: Utility tabs (e.g. password managers, email) do not drag down the core ratio.

#### B. Active Coverage Formula
To transparently communicate total computer presence:
$$\text{Active Coverage} = 100 \times \frac{T_{\text{productive}} + T_{\text{unproductive}} + T_{\text{neutral}}}{T_{\text{productive}} + T_{\text{unproductive}} + T_{\text{neutral}} + T_{\text{idle}}}$$

#### C. Net Productive Time
$$T_{\text{net}} = T_{\text{productive}} - T_{\text{unproductive}}$$
Reported in hours and minutes (`+3h 34m`), giving users an unambiguous balance sheet of their daily browser attention.
