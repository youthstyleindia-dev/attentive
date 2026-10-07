# Atentiv Data Dictionary & Schema Specification

This document details the persistent storage schemas used across **AtentivDB** (IndexedDB via Dexie.js) and the ephemeral state stores in `chrome.storage`.

---

## 1. Storage Overview

Atentiv maintains a strictly on-device storage hierarchy:
- **`chrome.storage.session`**: In-memory ephemeral storage for active dwell timer checkpoints, surviving service worker suspensions but wiped on browser exit.
- **`chrome.storage.local`**: Global extension preferences, opt-in flags, and exclusion lists.
- **IndexedDB (`AtentivDB` v1)**: 13 normalized analytical object stores for durable activity logs, vectors, decision traces, rules, and workstreams.

---

## 2. IndexedDB Stores (`AtentivDB`)

### 2.1 `tab_sessions`
Stores individual browser tab interaction intervals and their classification.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `session_id` | `string` (UUID) | Primary Key | Unique session identifier |
| `tab_id` | `number` | Yes | Chrome browser tab ID |
| `window_id` | `number` | Yes | Chrome browser window ID |
| `url` | `string` | Yes | Sanitized page URL (no query strings or hash) |
| `domain` | `string` | Yes | Extracted apex/subdomain (e.g. `github.com`) |
| `title` | `string` | No | Page title harvested at session start |
| `start_time` | `number` | Yes | Epoch timestamp (ms) of session start |
| `end_time` | `number` | Yes | Epoch timestamp (ms) of session close |
| `dwell_time` | `number` | No | Total elapsed dwell duration (ms) |
| `active_time` | `number` | No | Active dwell time excluding idle intervals (ms) |
| `idle_time` | `number` | No | Detected idle duration during session (ms) |
| `category` | `string` | Yes | fastText predicted category (e.g. `Computers`) |
| `activity_type`| `string` | Yes | Activity taxonomy type (e.g. `Coding`) |
| `productivity_type`| `enum` | Yes | `'productive'` \| `'neutral'` \| `'distracting'` |
| `productivity_score`| `number` | No | Numeric score between 0 and 100 |
| `workstream_id`| `string` | Yes | Assigned workstream foreign key |
| `workstream_name`| `string` | No | Display name of workstream |
| `classification_confidence`| `number`| No | Confidence probability (0.0 to 1.0) |
| `classification_latency_ms`| `number`| No | End-to-end inference latency in milliseconds |
| `model_version`| `string` | No | Version of fastText model used (e.g. `1.0.0`) |
| `created_at` | `number` | Yes | Record creation epoch timestamp (ms) |

---

### 2.2 `activities`
Normalized high-level user activities aggregated from session segments.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `activity_id` | `string` (UUID) | Primary Key | Unique activity identifier |
| `session_id` | `string` | Yes | Foreign key to `tab_sessions.session_id` |
| `activity_name` | `string` | Yes | Controlled activity name (e.g. `Documentation`) |
| `category` | `string` | Yes | Top-level category |
| `start_time` | `number` | Yes | Epoch timestamp (ms) |
| `end_time` | `number` | Yes | Epoch timestamp (ms) |
| `dwell_time` | `number` | No | Duration (ms) |
| `domain` | `string` | Yes | Associated domain |
| `productivity` | `enum` | Yes | `'productive'` \| `'neutral'` \| `'distracting'` |

---

### 2.3 `workstreams`
Clusters of coherent tasks and contexts.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `workstream_id` | `string` (UUID) | Primary Key | Unique workstream identifier |
| `name` | `string` | Yes | User or auto-assigned label |
| `description` | `string` | No | Contextual summary of the workstream |
| `category` | `string` | Yes | Primary dominant category |
| `centroid_vector`| `Float32Array` | No | Average fastText embedding vector (dim=64) |
| `domains` | `string[]` | No | Array of associated domains |
| `keywords` | `string[]` | No | Extracted representative keywords |
| `created_at` | `number` | Yes | Creation timestamp |
| `updated_at` | `number` | Yes | Last session assignment timestamp |
| `active` | `boolean` | Yes | Whether the workstream is actively tracked |
| `color` | `string` | No | Hex color code for UI visualization |

