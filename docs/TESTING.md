# Validation

Validated September 23, 2026.

- TypeScript check and production build: passed.
- Six automated tests: passed (URL sanitization, exclusions, classification, bounded/range-clipped scoring, empty data, and mocked worker lifecycle covering opt-in, transitions, idle gaps, saved contexts, restore and deletion).
- Real Manifest V3 extension loaded in isolated Playwright Chromium: passed.
- Browser checks: demo separation, rules dialog, tracking toggle, actual foreground activity capture, sanitized saved tab URL, focus-session start, deletion, and 390px responsive layout: passed.
- Browser console: no page errors during checked flows.
- Desktop dashboard screenshot visually reviewed.

Reproduce:

```sh
npm ci
npm run build
npm test
npx playwright install chromium
npm run test:browser
```

Browser checks create a temporary isolated profile and delete it after the run. The web page used for tracking is fulfilled locally by the test and does not require logging in. The screenshot is written to ../dashboard-preview.png.

Not evaluated: a long-running human field study, performance at retention capacity, every operating-system sleep scenario, Chrome Web Store review, Edge-specific behavior, or the scientific validity of the score. Edge compatibility is based on Chromium APIs rather than a separate Edge test run.
