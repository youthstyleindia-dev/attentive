# Atentiv Preprocessing & Dataset Pipeline Audit

**Document:** `docs/architecture/preprocessing-audit.md`  
**Date:** October 14, 2026  
**Auditor:** Senior ML + Browser-Extension Systems Engineer  
**Baseline:** IEEE Std 830-1998 / SRS Revision 3.1 / Submission Version 3.0  
**Scope:** Runtime Preprocessing (`src/`), Offline Dataset & Training Pipeline (`model/`, `models/`), Preprocessing Spec & Parity

---

## 1. Executive Summary

This audit evaluates the existing text extraction, normalization, classification, and dataset training assets across the Atentiv repository. The primary objective is establishing complete, bit-for-bit parity between:
1. **Runtime Preprocessing in TypeScript (Part A):** Executed on-device inside the Chromium MV3 extension (`src/content/`, `src/features/`, `src/ml/`, `src/privacy/`, `src/rules/`).
2. **Offline Dataset & Model Training in Python 3.11 (Part B):** Executed reproducibly to train, evaluate, and quantize the on-device fastText classifier (`model/`, `models/`).

Both pipelines will be anchored to a shared, machine-readable specification (`model/configs/preprocessing.json` and `docs/architecture/preprocessing-spec.md`) with automated cross-language parity testing against 200 golden test vectors.

---

## 2. Inventory of Existing Assets

| Subsystem | Existing Path | Current State & Capability |
|---|---|---|
| **DOM Extraction** | `src/content/domExtractor.ts` | Extracts title (up to 300 chars), meta description/og:description (up to 500 chars), H1-H3 headings (up to 20), visible main/article text excerpt (up to 2 KB, stripping forms/inputs/scripts/styles/nav/footer), media playback detection. |
| **Content Script & HUD** | `src/content/pageContext.ts` | Observes DOM mutations with a 1000ms debounce, computes signal hash, notifies worker via `PAGE_SIGNALS_UPDATED`. Implements offline SVG letter avatar generation (zero network egress). |
| **URL Sanitization & Features** | `src/features/textFeatures.ts` | Strips query strings, hashes, credentials; tokenizes paths. `buildCompositeFeatureText` concatenates domain, tokens, title, description, headings, excerpt. |
| **Privacy & Exclusions** | `src/privacy/exclusionEngine.ts` | Evaluates sensitive domains (banking, health, adult) and user exclusion rules. Prevents dwell accumulation and drops records. |
| **User Rule Engine** | `src/rules/ruleEngine.ts` | Evaluates user custom rules (regex, domain match) with absolute top priority over ML models. |
| **Multi-Stage Classifier** | `src/ml/classifier.ts` | 6-stage pipeline: Exclusion → User Rules → Curated DB → fastText WASM → Keyword Fallback → Neutral. Generates `DecisionTraceRecord`. |
| **WASM Model Loader** | `src/ml/modelLoader.ts` | Fetches local `fastText.common.wasm` (350 KB) and `atentiv-page-category.ftz` (1.88 MB). Caches instance in memory. |
| **ATLAS Lifecycle** | `src/atlas/atlasEngine.ts` | Tracks tab states (`ACTIVE`, `INACTIVE`, `UNTRACKABLE`), handles 180s inactivity timeout with audio/video media exception. |
| **Python Offline Scripts** | `model/training/` | Scripts exist: `clean_dataset.py`, `preprocess.py`, `train.py`, `evaluate.py`, `create_fasttext_files.py`. |
| **Training Configs** | `model/configs/` | `taxonomy.json` (13 categories), `preprocessing_config.json`, `model_config.json`. |
| **Model Artifacts** | `public/models/`, `model/artifacts/` | Bundled `atentiv-page-category.ftz` (1.88 MB), `model_manifest.json` (SHA-256, validation metrics, per-class F1). |
| **Raw Dataset** | `/Users/divya/Downloads/cleaned_classified_data.parquet` | 19 MB cleaned raw dataset available on machine for ingestion. |

---

## 3. Gap Analysis: What Is Missing

1. **Unified Runtime Preprocessing Pipeline (`src/intelligence/`):**
   - The runtime pipeline currently has logic scattered across `domExtractor.ts`, `textFeatures.ts`, `classifier.ts`, and `sessionManager.ts`.
   - A single, pure, functional, unit-testable orchestrator is required: `src/intelligence/runtimePipeline.ts`. It must enforce the 11 gates and stages in exact sequence, returning typed step results and explicit reason codes for decision traces.

2. **Strict Field Joining & Normalization Parity Spec:**
   - Existing `buildCompositeFeatureText` in `src/features/textFeatures.ts` prepended domain and path tokens before title.
   - The authoritative specification requires:
     $$\text{CompositeText} = \text{join}(\text{title}, \text{description}, \text{headings}, \text{main\_text})$$
     with Unicode NFKC normalization, lowercase conversion, whitespace collapsing, removal of URLs/emails/long digit runs (>6 digits), removal of control characters, and length bounding.
   - This exact joining and cleaning algorithm must be specified in `model/configs/preprocessing.json` and mirrored identically in TypeScript and Python.

