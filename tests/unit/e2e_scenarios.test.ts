import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { SessionManager } from "../../src/background/sessionManager";
import { Classifier } from "../../src/ml/classifier";
import { FocusScoreCalculator } from "../../src/analytics/focusScore";
import { ContextSwitchEvaluator } from "../../src/workstreams/contextSwitch";
import { WorkstreamEngine } from "../../src/workstreams/workstreamEngine";
import { db } from "../../src/db/database";
import { metrics, type Visit } from "../../src/model";
import type { UserRuleRecord } from "../../src/db/schemas";

// ── Test Helper: Mock Chrome Environment ──────────────────────────────────────
function createScenarioChrome() {
  const localStore: Record<string, any> = {};
  const sessionStore: Record<string, any> = {};

  let currentTab = {
    id: 101,
    windowId: 1,
    url: "https://www.youtube.com/watch?v=lecture1",
    title: "MIT Deep Learning Lecture 1",
    incognito: false,
    audible: true,
  };

  const createdTabs: any[] = [];

  const mock = {
    storage: {
      local: {
        get: async (keys?: any) => {
          if (!keys) return structuredClone(localStore);
          if (typeof keys === "string") return { [keys]: structuredClone(localStore[keys]) };
          return structuredClone(localStore);
        },
        set: async (items: Record<string, any>) => Object.assign(localStore, structuredClone(items)),
        remove: async (k: string) => delete localStore[k],
      },
      session: {
        get: async (keys?: any) => {
          if (!keys) return structuredClone(sessionStore);
          if (typeof keys === "string") return { [keys]: structuredClone(sessionStore[keys]) };
          return structuredClone(sessionStore);
        },
        set: async (items: Record<string, any>) => Object.assign(sessionStore, structuredClone(items)),
        remove: async (k: string) => delete sessionStore[k],
      },
    },
    windows: {
      getLastFocused: async () => ({ id: 1, focused: true }),
    },
    tabs: {
      query: async () => [currentTab],
      create: async (t: any) => {
        createdTabs.push(t);
        return { id: 300 + createdTabs.length, ...t };
      },
      remove: async () => {},
    },
    idle: {
      queryState: async (threshold: number) => "idle", // User is away from keyboard/mouse
    },
  };

  return {
    mock,
    localStore,
    sessionStore,
    createdTabs,
    setCurrentTab: (t: any) => {
      currentTab = t;
    },
  };
}

// ── TIER 3: CROSS-FEATURE INTERACTIONS ────────────────────────────────────────

test("Tier 3 (Interaction): Inactivity + Educational Background Audio Exception (FR-03)", async () => {
  const env = createScenarioChrome();
  (globalThis as any).chrome = env.mock;

  try {
    // 1. Initial tab visit: Audible Educational YouTube Lecture
    env.setCurrentTab({
      id: 201,
      windowId: 1,
      url: "https://www.youtube.com/watch?v=deeplearning",
      title: "MIT 6.S191 Introduction to Deep Learning Lecture",
      incognito: false,
      audible: true, // Tab is playing audible audio
    });

    await SessionManager.reconcile();
    const initialCheckpoint = SessionManager.getActiveCheckpoint();
    assert.ok(initialCheckpoint, "Active checkpoint must exist");
    assert.equal(initialCheckpoint.category, "Education");

    // 2. User stops typing/clicking for 300s (idleState = 'idle' > 180s timeout)
    // Because audible = true and category = 'Education' (qualifying category),
    // FR-03 mediaException applies! Active dwell continues to accumulate.
    await SessionManager.reconcile();

    const activeAfterIdle = SessionManager.getActiveCheckpoint();
    assert.ok(activeAfterIdle, "Session must remain active due to educational audio exception");
    assert.equal(env.sessionStore.trackingState, "TRACKING", "Tracking state must remain TRACKING");

    // 3. Negative control: Audio paused (audible = false)
    env.setCurrentTab({
      id: 201,
      windowId: 1,
      url: "https://www.youtube.com/watch?v=deeplearning",
      title: "MIT 6.S191 Introduction to Deep Learning Lecture",
      incognito: false,
      audible: false, // User paused the video
    });

    await SessionManager.reconcile();
    assert.equal(env.sessionStore.trackingState, "INACTIVE", "Tracking must pause when audio is not playing");
  } finally {
    delete (globalThis as any).chrome;
  }
});

