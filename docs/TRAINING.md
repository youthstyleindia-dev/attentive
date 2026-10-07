# Atentiv Model Training & Quantization Pipeline

This document details the training methodology, data preprocessing, hyperparameter optimization, and quantization procedures used to train the fastText multi-label page category classifier (`scripts/train_fasttext.py` and `scripts/evaluate_models.py`).

---

## 1. Dataset Cleaning & Split Strategy

The training corpus is derived from the public Hugging Face dataset `tshasan/multi-label-web-categorization` (49,399 raw records).

### 1.1 Data Preparation Steps
1. **De-duplication**: Exact URL-title duplicates were removed, leaving 47,093 high-quality unique instances.
2. **Label Formatting**: Multiple labels per record were converted to fastText prefix format:
   `__label__Computers __label__Education domain path clean_title`
3. **Partitioning**:
   - `train.txt`: 37,673 rows (80%)
   - `valid.txt`: 4,710 rows (10%)
   - `test.txt`: 4,710 rows (10%)
   - Stratified partition maintained across label distributions.

---

## 2. Model Training Configuration

FastText supervised multi-label classification was selected for its ultra-fast inference speed, compact footprint, and native WebAssembly compatibility.

### 2.1 Hyperparameters
```python
import fasttext

model = fasttext.train_supervised(
    input="model/data/train.txt",
    autotuneValidationFile="model/data/valid.txt",
    autotuneDuration=180,
    loss="ova",            # One-Versus-All for multi-label support
    dim=64,                # 64-dimensional dense embeddings
    ws=5,                  # Window size
    epoch=25,              # Number of passes over training set
    lr=0.25,               # Learning rate
    wordNgrams=2,          # Bigram feature extraction
    minCount=3,            # Discard rare single-occurrence tokens
    bucket=200000          # Hash bucket size for character n-grams
)
```

### 2.2 Why One-Versus-All (`ova`) Loss?
Unlike standard softmax which forces mutually exclusive single-label probability distributions summing to 1.0, web pages frequently span multiple categories (e.g. GitHub is both `Computers` and `Education`). The `loss="ova"` trains independent binary logistic loss classifiers for each label, allowing calibrated independent probability thresholds.

---

## 3. Quantization & Compression

To ensure rapid load time in Chrome Extension environments without exceeding MV3 memory budgets, the raw 37.59 MB `.bin` model was quantized using fastText's built-in product quantization:

```python
model.quantize(
    input="model/data/train.txt",
    qnorm=True,            # Quantize norm vectors
    retrain=True,          # Fine-tune embeddings post-quantization
    epoch=5,
    cutoff=100000          # Vocabulary cutoff
)
model.save_model("model/artifacts/quantized/atentiv-page-category.ftz")
```

### 3.1 Compression Results
- **Uncompressed Size**: 37.59 MB
- **Quantized Size**: **1.80 MB** (1,887,436 bytes)
- **Compression Factor**: **20.9x**
- **Micro F1 Retention**: Retained **99.25%** of raw model Micro F1 (0.6688 raw $\rightarrow$ 0.6638 quantized).
- **Inference Latency**: Decreased from 0.060 ms mean to **0.042 ms mean** (0.083 ms p95).