3. **Unified Category Taxonomy (`model/configs/labels.yaml`):**
   - The repo uses 13 canonical categories across `taxonomy.json`, `src/db/schemas.ts`, and `model_manifest.json`:
     `Technology`, `Education`, `Work`, `Research`, `Communication`, `Chat`, `News`, `Entertainment`, `Shop`, `Government`, `Health`, `Travel`, `Uncategorized`.
   - A declarative `model/configs/labels.yaml` must be created and validated at compile time so Python and TypeScript cannot diverge.

4. **Python Pipeline Entry Point & Environment:**
   - Missing single unified CLI entry point: `python -m model.pipeline --config model/configs/default.yaml`.
   - Missing pinned `requirements.txt` for Python 3.11 with `fasttext-wheel`, `pandas`, `pyarrow`, `scikit-learn`, `pyyaml`, `matplotlib`, `seaborn`.

5. **Parquet Schema & Dataset Provenance:**
   - Need standard Parquet dataset schema: `id`, `url_domain`, `title`, `description`, `headings`, `main_text`, `label`, `source`, `split`, `text_hash`, `created_at`.
   - Missing `models/data/DATASET_CARD.md` documenting open dataset provenance, licensing, absence of user PII, and collection methodology.

6. **Noise Augmentation in Training:**
   - Offline training must generate realistic runtime noise variants in the training split only: title-only samples, title+description only, missing headings, truncated excerpts.

7. **200 Golden Parity Test Fixtures:**
   - Missing `tests/fixtures/golden_preprocessing.json` containing 200 real-world extracted page records, the exact expected normalized string, and expected labels.
   - Missing automated cross-language verification test confirming character-for-character identical outputs between TS and Python.

---

## 4. Conflict Resolution & Compatibility Plan

| Potential Conflict | Pre-existing Code | Target Rule / Resolution |
|---|---|---|
| **Composite Text Order** | Domain + path tokens + title + desc + headings + excerpt (`src/features/textFeatures.ts`) | **Resolution:** Update to exact spec: `title`, `description`, `headings`, `main_text`. URL domain is already evaluated in curated domain and exclusion stages; aligning text to page content dramatically improves NLP generalization. |
| **Taxonomy Definition** | 13 categories in `model/configs/taxonomy.json` vs 11 proposed in prompt | **Resolution:** Step B1 instructs matching the existing categories in `src/`. We retain the 13 canonical categories (`Technology`, `Education`, `Work`, `Research`, `Communication`, `Chat`, `News`, `Entertainment`, `Shop`, `Government`, `Health`, `Travel`, `Uncategorized`) in `labels.yaml`, preventing breaking changes to IndexedDB schemas, workstream clustering, and existing UI views. |
| **Model Filename** | `atentiv-page-category.ftz` vs `atentiv-classifier.ftz` | **Resolution:** Build both `atentiv-classifier.ftz` and keep `atentiv-page-category.ftz` synchronized, updating `model_manifest.json` and `modelLoader.ts` to support both seamlessly. |
| **Preservation of Legacy & Archive** | `archive/packaged-runtime-pre-source/` exists | **Resolution:** Do not touch `archive/`. Create `model/archive/` to preserve historical scripts and configs without deletion. |

---

## 5. Execution Roadmap

- **Phase 1 (Audit & Spec):**
  - Commit this audit report (`docs/architecture/preprocessing-audit.md`).
  - Create machine-readable `model/configs/preprocessing.json` and `model/configs/labels.yaml`.
  - Author formal specification `docs/architecture/preprocessing-spec.md`.
- **Phase 2 (Runtime Preprocessing - Part A):**
  - Implement `src/intelligence/runtimePipeline.ts` covering Stages 1–11 with typed reason codes.
  - Implement text normalization mirroring spec.
  - Update `src/ml/classifier.ts` and `src/content/pageContext.ts`.
  - Add comprehensive unit tests in `tests/unit/preprocessing.test.ts`.
- **Phase 3 (Offline Dataset & Training - Part B):**
  - Setup Python 3.11 environment via `requirements.txt`.
  - Implement modular `model/pipeline.py` with noise augmentation and Parquet schema.
  - Generate Parquet datasets, fastText train/val/test splits, and `models/data/DATASET_CARD.md`.
  - Train quantized model, export confusion matrix and `metrics.json`.
  - Author `docs/architecture/model-evaluation.md`.
- **Phase 4 (Golden Parity Verification):**
  - Generate `tests/fixtures/golden_preprocessing.json` (200 test cases).
  - Run automated parity tests in both TS (`tests/unit/parity.test.ts`) and Python (`model/test_parity.py`).
- **Phase 5 (Full Verification):**
  - Run `npm test`, `npm run test:browser`, `npm run benchmark`, `npm run build`.