---

### 2.4 `workstream_events`
Tracks transitions, entries, exits, and context switch penalties between workstreams.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `event_id` | `string` (UUID) | Primary Key | Unique event ID |
| `workstream_id` | `string` | Yes | Target workstream ID |
| `session_id` | `string` | Yes | Associated session ID |
| `entered_at` | `number` | Yes | Epoch timestamp (ms) of switch into stream |
| `exited_at` | `number` | Yes | Epoch timestamp (ms) of switch out of stream |
| `duration` | `number` | No | Duration spent in workstream (ms) |
| `previous_workstream_id`| `string \| null`| Yes | Previous workstream ID for transition tracking |
| `switch_penalty` | `number` | No | Calculated context switch penalty (0 to 40) |

---

### 2.5 `snapshots`
Saved context resume workspaces for one-click tab restoration.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `snapshot_id` | `string` (UUID) | Primary Key | Unique snapshot ID |
| `workstream_id` | `string` | Yes | Associated workstream ID |
| `title` | `string` | Yes | User-provided workspace title |
| `note` | `string` | No | Optional user note ("Where did you leave off?") |
| `timestamp` | `number` | Yes | Creation epoch timestamp (ms) |
| `saved_tabs` | `SavedTab[]` | No | JSON array of `{ title: string; url: string; pinned?: boolean }` |

---

### 2.6 `rules`
User-defined or system-generated classification and override rules.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `rule_id` | `string` (UUID) | Primary Key | Unique rule ID |
| `name` | `string` | No | Descriptive rule name |
| `enabled` | `boolean` | Yes | Rule active toggle |
| `priority` | `number` | Yes | Evaluation priority (higher takes precedence) |
| `condition` | `RuleCondition` | No | Condition object (`domain_exact`, `path_prefix`, etc.) |
| `action` | `RuleAction` | No | Override action (`category`, `activity_type`, `productivity_type`) |
| `created_at` | `number` | Yes | Creation timestamp |

---

### 2.7 `decision_traces`
Auditable, explainable decision records for every classified tab session.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `decision_id` | `string` (UUID) | Primary Key | Unique decision ID |
| `session_id` | `string` | Yes | Associated session ID |
| `timestamp` | `number` | Yes | Evaluation timestamp |
| `url` | `string` | No | Sanitized URL evaluated |
| `domain` | `string` | Yes | Domain evaluated |
| `applied_rule_id` | `string \| null` | Yes | ID of rule applied (if resolved via rule) |
| `rule_type` | `string` | Yes | Resolution method (`Exact User Rule`, `fastText ML`, etc.) |
| `extracted_features` | `string[]` | No | Tokenized terms extracted from page context |
| `fasttext_probabilities`| `LabelScore[]`| No | Top predicted categories and confidence scores |
| `confidence` | `number` | No | Final confidence score (0.0 to 1.0) |
| `selected_category` | `string` | Yes | Final assigned category |
| `selected_activity` | `string` | No | Final assigned activity |
| `selected_productivity`| `string` | No | Final assigned productivity rating |
| `selected_workstream` | `string` | No | Final assigned workstream name |
| `latency_ms` | `number` | No | Total decision evaluation time in ms |
| `notes` | `string[]` | No | Human-readable explanation traces |

---

### 2.8 `user_feedback`
Stores manual user corrections to train personalized local overrides.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `feedback_id` | `string` (UUID) | Primary Key | Unique feedback identifier |
| `session_id` | `string` | Yes | Session ID corrected |
| `input_features` | `object` | No | Snapshot of input tokens at decision time |
| `predicted_category`| `string` | No | Original model category prediction |
| `predicted_activity`| `string` | No | Original activity prediction |
| `predicted_productivity`| `string`| No | Original productivity prediction |
| `user_category` | `string` | No | User-corrected category |
| `user_activity` | `string` | No | User-corrected activity |
| `user_productivity`| `string` | No | User-corrected productivity |
| `user_workstream` | `string` | No | User-assigned workstream |
| `reason` | `string` | No | Optional explanation string |
| `timestamp` | `number` | Yes | Feedback submission timestamp |

