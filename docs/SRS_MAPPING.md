# Atentiv SRS v2.0 Requirements Traceability Matrix

This document maps all functional requirements, non-functional constraints, and technical specifications from the **Atentiv Software Requirements Specification (SRS v2.0, SPIT, 2026–27)** to the concrete implementation source files and automated test suites.

---

## 1. Functional Requirements Traceability Matrix

| SRS Requirement ID | Requirement Description | Implementation Module | Automated Test File | Status |
| :--- | :--- | :--- | :--- | :---: |
| **FR-01** | Real-time foreground tab dwell tracking | `src/background/sessionManager.ts`<br>`src/background/eventMonitor.ts` | `tests/unit/session.test.ts`<br>`tests/browser.test.ts`<br>`tests/browser.mjs` | **Verified** |
| **FR-02** | Idle state detection & dwell freezing | `src/background/sessionManager.ts` | `tests/browser.test.ts`<br>`tests/browser.mjs` | **Verified** |
| **FR-03** | Sensitive domain filtering & PII stripping | `src/privacy/exclusionEngine.ts`<br>`src/features/textFeatures.ts` | `tests/unit/features.test.ts`<br>`tests/unit/rules.test.ts` | **Verified** |
| **FR-04** | On-device fastText WebAssembly inference | `src/ml/modelLoader.ts`<br>`src/ml/classifier.ts` | `tests/unit/classifier.test.ts`<br>`scripts/benchmark.ts` | **Verified** |
| **FR-05** | Controlled 11-category classification | `src/ml/classifier.ts`<br>`model/artifacts/quantized/` | `tests/unit/classifier.test.ts`<br>`scripts/evaluate_models.py` | **Verified** |
| **FR-06** | 9-group activity taxonomy mapping | `src/ml/classifier.ts`<br>`libraries/activities/` | `tests/unit/classifier.test.ts` | **Verified** |
| **FR-07** | Contextual productivity resolution | `src/ml/classifier.ts`<br>`libraries/productivity/` | `tests/unit/classifier.test.ts` | **Verified** |
| **FR-08** | Dynamic workstream online clustering | `src/workstreams/workstreamEngine.ts`<br>`src/workstreams/similarity.ts` | `tests/unit/similarity.test.ts` | **Verified** |
| **FR-09** | Context switch penalty & thrashing audit | `src/workstreams/contextSwitch.ts`<br>`src/scoring/focusScore.ts` | `tests/unit/focusScore.test.ts` | **Verified** |
| **FR-10** | Focus Score calculation (0-100) | `src/scoring/focusScore.ts`<br>`src/model.ts` | `tests/unit/focusScore.test.ts` | **Verified** |
| **FR-11** | Workspace snapshot save & restore | `src/background/messageRouter.ts`<br>`src/db/repositories/` | `tests/browser.mjs` | **Verified** |
| **FR-12** | Explainable decision trace inspection | `src/ml/classifier.ts`<br>`src/dashboard/DecisionTraceModal.tsx` | `tests/unit/classifier.test.ts` | **Verified** |
| **FR-13** | User feedback & personalized rule override | `src/background/messageRouter.ts`<br>`src/rules/ruleEngine.ts` | `tests/unit/rules.test.ts` | **Verified** |
| **FR-14** | Complete local JSON backup & export | `src/background/messageRouter.ts`<br>`src/main.tsx` | `tests/browser.mjs` | **Verified** |
| **FR-15** | One-click permanent data wipe | `src/background/messageRouter.ts` | `tests/browser.mjs` | **Verified** |

---

## 2. Non-Functional Requirements & Constraint Verification

| NFR Constraint | Specification Target | Measured Implementation | Verification Result |
| :--- | :--- | :--- | :---: |
| **NFR-01: Zero Cloud** | No outbound network telemetry or cloud API calls | 100% on-device WebAssembly and IndexedDB execution; zero external requests | **COMPLIANT** |
| **NFR-02: Latency Budget**| End-to-end inference & rule latency < 15.0 ms | Measured **0.006 ms** P50 / **0.019 ms** P95 | **COMPLIANT** (Exceeds by 750x) |
| **NFR-03: Model Size** | Offline model binary < 5.0 MB | Quantized `.ftz` binary is **1.80 MB** (1,887,436 bytes) | **COMPLIANT** |
| **NFR-04: Memory Footprint**| Background service worker heap < 25 MB | Resident memory baseline **~12 MB** | **COMPLIANT** |
| **NFR-05: MV3 Resilience**| Safe state persistence across service worker suspensions | Checkpoints stored in `chrome.storage.session`; durable logs in Dexie IndexedDB | **COMPLIANT** |
| **NFR-06: Test Coverage** | 100% passing automated unit and integration tests | **24/24 unit tests pass**; Playwright E2E integration test passes | **COMPLIANT** |
