#!/usr/bin/env python3
"""
Export Model Manifest and Package Production Artifacts for Atentiv
Generates model_manifest.json, reproducibility.json, and copies the selected .ftz to public/models/.
"""
import os
import sys
import json
import hashlib
import shutil
import time

QUANT_MODEL = "model/artifacts/quantized/atentiv-page-category.ftz"
RAW_MODEL = "model/artifacts/trained/atentiv-page-category.bin"
METRICS_JSON = "model/artifacts/metrics/metrics.json"
MODEL_CONFIG = "model/configs/model_config.json"
PREPROCESS_CONFIG = "model/configs/preprocessing_config.json"
TAXONOMY_CONFIG = "model/configs/taxonomy.json"

OUTPUT_MANIFEST = "model/artifacts/model_manifest.json"
OUTPUT_REPRODUCIBILITY = "model/artifacts/reports/reproducibility.json"
TARGET_PUBLIC_DIR = "public/models"
TARGET_PUBLIC_MODEL = os.path.join(TARGET_PUBLIC_DIR, "atentiv-page-category.ftz")

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def export():
    os.makedirs(TARGET_PUBLIC_DIR, exist_ok=True)
    if not os.path.exists(QUANT_MODEL):
        raise FileNotFoundError(f"{QUANT_MODEL} not found. Run train.py and quantize.py first.")

    with open(MODEL_CONFIG) as f:
        model_cfg = json.load(f)
    with open(PREPROCESS_CONFIG) as f:
        prep_cfg = json.load(f)
    with open(TAXONOMY_CONFIG) as f:
        tax_cfg = json.load(f)

    metrics_data = {}
    if os.path.exists(METRICS_JSON):
        with open(METRICS_JSON) as f:
            metrics_data = json.load(f)

    quant_size = os.path.getsize(QUANT_MODEL)
    quant_hash = sha256_file(QUANT_MODEL)
    raw_size = os.path.getsize(RAW_MODEL) if os.path.exists(RAW_MODEL) else 0

    print("=" * 60)
    print("ATENTIV PRODUCTION MODEL EXPORT")
    print(f"Quantized Model: {QUANT_MODEL} ({quant_size:,} bytes, {quant_size/(1024*1024):.2f} MB)")
    print(f"SHA256: {quant_hash}")
    print("=" * 60)

    # 1. Copy model to extension public folder
    shutil.copyfile(QUANT_MODEL, TARGET_PUBLIC_MODEL)
    print(f"Copied production model artifact to: {TARGET_PUBLIC_MODEL}")

    # 2. Build model manifest
    manifest = {
        "model_id": "atentiv-page-category-v1",
        "model_name": "atentiv-page-category",
        "version": model_cfg.get("version", "1.0.0"),
        "framework": "fastText",
        "loss": "ova",
        "dimension": model_cfg.get("dim", 50),
        "wordNgrams": model_cfg.get("wordNgrams", 2),
        "quantized": True,
        "size_bytes": quant_size,
        "size_mb": round(quant_size / (1024 * 1024), 2),
        "checksum_sha256": quant_hash,
        "public_path": "models/atentiv-page-category.ftz",
        "training_dataset": "tshasan/multi-label-web-categorization",
        "training_rows": 49399,
        "cleaned_unique_rows": 47093,
        "taxonomy_version": tax_cfg.get("version", "1.0.0"),
        "preprocessing_version": prep_cfg.get("version", "1.0.0"),
        "feature_schema_version": "1.0.0",
        "labels": [c["id"] for c in tax_cfg["categories"]],
        "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "validation_metrics": metrics_data.get("quantized_model", {}).get("metrics", {}),
        "active": True,
        "notes": "FastText supervised multi-label classifier with one-vs-all loss and 2x word n-grams, quantized for ultra-low-latency on-device WebAssembly execution in Atentiv browser extension."
    }

    with open(OUTPUT_MANIFEST, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Exported model manifest: {OUTPUT_MANIFEST}")

    # Also save in public directory for the browser extension to fetch metadata
    public_manifest = os.path.join(TARGET_PUBLIC_DIR, "model_manifest.json")
    with open(public_manifest, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Exported public manifest: {public_manifest}")

    # 3. Build reproducibility report
    reproducibility = {
        "export_timestamp": manifest["created_at"],
        "python_version": sys.version,
        "dataset_source": "https://huggingface.co/datasets/tshasan/multi-label-web-categorization",
        "dataset_rows": 49399,
        "random_seed": prep_cfg.get("seed", 42),
        "splits": {
            "train": 37673,
            "valid": 4710,
            "test": 4710
        },
        "model_parameters": model_cfg,
        "preprocessing_parameters": prep_cfg,
        "raw_model_sha256": sha256_file(RAW_MODEL) if os.path.exists(RAW_MODEL) else None,
        "quantized_model_sha256": quant_hash,
        "pipeline_commands": [
            "python model/training/inspect_dataset.py",
            "python model/training/clean_dataset.py",
            "python model/training/preprocess.py",
            "python model/training/create_fasttext_files.py",
            "python model/training/train.py",
            "python model/training/evaluate.py",
            "python model/training/quantize.py",
            "python model/training/export_manifest.py"
        ]
    }
    with open(OUTPUT_REPRODUCIBILITY, "w") as f:
        json.dump(reproducibility, f, indent=2)
    print(f"Exported reproducibility log: {OUTPUT_REPRODUCIBILITY}")

    print("=" * 60)
    print("ALL PRODUCTION MODEL ARTIFACTS EXPORTED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    export()
