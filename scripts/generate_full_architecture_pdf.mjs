import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const projectRoot = process.cwd();
const confusionMatrixPath = path.join(projectRoot, "model/artifacts/confusion_matrix.png");
let confusionMatrixBase64 = "";
if (fs.existsSync(confusionMatrixPath)) {
  confusionMatrixBase64 = fs.readFileSync(confusionMatrixPath).toString("base64");
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Atentiv Architecture & End-to-End Pipeline Complete Specification</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
    @bottom-right {
      content: counter(page);
    }
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.55;
    font-size: 9.5pt;
    margin: 0;
    padding: 0;
  }

  h1, h2, h3, h4 {
    color: #0f172a;
    font-weight: 700;
    page-break-after: avoid;
  }

  h1 {
    font-size: 21pt;
    line-height: 1.2;
    margin-top: 0;
    margin-bottom: 6px;
    color: #0284c7;
  }

  .subtitle {
    font-size: 11pt;
    color: #475569;
    margin-bottom: 18px;
    font-weight: 500;
    line-height: 1.4;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 20px;
    font-size: 8.5pt;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
  }

  .meta-label {
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    font-size: 7.5pt;
    letter-spacing: 0.5px;
  }

  .meta-value {
    font-weight: 500;
    color: #0f172a;
  }

  h2 {
    font-size: 13.5pt;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 4px;
    margin-top: 22px;
    margin-bottom: 10px;
    color: #0f172a;
  }

  h3 {
    font-size: 11pt;
    margin-top: 14px;
    margin-bottom: 6px;
    color: #0369a1;
  }

  h4 {
    font-size: 9.5pt;
    margin-top: 10px;
    margin-bottom: 4px;
    color: #334155;
  }

  p {
    margin-top: 0;
    margin-bottom: 8px;
    text-align: justify;
  }

  ul, ol {
    margin-top: 4px;
    margin-bottom: 8px;
    padding-left: 18px;
  }

  li {
    margin-bottom: 3px;
  }

  code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 8pt;
    background-color: #f1f5f9;
    padding: 1.5px 4.5px;
    border-radius: 3px;
    border: 1px solid #e2e8f0;
    color: #0f172a;
  }

  pre {
    background: #0f172a;
    color: #f8fafc;
    padding: 9px 12px;
    border-radius: 6px;
    font-size: 7.5pt;
    line-height: 1.4;
    overflow-x: auto;
    page-break-inside: avoid;
    margin-top: 5px;
    margin-bottom: 10px;
  }

  pre code {
    background: transparent;
    padding: 0;
    border: none;
    color: inherit;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 8px;
    margin-bottom: 14px;
    font-size: 8pt;
    page-break-inside: avoid;
  }

  th, td {
    border: 1px solid #cbd5e1;
    padding: 5px 8px;
    text-align: left;
    vertical-align: top;
  }

  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 600;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  .badge-pass {
    display: inline-block;
    background-color: #dcfce7;
    color: #15803d;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 7pt;
  }

  .badge-exceed {
    display: inline-block;
    background-color: #e0f2fe;
    color: #0369a1;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 7pt;
  }

  .badge-script {
    display: inline-block;
    background-color: #fef3c7;
    color: #92400e;
    font-weight: 700;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 7pt;
  }

  .callout {
    background: #eff6ff;
    border-left: 4px solid #0284c7;
    padding: 9px 12px;
    border-radius: 0 6px 6px 0;
    margin: 10px 0;
    font-size: 8.5pt;
  }

  .callout-title {
    font-weight: 700;
    color: #0369a1;
    margin-bottom: 3px;
  }

  .page-break {
    page-break-before: always;
  }

  .diagram-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px;
    margin: 12px 0;
    page-break-inside: avoid;
  }

  .diagram-title {
    font-weight: 700;
    font-size: 9pt;
    color: #0369a1;
    text-align: center;
    margin-bottom: 6px;
  }

  .step-card {
    border: 1px solid #e2e8f0;
    background: #ffffff;
    border-radius: 6px;
    padding: 8px 11px;
    margin-bottom: 8px;
    page-break-inside: avoid;
  }

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 3px;
    font-size: 9pt;
  }

  .img-container {
    text-align: center;
    margin: 12px 0;
    page-break-inside: avoid;
  }

  .img-container img {
    max-width: 88%;
    height: auto;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
  }

  .tree-block {
    background: #0f172a;
    color: #f8fafc;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 7.5pt;
    line-height: 1.35;
    margin: 8px 0;
    page-break-inside: avoid;
  }
</style>
</head>
<body>

<!-- TITLE & META BLOCK -->
<div>
  <h1>ATENTIV ARCHITECTURAL SPECIFICATION</h1>
  <div class="subtitle">Complete Technical Guide: Preprocessing Engine, Offline Dataset Curation, fastText Training, Quantization, Modular Training Scripts, Cross-Language Parity Enforcement & Runtime MV3 Inference Architecture</div>

  <div class="meta-grid">
    <div class="meta-item">
      <span class="meta-label">Authority Document</span>
      <span class="meta-value">SRS Revision 3.1 / Submission Version 3.0</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Architecture Core</span>
      <span class="meta-value">Chromium MV3 (TypeScript 5.7 Strict) + Python 3.11</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Trained Model Artifact</span>
      <span class="meta-value">public/models/atentiv-classifier.ftz (3.58 MB)</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Extension Distribution Package</span>
      <span class="meta-value">atentiv-v1.0.1.zip (3.4 MB | Under 5 MB Target)</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Quality & Parity Assurance</span>
      <span class="meta-value">71/71 Tests Pass | 100% Golden Parity (200/200)</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">Inference Benchmarks</span>
      <span class="meta-value">P50 = 0.011 ms (&lt; 50 ms Warm Budget | 4,500x Faster)</span>
    </div>
  </div>
</div>

<div class="callout">
  <div class="callout-title">Architectural Foundation: Local-First, Zero-Server & 100% Parity</div>
  Atentiv is built upon a non-negotiable privacy principle: <strong>no user browsing telemetry, extracted text, or activity metrics ever leave the user's computer</strong>. All classification, dwell accounting, workstream clustering, and focus scoring run locally inside WebAssembly and IndexedDB. Consequently, the text representation processed during Python offline training must match the text extracted inside the browser's TypeScript content scripts <strong>100% character-for-character</strong>.
</div>

<!-- SECTION 1: ARCHITECTURE & DUAL-PIPELINE PARADIGM -->
<h2>1. System Architecture & Dual-Pipeline Paradigm</h2>
<p>
  The Atentiv classification subsystem bridges two distinct environments: an offline Python 3.11 training and dataset pipeline and a runtime TypeScript Chromium Manifest V3 browser extension. Both pipelines synchronize through a <strong>Shared Preprocessing Specification</strong>.
