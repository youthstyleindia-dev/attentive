#!/usr/bin/env python3
"""
Clean Dataset for Atentiv
Deterministic cleaning, URL token extraction, Unicode normalization, and semantic deduplication.
"""
import os
import sys
import re
import unicodedata
import hashlib
from urllib.parse import urlparse
import pandas as pd
import numpy as np

RAW_CANDIDATES = [
    "models/data/raw/cleaned_classified_data.parquet",
    "/Users/divya/Downloads/cleaned_classified_data.parquet"
]

OUTPUT_DIR = "models/data/processed"
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "dataset_cleaned.parquet")

def normalize_text(text: str) -> str:
    if not text or not isinstance(text, str):
        return ""
    # NFKC Unicode normalization
    text = unicodedata.normalize("NFKC", text)
    # Remove control characters except newline/tab
    text = "".join(ch for ch in text if ch == " " or unicodedata.category(ch)[0] != "C")
    # Collapse whitespace
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_url_tokens(url: str) -> str:
    try:
        parsed = urlparse(url)
        netloc = parsed.netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        domain_parts = netloc.replace("-", " ").replace(".", " ").split()
        path = parsed.path.lower()
        # Clean path into tokens
        path_tokens = re.findall(r"[a-zA-Z0-9_\-]+", path)
        path_tokens = [t.replace("-", " ").replace("_", " ") for t in path_tokens if len(t) > 1 and not t.isdigit()]
        combined = " ".join(domain_parts + path_tokens)
        return combined
    except Exception:
        return ""

def clean():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    raw_path = None
    for p in RAW_CANDIDATES:
        if os.path.exists(p):
            raw_path = p
            break
    if not raw_path:
        raise FileNotFoundError("Raw parquet dataset not found.")

    print(f"Loading raw dataset from {raw_path}...")
    df = pd.read_parquet(raw_path)
    initial_len = len(df)
    print(f"Loaded {initial_len:,} raw rows.")

    # 1. Filter out completely unusable rows (missing url or empty category)
    df = df[df['url'].notna() & (df['url'].astype(str).str.len() > 3)]
    df = df[df['category'].notna()]
    print(f"After valid url/category filter: {len(df):,} rows.")

    # 2. Normalize text fields
    print("Normalizing titles, snippets, meta descriptions, and extracting URL tokens...")
    df['title_clean'] = df['title'].astype(str).apply(normalize_text)
    df['snippet_clean'] = df['snippet'].astype(str).apply(normalize_text)
    df['meta_clean'] = df['meta_description'].astype(str).apply(normalize_text)
    df['url_tokens'] = df['url'].astype(str).apply(extract_url_tokens)

    # 3. Create canonical composite text representation
    # domain + url path tokens + page title + meta description + snippet excerpt
    def build_text(row):
        parts = []
        if row['url_tokens']:
            parts.append(row['url_tokens'])
        if row['title_clean']:
            parts.append(row['title_clean'])
        if row['meta_clean']:
            parts.append(row['meta_clean'][:300])
        elif row['snippet_clean']:
            parts.append(row['snippet_clean'][:500])
        combined = " ".join(parts)
        return combined.lower()

    df['composite_text'] = df.apply(build_text, axis=1)

    # 4. Filter empty text records
    df = df[df['composite_text'].str.strip().str.len() > 2]

    # 5. Preserve original record hash for traceability
    def make_hash(row):
        val = f"{row['url']}|{row['title']}|{str(row['category'])}"
        return hashlib.sha256(val.encode("utf-8")).hexdigest()[:16]

    df['record_id'] = df.apply(make_hash, axis=1)

    # 6. Deduplicate exact duplicate semantic inputs
    before_dedup = len(df)
    df = df.drop_duplicates(subset=['composite_text'])
    print(f"Semantic deduplication: removed {before_dedup - len(df):,} duplicates. Retained {len(df):,} unique rows.")

    # Save cleaned dataset
    df.to_parquet(OUTPUT_FILE, index=False)
    print(f"Cleaned dataset saved to: {OUTPUT_FILE} ({os.path.getsize(OUTPUT_FILE):,} bytes)")

if __name__ == "__main__":
    clean()
