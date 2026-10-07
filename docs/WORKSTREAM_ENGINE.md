# Atentiv Online Workstream Clustering Engine

This document details the online clustering, vector similarity, and state transition mechanisms implemented in `src/workstreams/workstreamEngine.ts`, `src/workstreams/similarity.ts`, and `src/workstreams/contextSwitch.ts`.

---

## 1. Concept: Dynamic Workstream Clustering

Rather than forcing users to manually organize tabs into project folders, Atentiv automatically clusters browsing sessions into **workstreams** in real time.

A workstream represents an ongoing cognitive task context (e.g. *"Rust WebAssembly Compiler"*, *"Database Migration Research"*).

---

## 2. Multi-Factor Workstream Similarity Score

When a user opens or switches to a tab, the engine computes a composite similarity score $S(T, W_i)$ between the incoming tab $T$ and each existing active workstream $W_i$:

$$S(T, W_i) = w_d \cdot S_{\text{domain}} + w_c \cdot S_{\text{category}} + w_v \cdot S_{\text{vector}} + w_t \cdot S_{\text{recency}}$$

### Component Formulations

1. **Domain Overlap Score ($S_{\text{domain}}$, weight $w_d = 0.35$):**
   $$S_{\text{domain}} = \begin{cases} 1.0 & \text{if } \text{domain}(T) \in \text{domains}(W_i) \\ 0.0 & \text{otherwise} \end{cases}$$

2. **Category Match Score ($S_{\text{category}}$, weight $w_c = 0.25$):**
   $$S_{\text{category}} = \begin{cases} 1.0 & \text{if } \text{category}(T) = \text{category}(W_i) \\ 0.0 & \text{otherwise} \end{cases}$$

3. **fastText Sentence Vector Cosine Similarity ($S_{\text{vector}}$, weight $w_v = 0.25$):**
   Given the 64-dimensional L2-normalized embedding $\vec{v}_T$ and workstream centroid vector $\vec{C}_{W_i}$:
   $$S_{\text{vector}} = \max\left(0, \frac{\vec{v}_T \cdot \vec{C}_{W_i}}{\|\vec{v}_T\|_2 \|\vec{C}_{W_i}\|_2}\right)$$

4. **Temporal Recency Decay Score ($S_{\text{recency}}$, weight $w_t = 0.15$):**
   Accounts for temporal proximity, favoring recently active contexts:
   $$S_{\text{recency}} = \exp(-\lambda \cdot \Delta t)$$
   Where $\Delta t$ is elapsed time in minutes since the workstream was last active, and $\lambda = 0.001$.

---

## 3. Thresholds and Online Allocation

- **Similarity Threshold**: $\tau = 0.45$.
- **Assignment Logic**:
  - If $\max_i S(T, W_i) \ge \tau$: Tab $T$ is assigned to the best-matching workstream $W^*$.
  - Centroid vector $\vec{C}_{W^*}$ is incrementally updated via moving average:
    $$\vec{C}_{W^*} \leftarrow \alpha \vec{C}_{W^*} + (1 - \alpha) \vec{v}_T \quad (\alpha = 0.85)$$
  - If $\max_i S(T, W_i) < \tau$: A new candidate workstream is instantiated using tab metadata and category.

---

## 4. Context Switch Evaluation & Penalties

Switching contexts incurs high cognitive friction. Atentiv evaluates every transition:

1. **Workstream Identity Change**:
   If $W_{\text{current}} \neq W_{\text{previous}}$, a context switch is recorded.
2. **Category Shift**:
   Switching between radically different categories (e.g. `Computers` $\rightarrow$ `Entertainment`) incurs higher penalty than switching within the same domain.
3. **Rapid Thrashing Multiplier**:
   If the duration in the previous workstream was less than 60 seconds, the transition is classified as "attention thrashing" and receives a penalty boost:
   $$\text{penalty} = \min(40, \text{base\_penalty} \times 1.5)$$
4. **Cap**: The cumulative context switch penalty subtracted from the Focus Score is capped at 40 points to avoid negative or distorted scores.
