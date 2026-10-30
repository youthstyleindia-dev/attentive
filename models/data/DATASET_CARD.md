# Atentiv Page Classification Dataset Card

**Dataset Name:** Atentiv Multi-Label Web Categorization Dataset  
**Version:** 2.0.0  
**Authority:** Atentiv SRS Revision 3.1 / Submission Version 3.0  
**Last Updated:** October 14, 2026  
**License:** Creative Commons Attribution 4.0 International (CC-BY 4.0) & Open Web Search Shards  
**Format:** Apache Parquet (`models/data/processed/atentiv_dataset.parquet`) & fastText Line (`models/data/splits/*.txt`)

---

## 1. Dataset Summary

The Atentiv Page Classification Dataset is curated to train lightweight, high-speed, on-device text classifiers that identify the functional category of active browser tabs locally inside Chromium browsers without telemetry or cloud egress.

The dataset contains structured page metadata (domain, title, description, headings, visible article snippet) mapped to the 13 canonical taxonomy categories used across Atentiv.

---

## 2. Provenance & Data Sources

| Shard ID | Source Description | License | Collection Date | Sample Count |
|---|---|---|---|---|
| `shard-01-open-warc` | Openly licensed public web-page crawl shards (Common Crawl / open web corpora via `tshasan/multi-label-web-categorization`) | CC-BY 4.0 / Public Domain | September 2026 | ~49,399 |
| `shard-02-curated` | Curated technical, educational, and developer reference domains (MDN, Python Docs, ArXiv, Wikipedia, GitHub) | MIT / CC-BY-SA | October 2026 | ~5,000 |
| `shard-03-noise-aug` | Controlled synthetic noise augmentations (title-only, missing headings, truncated excerpts) applied to the training split | MIT | October 2026 | ~8,000 |

### Privacy & Ethical Guarantees:
- **Zero Personal Data (PII):** The dataset does **NOT** contain user browsing history, cookies, session identifiers, form inputs, emails, phone numbers, or passwords.
- **Lawful & Ethical Collection:** Sourced strictly from public web metadata and synthetic test variants.
- **Adversarial URL Scrubbing:** All URLs are stripped of authentication tokens, queries, hashes, and private parameters before feature extraction.

---

## 3. Dataset Schema (Parquet Source of Truth)

Every record in `models/data/processed/atentiv_dataset.parquet` conforms to the strict schema:

| Column Name | Data Type | Description |
|---|---|---|
| `id` | `string` | Unique record identifier (e.g., `atentiv-000123`) |
| `url_domain` | `string` | Normalized domain without protocol or `www.` (e.g., `github.com`) |
| `title` | `string` | Page `<title>` text (capped at 300 characters) |
| `description` | `string` | `og:description` or meta description (capped at 500 characters) |
| `headings` | `list<string>` | Up to 20 H1–H3 section titles (each capped at 150 characters) |
| `main_text` | `string` | Cleaned visible text excerpt from `<main>`/`<article>` (capped at 2048 characters) |
| `label` | `string` | FastText ground-truth category label |
| `source` | `string` | Origin shard provenance |
| `split` | `string` | Partition assignment: `train`, `valid`, or `test` |
| `text_hash` | `string` | SHA-256 fingerprint (16 chars) of composite normalized text for deduplication |
| `created_at` | `string` | ISO 8601 UTC timestamp |
| `composite_text` | `string` | Spec-joined normalized input string passed directly to the classifier |

---

## 4. Partitioning & Leakage Prevention

To ensure robust generalization and eliminate data leakage:
1. **Domain-Stratified Splitting:** The partition between Train (80%), Validation (10%), and Test (10%) is split strictly by `url_domain`. 
2. **Zero Domain Leakage:** No single domain or website ever appears in more than one partition. The model is tested exclusively on websites it has never seen during training.
3. **Deterministic Random Seed:** Partition assignments are completely reproducible via seed `42`.

---

## 5. Noise Augmentation (Training Split Only)

To prepare the model for asynchronous browser conditions (such as rapid tab switching before page load completes), the training split includes realistic noise variants:
- **Title-Only Variants (10%):** Simulates immediate tab switches where only the title was extracted.
- **Title + Description Variants (10%):** Simulates lightweight landing pages without article bodies.
- **Truncated Excerpts (10%):** Simulates partial text payloads.
- **Pristine Validation & Test:** Validation and held-out test splits contain **zero** augmented records to ensure realistic, unbiased evaluation.
