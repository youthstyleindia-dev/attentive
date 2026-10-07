# Atentiv — Comprehensive Test Plan
**Document Version:** 1.0.0 (SRS Revision 3.1 / Submission Version 3.0 Baseline)  
**Target:** Atentiv Chrome Extension (Manifest V3)

---

## 1. Scope & Objectives
This document establishes the formal verification and validation strategy for the Atentiv cognitive productivity engine. The objective is to verify that all functional requirements (FR-01 through FR-18) and non-functional constraints (NFR-01 through NFR-06) operate deterministically, adhere strictly to local-first privacy boundaries, accumulate zero falsified metrics on restricted browser pages, and maintain data consistency across service worker lifecycle cycles.

---

## 2. Testing Levels & Strategy

### 2.1 Unit Testing (Vitest / Node Environment)
- **Mathematical Formulations:** Focus Score calculation, Context Switch Penalty (CSP) weighting, Switch Weight ($SW$), Category Unrelatedness ($CU$), centroid cosine clustering, text vectorization (TF-IDF, n-gram hashing).
- **Rule Precedence:** Domain exclusion > User custom rule > Rule-based URL matcher > FastText local classifier > Fallback heuristic.
- **Data Scrubbing:** Query parameter sanitization, basic auth stripping, hash stripping, internal URI rejection.

### 2.2 Integration Testing
- **Dexie.js / IndexedDB Repositories:** Verify atomic transactions, schema migration (v1 -> v2), compound index queries, session close integrity, snapshot serialization and deserialization.
- **Message Router:** Contract validation for all internal messages (`GET_HUD_STATE`, `GET_LIVE_STATE`, `SAVE_SNAPSHOT`, `RESTORE_SNAPSHOT`, `DELETE_ALL_DATA`, `EXPORT_DATA`).

### 2.3 System & E2E Testing (Playwright / Chromium Runner)
- **Lifecycle Events:** Tab activation, tab close, window focus changes, idle state transitions (`active` -> `idle` -> `locked`).
- **Formal UIs:** Verify rendering and data synchronization across `sidepanel.html`, `dashboard.html`, and `options.html`.
- **Restricted Protocol Guard:** Verify that navigating to `chrome://extensions` or `about:blank` triggers `UNTRACKABLE` status, yields null focus score, and prevents idle dwell leakage.

---

## 3. Test Environment & Tools
- **Runtime:** Node.js v20+, Chromium 120+ (Manifest V3 support).
- **Test Framework:** Vitest v1.3+, Playwright for browser extension integration.
- **Database Engine:** Fake-indexeddb in unit suites, native IndexedDB in Chromium.
- **Coverage Target:** Minimum 85% branch coverage across intelligence and persistence layers.