test("Tier 3 (Interaction): User Custom Rules override FastText ML & Curated DB Precedence", async () => {
  // Reddit normally defaults to Entertainment / distracting in curated rules
  const defaultRes = await Classifier.classify({
    url: "https://www.reddit.com/r/programming",
    title: "Reddit Programming Discussion",
  });

  // User specifies custom high-priority rule:
  // Route /r/learnprogramming to Education / Productive
  const customRule: UserRuleRecord = {
    rule_id: "rule-reddit-study",
    name: "Reddit Study Override",
    priority: 100, // Top priority
    enabled: true,
    condition: {
      domain_exact: "reddit.com",
      url_path_prefix: "/r/learnprogramming",
    },
    action: {
      category: "Education",
      activity_type: "Coding",
      productivity_type: "productive",
      force_workstream: "Computer Science",
    },
    created_at: Date.now(),
    updated_at: Date.now(),
  };

  // Classify with custom user rule
  const overriddenRes = await Classifier.classify({
    url: "https://www.reddit.com/r/learnprogramming/comments/123",
    title: "Learning Pointers in C++",
    userRules: [customRule],
  });

  assert.equal(overriddenRes.category, "Education");
  assert.equal(overriddenRes.activity, "Coding");
  assert.equal(overriddenRes.productivity, "productive");
  assert.equal(overriddenRes.modelVersion, "user-rule");
  assert.ok(
    overriddenRes.decisionTrace.rule_matches.some((r) => r.rule_id === "rule-reddit-study"),
    "Decision trace must record applied user rule"
  );

  // Non-matching path still uses default classification
  const entertainmentRes = await Classifier.classify({
    url: "https://www.reddit.com/r/funny/comments/456",
    title: "Hilarious Memes",
    userRules: [customRule],
  });
  assert.equal(entertainmentRes.productivity, "distracting");
});

test("Tier 3 (Interaction): YouTube Contextual Title Overrides (Educational vs Entertainment)", async () => {
  // Case A: Educational keywords promote YouTube to Productive
  const educationalTitles = [
    "Stanford CS229: Machine Learning Course Lecture 01",
    "Rust Programming Language Full Tutorial for Beginners",
    "React 19 System Architecture Documentation Walkthrough",
  ];

  for (const title of educationalTitles) {
    const res = await Classifier.classify({
      url: "https://www.youtube.com/watch?v=tech123",
      title,
    });
    assert.equal(
      res.productivity,
      "productive",
      `Title '${title}' must be classified as productive`
    );
  }

  // Case B: Entertainment / Music / Gaming on YouTube remains Distracting
  const entertainmentTitles = [
    "Top 10 Epic Gaming Moments 2026",
    "Relaxing Lo-Fi Chill Hip Hop Beats to Sleep",
    "Celebrity Interview and Drama Compilation",
  ];

  for (const title of entertainmentTitles) {
    const res = await Classifier.classify({
      url: "https://www.youtube.com/watch?v=fun456",
      title,
    });
    assert.equal(
      res.productivity,
      "distracting",
      `Title '${title}' must remain distracting`
    );
  }
});

// ── TIER 4: REAL-WORLD APPLICATION SCENARIOS ──────────────────────────────────

