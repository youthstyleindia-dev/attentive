# Atentiv — Viva Voce: Algorithm & Mathematical Formulations
**Specification Baseline:** SRS Revision 3.1 / Submission Version 3.0

---

### Q1: Explain the Context Switch Penalty (CSP) formula and why $SW = 1.5$ exists.
**Answer:** The formula is $CSP = \sum (SW \times CU)$. $SW$ represents Switch Weight: if a user leaves a tab in $\le 45$ seconds, $SW = 1.5$, otherwise $1.0$. The $1.5$ multiplier mathematically models cognitive science findings on "attention residue": rapid hopping between tabs induces greater cognitive fatigue than deliberate task transitions.

### Q2: How does the Workstream clustering algorithm work?
**Answer:** Workstream clustering utilizes TF-IDF vectorization over sanitized URL paths and page titles. When a tab is visited, its cosine similarity against active Workstream centroids is calculated. If the similarity $\ge 0.68$ and the visit occurred within a 20-minute temporal window, it joins the cluster. Workstreams automatically merge if $>3$ tabs share common links or centroid similarity exceeds $0.85$, and split if the user spends $>15$ continuous minutes on an unrelated topic.

### Q3: Why is Focus Score undefined ($—$) when tracked time is zero?
**Answer:** Displaying 0/100 implies that the user was completely distracted or penalized. When the user has just installed the extension or is browsing internal `chrome://` pages, zero data has been collected. Displaying `—` preserves scientific integrity and prevents false negative feedback.
