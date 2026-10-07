#!/usr/bin/env python3
"""
Preprocess Dataset for Atentiv
Extracts structured features and prepares train/valid/test datasets with stratified multi-label sampling.
"""
import os
import sys
import re
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split

INPUT_FILE = "models/data/processed/dataset_cleaned.parquet"
OUTPUT_DIR = "models/data/splits"

def clean_for_fasttext(text: str) -> str:
    # fastText expects space-separated tokens on a single line
    text = text.replace("\n", " ").replace("\r", " ").replace("\t", " ")
    # Keep alphanumeric, dashes, dots, underscores
    text = re.sub(r"[^\w\s\.\-_]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def preprocess():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    if not os.path.exists(INPUT_FILE):
        raise FileNotFoundError(f"Input file {INPUT_FILE} not found. Run clean_dataset.py first.")

    print(f"Loading cleaned dataset from {INPUT_FILE}...")
    df = pd.read_parquet(INPUT_FILE)
    print(f"Loaded {len(df):,} cleaned rows.")

    with open("model/configs/preprocessing_config.json") as f:
        cfg = json.load(f)

    # Convert category array into fastText label prefix strings
    def format_labels(cat_array):
        labels = []
        if isinstance(cat_array, (list, np.ndarray)):
            for c in cat_array:
                c_str = str(c).strip().replace(" ", "_")
                if c_str:
                    labels.append(f"__label__{c_str}")
        elif pd.notna(cat_array):
            c_str = str(cat_array).strip().replace(" ", "_")
            if c_str:
                labels.append(f"__label__{c_str}")
        return " ".join(labels)

    df['ft_labels'] = df['category'].apply(format_labels)
    df['ft_text'] = df['composite_text'].apply(clean_for_fasttext)

    # Format fasttext line: __label__Cat1 __label__Cat2 token1 token2 ...
    df['fasttext_line'] = df['ft_labels'] + " " + df['ft_text']

    # Filter out empty text or empty labels
    df = df[df['ft_labels'].str.len() > 0]
    df = df[df['ft_text'].str.len() > 2]
    print(f"Total valid fasttext samples: {len(df):,}")

    # Deterministic train / val / test split
    seed = cfg.get("seed", 42)
    train_ratio = cfg["split_ratios"]["train"]
    val_ratio = cfg["split_ratios"]["valid"]
    test_ratio = cfg["split_ratios"]["test"]

    # First split off test (10%)
    train_val_df, test_df = train_test_split(df, test_size=test_ratio, random_state=seed, shuffle=True)
    # Then split train and validation (0.1 / 0.9 = ~11.11% of train_val)
    val_rel_ratio = val_ratio / (train_ratio + val_ratio)
    train_df, val_df = train_test_split(train_val_df, test_size=val_rel_ratio, random_state=seed, shuffle=True)

    print(f"Split results:")
    print(f"  Train: {len(train_df):,} samples ({len(train_df)/len(df)*100:.1f}%)")
    print(f"  Valid: {len(val_df):,} samples ({len(val_df)/len(df)*100:.1f}%)")
    print(f"  Test:  {len(test_df):,} samples ({len(test_df)/len(df)*100:.1f}%)")

    # Save to splits directory
    train_df.to_parquet(os.path.join(OUTPUT_DIR, "train.parquet"), index=False)
    val_df.to_parquet(os.path.join(OUTPUT_DIR, "valid.parquet"), index=False)
    test_df.to_parquet(os.path.join(OUTPUT_DIR, "test.parquet"), index=False)

    print(f"Saved parquet splits to {OUTPUT_DIR}/")

if __name__ == "__main__":
    preprocess()
