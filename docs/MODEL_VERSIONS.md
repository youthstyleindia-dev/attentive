# Atentiv Model Versioning & Lifecycle Specification

This document details the on-device model registry, version migration strategy, and manifest verification system implemented in `model_manifest.json`, `src/ml/modelLoader.ts`, and `src/db/schemas.ts`.

---

## 1. Model Lifecycle Architecture

In an offline, on-device architecture, model updates must be deterministic, verifiable, and backward-compatible with historical analytical data.

Atentiv employs a formal **Model Manifest & Registry** stored both statically in the extension package (`model_manifest.json`) and dynamically in IndexedDB (`model_manifest` and `model_registry` stores).

---

## 2. Model Manifest Schema

The root `model_manifest.json` tracks cryptographic and topological metadata:

```json
{
  "manifest_version": "1.0.0",
  "active_model_version": "1.0.0",
  "models": {
    "1.0.0": {
      "name": "atentiv-page-category",
      "version": "1.0.0",
      "format": "fasttext-quantized",
      "file_path": "models/atentiv-page-category.ftz",
      "file_size_bytes": 1887436,
      "sha256": "3cb49a4f4d2f0dfcce95d3886536bf30beea232da1823eb52fb584cf29bfe7be",
      "runtime": "wasm",
      "wasm_binary_path": "wasm/fastText.common.wasm",
      "dimension": 64,
      "num_classes": 11,
      "classes": [
        "Adult", "Chat", "Computers", "Education", "Entertainment",
        "Government", "Health", "News", "Shop", "Sports", "Travel"
      ],
      "metrics": {
        "micro_f1": 0.6638,
        "precision_at_1": 0.7301,
        "p95_latency_ms": 0.083
      },
      "release_date": "2026-09-28"
    }
  }
}
```

---

## 3. Dynamic Model Loader & Integrity Check

During service worker startup or first inference request, `ModelLoader` performs:
1. **Manifest Validation**: Inspects `model_manifest.json` to verify supported classes and expected byte length.
2. **WebAssembly Instantiation**: Loads `public/wasm/fastText.common.wasm` into WebAssembly memory.
3. **Model Weight Loading**: Reads `public/models/atentiv-page-category.ftz` as an `ArrayBuffer` and instantiates the fastText module.
4. **Self-Healing Fallback**: If model loading fails or WASM is unavailable in a constrained context, the classifier automatically falls back to Stage 4 (Curated Domain Knowledge) and keyword heuristics without crashing.

---

## 4. Historical Data Compatibility & Migration Policy

1. **Immutable Historical Tags**:
   Every recorded tab session (`tab_sessions`) preserves the exact `model_version` used during inference. Past records are never retroactively re-classified without explicit user intent.
2. **Centroid Vector Re-Alignment**:
   Workstream centroid vectors (`workstreams.centroid_vector`) match the dimensionality ($D=64$) of the active model. Future model versions changing vector dimensions will recompute centroid vectors from stored domain and keyword histories.
3. **Local Fine-Tuning Non-Interference**:
   User rule overrides (`rules`) operate at the deterministic pre-model layer and are immune to underlying model weight migrations.
