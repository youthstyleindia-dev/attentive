#!/usr/bin/env python3
"""
Atentiv FastText Training & Dataset Pipeline
Entry Point: python -m model.pipeline --config model/configs/default.yaml
Python: 3.11+
Authority: SRS Revision 3.1 / docs/architecture/preprocessing-spec.md
"""

import os
import sys
import re
import json
import time
import hashlib
import unicodedata
import argparse
from typing import List, Dict, Any, Tuple, Optional
from urllib.parse import urlparse

import yaml
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, precision_recall_fscore_support, confusion_matrix
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import fasttext


# ── Canonical Spec Normalization (Exact Parity with TypeScript) ───────────────

def normalize_text(text: Optional[str], max_chars: Optional[int] = None) -> str:
    """
    Normalizes a text block in exact parity with src/intelligence/runtimePipeline.ts:
    1. Unicode NFKC
    2. Control characters -> space
    3. URLs -> space
    4. Emails -> space
    5. Long digit runs (>=7 digits) -> space
    6. Allowed characters: alphanumeric, '.', '-', '_', spaces
    7. Lowercase
    8. Collapse whitespace and trim
    """
    if not text or not isinstance(text, str):
        return ""

    s = text

    # 1. Unicode NFKC
    try:
        s = unicodedata.normalize("NFKC", s)
    except Exception:
        pass

    # 2. Control characters (\u0000-\u0008, \u000B-\u001F, \u007F-\u009F)
    s = re.sub(r"[\u0000-\u0008\u000B-\u001F\u007F-\u009F]", " ", s)

    # 3. URLs
    s = re.sub(r"https?://[^\s]+", " ", s, flags=re.IGNORECASE)

    # 4. Emails
    s = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", " ", s)

    # 5. Long digit runs (7+ consecutive digits)
    s = re.sub(r"\b\d{7,}\b", " ", s)

    # 6. Keep alphanumeric, dots, dashes, underscores, spaces
    s = re.sub(r"[^\w\s\.\-_]", " ", s)

    # 7. Lowercase
    s = s.lower()

    # 8. Collapse whitespace and trim
    s = re.sub(r"\s+", " ", s).strip()

    if max_chars and max_chars > 0:
        s = s[:max_chars].strip()

    return s


def normalize_and_join_composite_text(
    title: Optional[str] = None,
    description: Optional[str] = None,
    headings: Optional[List[str]] = None,
    main_text: Optional[str] = None,
) -> str:
    """
    Normalizes and joins fields in exact sequence per preprocessing-spec.md:
    title (300) -> description (500) -> headings (20 items, 150 each) -> main_text (2048)
    Clamped to 4096 composite characters maximum.
    """
    parts = []

    # 1. Title (up to 300)
    if title:
        t = normalize_text(title, 300)
        if t:
            parts.append(t)

    # 2. Description (up to 500)
    if description:
        d = normalize_text(description, 500)
        if d:
            parts.append(d)

    # 3. Headings (up to 20 headings, each max 150)
    if headings is not None and isinstance(headings, (list, np.ndarray)) and len(headings) > 0:
        clean_headings = []
        for h in list(headings)[:20]:
            if h and isinstance(h, str):
                ch = normalize_text(h, 150)
                if ch:
                    clean_headings.append(ch)
        if clean_headings:
            parts.append(" ".join(clean_headings))

    # 4. Main text (up to 2048)
    if main_text:
        mt = normalize_text(main_text, 2048)
        if mt:
            parts.append(mt)

    if not parts:
        return ""

    joined = re.sub(r"\s+", " ", " ".join(parts)).strip()
    return joined[:4096].strip()


def extract_clean_domain(url: str) -> str:
    """Extracts lowercase domain without www."""
    try:
        parsed = urlparse(url)
        domain = parsed.netloc.lower().strip()
        if domain.startswith("www."):
            domain = domain[4:]
        # Remove port if present
        domain = domain.split(":")[0]
        return domain
    except Exception:
        return ""


# ── Pipeline Orchestrator ───────────────────────────────────────────────────

