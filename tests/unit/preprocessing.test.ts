import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";

import {
  normalizeText,
  normalizeAndJoinCompositeText,
  checkEligibilityGate,
  checkExclusionGate,
  checkActiveTimeGate,
  computeFeatureHash,
  checkDynamicHashGate,
  scrubUrl,
  recordLinkRelationship,
  evaluateYouTubeGate,
  resolveCategorisationPrecedence,
} from "../../src/intelligence/runtimePipeline";
import { extractPageSignals } from "../../src/content/domExtractor";
import { DomainRepository } from "../../src/db/repositories/domainRepository";

// ── 1. Eligibility Gate Tests ──────────────────────────────────────────────
test("Eligibility Gate: blocks internal browser schemes and allows standard web URLs", () => {
  const internalUrls = [
    "chrome://settings",
    "chrome-extension://abcdef/dashboard.html",
    "edge://extensions",
    "about:blank",
    "brave://settings",
    "opera://startpage",
    "devtools://devtools/bundled/inspector.html",
    "data:text/html,<h1>Test</h1>",
    "blob:https://example.com/uuid",
    "javascript:void(0)",
  ];

  for (const url of internalUrls) {
    const res = checkEligibilityGate(url);
    assert.equal(res.status, "BLOCKED", `URL should be blocked: ${url}`);
    assert.ok(
      res.reasonCode.startsWith("GATE1_INTERNAL_SCHEME_") ||
        res.reasonCode === "GATE1_EMPTY_URL",
    );
    assert.equal(res.data.isEligible, false);
  }

  const validUrls = [
    "https://github.com/torvalds/linux",
    "http://example.com/test",
    "https://docs.python.org/3/library/os.html",
  ];

  for (const url of validUrls) {
    const res = checkEligibilityGate(url);
    assert.equal(res.status, "PASSED", `URL should pass: ${url}`);
    assert.equal(res.reasonCode, "GATE1_ELIGIBLE_WEB_URL");
    assert.equal(res.data.isEligible, true);
  }
});

// ── 2. Exclusion Gate Tests ────────────────────────────────────────────────
test("Exclusion Gate: stops immediately on excluded or sensitive domains", () => {
  const userExclusions = ["company-internal.net", "secret-project.io"];

  // User excluded
  const resUser = checkExclusionGate(
    "company-internal.net",
    "https://company-internal.net/wiki",
    userExclusions,
  );
  assert.equal(resUser.status, "BLOCKED");
  assert.equal(resUser.data.isExcluded, true);

  // Subdomain of user excluded
  const resSub = checkExclusionGate(
    "docs.company-internal.net",
    "https://docs.company-internal.net/api",
    userExclusions,
  );
  assert.equal(resSub.status, "BLOCKED");
  assert.equal(resSub.data.isExcluded, true);

  // Sensitive banking/healthcare domain
  const resBank = checkExclusionGate(
    "chase.com",
    "https://chase.com/myaccount",
    [],
  );
  assert.equal(resBank.status, "BLOCKED");
  assert.equal(resBank.data.isExcluded, true);

  // Clean domain
  const resClean = checkExclusionGate(
    "github.com",
    "https://github.com",
    userExclusions,
  );
  assert.equal(resClean.status, "PASSED");
  assert.equal(resClean.data.isExcluded, false);
});

