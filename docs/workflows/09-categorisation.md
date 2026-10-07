# Workflow 09 — Precedence-Driven Categorisation
**Authority:** Latest Atentiv SRS Revision 3.1 / Submission Version 3.0 (FR-06)

## 1. Categorisation Precedence Order
Atentiv evaluates web pages through an 8-stage deterministic pipeline:
1. **Exclusion List:** Halts tracking if matched.
2. **Explicit User Rules:** Highest priority user pattern matches.
3. **User Feedback Overrides:** Historic user corrections.
4. **Preset Curated Domain Library:** 100+ vetted domain baselines.
5. **Inference Cache:** 24-hour exact content match cache.
6. **fastText WASM Model:** Local SIMD linear classifier (16-dim embeddings).
7. **Keyword Dictionary Scoring:** Fallback taxonomy keywords.
8. **Default Fallback:** Category "Other", Productivity "Neutral" (0).