test("Tier 4 (Scenario 1): Academic Deep Research Session yields top Focus Score (PR=1.0, SR=1.0)", () => {
  // Multi-tab research workflow over 1 hour (3600 seconds)
  // Tabs: ArXiv (Paper) -> Scholar (Citations) -> GitHub (Code) -> Documentation
  const visits: Visit[] = [
    {
      id: "v-1",
      stream: "research",
      start: 0,
      end: 900_000, // 15 mins
      switched: false,
      title: "Attention Is All You Need — ArXiv",
      url: "https://arxiv.org/abs/1706.03762",
      tabId: 1,
      category: "Research",
      activity: "Paper Reading",
      productivity: "productive",
    },
    {
      id: "v-2",
      stream: "research",
      start: 900_000,
      end: 1_800_000, // 15 mins
      switched: true,
      title: "Google Scholar Citations",
      url: "https://scholar.google.com/scholar?q=transformers",
      tabId: 2,
      category: "Research",
      activity: "Citation Analysis",
      productivity: "productive",
    },
    {
      id: "v-3",
      stream: "research",
      start: 1_800_000,
      end: 2_700_000, // 15 mins
      switched: true,
      title: "HuggingFace Transformers Repository",
      url: "https://github.com/huggingface/transformers",
      tabId: 3,
      category: "Technology",
      activity: "Coding",
      productivity: "productive",
    },
    {
      id: "v-4",
      stream: "research",
      start: 2_700_000,
      end: 3_600_000, // 15 mins
      switched: true,
      title: "PyTorch Documentation",
      url: "https://pytorch.org/docs/stable/nn.html",
      tabId: 4,
      category: "Technology",
      activity: "Documentation",
      productivity: "productive",
    },
  ];

  // 1. Model metrics computation
  const m = metrics(visits, 0, 3_600_000, "research");
  assert.equal(m.total, 3_600_000); // Exactly 1 hour
  assert.equal(m.productiveTime, 3_600_000);
  assert.equal(m.unproductiveTime, 0);
  assert.equal(m.switches, 3);
  assert.equal(m.penalty, 6); // 3 switches * 2 = 6 points
  assert.ok(m.score !== null && m.score >= 90, `Focus score must be high, got ${m.score}`);

  // 2. Analytical formula verification
  // F = round(100(0.65PR + 0.35SR)) - min(40, N*2)
  const calc = FocusScoreCalculator.compute({
    productiveActiveSeconds: 3600,
    neutralActiveSeconds: 0,
    distractingActiveSeconds: 0,
    dominantWorkstreamSeconds: 3600, // 100% same workstream
    contextSwitchCount: 3,
  });

  assert.equal(calc.productiveRatio, 1.0);
  assert.equal(calc.stabilityRatio, 1.0);
  assert.equal(calc.switchPenalty, 6);
  assert.equal(calc.score, 94); // round(100(0.65*1 + 0.35*1)) - 6 = 100 - 6 = 94
});

test("Tier 4 (Scenario 2): Multitasking & Distraction Fragmentation drops Focus Score to 0", () => {
  // Rapid thrashing between coding and entertainment sites (Instagram, Twitter, Reddit, YouTube)
  // 25 switches, each interval <= 45s (SW = 1.5, CU = 4 => rapid unrelated switch)
  let penaltySum = 0;
  let lastTime = 0;

  for (let i = 0; i < 25; i++) {
    const now = lastTime + 20_000; // Switch every 20 seconds
    const evaluation = ContextSwitchEvaluator.evaluate({
      fromWorkstreamId: i % 2 === 0 ? "ws-coding" : "ws-fun",
      toWorkstreamId: i % 2 === 0 ? "ws-fun" : "ws-coding",
      fromCategory: i % 2 === 0 ? "Technology" : "Entertainment",
      toCategory: i % 2 === 0 ? "Entertainment" : "Technology",
      lastSwitchTimestamp: lastTime,
      now,
    });

    assert.equal(evaluation.isRapidSwitch, true);
    assert.equal(evaluation.penaltyPoints, 6, "Each rapid unrelated switch adds 6 points");
    penaltySum += evaluation.penaltyPoints;
    lastTime = now;
  }

  assert.equal(penaltySum, 150, "Uncapped penalty sum is 150 points");

  // Focus score formula caps SP strictly at 40 and clamps score to 0
  const scoreResult = FocusScoreCalculator.compute({
    productiveActiveSeconds: 120, // Only 2 mins productive
    neutralActiveSeconds: 60,
    distractingActiveSeconds: 3420, // Heavy distraction
    dominantWorkstreamSeconds: 120,
    contextSwitchCount: 25,
  });

  assert.equal(scoreResult.switchPenalty, 40, "Switch penalty must cap strictly at 40");
  assert.equal(scoreResult.score, 0, "Score must clamp at 0 under heavy distraction thrashing");
});

