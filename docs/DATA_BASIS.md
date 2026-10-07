# Scientific Data Basis & Architectural Rationale

This document provides the foundational engineering justification and scientific data basis for the architecture of **Atentiv**, explaining why the public machine learning corpus trains **Page Category** rather than direct **Productivity**.

---

## 1. The Fallacy of Global "Productivity" Datasets

Many naive productivity trackers attempt to train machine learning models directly on binary labels (`1 = Productive`, `0 = Distracting`). This approach is scientifically flawed and fails in real-world environments for fundamental reasons:

1. **Context Dependency**:
   - A video on `youtube.com` watching a calculus lecture is highly productive for a student; watching entertainment sketches is distracting.
   - Browsing `reddit.com/r/rust` is productive for a systems programmer debugging an asynchronous runtime bug; browsing general memes is distracting.
   - An ML model trained on static labels cannot know the user's role, job description, or immediate task intention.
2. **Subjectivity & User Diversity**:
   - What is core work for a social media marketing manager (Twitter, TikTok, Instagram) is distraction for a financial analyst.
   - Global datasets cannot capture personal intent without leaking invasive contextual surveillance.
3. **Severe Label Noise**:
   - Public multi-label categorization datasets (such as `tshasan/multi-label-web-categorization`) contain objective semantic categories (`Computers`, `Education`, `Entertainment`, `Health`), but zero ground truth on whether any given user at any given minute was being productive.

---

## 2. The Two-Tiered Separation of Concerns

Atentiv solves this by strictly decoupling **Objective Category Classification** from **Subjective Productivity Evaluation**:

```
+---------------------------------------------------------------------------------------------------+
| Tier 1: Objective Semantic Categorization (Public Model)                                          |
| - Dataset: tshasan/multi-label-web-categorization (49,399 rows, CC BY 4.0)                        |
| - Model: fastText Supervised OVA (Quantized .ftz, 1.80 MB, WASM)                                  |
| - Task: "What topic does this webpage discuss?" (Computers, Education, News, Entertainment)       |
| - Property: Universal, objective, cross-user semantic consensus.                                  |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
+---------------------------------------------------------------------------------------------------+
| Tier 2: Subjective Productivity & Workstream Context (Personalized On-Device)                     |
| - Mechanism: User Intention + Workstream Rules + Feedback Overrides                               |
| - Storage: Local IndexedDB (Dexie.js AtentivDB)                                                   |
| - Task: "Given my active focus goal ('Complete prototype'), is this Computers session relevant?"  |
| - Property: 100% personalized, user-controlled, completely private, zero cloud data leakage.      |
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Engineering Advantages of This Approach

1. **Robust Generalization**:
   The fastText model achieves high precision across standard web domains because semantic categorization (`Computers`, `Education`) is consistent across users and languages.
2. **Deterministic User Control**:
   By delegating productivity to the rule engine and workstream matching, the user retains complete authority:
   - When a user corrects a site (e.g. marking `youtube.com` as productive for their learning workstream), the rule engine overrides the default immediately.
   - The user never has to fight an unexplainable black-box classifier.
3. **Zero Privacy Leakage**:
   Personal goals, workstream titles, and task schedules remain strictly inside local IndexedDB on the user's hardware.
