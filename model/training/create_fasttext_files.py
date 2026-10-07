#!/usr/bin/env python3
"""
Create FastText Text Files for Atentiv
Converts parquet splits into train.txt, valid.txt, test.txt formatted for fastText multi-label supervision.
"""
import os
import sys
import pandas as pd

SPLITS_DIR = "models/data/splits"

def create_files():
    for split_name in ["train", "valid", "test"]:
        pq_path = os.path.join(SPLITS_DIR, f"{split_name}.parquet")
        txt_path = os.path.join(SPLITS_DIR, f"{split_name}.txt")
        if not os.path.exists(pq_path):
            raise FileNotFoundError(f"{pq_path} not found. Run preprocess.py first.")

        print(f"Reading {pq_path}...")
        df = pd.read_parquet(pq_path)
        lines = df['fasttext_line'].astype(str).tolist()

        print(f"Writing {len(lines):,} lines to {txt_path}...")
        with open(txt_path, "w", encoding="utf-8") as f:
            for line in lines:
                f.write(line + "\n")
        print(f"Done: {txt_path} ({os.path.getsize(txt_path):,} bytes)")

if __name__ == "__main__":
    create_files()
