# Atentiv Multi-Stage Rule Engine & Decision Hierarchy

This document specifies the deterministic, multi-stage decision resolution hierarchy implemented in `src/rules/ruleEngine.ts` and `src/ml/classifier.ts`.

---

## 1. Decision Resolution Hierarchy

To guarantee user sovereignty, privacy protection, and sub-millisecond execution, Atentiv evaluates browsing events through a strict 7-stage fallback cascade:

```
[Stage 1: Privacy Exclusion Filter]
       |
       v (not excluded)
[Stage 2: Exact User Rule] (domain_exact)
       |
       v (no match)
[Stage 3: High-Priority Pattern Rule] (wildcard / path_prefix)
       |
       v (no match)
[Stage 4: Curated Domain Knowledge Base] (~100+ pre-indexed domains)
       |
       v (no match)
[Stage 5: fastText WebAssembly ML Inference] (11-class multi-label model)
       |
       v
[Stage 6: Controlled Activity Taxonomy] (9 activity groups)
       |
       v
[Stage 7: Contextual Productivity Scoring] (Task-dependent override)
```

---

## 2. Stage Details

### Stage 1: Privacy Exclusion Filter
- Checks whether the URL matches the system's sensitive domain library (`libraries/privacy/sensitive_domains.json`: banking, healthcare, adult, credentials) or the user's manual exclusion list.
- **Action**: Tracking is immediately halted. No session record is written to IndexedDB. Decision trace marks `isExcluded: true`.

### Stage 2: Exact User Rules
- Evaluates rules created by the user where `condition.domain_exact` exactly matches the normalized host.
- **Priority**: Always assigned high priority (`priority >= 100`).
- **Action**: Returns user-configured category, activity, and productivity rating directly, bypassing ML model evaluation.

### Stage 3: High-Priority Pattern Rules
- Evaluates rules matching path prefixes (`path_prefix`) or domain wildcards (`*.example.com`).
- Evaluated in descending order of `priority`.
- Allows granular overrides (e.g. `youtube.com/watch` vs `youtube.com/music`).

### Stage 4: Curated Domain Knowledge Base
- Pre-compiled dictionary lookup in `libraries/domains/domains.json`.
- Contains curated mappings for common developer tools, educational sites, documentation hubs, news outlets, and entertainment networks.
- **Latency**: Under 0.04 ms.
- If confidence $\ge 0.85$, assigns default category, activity, and baseline productivity.

### Stage 5: fastText WebAssembly ML Model
- Triggered when no prior deterministic rule matches.
- Evaluates composite feature text using the quantized fastText model (`atentiv-page-category.ftz`).
- Returns probability distribution across 11 web categories: `Computers`, `Education`, `Entertainment`, `News`, `Chat`, `Shop`, `Government`, `Health`, `Travel`, `Sports`, `Adult`.
- Emits decision trace including top probabilities and classification confidence.

### Stage 6: Activity Taxonomy Rule
- Maps the predicted category and domain tokens into one of 9 controlled activity classes:
  1. `Coding & Development`
  2. `Research & Reading`
  3. `Learning & Education`
  4. `Communication & Messaging`
  5. `Entertainment & Media`
  6. `Social & Community`
  7. `Commerce & Shopping`
  8. `Administration & Utilities`
  9. `General Browsing`

### Stage 7: Contextual Productivity Scoring
- Productivity cannot be purely static: watching a tutorial on YouTube is productive for learning, while watching entertainment clips is distracting.
- Combines the classified activity, user intention, and active workstream to categorize the session into:
  - `productive`: Directly supports active focus intention or professional/educational tasks.
  - `neutral`: Utility, administration, or communication tasks.
  - `distracting`: Passive media consumption or unrelated browsing.
