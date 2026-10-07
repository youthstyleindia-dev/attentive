# Atentiv Feature Engineering & Tokenization Library
## Complete Feature Dictionary & Privacy Taxonomy

This document provides the formal specification for all observable and derived features in the Atentiv Browser Activity Intelligence System, conforming to Section 81 of the Atentiv Specification.

---

## 1. Feature Pipeline Overview

Atentiv processes browser content into structured textual and vector inputs through a deterministic, privacy-preserving pipeline:

```
+------------------+     +-------------------+     +--------------------+     +-------------------+
| Raw Browser Tab  | --> | URL Sanitization  | --> | Text Normalization | --> | Composite Text    |
| (URL, Title, DOM)|     | & Domain Strip    |     | & Cleaning         |     | Construction      |
+------------------+     +-------------------+     +--------------------+     +-------------------+
                                                                                        |
                                                                                        v
                                                                              +-------------------+
                                                                              | fastText WASM     |
                                                                              | Embedding Vector  |
                                                                              +-------------------+
```

---

## 2. Comprehensive Feature Matrix

| Feature | Data Type | Source | Transformation / Sanitization | Purpose | Privacy Class | Persisted? | Consuming Engines |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **`domain`** | `string` | URL | Strips `www.`, ports, credentials | Apex platform identification | Non-PII | Yes | Activity, Productivity, Analytics |
| **`hostname`** | `string` | URL | Extracted from `window.location.hostname` | Subdomain resolution | Non-PII | Ephemeral | Privacy Engine, Rule Matcher |
| **`subdomain`** | `string` | URL | Apex prefix parsing | Multi-tenant platform classification | Non-PII | Ephemeral | Fast Path Rule Resolution |
| **`url_tokens`** | `string[]` | URL Path | Strips query, hash, credentials; splits on `/`, `-`, `_` | Contextual topic extraction | Redacted | Ephemeral | ML Classifier, Workstream |
| **`path_tokens`** | `string[]` | Pathname | Filters numeric IDs, GUIDs, auth tokens | Task context signals | Redacted | Ephemeral | Classifier, Workstream |
| **`title_tokens`** | `string[]` | Document Title | Lowercase, non-alphanumeric noise strip, 500-char clip | Primary page subject representation | Masked | Yes (Title) | Classifier, Workstream, Traces |
| **`heading_tokens`** | `string[]` | DOM `h1`, `h2` | Multi-space collapse, length bounded | High-confidence content verification | Masked | Ephemeral | Fast Path Enrichment |
| **`meta_tokens`** | `string[]` | Meta Description | Extracts `meta[name=description]`, bounded | Contextual background signal | Redacted | Ephemeral | fastText Embedding |
| **`language`** | `string` | `html[lang]` | BCP-47 language tag parsing | Multilingual tokenizer selection | Non-PII | Cache | Text Preprocessing |
| **`timestamp`** | `number` (ms) | Browser Event | UTC Epoch milliseconds | Temporal ordering & dwell computation | Temporal | Yes | ATLAS State Machine, Analytics |
| **`hour`** | `number` (0–23) | Timestamp | `new Date(ts).getHours()` | Hourly context switch frequency | Aggregated | Yes | Analytics (Hourly Switches Graph)|
| **`day`** | `number` (0–6) | Timestamp | `new Date(ts).getDay()` | Multi-day trend aggregation | Aggregated | Yes | Analytics, Export |
| **`active_time`** | `number` (ms) | ATLAS Engine | Active foreground interaction intervals | Active dwell time calculation | Metrics | Yes | Focus Score, Coverage, Dwell |
| **`idle_time`** | `number` (ms) | Chrome Idle API | Cumulative away intervals ($>180\text{s}$) | Active coverage divisor; idle reporting | Metrics | Yes | Active Coverage, Dashboard |
| **`previous_tab_id`**| `number` | `tabs.onActivated`| Captured prior to active tab change | Pure tab switch detection | Ephemeral | Yes | Tab Switch Detector |
| **`current_tab_id`** | `number` | `tabs.onActivated`| Captured upon tab activation | Active session binding | Ephemeral | Yes | Tab Switch Detector |
| **`previous_domain`**| `string` | Tab Session | Domain from prior active checkpoint | Cross-domain friction analysis | Non-PII | Yes | Switch Burden Evaluator |
| **`current_domain`** | `string` | Tab Session | Domain of incoming active tab | Cross-domain friction analysis | Non-PII | Yes | Switch Burden Evaluator |
| **`category`** | `string` | ML / Rules | Taxonomy mapping (e.g. Technology, Education) | Broad activity grouping | Analytic | Yes | Workstreams, Analytics, HUD |
| **`activity`** | `string` | Classifier | Controlled taxonomy (e.g. Coding, Reading) | Granular behavioral classification | Analytic | Yes | HUD, Decision Traces, Timeline |
| **`productivity`** | `enum` | Rules / Library | `productive`, `unproductive`, `neutral` | Focus Score numerator & denominator | Metric | Yes | Focus Score, Notifications |
| **`workstream_id`** | `string` | Workstream Engine| Cosine similarity clustering + hysteresis | Cohesive task grouping | Derived | Yes | Workstream Map, Smart Nav |
| **`switch_count`** | `number` | Tab Detector | Count of $\mathbf{1}(\text{tabId}_t \neq \text{tabId}_{t-1})$ | Pure multitasking volume | Metric | Yes | Analytics, HUD |
| **`switch_interval`**| `number` (ms) | Tab Detector | Time elapsed since prior switch event | Rapid oscillating switch detection | Temporal | Yes | Switch Burden Evaluator |
| **`nav_relation`** | `enum` | History / Opener | `parent_child`, `same_domain`, `unrelated` | Navigation proximity weighting | Structural | Ephemeral | Workstream Engine |
| **`model_confidence`**| `number` (0–1) | fastText WASM | Softmax probability output of top label | Decision explainability & fallbacks | Diagnostic | Yes | Decision Traces |
| **`user_rule_match`**| `boolean` | Rule Engine | Deterministic priority lookup result | Highest-priority override indicator | User Config | Yes | Decision Traces, UI Badges |
| **`switch_burden`** | `number` (0–100)| Burden Engine | Multi-factor cognitive friction score | Qualitative interruption index | Derived | Yes | Analytics, Traces |

---

## 3. Privacy & Sanitization Protocols

### 3.1 Strict Exclusion Protocols
Internal browser schemes (`chrome://`, `chrome-extension://`, `about:`, `file://`) are strictly rejected prior to feature extraction. No features are generated or stored for these origins.

### 3.2 Stripping Sensitive URL Parameters
All query parameters and hash fragments are permanently discarded before URL strings touch the feature store:
```typescript
const parsed = new URL(rawUrl);
parsed.search = "";
parsed.hash = "";
parsed.username = "";
parsed.password = "";
```

### 3.3 Ephemeral vs. Persisted Data
- High-volume raw signals (`heading_tokens`, `meta_tokens`, `subdomain`) exist only in transient memory during classification and are never written to IndexedDB.
- Only sanitized aggregate representations (`tab_sessions`, `activity_segments`, `tab_switch_events`) are committed to local IndexedDB storage.
