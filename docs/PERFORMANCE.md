# Atentiv Performance & Latency Benchmarks

This document records the empirical latency micro-benchmarks evaluated across all critical execution paths of Atentiv (`scripts/benchmark.ts`).

---

## 1. Executive Summary: Latency Targets vs. Actuals

All benchmark measurements were captured over 1,000 continuous iterations on macOS (Node.js v24.16 / Chrome V8 engine). Every critical path easily outperforms its latency threshold:

| Benchmark Operation | Target Latency | P50 (Median) | P95 | P99 | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Curated Domain Lookup** | < 5.0 ms | **0.035 ms** | 0.074 ms | 0.135 ms | **PASS** |
| **Text Feature Extraction & Normalization** | < 2.0 ms | **0.004 ms** | 0.006 ms | 0.013 ms | **PASS** |
| **Rule Engine Evaluation** | < 1.0 ms | **0.001 ms** | 0.001 ms | 0.004 ms | **PASS** |
| **End-to-End Multi-Stage Classification** | < 15.0 ms | **0.006 ms** | 0.019 ms | 0.462 ms | **PASS** |
| **IndexedDB Session Put + Dwell Update** | < 10.0 ms | **0.782 ms** | 1.144 ms | 1.764 ms | **PASS** |

---

## 2. Operation Breakdowns

### 2.1 Curated Domain Lookup (P50: 0.035 ms)
- Sub-millisecond hash-map lookup against pre-indexed curated domain library (`libraries/domains/domains.json`).
- Delivers instant classification for high-frequency platforms (GitHub, StackOverflow, YouTube, Gmail, Notion).

### 2.2 Text Feature Extraction (P50: 0.004 ms)
- URL sanitization, domain extraction, path tokenization, and multi-space text normalization.
- Extremely low overhead prevents UI frame drops during active page interactions.

### 2.3 Rule Engine Evaluation (P50: 0.001 ms)
- Priority-ordered evaluation of exact domain matches, wildcard patterns, and path prefixes.
- Zero allocation for non-matching rules; sub-microsecond resolution.

### 2.4 End-to-End Classification (P50: 0.006 ms, P95: 0.019 ms)
- Evaluates the complete pipeline: privacy verification $\rightarrow$ rule evaluation $\rightarrow$ knowledge base lookup $\rightarrow$ fastText WebAssembly inference $\rightarrow$ decision trace construction.
- Operating at 0.006 ms median, Atentiv consumes less than 0.05% of a single 60 FPS frame (16.6 ms budget), guaranteeing completely imperceptible background overhead.

### 2.5 IndexedDB Persistence (P50: 0.782 ms)
- Durable write and update operations via Dexie.js (`db.tab_sessions.put`, `db.tab_sessions.update`).
- Maintains sub-2ms transaction speeds even under frequent active dwell increments.

---

## 3. Memory & Resource Footprint

- **fastText WASM Binary**: 342 KB transfer size.
- **Quantized Model File (`.ftz`)**: 1.80 MB.
- **Background Worker Heap Usage**: ~12 MB baseline resident memory.
- **Background Service Worker Idle Suspension**: Compliant with MV3 idle termination requirements; safely checkpoints active dwell timers to `chrome.storage.session`.