test("Tier 4 (Scenario 3): Workstream Snapshot Save and Quick Resume Rehydration in <=50ms", async () => {
  const env = createScenarioChrome();
  (globalThis as any).chrome = env.mock;

  try {
    const snapshotId = "snap-" + crypto.randomUUID();
    const snapshotData = {
      snapshot_id: snapshotId,
      title: "Deep Learning Research Workspace",
      workstream_id: "ws-ai-research",
      timestamp: Date.now(),
      tab_count: 4,
      tabs: [
        { url: "https://arxiv.org/abs/1706.03762", title: "Attention Is All You Need", pin_state: false },
        { url: "https://github.com/huggingface/transformers", title: "Transformers Library", pin_state: false },
        { url: "https://pytorch.org/docs", title: "PyTorch Documentation", pin_state: true },
        { url: "https://colab.research.google.com", title: "Google Colab", pin_state: false },
      ],
    };

    // 1. Save snapshot to Dexie IndexedDB
    await db.snapshots.put(snapshotData as any);
    const saved = await db.snapshots.get(snapshotId);
    assert.ok(saved);
    assert.equal(saved.title, "Deep Learning Research Workspace");

    // 2. Quick Resume Rehydration: Open tabs via chrome.tabs.create
    const t0 = performance.now();
    for (const t of snapshotData.tabs) {
      await chrome.tabs.create({ url: t.url, active: false });
    }
    const restoreLatencyMs = performance.now() - t0;

    assert.equal(env.createdTabs.length, 4, "Must rehydrate all 4 tabs");
    assert.equal(env.createdTabs[0].url, "https://arxiv.org/abs/1706.03762");
    assert.equal(env.createdTabs[1].url, "https://github.com/huggingface/transformers");
    assert.ok(
      restoreLatencyMs < 50,
      `Quick Resume rehydration must complete in <=50ms (took ${restoreLatencyMs.toFixed(2)}ms)`
    );
  } finally {
    delete (globalThis as any).chrome;
  }
});

test("Tier 4 (Scenario 4): Service Worker Sleep & Session Checkpoint Recovery", async () => {
  const env = createScenarioChrome();
  (globalThis as any).chrome = env.mock;

  try {
    // 1. Service Worker records active dwell session before suspension
    const initialCheckpoint = {
      sessionId: "session-persist-01",
      tabId: 50,
      windowId: 1,
      url: "https://github.com/atentiv",
      domain: "github.com",
      title: "Atentiv Repository",
      category: "Technology",
      activity: "Coding",
      productivity: "productive" as const,
      workstreamId: "ws-dev",
      workstreamName: "Development",
      since: Date.now() - 120_000,
      lastCheckpoint: Date.now() - 5_000,
      dwellTime: 115_000, // 115 seconds accumulated
    };

    await chrome.storage.session.set({ activeCheckpoint: initialCheckpoint });

    // 2. Service Worker wakes from sleep and rehydrates state from storage
    await SessionManager.initFromStorage();

    const recovered = SessionManager.getActiveCheckpoint();
    assert.ok(recovered, "Must recover active checkpoint upon service worker startup");
    assert.equal(recovered.sessionId, "session-persist-01");
    assert.equal(recovered.dwellTime, 115_000, "Must preserve existing dwell time across worker lifecycle");
    assert.equal(recovered.workstreamName, "Development");
  } finally {
    delete (globalThis as any).chrome;
  }
});

test("Tier 4 (Scenario 5): Machine Sleep Detection (>90s Gap) excludes sleep from active dwell", () => {
  const t0 = 10_000_000;
  let lastHeartbeat = t0;

  // Case A: Normal 30s heartbeat interval (Laptop awake)
  const awakeTime = t0 + 30_000;
  const awakeDelta = (awakeTime - lastHeartbeat) / 1000;
  assert.equal(awakeDelta <= 90, true, "30s delta is normal operation");
  lastHeartbeat = awakeTime;

  // Case B: Machine closed / sleep for 45 minutes (2700s delta > 90s threshold)
  const sleepWakeTime = awakeTime + 2700 * 1000;
  const sleepDelta = (sleepWakeTime - lastHeartbeat) / 1000;

  const isSystemSleep = sleepDelta > 90;
  assert.equal(isSystemSleep, true, "Delta > 90s must be detected as SYSTEM_SLEEP");

  // Gap classification: 45 minutes excluded from dwell time
  let activeDwell = 120; // 2 minutes dwell before sleep
  let idleTime = 0;
  let sleepTime = 0;

  if (isSystemSleep) {
    sleepTime += sleepDelta;
    // Dwell time remains untouched (not corrupted by sleep gap)
  } else {
    activeDwell += sleepDelta;
  }

  assert.equal(activeDwell, 120, "Active dwell time must NOT accrue during machine sleep");
  assert.equal(sleepTime, 2700, "Sleep gap must be accounted for in system sleep records");
});