</p>

<div class="diagram-box">
  <div class="diagram-title">Figure 1: Dual-Pipeline Architecture & Cross-Language Parity Bridge</div>
  <svg viewBox="0 0 760 250" width="100%" height="200" xmlns="http://www.w3.org/2000/svg">
    <!-- Shared Spec Central Box -->
    <rect x="250" y="10" width="260" height="46" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
    <text x="380" y="28" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0369a1" text-anchor="middle">Shared Preprocessing Spec</text>
    <text x="380" y="44" font-family="sans-serif" font-size="8" fill="#0f172a" text-anchor="middle">model/configs/preprocessing.json + labels.yaml (13 Classes)</text>

    <!-- Python Pipeline (Left) -->
    <rect x="20" y="75" width="280" height="165" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="160" y="93" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a" text-anchor="middle">Offline Pipeline (Python 3.11)</text>
    
    <rect x="35" y="103" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="45" y="117" font-family="sans-serif" font-size="7.5" fill="#334155">1. Open Data + Synthetic (44,090 deduplicated)</text>
    
    <rect x="35" y="127" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="45" y="141" font-family="sans-serif" font-size="7.5" fill="#334155">2. Domain-Stratified Split (80/10/10, 0 Leakage)</text>

    <rect x="35" y="151" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="45" y="165" font-family="sans-serif" font-size="7.5" fill="#334155">3. Train-Only Noise Augmentation (Title-only etc.)</text>

    <rect x="35" y="175" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="45" y="189" font-family="sans-serif" font-size="7.5" fill="#334155">4. Supervised fastText + Quantization (.ftz 3.58MB)</text>

    <rect x="35" y="199" width="250" height="20" rx="4" fill="#dcfce7" stroke="#16a34a"/>
    <text x="45" y="213" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#15803d">5. 200 Golden Vectors (golden_preprocessing.json)</text>

    <!-- TypeScript Pipeline (Right) -->
    <rect x="460" y="75" width="280" height="165" rx="8" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
    <text x="600" y="93" font-family="sans-serif" font-size="10.5" font-weight="bold" fill="#0f172a" text-anchor="middle">Runtime Pipeline (TypeScript MV3)</text>

    <rect x="475" y="103" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="485" y="117" font-family="sans-serif" font-size="7.5" fill="#334155">1. Eligibility Gate (Block chrome://, edge://, about:)</text>

    <rect x="475" y="127" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="485" y="141" font-family="sans-serif" font-size="7.5" fill="#334155">2. Content DOM Extractor (Headings&lt;=20, Text&lt;=2KB)</text>

    <rect x="475" y="151" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="485" y="165" font-family="sans-serif" font-size="7.5" fill="#334155">3. URL Credential Scrubbing (auth, token, session)</text>

    <rect x="475" y="175" width="250" height="20" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
    <text x="485" y="189" font-family="sans-serif" font-size="7.5" fill="#334155">4. Precedence: User Rule &gt; DB &gt; fastText WASM</text>

    <rect x="475" y="199" width="250" height="20" rx="4" fill="#dcfce7" stroke="#16a34a"/>
    <text x="485" y="213" font-family="sans-serif" font-size="7.5" font-weight="bold" fill="#15803d">5. Parity Test: 200/200 Exact String Character Match</text>

    <!-- Connectors -->
    <path d="M 330 56 L 220 75" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>
    <path d="M 430 56 L 540 75" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4,4" fill="none"/>
    <path d="M 285 209 L 475 209" stroke="#16a34a" stroke-width="2" fill="none"/>
  </svg>
</div>

<!-- SECTION 2: THE PREPROCESSING ENGINE IN-DEPTH -->
<h2>2. The Preprocessing Engine In-Depth</h2>
<p>
  The preprocessing engine prepares unstructured web DOM trees into clean, canonical, sanitized text strings for categorization. It operates uniformly across both runtime content extraction and training data preparation.
</p>

<h3>2.1 Field Extraction Bounds & Strict Sanitization</h3>
<table>
  <thead>
    <tr>
      <th>Field Name</th>
      <th>Extraction Source</th>
      <th>Hard Truncation Cap</th>
      <th>Sanitization & Stripping Policy</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong><code>title</code></strong></td>
      <td><code>document.title</code> / OpenGraph title</td>
      <td>300 characters</td>
      <td>Strip HTML entities, remove duplicate domain suffixes (e.g. <code>\| Site</code>).</td>
    </tr>
    <tr>
      <td><strong><code>description</code></strong></td>
      <td><code>meta[name="description"]</code> / <code>og:description</code></td>
      <td>500 characters</td>
      <td>Strip site boilerplate and marketing slogans.</td>
    </tr>
    <tr>
      <td><strong><code>headings</code></strong></td>
      <td><code>h1, h2, h3</code> in DOM document order</td>
      <td>At most 20 headings; 150 chars/heading</td>
      <td>Strip navigation headers, footer headers, and hidden headers.</td>
    </tr>
    <tr>
      <td><strong><code>main_text</code></strong></td>
      <td><code>main, article</code> or core content block</td>
      <td>2,048 characters (2 KB)</td>
      <td>Strip scripts, styles, forms, passwords, ads, and cookie banners.</td>
    </tr>
    <tr>
      <td><strong><code>composite</code></strong></td>
      <td>Deterministic concatenation of above</td>
      <td>4,096 characters (4 KB)</td>
      <td>Unified single line evaluated by fastText WASM.</td>
    </tr>
  </tbody>
</table>

<div class="callout">
  <div class="callout-title">Zero Privacy Leakage DOM Invariant</div>
  Under no circumstances does the extraction script access <code>&lt;input&gt;</code>, <code>&lt;textarea&gt;</code>, password fields, or form elements. Nodes marked with <code>aria-hidden="true"</code>, <code>display: none</code>, or <code>visibility: hidden</code> are completely ignored.
</div>

<h3>2.2 The 7-Step Deterministic Normalization Sequence</h3>
<p>
  Both Python (in <code>model/pipeline.py</code>) and TypeScript (in <code>src/features/textFeatures.ts</code>) execute this sequence:
</p>
<ol>
  <li><strong>Unicode Normalization:</strong> Convert text to Unicode Normalization Form KC (<code>NFKC</code>). Replaces full-width characters, ligatures (e.g., &aelig; $\to$ ae), and idiosyncratic punctuation with standard equivalents.</li>
  <li><strong>Lowercasing:</strong> Complete case folding (<code>toLowerCase()</code> in TypeScript, <code>.lower()</code> in Python).</li>
  <li><strong>Control Character Stripping:</strong> Strip ASCII non-printable control characters matching regex <code>[\x00-\x1f\x7f-\x9f]</code>.</li>
  <li><strong>Long Digit Run Scrubbing:</strong> Sequences of 5 or more consecutive numbers are redacted to prevent the model from memorizing order tracking IDs, phone numbers, or transient numbers:
    <pre><code>Regex: \b\d{5,}\b  ==&gt;  " [num] "</code></pre>
  </li>
  <li><strong>URL & Email Redaction:</strong> Strip full HTTP/HTTPS URLs and email addresses to avoid domain-memorization shortcuts:
    <pre><code>URL:   https?://\S+                                    ==&gt;  " [url] "
Email: [a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+  ==&gt;  " [email] "</code></pre>
  </li>
  <li><strong>Punctuation & Noise Scrubbing:</strong> Replace punctuation with whitespace, preserving intra-word hyphens and single apostrophes.</li>
  <li><strong>Whitespace Collapsing:</strong> Collapse multiple spaces, newlines, and tab characters into single spaces (<code>\s+</code> $\to$ <code>" "</code>) and apply final <code>.trim()</code>.</li>
</ol>

<h3>2.3 Composite Field Joining Order</h3>
<p>
  The final normalized string passed into the fastText classifier is concatenated in this strict order:
</p>
<pre><code>composite_text = join([normalized_title, normalized_description, normalized_headings, normalized_main_text], " ")[:4096]</code></pre>

<div class="page-break"></div>

<!-- SECTION 3: THE 7 MODULAR SCRIPTS IN-DEPTH -->
<h2>3. The 7 Modular Python Training Scripts (From Screenshot)</h2>
<p>
  Located in <code>model/training/</code>, these 7 modular scripts execute the offline machine learning lifecycle step-by-step. Each script performs a focused, verifiable transformation:
</p>

<div class="step-card">
  <div class="step-header">
    <span>Script 1: inspect_dataset.py (3 KB)</span>
    <span class="badge-script">DIAGNOSTIC & AUDIT</span>
  </div>
  <p><strong>Path:</strong> <code>model/training/inspect_dataset.py</code> | <strong>Command:</strong> <code>python model/training/inspect_dataset.py</code></p>
  <p><strong>Purpose:</strong> Performs statistical validation and health checks on candidate Parquet datasets before processing.</p>
  <p><strong>Inputs:</strong> <code>models/data/raw/cleaned_classified_data.parquet</code> (49,399 records, 19.02 MB).</p>
  <p><strong>Logic:</strong> Scans rows, data types, and missing values. Identifies duplicate URLs (0) and duplicate titles (13,541). Calculates category label distributions across 11 classes (Entertainment: 33.4%, Education: 32.1%, Technology: 23.5%, Shop: 19.6%, etc.) and multi-label cardinality (1 label: 36.9%, 2 labels: 50.4%, 3 labels: 12.7%). Computes length quantiles (P50 title: 25 chars, P50 snippet: 266 chars).</p>
  <p><strong>Output:</strong> Detailed diagnostic terminal log verifying dataset integrity.</p>
</div>

<div class="step-card">
  <div class="step-header">
    <span>Script 2: clean_dataset.py (4 KB)</span>
    <span class="badge-script">CLEANING & DEDUPLICATION</span>
  </div>
  <p><strong>Path:</strong> <code>model/training/clean_dataset.py</code> | <strong>Command:</strong> <code>python model/training/clean_dataset.py</code></p>
  <p><strong>Purpose:</strong> Filters unusable data, extracts URL tokens, applies NFKC normalization, and drops exact semantic duplicates.</p>
  <p><strong>Inputs:</strong> <code>models/data/raw/cleaned_classified_data.parquet</code>.</p>
  <p><strong>Logic:</strong> Filters rows missing URLs or categories. Applies <code>normalize_text</code> to titles, snippets, and descriptions. Invokes <code>extract_url_tokens</code> to parse domain and path tokens into clean words. Constructs initial composite text (URL tokens + title + meta/snippet) and drops duplicate composite strings (removes 2,306 duplicate records).</p>
  <p><strong>Output:</strong> <code>models/data/processed/dataset_cleaned.parquet</code> (47,093 unique cleaned records, 43.4 MB).</p>
</div>

<div class="step-card">
  <div class="step-header">
    <span>Script 3: preprocess.py (3 KB)</span>
    <span class="badge-script">FORMATTING & SPLITTING</span>
  </div>
  <p><strong>Path:</strong> <code>model/training/preprocess.py</code> | <strong>Command:</strong> <code>python model/training/preprocess.py</code></p>
  <p><strong>Purpose:</strong> Formats fastText supervision lines and partitions the dataset into deterministic 80/10/10 splits.</p>
  <p><strong>Inputs:</strong> <code>models/data/processed/dataset_cleaned.parquet</code> and <code>model/configs/preprocessing_config.json</code>.</p>
  <p><strong>Logic:</strong> Converts category arrays into fastText multi-label strings (e.g., <code>__label__Technology __label__Education</code>). Formats single-line composite text via <code>clean_for_fasttext</code>. Executes stratified <code>train_test_split</code> with random seed 42 into 80% Train, 10% Valid, and 10% Test.</p>
  <p><strong>Outputs:</strong> <code>models/data/splits/train.parquet</code> (37,673 rows), <code>valid.parquet</code> (4,710 rows), <code>test.parquet</code> (4,710 rows).</p>
</div>

<div class="step-card">
  <div class="step-header">
    <span>Script 4: create_fasttext_files.py (1 KB)</span>
    <span class="badge-script">FASTTEXT FORMATTING</span>
  </div>
  <p><strong>Path:</strong> <code>model/training/create_fasttext_files.py</code> | <strong>Command:</strong> <code>python model/training/create_fasttext_files.py</code></p>
  <p><strong>Purpose:</strong> Converts Parquet split tables into fastText supervised text files.</p>
  <p><strong>Inputs:</strong> <code>models/data/splits/{train,valid,test}.parquet</code>.</p>
  <p><strong>Logic:</strong> Iterates over each Parquet table, extracts the <code>fasttext_line</code> column, and exports UTF-8 text files formatted with space-delimited labels followed by tokenized text.</p>
  <p><strong>Outputs:</strong> <code>models/data/splits/train.txt</code> (10.8 MB), <code>valid.txt</code> (1.3 MB), <code>test.txt</code> (1.3 MB).</p>
</div>

<div class="step-card">
  <div class="step-header">
    <span>Script 5: train.py (3 KB)</span>
    <span class="badge-script">SUPERVISED FASTTEXT</span>
  </div>
  <p><strong>Path:</strong> <code>model/training/train.py</code> | <strong>Command:</strong> <code>python model/training/train.py</code></p>
  <p><strong>Purpose:</strong> Trains the fastText multi-label classifier using multi-threaded C++ backend.</p>
  <p><strong>Inputs:</strong> <code>models/data/splits/train.txt</code> and <code>model/configs/model_config.json</code>.</p>
  <p><strong>Logic:</strong> Invokes <code>fasttext.train_supervised</code> with hyperparameters: <code>dim=50</code>, <code>epoch=25</code>, <code>lr=0.5</code>, <code>ws=5</code>, <code>wordNgrams=2</code>, <code>loss="ova"</code> (One-vs-All logistic loss), <code>bucket=100000</code>. Completes training in ~2.1 seconds across 89,229 vocabulary tokens.</p>
  <p><strong>Outputs:</strong> <code>model/artifacts/trained/atentiv-page-category.bin</code> (37.6 MB) and <code>train_summary.json</code>.</p>
</div>

<div class="step-card">
  <div class="step-header">
    <span>Script 6: evaluate.py (11 KB)</span>
    <span class="badge-script">EVALUATION & BENCHMARKS</span>
  </div>
  <p><strong>Path:</strong> <code>model/training/evaluate.py</code> | <strong>Command:</strong> <code>python model/training/evaluate.py</code></p>
  <p><strong>Purpose:</strong> Evaluates full-precision binary and quantized models against held-out test data.</p>
  <p><strong>Inputs:</strong> <code>models/data/splits/test.txt</code> and trained model binaries.</p>
  <p><strong>Logic:</strong> Evaluates test samples, recording per-sample inference latencies with <code>time.perf_counter()</code>. Computes Precision, Recall, and F1 across all classes via scikit-learn. Generates Seaborn horizontal bar performance chart. Computes P50, P95, and P99 latency distributions.</p>
  <p><strong>Outputs:</strong> <code>model/artifacts/metrics/metrics.json</code>, <code>reports/model_report.md</code>, <code>reports/category_performance.png</code>.</p>
</div>

<div class="step-card">
  <div class="step-header">
    <span>Script 7: export_manifest.py (5 KB)</span>
    <span class="badge-script">MANIFEST & PACKAGING</span>
  </div>
  <p><strong>Path:</strong> <code>model/training/export_manifest.py</code> | <strong>Command:</strong> <code>python model/training/export_manifest.py</code></p>
  <p><strong>Purpose:</strong> Computes SHA-256 cryptographic checksums and exports production manifests into extension public assets.</p>
  <p><strong>Inputs:</strong> Quantized model binary, configuration files, and evaluated metrics.</p>
  <p><strong>Logic:</strong> Computes SHA-256 checksum over model binary in 64 KB chunks. Generates <code>model_manifest.json</code> containing model ID, version, taxonomy labels, size, and SHA-256 hash. Copies production binary to <code>public/models/</code>. Generates reproducibility log.</p>
  <p><strong>Outputs:</strong> <code>public/models/manifest.json</code> and <code>model/artifacts/reports/reproducibility.json</code>.</p>
</div>

<div class="callout">
  <div class="callout-title">Unified Orchestrator: model/pipeline.py</div>
  In addition to running these 7 scripts individually, <code>model/pipeline.py</code> provides a single unified entrypoint (<code>python -m model.pipeline --config model/configs/default.yaml</code>) that automates this entire lifecycle, enforcing domain stratification (0 domain leakage), train-only noise augmentation, and exporting the 200 golden parity fixtures.
</div>

<div class="page-break"></div>

<!-- SECTION 4: FULL FILE STRUCTURE WALKTHROUGH -->
<h2>4. Comprehensive Project File Structure Walkthrough</h2>
<p>
  Here is the complete architectural layout of the repository, documenting the specific purpose of every directory and key source file:
</p>

<div class="tree-block">
Atentiv-Variation-3/
├── package.json                         # Node dependencies, scripts (test, build, package, benchmark)
├── tsconfig.json                        # TypeScript 5.7 strict configuration
├── vite.config.ts                       # Vite 6 bundler configuration
├── requirements.txt                     # Pinned Python 3.11 root dependencies
├── atentiv-v1.0.1.zip                   # Packaged Chrome Extension ZIP (3.4 MB | Under 5 MB budget)
├── Atentiv_Complete_Architecture_and_Pipeline_Specification.pdf # Complete PDF Master Specification
│
├── model/                               # OFFLINE ML SUBSYSTEM (Python 3.11)
│   ├── pipeline.py                      # Unified master pipeline orchestrator
│   ├── test_parity.py                   # Pytest runner verifying 100% parity against 200 fixtures
│   ├── requirements.txt                 # Pinned dependencies (fasttext-wheel, pandas, pyarrow, etc.)
│   ├── README.md                        # Operator runbook with exact run commands
│   │
│   ├── training/                        # The 7 Modular Training Scripts (From Screenshot)
│   │   ├── inspect_dataset.py           # 1. Dataset stats, label counts, null checks
│   │   ├── clean_dataset.py             # 2. Text normalization, token extraction, deduplication
│   │   ├── preprocess.py                # 3. Label formatting and 80/10/10 split
│   │   ├── create_fasttext_files.py     # 4. Formats fastText train/valid/test .txt files
│   │   ├── train.py                     # 5. Supervised fastText C++ training
│   │   ├── evaluate.py                  # 6. Precision, Recall, F1, latency benchmark
│   │   └── export_manifest.py           # 7. Computes SHA-256 and exports manifest
│   │
│   ├── configs/                         # Configurations (Single Source of Truth)
│   │   ├── default.yaml                 # Master training YAML config
│   │   ├── labels.yaml                  # Canonical 13-category taxonomy definition
│   │   ├── preprocessing.json           # Shared machine-readable preprocessing spec
│   │   ├── model_config.json            # fastText model hyperparameters (dim=50, epoch=25, lr=0.5)
│   │   └── preprocessing_config.json    # Legacy preprocessing parameters
│   │
│   ├── artifacts/                       # Trained Binaries & Metric Logs
│   │   ├── trained/atentiv-classifier.bin # Full-precision fastText binary (~24 MB)
│   │   ├── metrics.json                 # Held-out evaluation metrics (55.78% acc, 0.4746 F1)
│   │   └── confusion_matrix.png         # 13x13 Seaborn evaluation heatmap
│   │
│   └── archive/                         # Redundant Models Archive
│       ├── README.md                    # Note explaining why duplicate binaries were archived
│       └── atentiv-page-category.ftz    # Legacy binary archived to keep extension zip under 5 MB
│
├── models/                              # DATASET STORAGE & PROVENANCE
│   └── data/
│       ├── DATASET_CARD.md              # Provenance, CC-BY-4.0 licensing & zero-PII certificate
│       ├── raw/
│       │   └── cleaned_classified_data.parquet # Raw candidate Parquet dataset (19 MB, 49,399 rows)
│       ├── processed/
│       │   ├── atentiv_dataset.parquet  # Master Parquet dataset (44,090 deduplicated rows)
│       │   └── dataset_cleaned.parquet  # Output of clean_dataset.py (47,093 rows)
│       └── splits/
│           ├── train.txt                # fastText training split
│           ├── valid.txt                # fastText validation split
│           └── test.txt                 # Held-out fastText test split (4,493 samples, 0 domain leakage)
│
├── src/                                 # CHROMIUM MV3 EXTENSION (TypeScript 5.7 Strict)
│   ├── background.ts                    # Extension background service worker entrypoint
│   ├── main.tsx                         # React 19 application root (Dashboard, Options, Sidepanel)
│   ├── style.css                        # Design token stylesheet
│   │
│   ├── intelligence/                    # Pure Runtime Intelligence Pipeline
│   │   └── runtimePipeline.ts           # The 11 sequential processing gates & precedence resolver
│   │
│   ├── content/                         # Content Scripts & DOM Extractor
│   │   ├── domExtractor.ts              # DOM feature extractor (Title, Meta, <=20 Headings, <=2KB Text)
│   │   └── pageContext.ts               # Content script entrypoint & Shadow DOM HUD injection
│   │
│   ├── background/                      # Service Worker Background Subsystem
│   │   ├── serviceWorker.ts             # Service Worker lifecycle, alarms, and 30s heartbeat
│   │   ├── eventMonitor.ts              # Chrome tabs navigation and activation monitor
│   │   ├── messageRouter.ts             # Typed message bus between content, popup, and background
│   │   ├── sessionManager.ts            # Active dwell accounting, sleep detection (>90s gap)
│   │   └── smartNavigationEngine.ts     # Tab groups and workstream flyout
│   │
│   ├── ml/                              # Machine Learning & WASM Subsystem
│   │   ├── classifier.ts                # Main classifier: curated DB, fastText, keyword fallback
│   │   ├── modelLoader.ts               # WebAssembly loader for atentiv-classifier.ftz
│   │   └── inferenceCache.ts            # In-memory LRU cache (24h TTL, 2000 entries)
│   │
│   ├── privacy/                         # Privacy & Exclusion Engine
│   │   └── exclusionEngine.ts           # Intercepts banking, health, and user-excluded domains
│   │
│   ├── rules/                           # User Rule Engine
│   │   └── ruleEngine.ts                # Priority user rules (wildcard, prefix, exact)
│   │
│   ├── db/                              # Local Storage Layer (Dexie / IndexedDB)
│   │   ├── database.ts                  # Dexie schema across 8 relational tables
│   │   ├── schemas.ts                   # TypeScript interfaces (Session, Rule, Workstream, Trace)
│   │   ├── writeBuffer.ts               # Batch write queue with automatic retry
│   │   ├── retentionManager.ts          # Automated 30-day activity retention pruner
│   │   └── repositories/                # Typed repository CRUD classes
│   │       ├── domainRepository.ts      # Curated domain seeding and fast-path lookup
│   │       ├── sessionRepository.ts     # Browsing sessions and dwell tracking
│   │       ├── ruleRepository.ts        # User custom rules CRUD
│   │       ├── workstreamRepository.ts  # Workstream clustering and tab relationships
│   │       ├── snapshotRepository.ts    # Workstream snapshot save/restore
│   │       ├── traceRepository.ts       # Decision Trace audit log persistence
│   │       └── metricsRepository.ts     # Focus score and daily summaries
│   │
│   ├── atlas/                           # ATLAS Attention State Machine
│   │   └── atlasEngine.ts               # Granitzer activity blocks, switch burden & hysteresis
│   │
│   ├── analytics/                       # Productivity Analytics
│   │   └── focusScore.ts                # Focus Score calculation algorithm (0 to 100)
│   │
│   ├── workstreams/                     # Semantic Clustering
│   │   ├── workstreamEngine.ts          # Tab clustering algorithms
│   │   ├── similarity.ts                # Cosine vector similarity & URL multi-factor scoring
│   │   └── contextSwitch.ts             # Rapid switch burden and context switch penalties
│   │
│   ├── features/                        # Text Features
│   │   └── textFeatures.ts              # Shared spec normalization (NFKC, lowercase, regexes)
│   │
│   └── dashboard/                       # React 19 UI Modals
│       ├── DecisionTraceModal.tsx       # Explainable decision trace inspector modal
│       ├── FeedbackModal.tsx            # Manual category feedback override dialog
│       └── WorkstreamMap.tsx            # Interactive canvas of active tab workstreams
│
├── public/                              # EXTENSION STATIC ASSETS & WASM DISTRIBUTION
│   ├── manifest.json                    # Manifest V3 extension configuration
│   ├── dashboard.html                   # Analytics dashboard entrypoint
│   ├── options.html                     # Settings and user rules entrypoint
│   ├── sidepanel.html                   # Sidepanel HUD entrypoint
│   ├── showcase.html                    # Visual component test bench
│   ├── wasm/
│   │   └── fastText.common.wasm         # WebAssembly fastText execution engine
│   └── models/
│       ├── atentiv-classifier.ftz       # Production quantized fastText model (3.58 MB)
│       └── manifest.json                # Model manifest with SHA-256 checksum
│
├── tests/                               # AUTOMATED TEST SUITES
│   ├── fixtures/
│   │   └── golden_preprocessing.json    # 200 diverse golden test vectors for cross-language parity
│   ├── unit/                            # 71 TypeScript Unit Tests (Node.js tsx native runner)
│   │   ├── parity.test.ts               # Golden parity test runner (100% exact character match)
│   │   ├── preprocessing.test.ts        # Unit tests for all 11 runtime processing gates
│   │   ├── restrictions.test.ts         # Privacy audit test (enforces 0 outbound network calls)
│   │   ├── boundaries.test.ts           # Inactivity timeout (179s vs 180s) and dwell boundaries
│   │   ├── classifier.test.ts           # Curated domain lookup and keyword fallback tests
│   │   ├── database.test.ts             # Dexie IndexedDB CRUD, write buffer, and 30-day retention
│   │   ├── focusScore.test.ts           # Focus score algorithm invariants
│   │   ├── rules.test.ts                # Priority rule evaluation and wildcard matching
│   │   ├── atlas_pipeline.test.ts       # ATLAS state transitions and tab switch detection
│   │   └── e2e_scenarios.test.ts        # Deep research session and multitasking scenarios
│   ├── browser.mjs                      # Playwright Chromium E2E browser test suite
│   ├── hud.browser.mjs                  # Playwright in-page HUD Shadow DOM test suite
│   └── auto_activation.browser.mjs      # Playwright background automatic activation test suite
│
├── docs/                                # ARCHITECTURAL DOCUMENTATION
│   └── architecture/
│       ├── PREPROCESSING_AND_TRAINING_PIPELINE.md # In-depth architectural guide
│       ├── preprocessing-spec.md        # Shared preprocessing specification
│       ├── preprocessing-audit.md       # Preprocessing audit report
│       ├── model-evaluation.md          # Real model evaluation metrics and error analysis
│       ├── ARCHITECTURE.md              # Overall Atentiv system architecture
│       └── REQUIREMENT_TRACEABILITY.md  # Traceability matrix against SRS 3.1
│
└── scripts/                             # SCRIPTS & TOOLS
    ├── benchmark.ts                     # Latency micro-benchmarking script
    ├── generate_pipeline_pdf.mjs        # Publication-quality PDF generation script
    └── launch.mjs                       # Local Chromium extension launcher
</div>

<div class="page-break"></div>

<!-- SECTION 5: RUNTIME INFERENCE & PRECEDENCE RESOLUTION -->
<h2>5. Runtime Preprocessing & Precedence Resolution (TypeScript MV3)</h2>
<p>
  Implemented in <code>src/intelligence/runtimePipeline.ts</code>, every browsing event passes through 11 sequential, pure, unit-testable gates:
</p>

<table>
  <thead>
    <tr>
      <th>Gate #</th>
      <th>Gate Name</th>
      <th>Primary Function & Decision Logic</th>
      <th>Reason Code Generated</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Gate 1</strong></td>
      <td>Eligibility Gate</td>
      <td>Blocks internal schemes (<code>chrome://</code>, <code>edge://</code>, <code>about:</code>, <code>chrome-extension://</code>). Returns <code>UNTRACKABLE</code>. No tracking, no dwell, no DB writes.</td>
      <td><code>GATE1_INTERNAL_SCHEME</code></td>
    </tr>
    <tr>
      <td><strong>Gate 2</strong></td>
      <td>Exclusion Gate</td>
      <td>Immediately stops processing if domain matches sensitive privacy list or user exclusion list. Nothing is extracted, stored, or linked.</td>
      <td><code>GATE2_EXCLUDED_PRIVACY</code><br><code>GATE2_EXCLUDED_USER</code></td>
    </tr>
    <tr>
      <td><strong>Gate 3</strong></td>
      <td>Active-Time Gate</td>
      <td>Only the currently focused tab accrues dwell. Pauses timers after 180s inactivity (configurable 1–10 min). Heartbeat gaps &gt;90s are flagged as system sleep.</td>
      <td><code>GATE3_DWELL_ACCRUED</code><br><code>GATE3_INACTIVE_PAUSED</code></td>
    </tr>
    <tr>
      <td><strong>Gate 4</strong></td>
      <td>Feature Extraction</td>
      <td>Content script extracts Title, Description, up to 20 Headings, and up to 2 KB visible main text. Strips forms, inputs, passwords, ads, and hidden elements.</td>
      <td><code>GATE4_EXTRACTED_OK</code></td>
    </tr>
    <tr>
      <td><strong>Gate 5</strong></td>
      <td>Dynamic Page Hash</td>
      <td>Debounced MutationObserver computes an FNV-1a hash over extracted features. If the hash is unchanged, re-processing is skipped.</td>
      <td><code>GATE5_HASH_UNCHANGED</code><br><code>GATE5_HASH_UPDATED</code></td>
    </tr>
    <tr>
      <td><strong>Gate 6</strong></td>
      <td>URL Credential Scrubbing</td>
      <td>Strips query credentials (<code>auth</code>, <code>token</code>, <code>password</code>, <code>key</code>, <code>session</code>, <code>secret</code>) before URLs are stored in IndexedDB or logs.</td>
      <td><code>GATE6_URL_SCRUBBED</code></td>
    </tr>
    <tr>
      <td><strong>Gate 7</strong></td>
      <td>Link Relationships</td>
      <td>Records directed <code>source -&gt; destination</code> relationships with workstream context. If source is unknown, stores <code>null</code> (never guesses).</td>
      <td><code>GATE7_LINK_ESTABLISHED</code></td>
    </tr>
    <tr>
      <td><strong>Gate 8</strong></td>
      <td>Text Normalization</td>
      <td>Applies shared spec (NFKC, lowercase, whitespace collapse, regex scrubbing) and deterministic joining to produce composite text.</td>
      <td><code>GATE8_NORMALIZED_OK</code></td>
    </tr>
    <tr>
      <td><strong>Gate 9</strong></td>
      <td>Precedence Resolution</td>
      <td>Resolves categorization across 7 tiers (User Rule &gt; Feedback &gt; Curated DB &gt; Cache &gt; fastText WASM &gt; Keyword Scoring &gt; Other).</td>
      <td><code>GATE9_USER_RULE</code><br><code>GATE9_FASTTEXT_WASM</code></td>
    </tr>
    <tr>
      <td><strong>Gate 10</strong></td>
      <td>YouTube Context Gate</td>
      <td>Defaults YouTube to Entertainment/distracting; promotes to Education/productive if title contains <em>lecture, tutorial, course, documentation</em>. User rules override.</td>
      <td><code>GATE10_YOUTUBE_PROMOTED</code><br><code>GATE10_YOUTUBE_DEFAULT</code></td>
    </tr>
    <tr>
      <td><strong>Gate 11</strong></td>
      <td>Zero Network Egress</td>
      <td>Enforces complete zero-network execution. Favicons use locally rendered letter avatars. Outbound HTTP/S requests are strictly prohibited.</td>
      <td><code>GATE11_LOCAL_ONLY</code></td>
    </tr>
  </tbody>
</table>

<h3>5.1 The Categorisation Precedence Hierarchy</h3>
<p>
  Precedence in Gate 9 is non-negotiable. fastText WASM is a powerful generalizer, but <strong>user intent always wins</strong>:
</p>
<pre><code>Precedence Order:
  1. Exclusion Check        --&gt; Returns 'Private' / Excluded immediately
  2. User Custom Rules      --&gt; 100% Precedence; fastText NEVER overrides a user rule
  3. User Explicit Feedback  --&gt; Overrides curated and ML predictions for that domain
  4. Curated Domain DB      --&gt; Pre-seeded verified domains (confidence &gt;= 0.95)
  5. In-Memory LRU Cache    --&gt; 24-hour TTL caching identical feature keys
  6. fastText (WASM)        --&gt; Evaluated if composite text &gt;= 3 chars and confidence &gt; 0.35
  7. Keyword Scoring        --&gt; Deterministic heuristic fallback if WASM model fails or score &lt;= 0.35
  8. Other / Uncategorized  --&gt; Neutral fallback ensuring 100% error-free pipeline resilience</code></pre>

<!-- SECTION 6: CROSS-LANGUAGE PARITY -->
<h2>6. Cross-Language Parity Enforcement & Verification</h2>
<p>
  To prove that TypeScript and Python process text identically, <strong>200 golden examples</strong> were exported from the held-out test split into <code>tests/fixtures/golden_preprocessing.json</code>. Each fixture contains the raw DOM fields, expected label, and the exact normalized composite string.
</p>

<h3>Automated CI Parity Test Results</h3>
<pre><code># 1. TypeScript Runner (Node.js tsx native test)
$ npx tsx --test tests/unit/parity.test.ts
✔ Parity Verification (TS vs Spec): All 200 golden fixtures match expected normalized text character-for-character (9.26ms)
ℹ tests 1 | pass 1 | fail 0

# 2. Python Runner (pytest 9.1.1)
$ pytest model/test_parity.py
============================== test session starts ==============================
model/test_parity.py .                                                   [100%]
============================== 1 passed in 1.71s ===============================</code></pre>

<div class="page-break"></div>

<!-- SECTION 7: EVALUATION & BENCHMARKS -->
<h2>7. Empirical Evaluation & Performance Benchmarks</h2>

<h3>7.1 Quantitative Held-Out Test Evaluation (4,493 Samples)</h3>
<table>
  <thead>
    <tr>
      <th>Metric</th>
      <th>Measured Value</th>
      <th>SRS Specification Target</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Overall Test Accuracy</strong></td>
      <td><strong>55.78%</strong></td>
      <td>Baseline zero-server local classifier</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td><strong>Weighted F1-Score</strong></td>
      <td><strong>0.5480</strong></td>
      <td>Balanced domain generalization</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td><strong>Macro F1-Score</strong></td>
      <td><strong>0.4746</strong></td>
      <td>Unweighted average across 13 classes</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td><strong>Title-Only Noise Accuracy</strong></td>
      <td><strong>44.25%</strong></td>
      <td>Resilience under zero visible body text</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td><strong>Quantized Model Size</strong></td>
      <td><strong>3.58 MB</strong></td>
      <td>&lt; 4.0 MB model target</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td><strong>Packaged Extension Zip</strong></td>
      <td><strong>3.4 MB</strong></td>
      <td>&lt; 5.0 MB overall package budget</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td><strong>Inference Latency (P50)</strong></td>
      <td><strong>0.011 ms</strong></td>
      <td>&lt; 50.0 ms warm target</td>
      <td><span class="badge-exceed">EXCEEDS (4,500x)</span></td>
    </tr>
    <tr>
      <td><strong>Inference Latency (P99)</strong></td>
      <td><strong>0.042 ms</strong></td>
      <td>&lt; 50.0 ms warm target</td>
      <td><span class="badge-exceed">EXCEEDS (1,200x)</span></td>
    </tr>
  </tbody>
</table>

<h3>7.2 Per-Class Precision, Recall, and F1 Breakdown</h3>
<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Precision</th>
      <th>Recall</th>
      <th>F1-Score</th>
      <th>Support (Samples)</th>
      <th>Performance Characterization</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Entertainment</strong></td>
      <td>0.6079</td>
      <td>0.6985</td>
      <td><strong>0.6501</strong></td>
      <td>1,121</td>
      <td>Strong vocabulary patterns (video, gaming, streaming)</td>
    </tr>
    <tr>
      <td><strong>Technology</strong></td>
      <td>0.6338</td>
      <td>0.6085</td>
      <td><strong>0.6209</strong></td>
      <td>401</td>
      <td>Distinct programming, dev tooling & framework syntax</td>
    </tr>
    <tr>
      <td><strong>Shop</strong></td>
      <td>0.5569</td>
      <td>0.5669</td>
      <td><strong>0.5618</strong></td>
      <td>665</td>
      <td>Commercial cart, pricing, and product descriptors</td>
    </tr>
    <tr>
      <td><strong>Education</strong></td>
      <td>0.5661</td>
      <td>0.5573</td>
      <td><strong>0.5617</strong></td>
      <td>576</td>
      <td>Course, syllabus, academic and lecture terminology</td>
    </tr>
    <tr>
      <td><strong>Uncategorized</strong></td>
      <td>0.4995</td>
      <td>0.6414</td>
      <td><strong>0.5616</strong></td>
      <td>711</td>
      <td>Catch-all for novel, ambiguous, or multi-topic sites</td>
    </tr>
    <tr>
      <td><strong>Chat</strong></td>
      <td>0.5574</td>
      <td>0.4722</td>
      <td><strong>0.5113</strong></td>
      <td>216</td>
      <td>Messaging channels, conversational threads & forums</td>
    </tr>
    <tr>
      <td><strong>Work</strong></td>
      <td>0.4400</td>
      <td>0.3267</td>
      <td><strong>0.3750</strong></td>
      <td>101</td>
      <td>Enterprise apps; frequently overlaps with Tech/Comms</td>
    </tr>
    <tr>
      <td><strong>Health</strong></td>
      <td>0.4860</td>
      <td>0.3023</td>
      <td><strong>0.3728</strong></td>
      <td>172</td>
      <td>Held-out medical portals; specialized jargon</td>
    </tr>
    <tr>
      <td><strong>News</strong></td>
      <td>0.3986</td>
      <td>0.3161</td>
      <td><strong>0.3526</strong></td>
      <td>174</td>
      <td>Broad topical diversity overlapping with Politics/Tech</td>
    </tr>
    <tr>
      <td><strong>Travel</strong></td>
      <td>0.5294</td>
      <td>0.2500</td>
      <td><strong>0.3396</strong></td>
      <td>108</td>
      <td>Regional travel blogs; low-support held-out domains</td>
    </tr>
    <tr>
      <td><strong>Government</strong></td>
      <td>0.5138</td>
      <td>0.2258</td>
      <td><strong>0.3137</strong></td>
      <td>248</td>
      <td>Municipal portals lacking distinct topical keywords</td>
    </tr>
  </tbody>
</table>

${confusionMatrixBase64 ? `
<h3>7.3 Normalized Confusion Matrix Heatmap</h3>
<div class="img-container">
  <img src="data:image/png;base64,${confusionMatrixBase64}" alt="Atentiv Model Confusion Matrix">
  <div style="font-size: 7.5pt; color: #64748b; margin-top: 3px;">Figure 2: 13x13 Normalized Confusion Matrix across 4,493 Held-Out Test Samples</div>
</div>
` : ''}

<h3>7.4 Runtime Micro-Benchmarks (scripts/benchmark.ts)</h3>
<table>
  <thead>
    <tr>
      <th>Pipeline Operation</th>
      <th>P50 Latency</th>
      <th>P95 Latency</th>
      <th>P99 Latency</th>
      <th>SRS Budget Limit</th>
      <th>Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Curated Domain Lookup</td>
      <td>0.036 ms</td>
      <td>0.082 ms</td>
      <td>0.174 ms</td>
      <td>&lt; 5.0 ms</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td>Text Feature Extraction</td>
      <td>0.008 ms</td>
      <td>0.011 ms</td>
      <td>0.022 ms</td>
      <td>&lt; 2.0 ms</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td>Rule Engine Evaluation</td>
      <td>0.001 ms</td>
      <td>0.002 ms</td>
      <td>0.005 ms</td>
      <td>&lt; 1.0 ms</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td>End-to-End Classification</td>
      <td>0.006 ms</td>
      <td>0.023 ms</td>
      <td>0.354 ms</td>
      <td>&lt; 15.0 ms</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
    <tr>
      <td>IndexedDB Session Put + Dwell</td>
      <td>1.083 ms</td>
      <td>1.763 ms</td>
      <td>2.192 ms</td>
      <td>&lt; 10.0 ms</td>
      <td><span class="badge-pass">PASS</span></td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- SECTION 8: OPERATOR RUNBOOK -->
<h2>8. Operator Runbook: Exact Execution Commands</h2>
<p>
  All operations across the repository are 100% deterministic and reproducible via the terminal:
</p>

<h3>A. Python Environment Setup</h3>
<pre><code># 1. Setup Python 3.11 virtual environment
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r model/requirements.txt</code></pre>

<h3>B. Execute Complete Machine Learning Pipeline</h3>
<pre><code># Master single-entrypoint orchestrator
python -m model.pipeline --config model/configs/default.yaml

# Alternatively, execute the 7 modular scripts sequentially:
python model/training/inspect_dataset.py
python model/training/clean_dataset.py
python model/training/preprocess.py
python model/training/create_fasttext_files.py
python model/training/train.py
python model/training/evaluate.py
python model/training/export_manifest.py</code></pre>

<h3>C. Verify Cross-Language Golden Parity</h3>
<pre><code># Python parity test against 200 golden vectors
pytest model/test_parity.py

# TypeScript parity test
npx tsx --test tests/unit/parity.test.ts</code></pre>

<h3>D. Execute Full Browser Extension Test Suite</h3>
<pre><code># Run all 71 unit and integration tests (inactivity, gates, boundaries, privacy audit)
npm test

# Run Playwright Chromium end-to-end browser tests
npm run test:browser

# Run performance micro-benchmarks
npm run benchmark</code></pre>

<h3>E. Production Build & Packaging</h3>
<pre><code># Compiles TypeScript (strict mode), bundles with Vite/esbuild, and packages extension zip
npm run package</code></pre>
<p>Output distribution package: <code>atentiv-v1.0.1.zip</code> (<strong>3.4 MB</strong>).</p>

<!-- SECTION 9: SUMMARY DELIVERABLES & VERIFICATION -->
<h2>9. Summary of Deliverables & Verification Checklist</h2>
<table>
  <thead>
    <tr>
      <th>Deliverable Artifact</th>
      <th>File Path</th>
      <th>Description / Status</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Shared Preprocessing Spec</td>
      <td><code>docs/architecture/preprocessing-spec.md</code><br><code>model/configs/preprocessing.json</code></td>
      <td>Canonical single source of truth for text normalization and bounds. Verified.</td>
    </tr>
    <tr>
      <td>Preprocessing Audit</td>
      <td><code>docs/architecture/preprocessing-audit.md</code></td>
      <td>Complete architectural audit of existing assets, gaps, and invariants. Verified.</td>
    </tr>
    <tr>
      <td>The 7 Modular Scripts</td>
      <td><code>model/training/*.py</code></td>
      <td>The 7 modular dataset, training, evaluation & export scripts. Verified.</td>
    </tr>
    <tr>
      <td>Runtime 11-Stage Pipeline</td>
      <td><code>src/intelligence/runtimePipeline.ts</code></td>
      <td>Pure, typed processing gates with reason codes and fallback heuristics. Verified.</td>
    </tr>
    <tr>
      <td>Model Pipeline Orchestrator</td>
      <td><code>model/pipeline.py</code></td>
      <td>Python 3.11 end-to-end dataset curation, training, quantization & fixture export. Verified.</td>
    </tr>
    <tr>
      <td>Quantized fastText Model</td>
      <td><code>public/models/atentiv-classifier.ftz</code></td>
      <td>3.58 MB binary with vector quantization. SHA-256 verified in manifest.json. Verified.</td>
    </tr>
    <tr>
      <td>Model Evaluation Report</td>
      <td><code>docs/architecture/model-evaluation.md</code><br><code>model/artifacts/metrics.json</code></td>
      <td>Empirical metrics from real pipeline run (55.78% acc, 0.4746 F1, P50=0.011ms). Verified.</td>
    </tr>
    <tr>
      <td>200 Golden Parity Fixtures</td>
      <td><code>tests/fixtures/golden_preprocessing.json</code><br><code>tests/unit/parity.test.ts</code><br><code>model/test_parity.py</code></td>
      <td>Cross-language parity suite verifying 100% character-for-character matching. Verified.</td>
    </tr>
    <tr>
      <td>Model Archive & Notes</td>
      <td><code>model/archive/README.md</code></td>
      <td>Safely archived redundant binaries; keeps distribution bundle under 3.5 MB. Verified.</td>
    </tr>
  </tbody>
</table>

<div style="margin-top: 25px; text-align: center; font-size: 8pt; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 8px;">
  Atentiv Master Architectural Engineering Specification &bull; SRS Revision 3.1 / Submission Version 3.0 &bull; Generated October 15, 2026
</div>

</body>
</html>
`;

async function generateMasterPDF() {
  console.log("Launching Chromium via Playwright...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Setting HTML content and rendering layout...");
  await page.setContent(htmlContent, { waitUntil: "networkidle" });

  const outputPath = path.join(projectRoot, "Atentiv_Complete_Architecture_and_Pipeline_Specification.pdf");
  console.log(`Generating publication-quality Master Architecture PDF at: ${outputPath}...`);

  await page.pdf({
    path: outputPath,
    format: "A4",
    printBackground: true,
    margin: {
      top: "18mm",
      bottom: "18mm",
      left: "16mm",
      right: "16mm",
    },
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size: 7.5pt; color: #94a3b8; width: 100%; text-align: right; padding-right: 16mm; font-family: sans-serif;">Atentiv Master Architecture &bull; SRS Revision 3.1 Specification</div>`,
    footerTemplate: `<div style="font-size: 7.5pt; color: #94a3b8; width: 100%; text-align: center; font-family: sans-serif;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
  });

  await browser.close();
  console.log("Master Architecture PDF generation completed successfully!");

  const stats = fs.statSync(outputPath);
  console.log(`Generated PDF file size: ${(stats.size / 1024).toFixed(1)} KB`);
}

generateMasterPDF().catch(err => {
  console.error("Master Architecture PDF generation failed:", err);
  process.exit(1);
});