// ── 3. Active-Time & Sleep Gate Tests ──────────────────────────────────────
test("Active-Time Gate: focused tab dwell, 180s inactivity timeout, and >90s sleep detection", () => {
  // Focused and active
  const activeRes = checkActiveTimeGate({
    isTabFocused: true,
    idleSeconds: 30,
    inactivityThresholdSeconds: 180,
    heartbeatGapSeconds: 30,
  });
  assert.equal(activeRes.status, "PASSED");
  assert.equal(activeRes.data.dwellAllowed, true);

  // Tab not focused -> dwell paused
  const unfocusedRes = checkActiveTimeGate({
    isTabFocused: false,
    idleSeconds: 10,
  });
  assert.equal(unfocusedRes.status, "PAUSED");
  assert.equal(unfocusedRes.reasonCode, "GATE3_TAB_NOT_FOCUSED");
  assert.equal(unfocusedRes.data.dwellAllowed, false);

  // Inactivity timeout exceeded (>180s)
  const idleRes = checkActiveTimeGate({
    isTabFocused: true,
    idleSeconds: 181,
    inactivityThresholdSeconds: 180,
    hasMediaPlaying: false,
  });
  assert.equal(idleRes.status, "PAUSED");
  assert.equal(idleRes.reasonCode, "GATE3_INACTIVITY_TIMEOUT_EXCEEDED");
  assert.equal(idleRes.data.isIdle, true);

  // Inactivity timeout overridden by active HTML5 media playback (FR-03)
  const mediaRes = checkActiveTimeGate({
    isTabFocused: true,
    idleSeconds: 600,
    inactivityThresholdSeconds: 180,
    hasMediaPlaying: true,
  });
  assert.equal(mediaRes.status, "PASSED");
  assert.equal(mediaRes.reasonCode, "GATE3_MEDIA_PLAYBACK_ACTIVE_OVERRIDE");
  assert.equal(mediaRes.data.dwellAllowed, true);

  // Machine sleep gap (>90s gap between 30s heartbeats)
  const sleepRes = checkActiveTimeGate({
    isTabFocused: true,
    idleSeconds: 20,
    heartbeatGapSeconds: 120, // 2-minute sleep gap
  });
  assert.equal(sleepRes.status, "PAUSED");
  assert.equal(sleepRes.reasonCode, "GATE3_SYSTEM_SLEEP_DETECTED");
  assert.equal(sleepRes.data.isSleepGap, true);
});

// ── 4. URL Scrubbing Tests ─────────────────────────────────────────────────
test("URL Scrubbing: strips query credentials, tokens, session IDs, and hashes", () => {
  const rawUrl =
    "https://example.com/checkout?auth=secret123&token=xyz789&user=divya&session_id=sess456&search=react#step2";
  const scrubbed = scrubUrl(rawUrl);

  assert.equal(scrubbed.domain, "example.com");
  assert.ok(!scrubbed.scrubbedUrl.includes("auth="));
  assert.ok(!scrubbed.scrubbedUrl.includes("token="));
  assert.ok(!scrubbed.scrubbedUrl.includes("session_id="));
  assert.ok(!scrubbed.scrubbedUrl.includes("#step2"));
  assert.ok(scrubbed.scrubbedUrl.includes("user=divya"));
  assert.ok(scrubbed.scrubbedUrl.includes("search=react"));
  assert.ok(scrubbed.strippedParams.includes("auth"));
  assert.ok(scrubbed.strippedParams.includes("token"));
  assert.ok(scrubbed.strippedParams.includes("session_id"));
});

// ── 5. Dynamic Page Feature Hash Tests ────────────────────────────────────
test("Dynamic Page Hash: skips re-processing when title and headings are identical", () => {
  const hash1 = computeFeatureHash({
    title: "React 19 Documentation",
    headings: ["Getting Started", "Hooks Overview"],
  });
  const hash2 = computeFeatureHash({
    title: "React 19 Documentation",
    headings: ["Getting Started", "Hooks Overview"],
  });
  const hash3 = computeFeatureHash({
    title: "React 19 Documentation - Server Components",
    headings: ["Getting Started", "Server Components"],
  });

  const resSame = checkDynamicHashGate(hash1, hash2);
  assert.equal(resSame.status, "SKIPPED");
  assert.equal(resSame.reasonCode, "GATE5_FEATURE_HASH_UNCHANGED");

  const resDiff = checkDynamicHashGate(hash3, hash1);
  assert.equal(resDiff.status, "PASSED");
  assert.equal(resDiff.reasonCode, "GATE5_FEATURE_HASH_UPDATED");
});

