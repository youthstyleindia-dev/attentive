# Atentiv Model Evaluation & Benchmark Report

This document reports the empirical evaluation metrics for the quantized fastText WebAssembly classifier evaluated against the 4,710 hold-out test samples (`model/data/test.txt`).

---

## 1. Summary Metrics Comparison

| Evaluation Metric | Raw `.bin` Model | Quantized `.ftz` Model | Relative Delta (%) | Target Requirement |
| :--- | :---: | :---: | :---: | :---: |
| **Model Size** | 37.59 MB | **1.80 MB** | **-95.2%** | < 5.0 MB |
| **Precision @ 1** | 0.7461 | **0.7301** | -2.1% | > 0.70 |
| **Precision @ 3** | 0.4638 | **0.4570** | -1.5% | > 0.40 |
| **Recall @ 3** | 0.7897 | **0.7782** | -1.5% | > 0.75 |
| **Micro Precision** | 0.7343 | **0.6952** | -5.3% | > 0.65 |
| **Micro Recall** | 0.6140 | **0.6351** | +3.4% | > 0.60 |
| **Micro F1 Score** | 0.6688 | **0.6638** | **-0.75%** | > 0.65 |
| **Macro F1 Score** | 0.6071 | **0.6144** | +1.2% | > 0.55 |
| **Median Latency** | 0.031 ms | **0.030 ms** | -3.2% | < 5.0 ms |
| **p95 Latency** | 0.124 ms | **0.083 ms** | **-33.1%** | < 15.0 ms |

---

## 2. Per-Label Performance Breakdown (Hold-Out Test Set)

Evaluated on 4,710 test rows across the 11 classes:

| Category Class | Precision | Recall | F1-Score | Support (Test Samples) |
| :--- | :---: | :---: | :---: | :---: |
| **Chat / Messaging** | 0.8817 | 0.8067 | **0.8425** | 388 |
| **Entertainment** | 0.7423 | 0.7359 | **0.7391** | 1,609 |
| **Education** | 0.7465 | 0.7148 | **0.7303** | 1,504 |
| **Sports** | 0.8122 | 0.6285 | **0.7088** | 471 |
| **Adult** | 0.6800 | 0.6415 | **0.6602** | 212 |
| **Computers / Tech** | 0.6641 | 0.6402 | **0.6519** | 1,842 |
| **Travel** | 0.6633 | 0.5372 | **0.5936** | 363 |
| **Government** | 0.6599 | 0.5010 | **0.5696** | 519 |
| **News** | 0.5993 | 0.4643 | **0.5233** | 827 |
| **Shop** | 0.4981 | 0.4190 | **0.4552** | 630 |
| **Health** | 0.6045 | 0.3473 | **0.4411** | 383 |

---

## 3. Analysis & Key Insights

1. **High Support & Accuracy in Core Classes**:
   - High F1 scores in `Chat` (0.84), `Entertainment` (0.74), and `Education` (0.73) provide robust detection for cognitive context transitions.
2. **Minimal Quantization Degradation**:
   - Compressing the model by 20.9x resulted in less than 1% loss in Micro F1 (from 0.6688 to 0.6638), while drastically reducing p95 inference latency from 0.124 ms to 0.083 ms.
3. **Multi-Stage Safety Net**:
   - Classes with lower stand-alone F1 scores (e.g. `Shop` at 0.455) are supplemented by Stage 4 curated domain rules (`amazon.com`, `ebay.com`, `shopify.com`), guaranteeing deterministic 100% precision on leading commercial platforms.
