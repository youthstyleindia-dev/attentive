# Atentiv Explainable Decision Traces

This document specifies the explainability architecture, decision trace generation, and user auditability features implemented in `src/ml/classifier.ts`, `src/db/repositories/traceRepository.ts`, and `src/dashboard/DecisionTraceModal.tsx`.

---

## 1. Explainability Philosophy

Black-box AI classification destroys user trust. When an attention assistant silently classifies a research session as "distracting", the user has no way of knowing whether the classification stemmed from a miscalibrated ML model, a keyword collision, or an outdated rule.

Atentiv mandates **100% Explainability**: every single tab classification produces an auditable, human-readable **Decision Trace** recording exactly what rule or model was applied, the extracted tokens, the model probabilities, and the inference latency.

---

## 2. Decision Trace Structure (`DecisionTraceRecord`)

```typescript
export interface DecisionTraceRecord {
  decision_id: string;               // Unique trace UUID
  session_id: string;                // Correlated tab session UUID
  timestamp: number;                 // Epoch evaluation timestamp
  url: string;                       // Sanitized URL (no query strings/secrets)
  domain: string;                    // Normalized domain
  applied_rule_id: string | null;    // Rule ID if resolved via rule engine
  rule_type: string;                 // "Exact User Rule" | "Domain Knowledge" | "fastText ML"
  extracted_features: string[];      // Tokens extracted from URL, title, meta
  fasttext_probabilities: Array<{    // Top fastText category distributions
    label: string;
    score: number;
  }>;
  confidence: number;                // Final decision confidence (0.0 to 1.0)
  selected_category: string;         // Resulting category
  selected_activity: string;         // Resulting activity
  selected_productivity: string;     // Resulting productivity
  selected_workstream: string;       // Assigned workstream cluster
  latency_ms: number;                // Execution latency in ms
  notes: string[];                   // Human-readable resolution log
}
```

---

## 3. Step-by-Step Resolution Trace Examples

### Example 1: Deterministic Domain Knowledge Resolution
```json
{
  "domain": "github.com",
  "rule_type": "Curated Domain Knowledge",
  "applied_rule_id": "curated-github.com",
  "extracted_features": ["github", "facebook", "react", "issues"],
  "fasttext_probabilities": [],
  "confidence": 1.0,
  "selected_category": "Computers",
  "selected_activity": "Coding & Development",
  "selected_productivity": "productive",
  "selected_workstream": "Frontend Architecture",
  "latency_ms": 0.038,
  "notes": [
    "Domain matched curated library: github.com",
    "Assigned default activity: Coding & Development",
    "Confidence score set to 1.0"
  ]
}
```

### Example 2: fastText WebAssembly ML Inference Resolution
```json
{
  "domain": "huggingface.co",
  "rule_type": "fastText ML Inference",
  "applied_rule_id": null,
  "extracted_features": ["huggingface", "models", "fasttext", "quantization"],
  "fasttext_probabilities": [
    { "label": "Computers", "score": 0.884 },
    { "label": "Education", "score": 0.542 },
    { "label": "Chat", "score": 0.081 }
  ],
  "confidence": 0.884,
  "selected_category": "Computers",
  "selected_activity": "Research & Reading",
  "selected_productivity": "productive",
  "selected_workstream": "Machine Learning",
  "latency_ms": 0.082,
  "notes": [
    "No user or domain override found",
    "Evaluated fastText 11-category multi-label WASM model",
    "Top category: Computers (confidence 0.884)",
    "Mapped to activity: Research & Reading via keyword matching"
  ]
}
```

---

## 4. User Inspection & Correction Loop

1. **Inspector Modal (`DecisionTraceModal.tsx`)**:
   Users can click on any visit in the Atentiv dashboard to open the Decision Trace modal. It renders:
   - Evaluated URL and domain.
   - Classification pipeline path taken.
   - Feature token chips.
   - Probability bar charts for top fastText categories.
   - Evaluation latency in milliseconds.
2. **Direct Feedback & Rule Creation (`FeedbackModal.tsx`)**:
   If the user disagrees with any classification, they can click "Correct classification".
   - The feedback is stored locally in `user_feedback`.
   - An exact high-priority user rule (`priority = 100`) is immediately synthesized in `rules` repository.
   - All subsequent visits to that domain are deterministically resolved via the user's explicit preference.