class AtentivPipeline:
    def __init__(self, config_path: str):
        with open(config_path, "r", encoding="utf-8") as f:
            self.cfg = yaml.safe_load(f)

        self.paths = self.cfg["paths"]
        self.dataset_cfg = self.cfg["dataset"]
        self.training_cfg = self.cfg["training"]
        self.quant_cfg = self.cfg.get("quantization", {})

        # Load canonical labels
        labels_path = self.paths.get("labels_config", "model/configs/labels.yaml")
        with open(labels_path, "r", encoding="utf-8") as f:
            labels_data = yaml.safe_load(f)
        self.canonical_labels = labels_data["labels"]
        print(f"[Pipeline] Loaded {len(self.canonical_labels)} canonical taxonomy labels: {self.canonical_labels}")

    def run(self):
        t0 = time.time()
        print("=" * 70)
        print("  ATENTIV FASTTEXT PREPROCESSING & TRAINING PIPELINE (Python 3.11)")
        print("=" * 70)

        # 1. Ingest and Clean
        df = self.ingest_and_clean()

        # 2. Split by Domain (Zero leakage)
        df = self.split_by_domain(df)

        # 3. Noise Augmentation on Train Split
        df = self.apply_noise_augmentation(df)

        # 4. Export FastText TXT and Parquet Source of Truth
        self.export_splits(df)

        # 5. Train FastText Model
        bin_model_path = self.train_model()

        # 6. Quantize Model (.ftz)
        ftz_path = self.quantize_model(bin_model_path)

        # 7. Evaluate on Held-Out Test Split
        metrics = self.evaluate(ftz_path)

        # 8. Export Manifest with Hashes
        self.export_manifest(ftz_path, metrics)

        # 9. Export 200 Golden Parity Test Vectors
        self.export_golden_fixtures(df)

        total_time = time.time() - t0
        print("=" * 70)
        print(f"  PIPELINE COMPLETE IN {total_time:.1f}s ({total_time/60:.2f} min)")
        print("=" * 70)

    def ingest_and_clean(self) -> pd.DataFrame:
        print("\n--- STEP 1: INGESTION AND CLEANING ---")
        raw_candidates = self.paths.get("raw_candidates", [])
        raw_path = None
        for p in raw_candidates:
            if os.path.exists(p):
                raw_path = p
                break

        if not raw_path:
            raise FileNotFoundError(f"Raw dataset not found in candidates: {raw_candidates}")

        print(f"Loading raw dataset from {raw_path}...")
        df_raw = pd.read_parquet(raw_path)
        print(f"Raw records loaded: {len(df_raw):,}")

        # Drop invalid URLs
        df = df_raw[df_raw["url"].notna() & (df_raw["url"].astype(str).str.len() > 5)].copy()

        # Extract clean domain
        df["url_domain"] = df["url"].apply(extract_clean_domain)
        df = df[df["url_domain"].str.len() > 1]

        # Standardize fields: title, description, headings, main_text, label
        df["title"] = df["title"].fillna("").astype(str)
        df["description"] = df["meta_description"].fillna("").astype(str) if "meta_description" in df.columns else ""
        df["main_text"] = df["snippet"].fillna("").astype(str) if "snippet" in df.columns else ""

        # Headings: create structured list from title tokens or empty list
        df["headings"] = [[] for _ in range(len(df))]

        # Label normalization to canonical taxonomy
        def map_label(cat_val) -> str:
            if isinstance(cat_val, (list, np.ndarray)) and len(cat_val) > 0:
                raw_label = str(cat_val[0])
            elif pd.notna(cat_val):
                raw_label = str(cat_val)
            else:
                return "Uncategorized"

            # Match or map
            clean_l = raw_label.replace("_", " ").strip()
            for canon in self.canonical_labels:
                if canon.lower() == clean_l.lower():
                    return canon
            # Heuristic mappings
            lower = clean_l.lower()
            if "tech" in lower or "code" in lower or "dev" in lower or "computer" in lower:
                return "Technology"
            if "learn" in lower or "edu" in lower or "course" in lower or "academic" in lower:
                return "Education"
            if "work" in lower or "business" in lower or "productivity" in lower:
                return "Work"
            if "research" in lower or "science" in lower:
                return "Research"
            if "chat" in lower or "message" in lower:
                return "Chat"
            if "comm" in lower or "email" in lower or "forum" in lower:
                return "Communication"
            if "news" in lower or "media" in lower:
                return "News"
            if "entertain" in lower or "game" in lower or "movie" in lower or "music" in lower or "video" in lower:
                return "Entertainment"
            if "shop" in lower or "store" in lower or "commerce" in lower:
                return "Shop"
            if "gov" in lower or "legal" in lower:
                return "Government"
            if "health" in lower or "med" in lower:
                return "Health"
            if "travel" in lower or "hotel" in lower:
                return "Travel"
            return "Uncategorized"

        df["label"] = df["category"].apply(map_label)

        # Apply exact spec composite normalization
        print("Applying spec-compliant Unicode NFKC and field-joining normalization...")
        composite_texts = []
        text_hashes = []
        for _, row in df.iterrows():
            comp = normalize_and_join_composite_text(
                title=row["title"],
                description=row["description"],
                headings=row["headings"],
                main_text=row["main_text"],
            )
            composite_texts.append(comp)
            h = hashlib.sha256(comp.encode("utf-8")).hexdigest()[:16]
            text_hashes.append(h)

        df["composite_text"] = composite_texts
        df["text_hash"] = text_hashes

        # Cleaning filters: drop near-empty text (length < 3) and exact duplicate hashes
        initial_len = len(df)
        df = df[df["composite_text"].str.len() >= 3]
        df = df.drop_duplicates(subset=["text_hash"])
        print(f"Cleaning complete: {initial_len:,} -> {len(df):,} unique rows (dropped {initial_len - len(df):,} duplicates/near-empty).")

        # Set standard metadata columns
        df["id"] = [f"atentiv-{idx:06d}" for idx in range(len(df))]
        df["source"] = "open-web-classification-warc"
        df["created_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())

        # Print per-class balance
        print("\nClass distribution:")
        print(df["label"].value_counts().to_string())
        return df

    def split_by_domain(self, df: pd.DataFrame) -> pd.DataFrame:
        print("\n--- STEP 2: DOMAIN-STRATIFIED SPLIT (ZERO DATA LEAKAGE) ---")
        seed = self.dataset_cfg.get("seed", 42)
        ratios = self.dataset_cfg.get("split_ratios", {"train": 0.8, "valid": 0.1, "test": 0.1})
        train_r = ratios.get("train", 0.8)
        val_r = ratios.get("valid", 0.1)

        # Get unique domains with their predominant label
        domain_groups = df.groupby("url_domain")["label"].agg(lambda s: s.mode()[0] if not s.empty else "Uncategorized")
        unique_domains = domain_groups.index.to_numpy()
        predom_labels = domain_groups.to_numpy()

        np.random.seed(seed)
        shuffled_indices = np.random.permutation(len(unique_domains))
        unique_domains = unique_domains[shuffled_indices]
        predom_labels = predom_labels[shuffled_indices]

        n_domains = len(unique_domains)
        n_train = int(n_domains * train_r)
        n_val = int(n_domains * val_r)

        train_domains = set(unique_domains[:n_train])
        val_domains = set(unique_domains[n_train : n_train + n_val])
        test_domains = set(unique_domains[n_train + n_val :])

        def assign_split(dom):
            if dom in train_domains:
                return "train"
            elif dom in val_domains:
                return "valid"
            return "test"

        df["split"] = df["url_domain"].apply(assign_split)

        print(f"Domain Split Summary:")
        print(f"  Train: {len(train_domains):,} domains -> {sum(df['split'] == 'train'):,} samples ({sum(df['split'] == 'train')/len(df)*100:.1f}%)")
        print(f"  Valid: {len(val_domains):,} domains -> {sum(df['split'] == 'valid'):,} samples ({sum(df['split'] == 'valid')/len(df)*100:.1f}%)")
        print(f"  Test:  {len(test_domains):,} domains -> {sum(df['split'] == 'test'):,} samples ({sum(df['split'] == 'test')/len(df)*100:.1f}%)")

        # Verify domain disjointness
        assert len(train_domains.intersection(val_domains)) == 0, "Domain leakage between train and valid!"
        assert len(train_domains.intersection(test_domains)) == 0, "Domain leakage between train and test!"
        assert len(val_domains.intersection(test_domains)) == 0, "Domain leakage between valid and test!"
        print("Verified 100% domain isolation across splits.")
        return df

    def apply_noise_augmentation(self, df: pd.DataFrame) -> pd.DataFrame:
        print("\n--- STEP 3: NOISE AUGMENTATION (TRAIN SPLIT ONLY) ---")
        noise_cfg = self.dataset_cfg.get("noise_augmentation", {})
        if not noise_cfg.get("enabled", True):
            print("Noise augmentation disabled.")
            return df

        train_mask = df["split"] == "train"
        train_df = df[train_mask].copy()
        non_train_df = df[~train_mask].copy()

        seed = self.dataset_cfg.get("seed", 42)
        np.random.seed(seed)

        augmented_rows = []
        title_only_r = noise_cfg.get("title_only_ratio", 0.10)
        title_desc_r = noise_cfg.get("title_desc_only_ratio", 0.10)

        # 1. Title-only variants (simulate immediate tab switch before DOM finishes)
        sample_size = int(len(train_df) * title_only_r)
        title_samples = train_df.sample(n=sample_size, random_state=seed).copy()
        for _, row in title_samples.iterrows():
            clean_t = normalize_text(row["title"], 300)
            if len(clean_t) >= 3:
                augmented_rows.append({
                    "id": f"{row['id']}-aug-title",
                    "url_domain": row["url_domain"],
                    "title": row["title"],
                    "description": "",
                    "headings": [],
                    "main_text": "",
                    "label": row["label"],
                    "source": "augmented-title-only",
                    "split": "train",
                    "composite_text": clean_t,
                    "text_hash": hashlib.sha256(clean_t.encode("utf-8")).hexdigest()[:16],
                    "created_at": row["created_at"],
                })

        # 2. Title + description only variants (simulate pages without article body)
        desc_samples = train_df.sample(n=int(len(train_df) * title_desc_r), random_state=seed + 1).copy()
        for _, row in desc_samples.iterrows():
            comp = normalize_and_join_composite_text(title=row["title"], description=row["description"])
            if len(comp) >= 3:
                augmented_rows.append({
                    "id": f"{row['id']}-aug-td",
                    "url_domain": row["url_domain"],
                    "title": row["title"],
                    "description": row["description"],
                    "headings": [],
                    "main_text": "",
                    "label": row["label"],
                    "source": "augmented-title-desc",
                    "split": "train",
                    "composite_text": comp,
                    "text_hash": hashlib.sha256(comp.encode("utf-8")).hexdigest()[:16],
                    "created_at": row["created_at"],
                })

        aug_df = pd.DataFrame(augmented_rows)
        print(f"Generated {len(aug_df):,} realistic runtime noise samples for training.")

        combined_train = pd.concat([train_df, aug_df], ignore_index=True)
        final_df = pd.concat([combined_train, non_train_df], ignore_index=True)
        print(f"Total dataset after augmentation: {len(final_df):,} (Train: {sum(final_df['split'] == 'train'):,})")
        return final_df

    def export_splits(self, df: pd.DataFrame):
        print("\n--- STEP 4: EXPORT DATASET AND FASTTEXT SPLITS ---")
        splits_dir = self.paths.get("splits_dir", "models/data/splits")
        os.makedirs(splits_dir, exist_ok=True)

        parquet_out = self.paths.get("processed_parquet", "models/data/processed/atentiv_dataset.parquet")
        os.makedirs(os.path.dirname(parquet_out), exist_ok=True)

        # Standard schema columns
        schema_cols = ["id", "url_domain", "title", "description", "headings", "main_text", "label", "source", "split", "text_hash", "created_at", "composite_text"]
        df[schema_cols].to_parquet(parquet_out, index=False)
        print(f"Saved canonical Parquet dataset to {parquet_out}")

        # FastText format export
        for split in ["train", "valid", "test"]:
            split_df = df[df["split"] == split]
            out_txt = os.path.join(splits_dir, f"{split}.txt")
            with open(out_txt, "w", encoding="utf-8") as f:
                for _, row in split_df.iterrows():
                    lbl = row["label"].strip().replace(" ", "_")
                    line = f"__label__{lbl} {row['composite_text']}\n"
                    f.write(line)
            print(f"Wrote {len(split_df):,} lines to {out_txt}")

    def train_model(self) -> str:
        print("\n--- STEP 5: FASTTEXT SUPERVISED TRAINING ---")
        train_txt = self.paths.get("train_txt", "models/data/splits/train.txt")
        out_bin = self.paths.get("output_trained_model", "model/artifacts/trained/atentiv-classifier.bin")
        os.makedirs(os.path.dirname(out_bin), exist_ok=True)

        cfg = self.training_cfg
        print(f"Training fastText with parameters: dim={cfg.get('dim', 50)}, epoch={cfg.get('epoch', 25)}, lr={cfg.get('lr', 0.5)}, wordNgrams={cfg.get('wordNgrams', 2)}, loss={cfg.get('loss', 'ova')}")

        t0 = time.time()
        model = fasttext.train_supervised(
            input=train_txt,
            lr=float(cfg.get("lr", 0.5)),
            dim=int(cfg.get("dim", 50)),
            ws=int(cfg.get("ws", 5)),
            epoch=int(cfg.get("epoch", 25)),
            minCount=int(cfg.get("minCount", 2)),
            wordNgrams=int(cfg.get("wordNgrams", 2)),
            loss=str(cfg.get("loss", "ova")),
            bucket=int(cfg.get("bucket", 100000)),
            thread=int(cfg.get("thread", 4)),
            verbose=2,
        )
        duration = time.time() - t0
        print(f"Training completed in {duration:.2f}s ({duration/60:.2f} min)")

        model.save_model(out_bin)
        size_bytes = os.path.getsize(out_bin)
        print(f"Raw trained model saved to {out_bin} ({size_bytes / (1024*1024):.2f} MB)")
        return out_bin

    def quantize_model(self, bin_model_path: str) -> str:
        print("\n--- STEP 6: FASTTEXT QUANTIZATION (.ftz) ---")
        train_txt = self.paths.get("train_txt", "models/data/splits/train.txt")
        out_ftz = self.paths.get("output_quantized_model", "public/models/atentiv-classifier.ftz")
        os.makedirs(os.path.dirname(out_ftz), exist_ok=True)

        model = fasttext.load_model(bin_model_path)
        print("Quantizing model with qnorm=True, cutoff=100000, retrain=True...")
        model.quantize(input=train_txt, qnorm=True, cutoff=100000, retrain=True)

        model.save_model(out_ftz)
        ftz_size = os.path.getsize(out_ftz)
        ftz_mb = ftz_size / (1024 * 1024)
        print(f"Quantized model saved to {out_ftz} ({ftz_mb:.2f} MB)")

        # Sync to backward compatibility alias
        compat_path = self.paths.get("output_compat_quantized_model", "public/models/atentiv-page-category.ftz")
        if compat_path != out_ftz:
            with open(out_ftz, "rb") as sf, open(compat_path, "wb") as df:
                df.write(sf.read())
            print(f"Synchronized compatibility model to {compat_path}")

        return out_ftz

    def evaluate(self, ftz_path: str) -> Dict[str, Any]:
        print("\n--- STEP 7: HELD-OUT EVALUATION & CONFUSION MATRIX ---")
        test_txt = self.paths.get("test_txt", "models/data/splits/test.txt")
        model = fasttext.load_model(ftz_path)

        y_true = []
        y_pred = []
        latencies_ms = []

        with open(test_txt, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split(" ", 1)
                if len(parts) == 2 and parts[0].startswith("__label__"):
                    true_lbl = parts[0].replace("__label__", "").replace("_", " ")
                    text = parts[1]
                    t0 = time.perf_counter()
                    preds, probs = model.predict(text, k=1)
                    latencies_ms.append((time.perf_counter() - t0) * 1000)
                    pred_lbl = preds[0].replace("__label__", "").replace("_", " ") if preds else "Uncategorized"
                    y_true.append(true_lbl)
                    y_pred.append(pred_lbl)

        labels = sorted(list(set(y_true).union(set(y_pred))))
        report = classification_report(y_true, y_pred, labels=labels, output_dict=True, zero_division=0)
        accuracy = sum(1 for yt, yp in zip(y_true, y_pred) if yt == yp) / max(1, len(y_true))

        print(f"\nHeld-Out Test Evaluation ({len(y_true):,} samples):")
        print(f"  Overall Accuracy: {accuracy * 100:.2f}%")
        print(f"  Macro F1:         {report['macro avg']['f1-score']:.4f}")
        print(f"  Weighted F1:      {report['weighted avg']['f1-score']:.4f}")
        print(f"  P50 Latency:      {np.percentile(latencies_ms, 50):.3f} ms")
        print(f"  P99 Latency:      {np.percentile(latencies_ms, 99):.3f} ms")

        # Robustness test on truncated / noisy variants
        print("\nEvaluating Noise Robustness (Title-Only Test Set)...")
        y_true_noisy = []
        y_pred_noisy = []
        with open(test_txt, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                parts = line.split(" ", 1)
                if len(parts) == 2 and parts[0].startswith("__label__"):
                    yt = parts[0].replace("__label__", "").replace("_", " ")
                    title_words = parts[1].split(" ")[:10]
                    title_clean = " ".join(title_words).replace("\n", " ").strip()
                    if title_clean:
                        preds, _ = model.predict(title_clean, k=1)
                        pred_lbl = preds[0].replace("__label__", "").replace("_", " ") if preds else "Uncategorized"
                        y_true_noisy.append(yt)
                        y_pred_noisy.append(pred_lbl)
        noisy_accuracy = sum(1 for yt, yp in zip(y_true_noisy, y_pred_noisy) if yt == yp) / max(1, len(y_true_noisy))
        print(f"  Title-Only Truncated Robustness Accuracy: {noisy_accuracy * 100:.2f}%")

        # Confusion Matrix
        cm = confusion_matrix(y_true, y_pred, labels=labels)
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", xticklabels=labels, yticklabels=labels)
        plt.title(f"Atentiv Page Classifier Confusion Matrix (Test Accuracy: {accuracy*100:.1f}%)")
        plt.xlabel("Predicted Category")
        plt.ylabel("True Category")
        plt.tight_layout()

        cm_png = self.paths.get("confusion_matrix_png", "model/artifacts/confusion_matrix.png")
        os.makedirs(os.path.dirname(cm_png), exist_ok=True)
        plt.savefig(cm_png, dpi=200)
        plt.close()
        print(f"Saved confusion matrix heatmap to {cm_png}")

        metrics_data = {
            "test_samples": len(y_true),
            "accuracy": round(accuracy, 4),
            "macro_precision": round(report["macro avg"]["precision"], 4),
            "macro_recall": round(report["macro avg"]["recall"], 4),
            "macro_f1": round(report["macro avg"]["f1-score"], 4),
            "weighted_f1": round(report["weighted avg"]["f1-score"], 4),
            "title_only_noisy_accuracy": round(noisy_accuracy, 4),
            "latency_ms": {
                "mean": round(float(np.mean(latencies_ms)), 3),
                "p50": round(float(np.percentile(latencies_ms, 50)), 3),
                "p95": round(float(np.percentile(latencies_ms, 95)), 3),
                "p99": round(float(np.percentile(latencies_ms, 99)), 3),
            },
            "per_label": {
                lbl: {
                    "precision": round(report[lbl]["precision"], 4),
                    "recall": round(report[lbl]["recall"], 4),
                    "f1": round(report[lbl]["f1-score"], 4),
                    "support": report[lbl]["support"],
                }
                for lbl in labels if lbl in report
            },
        }

        metrics_json = self.paths.get("metrics_json", "model/artifacts/metrics.json")
        with open(metrics_json, "w", encoding="utf-8") as f:
            json.dump(metrics_data, f, indent=2)
        print(f"Saved evaluation metrics to {metrics_json}")
        return metrics_data

    def export_manifest(self, ftz_path: str, metrics: Dict[str, Any]):
        print("\n--- STEP 8: EXPORT MODEL MANIFEST ---")
        sha256 = hashlib.sha256(open(ftz_path, "rb").read()).hexdigest()
        size_bytes = os.path.getsize(ftz_path)

        manifest = {
            "model_id": "atentiv-classifier-v2",
            "model_name": "atentiv-classifier",
            "version": "2.0.0",
            "framework": "fastText",
            "loss": self.training_cfg.get("loss", "ova"),
            "dimension": self.training_cfg.get("dim", 50),
            "wordNgrams": self.training_cfg.get("wordNgrams", 2),
            "quantized": True,
            "size_bytes": size_bytes,
            "size_mb": round(size_bytes / (1024 * 1024), 2),
            "checksum_sha256": sha256,
            "public_path": "models/atentiv-classifier.ftz",
            "training_date": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "taxonomy_version": "1.0.0",
            "preprocessing_version": "2.0.0",
            "labels": self.canonical_labels,
            "validation_metrics": metrics,
        }

        manifest_out = self.paths.get("manifest_json", "public/models/manifest.json")
        with open(manifest_out, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
        print(f"Exported manifest to {manifest_out} (SHA-256: {sha256[:12]}...)")

        compat_manifest = self.paths.get("compat_manifest_json", "public/models/model_manifest.json")
        with open(compat_manifest, "w", encoding="utf-8") as f:
            json.dump(manifest, f, indent=2)
        print(f"Synchronized compatibility manifest to {compat_manifest}")

    def export_golden_fixtures(self, df: pd.DataFrame, count: int = 200):
        print("\n--- STEP 9: EXPORT 200 GOLDEN PARITY FIXTURES ---")
        test_df = df[df["split"] == "test"].copy()
        if len(test_df) < count:
            test_df = df.copy()

        # Stratified sampling across categories for diversity
        samples_list = []
        for lbl, group in test_df.groupby("label"):
            n = min(len(group), max(1, count // len(self.canonical_labels) + 1))
            samples_list.append(group.sample(n=n, random_state=42))
        samples = pd.concat(samples_list, ignore_index=True)
        if len(samples) < count and len(test_df) >= count:
            remaining = test_df[~test_df["id"].isin(samples["id"])].sample(n=count - len(samples), random_state=42)
            samples = pd.concat([samples, remaining], ignore_index=True)
        samples = samples.head(count)

        fixtures = []
        for _, row in samples.iterrows():
            raw_title = str(row["title"]) if pd.notna(row["title"]) else ""
            raw_desc = str(row["description"]) if pd.notna(row["description"]) else ""
            raw_headings = [str(h) for h in row["headings"]] if isinstance(row["headings"], list) else []
            raw_main = str(row["main_text"]) if pd.notna(row["main_text"]) else ""

            comp = normalize_and_join_composite_text(
                title=raw_title,
                description=raw_desc,
                headings=raw_headings,
                main_text=raw_main,
            )
            fixtures.append({
                "id": row["id"],
                "raw": {
                    "url": f"https://{row['url_domain']}/path",
                    "title": raw_title,
                    "description": raw_desc,
                    "headings": raw_headings,
                    "mainText": raw_main,
                },
                "expectedNormalized": comp,
                "expectedLabel": row["label"],
            })

        out_path = self.paths.get("golden_fixtures", "tests/fixtures/golden_preprocessing.json")
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(fixtures, f, indent=2)
        print(f"Exported {len(fixtures)} golden parity fixtures to {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Atentiv Model Pipeline")
    parser.add_argument("--config", default="model/configs/default.yaml", help="Path to YAML config")
    args = parser.parse_args()

    pipeline = AtentivPipeline(args.config)
    pipeline.run()


if __name__ == "__main__":
    main()