---

### 2.9 `domains`
Curated knowledge base domain cache.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `domain` | `string` | Primary Key | Normalized domain (e.g. `github.com`) |
| `category` | `string` | Yes | Standard category mapping |
| `default_activity` | `string` | Yes | Standard default activity mapping |
| `default_productivity`| `string` | Yes | Default baseline productivity |
| `confidence` | `number` | No | Knowledge base confidence (typically 1.0) |
| `source` | `string` | No | Origin (`curated`, `community`, `user`) |

---

### 2.10 `focus_metrics`
Daily and hourly aggregated attention and focus analytics.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `metric_id` | `string` (UUID) | Primary Key | Unique metric ID |
| `date` | `string` | Yes | Date string (`YYYY-MM-DD`) |
| `hour` | `number` | Yes | Hour of day (0-23) |
| `total_dwell_time` | `number` | No | Total dwell duration in interval (ms) |
| `productive_time` | `number` | No | Productive dwell duration (ms) |
| `distracting_time` | `number` | No | Distracting dwell duration (ms) |
| `neutral_time` | `number` | No | Neutral dwell duration (ms) |
| `context_switches` | `number` | No | Total workstream switches observed |
| `focus_score` | `number` | No | Computed focus score (0 to 100) |

---

### 2.11 `feature_snapshots`
Temporary diagnostic store for extracted text tokens and embeddings.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `snapshot_id` | `string` (UUID) | Primary Key | Unique feature snapshot ID |
| `session_id` | `string` | Yes | Associated session ID |
| `url` | `string` | No | Sanitized URL |
| `composite_text` | `string` | No | Normalized text string passed to fastText |
| `vector_norm` | `number` | No | L2 norm of generated sentence vector |
| `created_at` | `number` | Yes | Creation timestamp |

---

### 2.12 `model_manifest`
Tracks installed fastText WebAssembly models and versions.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `version` | `string` | Primary Key | Model version string (`1.0.0`) |
| `file_name` | `string` | No | Model binary file name (`atentiv-page-category.ftz`) |
| `size_bytes` | `number` | No | File size in bytes (1,887,436 bytes) |
| `sha256` | `string` | No | SHA-256 integrity checksum |
| `num_classes` | `number` | No | Number of output categories (11) |
| `dimension` | `number` | No | Embedding vector dimension (64) |
| `quantized` | `boolean` | No | Quantization flag (`true`) |
| `active` | `boolean` | Yes | Active model flag |

---

### 2.13 `model_registry`
Historical log of local model updates, migrations, and evaluations.

| Column | Type | Indexed | Description |
| :--- | :--- | :---: | :--- |
| `id` | `string` (UUID) | Primary Key | Unique entry ID |
| `version` | `string` | Yes | Registered model version |
| `registered_at` | `number` | Yes | Registration timestamp |
| `micro_f1` | `number` | No | Micro F1 evaluation score on test set |
| `precision_at_1`| `number` | No | Precision @ 1 score on test set |
| `latency_p95_ms`| `number` | No | 95th percentile inference latency |
| `status` | `string` | Yes | Status (`active`, `deprecated`, `failed`) |

---

## 3. Chrome Storage Key Map

| Storage Area | Key | Type | Description |
| :--- | :--- | :--- | :--- |
| `chrome.storage.session` | `activeCheckpoint` | `ActiveCheckpoint` | Real-time session checkpoint storing `sessionId`, `tabId`, `windowId`, `url`, `since`, and `dwellTime`. |
| `chrome.storage.local` | `atentiv_settings` | `object` | Settings object: `{ enabled: boolean, exclusions: string[], retentionDays: number }`. |
| `chrome.storage.local` | `atentiv_goal` | `object` | Current focus intention: `{ goal: string, end: number, stream: string }`. |
| `chrome.storage.local` | `state` | `LegacyState` | Reactive UI view-model state synchronized with Dexie. |