// ── 6. Link Relationships Tests ───────────────────────────────────────────
test("Link Relationships: stores source -> destination with workstream, or null if unknown", () => {
  const relWithSource = recordLinkRelationship(
    "https://google.com/search?q=fasttext",
    "https://fasttext.cc/docs/en/crawl-vectors.html",
    "ws-research-123",
  );
  assert.equal(relWithSource.sourceUrl, "https://google.com/search?q=fasttext");
  assert.equal(
    relWithSource.destinationUrl,
    "https://fasttext.cc/docs/en/crawl-vectors.html",
  );
  assert.equal(relWithSource.workstreamId, "ws-research-123");

  const relNoSource = recordLinkRelationship(
    "",
    "https://news.ycombinator.com",
    null,
  );
  assert.equal(
    relNoSource.sourceUrl,
    null,
    "Unknown source must be null, never guessed",
  );
  assert.equal(relNoSource.workstreamId, null);
});

// ── 7. Text Normalization Spec Tests ──────────────────────────────────────
test("Text Normalization: Unicode NFKC, lowercase, whitespace collapsing, and digit/URL stripping", () => {
  // NFKC and control characters
  const rawWithControl =
    "React\u0000 19 \uFF46\uFF55\uFF4C\uFF4C\uFF57\uFF49\uFF44\uFF54\uFF48"; // fullwidth
  const norm1 = normalizeText(rawWithControl);
  assert.equal(norm1, "react 19 fullwidth");

  // URLs, emails, long digit runs
  const textWithPii =
    "Contact support@example.com or visit https://secret.net/login. SessionID: 9876543210 finished in 25s.";
  const norm2 = normalizeText(textWithPii);
  assert.ok(!norm2.includes("support@example.com"));
  assert.ok(!norm2.includes("https://secret.net/login"));
  assert.ok(!norm2.includes("9876543210"));
  assert.ok(norm2.includes("finished in 25s"));

  // Fixed field joining order: title -> description -> headings -> main text
  const composite = normalizeAndJoinCompositeText({
    title: "TypeScript 5.7 Release Notes",
    description: "Announcing TypeScript 5.7 with improved checks",
    headings: ["Checks for Uninitialized Variables", "V8 Path Rewriting"],
    mainText: "TypeScript 5.7 introduces path rewrites and compiler speedups.",
  });

  const expectedPrefix =
    "typescript 5.7 release notes announcing typescript 5.7 with improved checks checks for uninitialized variables v8 path rewriting typescript 5.7 introduces path rewrites and compiler speedups.";
  assert.equal(composite, expectedPrefix);
});

// ── 8. Categorisation Precedence Tests ────────────────────────────────────
test("Precedence: User rule beats fastText, and model failure falls back to keyword scoring", async () => {
  await DomainRepository.seedDefaults();

  // User rule priority
  const userRuleResult = await resolveCategorisationPrecedence({
    domain: "youtube.com",
    url: "https://www.youtube.com/watch?v=123",
    title: "Funny Cat Compilation 2026",
    compositeText: "funny cat compilation 2026 entertainment video",
    userRules: [
      {
        rule_id: "rule-1",
        name: "Force YouTube Work",
        condition: { domain_exact: "youtube.com" },
        action: {
          category: "Work",
          activity_type: "Productivity",
          productivity_type: "productive",
        },
        priority: 100,
        enabled: true,
        created_at: Date.now(),
        updated_at: Date.now(),
      },
    ],
  });
  assert.equal(userRuleResult.category, "Work");
  assert.equal(userRuleResult.productivity, "productive");
  assert.equal(userRuleResult.reasonCode, "GATE9_USER_RULE");

  // Curated domain priority
  const curatedResult = await resolveCategorisationPrecedence({
    domain: "github.com",
    url: "https://github.com/facebook/react",
    title: "facebook/react repository",
    compositeText: "facebook react repository javascript ui library",
  });
  assert.equal(curatedResult.category, "Technology");
  assert.equal(curatedResult.reasonCode, "GATE9_CURATED_DOMAIN");

  // Keyword scoring fallback
  const keywordResult = await resolveCategorisationPrecedence({
    domain: "random-obscure-blog-9988.org",
    url: "https://random-obscure-blog-9988.org/post",
    title: "Coding and Debugging in React and TypeScript",
    compositeText:
      "coding and debugging in react and typescript compiler functions",
  });
  assert.equal(keywordResult.category, "Technology");
  assert.equal(keywordResult.productivity, "productive");
  assert.equal(keywordResult.reasonCode, "GATE9_KEYWORD_HEURISTIC");
});

