# Implementation Audit: Atentiv System

**Document Version:** 1.0.0  
**Project:** Atentiv — Privacy-Preserving Browser Activity Intelligence + Personalized Local Classification + Workstream Detection  
**Academic Basis:** Atentiv Software Requirements Specification (SRS) v2.0 (Department of Computer Science & Engineering, Sardar Patel Institute of Technology)  
**Dataset Reference:** Hugging Face `tshasan/multi-label-web-categorization` (49,399 training rows, 11 categories, CC BY 4.0), located locally at `models/data/raw/cleaned_classified_data.parquet`.

---

## 1. Existing Architecture & Baseline

Before this major implementation step, the repository contained a preliminary proof-of-concept Chrome extension (originally titled *Cognitive Stream*, recently rebranded to *Atentiv*):
- **Runtime:** Chrome Manifest V3 service worker (`src/background.ts`) relying on `chrome.storage.local` and `chrome.storage.session`.
- **Frontend:** Single React 19 + TypeScript application (`src/main.tsx`) with custom CSS (`src/style.css`), bundled via Vite 6.
- **Data Model:** A single monolithic `State` object (`src/model.ts`) serialized into `chrome.storage.local`, holding flat arrays of visits and snapshots.
- **Classification:** Rudimentary static string matching (domain exact/subdomain match and keyword presence in URL/title) returning one of 4 predefined streams.
- **Testing:** Playwright E2E script (`tests/browser.mjs`), basic node test runners for heuristics (`tests/model.test.ts`, `tests/worker.test.ts`).

---

## 2. Identified Limitations & Gaps vs. SRS v2.0

| SRS Requirement | Baseline Status | Required Full Implementation |
| :--- | :--- | :--- |
| **IndexedDB Persistence** | Missing (`chrome.storage.local` with 5MB quota limit and monolithic JSON blob) | Full versioned Dexie.js database (`AtentivDB`) with 13 relational object stores |
| **ML Page Classification** | None (only 4 hardcoded streams and string lookups) | Supervised fastText multi-label model trained on 49,399 web pages, quantized to `.ftz`, executed locally via fastText WASM |
| **Domain & Keyword Libraries** | Hardcoded inside TypeScript arrays | Structured, versioned JSON libraries for Domains, Activities, Keywords, and Productivity |
| **Personalized User Rules** | Minimal domain exclusion text box | Hierarchical rule engine supporting regex, domains, path tokens, categories, and actions |
| **Workstream Engine** | Basic stream ID tag | Multi-factor similarity engine (semantic vectors, category overlap, temporal proximity, navigation linkage) with centroids |
| **Decision Traceability** | None | Full `decision_traces` store capturing inputs, rule matches, model probabilities, and latency |
| **Content Scripts** | None (background worker only inspected active tab URL/title) | Content scripts extracting DOM headings, meta descriptions, snippets, and mutation observing |
| **Media & Audio Awareness** | None | Audio/video playback detection via tab status and DOM media element state |
| **Side Panel & Dashboard** | Single view with simulated responsive collapse | Dedicated Side Panel, Full Visual Dashboard (with workstream constellations and switch reports), and Options view |

---

## 3. Technology Stack Decisions

1. **Database:** `Dexie.js` over native `IndexedDB` for transactional reliability, indexed querying (by date, workstream, domain, productivity), and clean schema versioning.
2. **Local Machine Learning:**
   - **Training:** Python 3.11 with `pandas`, `pyarrow`, `numpy`, `scikit-learn`, and `fasttext-wheel`.
   - **Inference Runtime:** `fasttext.wasm.js` (342 KB WebAssembly binary), embedded entirely in the extension bundle with zero network dependency.
   - **Model Format:** Quantized `.ftz` (under 10 MB) supporting both multi-label predictions (`predict`) and sentence embeddings (`getSentenceVector`).
3. **Frontend:** React 19, TypeScript, Lucide React icons, Vite 6, and responsive multi-view support (`dashboard`, `sidepanel`, `options`).
4. **Service Worker:** Manifest V3 compliant, non-blocking event-driven pipeline with timestamp intervals and atomic IndexedDB updates.

---

## 4. Preservation & Migration Strategy

- **Preserve Existing UI Strengths:** Keep the responsive CSS foundation and polished visual design, expanding it to accommodate the rich dashboard charts, workstream constellation graphs, decision trace inspector, rule editor, and Side Panel.
- **Preserve Backward Compatibility:** Migrate data from `chrome.storage.local` to `AtentivDB` upon initial boot.
- **Modular Directory Reorganization:** Organize source code into distinct modules:
  - `src/db/`: Dexie schema, repositories, and migrations.
  - `src/rules/`: Hierarchical rule matcher and default libraries.
  - `src/features/`: Safe tokenization, feature schemas, and content normalization.
  - `src/ml/`: fastText WASM loader, inference caching, and classification pipeline.
  - `src/workstreams/`: Clustering, similarity scoring, centroids, and context switches.
  - `src/analytics/`: Productivity classification, focus scoring formulas, dwell time.
  - `src/content/`: DOM extractor, content privacy filter, mutation handler.
  - `src/background/`: Event monitor, session manager, recovery manager, message router.
  - `model/`: Dataset cleaner, fastText trainer, evaluator, quantizer, and manifests.
  - `libraries/`: Versioned JSON taxonomies and domain/keyword libraries.
  - `docs/`: Comprehensive technical documentation, architecture specs, and model cards.

---

## 5. Files Added / Modified Plan

- **`model/`**: Full python training suite (`inspect_dataset.py`, `clean_dataset.py`, `preprocess.py`, `create_fasttext_files.py`, `train.py`, `evaluate.py`, `quantize.py`, `export_manifest.py`).
- **`libraries/`**: 8+ JSON configuration files for domains, keywords, activities, rules, and privacy.
- **`src/`**: Modular TypeScript architecture replacing monolithic files.
- **`public/`**: Bundled `models/atentiv-page-category.ftz` and `wasm/fastText.common.wasm`.
- **`docs/`**: Complete suite of 16 documentation files as mandated by the master specification.
- **`tests/`**: Unit, integration, database, and model validation test suites.
- **`scripts/`**: Benchmarking and validation scripts.
