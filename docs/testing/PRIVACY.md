# Privacy Review (Static, Partial)

The manifest declares extension APIs and http/https host access, with no analytics SDK or telemetry permission visible. The model is packaged locally. Background `fetch()` loads a bundled model URL, which is expected to resolve inside the extension. This is not a complete runtime network audit.

`content.js` now requests `CHECK_PAGE_TRACKABILITY` before extraction and before HUD boot/toggle; the worker checks the HTTP(S) URL against user exclusions, built-in sensitive domains, and sensitive URL paths. It fails closed if the worker is unavailable, and an open HUD is removed when settings add an exclusion. `UPDATE_SETTINGS` now purges matching sessions, traces, related records, affected snapshots, and derived focus metrics in a Dexie transaction. A failed purge returns an explicit “data may remain” error. Chrome-level verification and audit of all message/persistence paths are still outstanding.

Do not describe the product as fully privacy-verified until a source-level review, dynamic network capture, exclusion-path tests, and stored-data inspection pass.
