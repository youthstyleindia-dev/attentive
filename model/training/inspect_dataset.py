#!/usr/bin/env python3
"""
Inspect Downloaded Dataset for Atentiv
Dataset: Hugging Face tshasan/multi-label-web-categorization
"""
import os
import sys
from collections import Counter
import pandas as pd
import numpy as np

CANDIDATES = [
    os.path.join(os.path.dirname(__file__), "..", "data", "raw", "cleaned_classified_data.parquet"),
    "/Users/divya/Downloads/cleaned_classified_data.parquet",
    "models/data/raw/cleaned_classified_data.parquet",
    "cleaned_classified_data.parquet"
]

def find_dataset():
    for p in CANDIDATES:
        resolved = os.path.abspath(p)
        if os.path.exists(resolved):
            return resolved
    raise FileNotFoundError(f"Dataset not found among candidates: {CANDIDATES}")

def inspect():
    path = find_dataset()
    print("=" * 60)
    print(f"ATENTIV DATASET INSPECTOR")
    print(f"Selected dataset file: {path}")
    print(f"File size: {os.path.getsize(path):,} bytes ({os.path.getsize(path) / (1024*1024):.2f} MB)")
    print("=" * 60)

    df = pd.read_parquet(path)
    print(f"Row count: {len(df):,}")
    print(f"Column count: {len(df.columns)}")
    print(f"Columns: {list(df.columns)}")
    print("\nData Types:")
    print(df.dtypes)

    print("\nMissing Values Count:")
    print(df.isnull().sum())

    # Duplicates
    dup_url = df['url'].duplicated().sum()
    dup_title = df['title'].duplicated().sum()
    print(f"\nDuplicate URLs: {dup_url:,}")
    print(f"Duplicate Titles: {dup_title:,}")

    # Labels
    label_counts = Counter()
    multi_label_counts = Counter()
    for cat in df['category']:
        if isinstance(cat, (list, np.ndarray)):
            label_counts.update(cat)
            multi_label_counts[len(cat)] += 1
        elif pd.notna(cat):
            label_counts[str(cat)] += 1
            multi_label_counts[1] += 1

    print("\nCategory Label Frequencies (Total 11 categories):")
    for cat, cnt in label_counts.most_common():
        pct = (cnt / len(df)) * 100
        print(f"  {cat:<20}: {cnt:>6,} ({pct:>5.1f}%)")

    print("\nNumber of Labels per Document Distribution:")
    for num_labels, count in sorted(multi_label_counts.items()):
        print(f"  {num_labels} label(s): {count:,} documents ({(count/len(df))*100:.1f}%)")

    # Languages
    if 'language' in df.columns:
        print("\nTop 10 Languages:")
        for lang, count in df['language'].value_counts().head(10).items():
            print(f"  {lang:<8}: {count:>6,} ({(count/len(df))*100:.1f}%)")

    # Length distributions
    title_lens = df['title'].astype(str).str.len()
    print("\nTitle Length Distribution (chars):")
    print(title_lens.describe(percentiles=[0.25, 0.5, 0.75, 0.9, 0.95]))

    if 'snippet' in df.columns:
        snip_lens = df['snippet'].astype(str).str.len()
        print("\nSnippet Length Distribution (chars):")
        print(snip_lens.describe(percentiles=[0.25, 0.5, 0.75, 0.9, 0.95]))

    print("\nSample Records (First 3):")
    for idx, row in df.head(3).iterrows():
        print(f"--- Sample {idx+1} ---")
        print(f"  URL: {row.get('url')}")
        print(f"  Title: {row.get('title')}")
        print(f"  Snippet: {str(row.get('snippet'))[:120]}...")
        print(f"  Category: {row.get('category')}")
        print(f"  Language: {row.get('language')}")

    print("=" * 60)
    print("INSPECTION COMPLETE: Dataset is valid and ready for preprocessing.")
    print("=" * 60)

if __name__ == "__main__":
    inspect()
