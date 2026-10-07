# Workflow 13 — Workstream Grouping & Clustering
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-10, FR-13)

## 1. Clustering Parameters
- **Similarity Metric:** Cosine similarity on sentence embedding vectors.
- **Threshold:** Cosine similarity $\ge 0.68$.
- **Temporal Proximity:** Within 20 minutes without intervening unrelated distraction blocks.
- **Navigation Links:** Direct hyperlinked navigation automatically binds child pages to parent workstream.

## 2. Dynamic Merge
Two workstreams merge into one when:
- They share $\ge 3$ open or visited tabs, OR
- Centroid cosine similarity exceeds $0.85$.

## 3. Dynamic Split
A workstream splits when an unrelated topic is sustained for $> 15$ continuous active minutes.
