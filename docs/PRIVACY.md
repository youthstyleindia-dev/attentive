# Atentiv Privacy Specification & Guarantees

This document specifies the privacy engineering guarantees, local data residency policies, credential scrubbing mechanisms, and data minimization practices enforced in Atentiv.

---

## 1. Zero Cloud Network Transmission Guarantee

Atentiv operates under an absolute zero-cloud architecture:
- **No Cloud Inference APIs**: Zero requests to OpenAI, Anthropic, Google Gemini, or remote inference gateways.
- **No Remote Telemetry or Tracking**: No Google Analytics, PostHog, Mixpanel, Sentry, or third-party error trackers.
- **No Remote Database**: No Supabase, Firebase, AWS RDS, or server sync.
- **Offline WebAssembly Inference**: The ML model (`atentiv-page-category.ftz`) and WebAssembly binary (`fastText.common.wasm`) run 100% offline within the extension's execution context.

---

## 2. In-Memory URL & Content Scrubbing

Before any URL or webpage text is processed or stored:
1. **Query String Eradication**: All query parameters (`?access_token=...`, `?client_secret=...`, `?code=...`, `?session=...`, `?utm_source=...`) are completely discarded via URL object normalization.
2. **Hash & Fragment Eradication**: Hash fragments (`#id_token=...`) are stripped.
3. **Basic Authentication Stripping**: Embedded usernames and passwords (`user:pass@host`) are eliminated.
4. **Internal Browser Protocols**: URLs matching `chrome://`, `chrome-extension://`, `about:`, `file://`, and `data:` return `null` and are immediately excluded from tracking and database records.

---

## 3. Sensitive Domain Exclusion Filter (`libraries/privacy/sensitive_domains.json`)

Atentiv pre-configures a deterministic exclusion list for sensitive domains where tracking must never occur:
- **Financial & Banking**: Online banking, payment processors, tax portals (e.g. `chase.com`, `bankofamerica.com`, `paypal.com`).
- **Healthcare & Medical**: Telehealth, patient portals, medical records (e.g. `mychart.com`, `teladoc.com`).
- **Authentication & Secrets**: Password managers, 2FA portals (e.g. `1password.com`, `bitwarden.com`, `lastpass.com`).
- **Adult & Private**: Regulated adult platforms and private communication portals.

When a tab navigates to any sensitive domain or user-specified exclusion:
- Tracking is immediately skipped.
- No session, visit, or metric entry is written to IndexedDB.
- An excluded decision trace is emitted locally (`isExcluded: true`).

---

## 4. Default Opt-In & User Sovereignty

1. **Opt-In by Default**: Upon installation, tracking is paused (`enabled: false`) until the user explicitly clicks "Enable tracking".
2. **Instant Pause**: Users can pause tracking at any moment from the popup or settings panel.
3. **User-Configurable Exclusions**: Users can append arbitrary domains or subdomains to the exclusion list at any time.

---

## 5. Local Data Export and One-Click Permanent Wipe

1. **Complete Local JSON Export**:
   Users can export their complete analytical history (`tab_sessions`, `activities`, `workstreams`, `snapshots`, `rules`, `decision_traces`) into an offline JSON file for personal backup or migration.
2. **One-Click Permanent Deletion**:
   Clicking "Delete data" triggers a full purge:
   - Wipes all 13 object stores in `AtentivDB` IndexedDB.
   - Clears `chrome.storage.session` active checkpoints.
   - Resets `atentiv_settings` and pauses tracking.
   - Zero remnants remain on the device.
