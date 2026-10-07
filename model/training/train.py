#!/usr/bin/env python3
"""
Train FastText Multi-Label Classifier for Atentiv
Uses fastText supervised multi-label training with one-vs-all (ova) loss.
"""
import os
import sys
import time
import json
import fasttext

CONFIG_PATH = "model/configs/model_config.json"
TRAIN_FILE = "models/data/splits/train.txt"
OUTPUT_DIR = "model/artifacts/trained"
OUTPUT_MODEL = os.path.join(OUTPUT_DIR, "atentiv-page-category.bin")

def train():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not os.path.exists(TRAIN_FILE):
        raise FileNotFoundError(f"Training file {TRAIN_FILE} not found. Run create_fasttext_files.py first.")

    with open(CONFIG_PATH) as f:
        cfg = json.load(f)

    print("=" * 60)
    print("ATENTIV FASTTEXT MODEL TRAINER")
    print(f"Training dataset: {TRAIN_FILE}")
    print(f"Model parameters: dim={cfg.get('dim', 50)}, epoch={cfg.get('epoch', 20)}, "
          f"lr={cfg.get('lr', 0.5)}, wordNgrams={cfg.get('wordNgrams', 2)}, "
          f"loss={cfg.get('loss', 'ova')}, bucket={cfg.get('bucket', 100000)}")
    print("=" * 60)

    start_time = time.time()
    model = fasttext.train_supervised(
        input=TRAIN_FILE,
        lr=float(cfg.get("lr", 0.5)),
        dim=int(cfg.get("dim", 50)),
        ws=int(cfg.get("ws", 5)),
        epoch=int(cfg.get("epoch", 20)),
        minCount=int(cfg.get("minCount", 2)),
        wordNgrams=int(cfg.get("wordNgrams", 2)),
        loss=str(cfg.get("loss", "ova")),
        bucket=int(cfg.get("bucket", 100000)),
        thread=int(cfg.get("thread", 4)),
        verbose=2
    )
    duration = time.time() - start_time

    print(f"\nTraining completed in {duration:.2f} seconds ({duration/60:.2f} minutes).")
    print(f"Saving raw model to {OUTPUT_MODEL}...")
    model.save_model(OUTPUT_MODEL)

    size_bytes = os.path.getsize(OUTPUT_MODEL)
    print(f"Raw model size: {size_bytes:,} bytes ({size_bytes / (1024*1024):.2f} MB)")
    print(f"Total vocabulary words: {len(model.get_words()):,}")
    print(f"Total labels: {len(model.get_labels()):,} -> {model.get_labels()}")

    # Save training summary
    summary = {
        "model_name": cfg.get("model_name", "atentiv-page-category"),
        "version": cfg.get("version", "1.0.0"),
        "training_time_seconds": round(duration, 2),
        "raw_size_bytes": size_bytes,
        "raw_size_mb": round(size_bytes / (1024*1024), 2),
        "num_words": len(model.get_words()),
        "num_labels": len(model.get_labels()),
        "labels": model.get_labels(),
        "config": cfg
    }
    with open(os.path.join(OUTPUT_DIR, "train_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("=" * 60)
    print("RAW MODEL TRAINING COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    train()
