# Atentiv Model Pipeline & Training Subsystem

This subsystem handles the offline dataset curation, preprocessing, supervised fastText training, quantization, evaluation, and cross-language runtime parity enforcement for the Atentiv Page Classifier.

The authoritative specification is documented in [preprocessing-spec.md](file:///Users/divya/Documents/Atentiv-Variation-3/docs/architecture/preprocessing-spec.md).

---

## 1. Quickstart & Exact Run Instructions

### Environment Setup (Python 3.11)
```bash
# 1. Create a dedicated Python 3.11 virtual environment
python3.11 -m venv .venv
# Alternatively with uv:
# uv venv .venv --python 3.11

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Install pinned dependencies
pip install -r model/requirements.txt
```

### Run Entire Pipeline (Single Entrypoint)
To run raw dataset loading, cleaning, domain-stratified splitting, noise augmentation, Parquet export, supervised FastText training, quantization, held-out evaluation, and golden fixture export:

```bash
python -m model.pipeline --config model/configs/default.yaml
```

### Parity Verification
Verify that Python and TypeScript extract, normalize, and composite text with 100% character-for-character parity:

```bash
# Python parity test against 200 golden fixtures
pytest model/test_parity.py

# TypeScript parity test
npm test
# Or specifically:
npx tsx --test tests/unit/parity.test.ts
```

---

## 2. Directory Structure & Key Files

```
model/
├── README.md                     # This runbook and architecture guide
├── requirements.txt              # Pinned Python 3.11 dependencies
├── pipeline.py                   # Single executable pipeline orchestrator
├── test_parity.py                # Pytest golden fixture parity runner
├── configs/
│   ├── default.yaml              # Hyperparameters, split ratios, and artifact paths
│   ├── labels.yaml               # Canonical 13-category taxonomy definition
│   └── preprocessing.json        # Shared machine-readable preprocessing specification
├── artifacts/
│   ├── trained/                  # Full-precision fastText binary models (.bin)
│   ├── metrics.json              # Real evaluation metrics on held-out test split
│   └── confusion_matrix.png      # 13x13 Seaborn heatmap of test evaluation
└── training/                     # Legacy training utilities (preserved for reference)
```

---

## 3. Configuration & Taxonomy

### Canonical Taxonomy (`model/configs/labels.yaml`)
Aligned 1:1 with runtime TypeScript `PageCategory`:
- `Technology`, `Education`, `Work`, `Research`, `Communication`, `Chat`, `News`, `Entertainment`, `Shop`, `Government`, `Health`, `Travel`, `Uncategorized`.

### Machine-Readable Preprocessing (`model/configs/preprocessing.json`)
Specifies:
- Unicode NFKC normalization
- Lowercase transformation
- Control character removal
- Long digit run scrubbing (`\b\d{5,}\b` -> `[num]`)
- URL/email redaction (`https?://\S+` -> `[url]`, email -> `[email]`)
- Field truncation limits: Title (300 chars), Description (500 chars), Headings (20 items @ 150 chars max), Main Text (2048 chars)
- Composite text joining order and limit (4096 chars).

---

## 4. Dataset Pipeline & Splits

- **Primary Source Data**: Cleaned openly-licensed public web datasets & synthetic page vectors (`models/data/`). Real user browsing history is strictly prohibited.
- **Deduplication**: Exact text hash deduplication and length pruning.
- **Domain Split**: 80% Train, 10% Valid, 10% Test partitioned by root domain (`url_domain`) to ensure 0 data leakage between splits.
- **Parquet Master**: `models/data/processed/atentiv_dataset.parquet`.
- **FastText Training Splits**:
  - `models/data/splits/train.txt` (including realistic noise augmentations: title-only, title+desc, missing headings)
  - `models/data/splits/valid.txt`
  - `models/data/splits/test.txt`

---

## 5. Model Quantization & Delivery

- Quantized Model (`public/models/atentiv-classifier.ftz`):
  - FastText `.ftz` quantized format (<4 MB; real size ~3.58 MB).
  - P50 inference latency: ~0.011 ms.
  - Zero external network dependencies (compiled to WASM for runtime browser execution).
- Model Manifest (`public/models/manifest.json`):
  - Contains model ID, version, SHA-256 checksum, labels, and validation metrics for runtime hash verification on load.