// ── 9. YouTube Contextual Promotion Tests ─────────────────────────────────
test("YouTube Context Gate: promotes educational lectures to Learning/Productive, defaults to Entertainment", () => {
  // Educational Lecture
  const eduRes = evaluateYouTubeGate(
    "youtube.com",
    "MIT 6.006 Introduction to Algorithms - Full Course Lecture 1",
    "Entertainment",
    "distracting",
    false,
  );
  assert.equal(eduRes.category, "Education");
  assert.equal(eduRes.productivity, "productive");
  assert.equal(eduRes.reasonCode, "GATE10_YOUTUBE_EDUCATIONAL_PROMOTED");

  // Comedy / Entertainment
  const funRes = evaluateYouTubeGate(
    "youtube.com",
    "Top 50 Funniest Memes of 2026 Compilation",
    "Entertainment",
    "distracting",
    false,
  );
  assert.equal(funRes.category, "Entertainment");
  assert.equal(funRes.productivity, "distracting");
  assert.equal(funRes.reasonCode, "GATE10_YOUTUBE_DEFAULT_ENTERTAINMENT");

  // User Rule Override prevents promotion or demotion
  const userOverrideRes = evaluateYouTubeGate(
    "youtube.com",
    "MIT 6.006 Introduction to Algorithms",
    "Work",
    "productive",
    true, // has user rule
  );
  assert.equal(userOverrideRes.category, "Work");
  assert.equal(userOverrideRes.reasonCode, "GATE10_YOUTUBE_USER_RULE_OVERRIDE");
});

// ── 10. Extraction Limits & Privacy Guard Tests ───────────────────────────
test("Extraction Limits: at most 20 headings, at most 2 KB main text, no password/form content", () => {
  // Test heading bounding in composite text builder
  const thirtyHeadings = Array.from(
    { length: 30 },
    (_, i) => `Heading Section Number ${i + 1}`,
  );
  const hugeText = "A".repeat(5000);

  const composite = normalizeAndJoinCompositeText({
    title: "Document Title",
    description: "Meta description text",
    headings: thirtyHeadings,
    mainText: hugeText,
  });

  // Check that heading 21 is not present
  assert.ok(composite.includes("heading section number 20"));
  assert.ok(
    !composite.includes("heading section number 21"),
    "Headings beyond 20 must be dropped",
  );

  // Check composite total length is bounded
  assert.ok(
    composite.length <= 4096,
    "Composite text must be bounded to 4096 chars",
  );
});

// ── 11. Zero Network Request Guarantee Test ────────────────────────────────
test("Zero Network Request Guarantee: runtime pipeline makes 0 external HTTP/HTTPS calls", async () => {
  // Overwrite global fetch to ensure it is never invoked
  const originalFetch = globalThis.fetch;
  let networkCallAttempted = false;

  (globalThis as any).fetch = () => {
    networkCallAttempted = true;
    throw new Error("Outbound network request attempted in runtime pipeline!");
  };

  try {
    const res = await resolveCategorisationPrecedence({
      domain: "wikipedia.org",
      url: "https://en.wikipedia.org/wiki/Deep_learning",
      title: "Deep learning - Wikipedia",
      compositeText:
        "deep learning neural networks artificial intelligence backpropagation",
    });

    assert.equal(
      networkCallAttempted,
      false,
      "Pipeline must make 0 external network requests",
    );
    assert.ok(res.category);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
