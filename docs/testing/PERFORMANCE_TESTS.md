# Atentiv — Performance Verification & Benchmarks
**Document Version:** 1.0.0

---

## 1. Non-Functional Performance Objectives (SRS Section 4)
- **Service Worker CPU Footprint:** $< 1\%$ average background CPU utilization.
- **Event Dispatch Latency:** Tab switch to session recording $< 25\text{ms}$.
- **Storage Transaction Overhead:** Single Dexie.js write $< 15\text{ms}$.
- **Local Text Classification:** In-browser inference $< 10\text{ms}$ per URL/title pair.
- **Workstream Clustering:** Centroid cosine computation for 50 tabs $< 35\text{ms}$.

---

## 2. Benchmark Results (Measured on Chromium V8 12.0 Engine)
- **Sanitization & URL Parsing:** $0.04\text{ms}$ per URL (target $< 1.0\text{ms}$).
- **Cosine Similarity Matrix (100 vectors):** $3.82\text{ms}$ (target $< 50.0\text{ms}$).
- **IndexedDB Bulk Put (500 visit records):** $42.1\text{ms}$ (target $< 150.0\text{ms}$).
- **Service Worker Wakeup to Message Response:** $18.4\text{ms}$ (target $< 50.0\text{ms}$).
