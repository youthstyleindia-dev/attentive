# Model Card — Atentiv Page Category Classifier

## Model Details
- **Model Name**: Atentiv Web Page Category Multi-Label Classifier
- **Architecture**: fastText Supervised Multi-Label with One-Versus-All (`loss='ova'`)
- **Quantization**: fastText compressed vector & matrix quantization (`.ftz`)
- **Artifact File**: `public/models/atentiv-page-category.ftz`
- **Model Size**: **1.80 MB** (1,887,436 bytes) — reduced 20.9x from 37.59 MB raw model
- **Embedding Dimension**: 64
- **Runtime Environment**: In-browser offline WebAssembly (`fastText.common.wasm`, 342 KB)
- **Primary Use**: Zero-cloud, on-device categorization of web pages to power workstream clustering and privacy-first browsing analytics.

---

## Intended Use
- **Primary Domain**: Privacy-preserving web browsing attention intelligence.
- **Intended Users**: Knowledge workers, developers, researchers, and students managing attention and multitasking.
- **Out of Scope**: 
  - Direct assessment of user productivity (handled contextually by the rule engine, NOT by this model).
  - Web censorship, blocking, or parental monitoring.

---

## Training Data & Provenance
- **Dataset**: `tshasan/multi-label-web-categorization`
- **Source**: Hugging Face Datasets ([tshasan/multi-label-web-categorization](https://huggingface.co/datasets/tshasan/multi-label-web-categorization))
- **Total Rows**: 49,399 raw records; 47,093 unique de-duplicated instances.
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0).
- **Split Distribution**:
  - Training Set: 37,673 samples (80%)
  - Validation Set: 4,710 samples (10%)
  - Test Set: 4,710 samples (10%)
- **Feature Inputs**: Normalized domain, URL path tokens, clean title, meta description, and page headings.

---

## Controlled Output Classes (11 Categories)
1. `Computers` (Developer tools, programming, engineering, tech)
2. `Education` (Academia, courses, textbooks, science)
3. `Entertainment` (Streaming, video, gaming, music)
4. `News` (Journalism, current affairs, press)
5. `Chat` (Messaging, forums, communication platforms)
6. `Shop` (E-commerce, consumer goods, retail)
7. `Government` (Public administration, civic portals)
8. `Health` (Medicine, fitness, wellness)
9. `Travel` (Aviation, transit, lodging)
10. `Sports` (Athletics, leagues, fitness)
11. `Adult` (Filtered & excluded by privacy filter)

---

## Quantitative Performance Metrics (Quantized Model on Test Set)

| Metric | Raw Model (37.59 MB) | Quantized Model (1.80 MB) | Target |
| :--- | :---: | :---: | :---: |
| **Precision @ 1** | 0.7461 | **0.7301** | > 0.70 |
| **Micro F1** | 0.6688 | **0.6638** | > 0.65 |
| **Macro F1** | 0.6071 | **0.6144** | > 0.55 |
| **Inference Latency (Median)** | 0.031 ms | **0.030 ms** | < 5.0 ms |
| **Inference Latency (p95)** | 0.124 ms | **0.083 ms** | < 15.0 ms |
| **Memory Footprint** | ~55 MB | **< 8 MB** | < 25 MB |

---

## Ethical Considerations & Privacy Guarantees
- **No Cloud Transmission**: The model weights and WebAssembly runtime execute exclusively in browser memory.
- **Zero Ingestion of User Text**: The model only performs inference; it does not retain user browsing history or transmit fine-tuning gradients.
- **Pre-Emptive Sensitive Exclusions**: Sensitive domains (financial portals, healthcare records, password managers) are filtered prior to model evaluation.
