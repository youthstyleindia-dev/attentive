import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { AtlasStateMachine } from "../../src/atlas/atlasEngine";
import { FocusScoreCalculator } from "../../src/analytics/focusScore";
import { ContextSwitchEvaluator } from "../../src/workstreams/contextSwitch";
import { metrics, type Visit } from "../../src/model";
import { FocusModeManager, type TabInfo } from "./test_helpers";

// ── TIER 2: BOUNDARY & CORNER CASES ──────────────────────────────────────────

test("Tier 2 (Boundary): Inactivity timeout threshold boundary — 179s vs 180s", () => {
  const sm = new AtlasStateMachine(180); // 180 seconds default
  const t0 = 1_000_000;
  sm.onUserActivity(t0);

  // Boundary 1: Exactly 179 seconds (179,000ms) - Below threshold
  const check179 = sm.checkInactivity(t0 + 179 * 1000);
  assert.equal(check179.transitionedToIdle, false, "Must remain active at 179s");
  assert.equal(sm.getState(), "RECORDING");
  assert.equal(sm.isIdle(), false);

  // Boundary 2: Exactly 180 seconds (180,000ms) - At threshold
  const check180 = sm.checkInactivity(t0 + 180 * 1000);
  assert.equal(check180.transitionedToIdle, true, "Must transition to IDLE at exactly 180s");
  assert.equal(sm.getState(), "IDLE");
  assert.equal(sm.isIdle(), true);

  // Boundary 3: Configurable limits — 1 min (60s) minimum and 10 min (600s) maximum
  const smMin = new AtlasStateMachine(60); // 1 minute
  smMin.onUserActivity(t0);
  assert.equal(smMin.checkInactivity(t0 + 59 * 1000).transitionedToIdle, false);
  assert.equal(smMin.checkInactivity(t0 + 60 * 1000).transitionedToIdle, true);

  const smMax = new AtlasStateMachine(600); // 10 minutes
  smMax.onUserActivity(t0);
  assert.equal(smMax.checkInactivity(t0 + 599 * 1000).transitionedToIdle, false);
  assert.equal(smMax.checkInactivity(t0 + 600 * 1000).transitionedToIdle, true);
});

test("Tier 2 (Boundary): Context Switch Penalty capping at 40 points across switch counts", () => {
  // SP = min(40, N * 2)
  const testCases = [
    { switches: 0, expectedSP: 0 },
    { switches: 1, expectedSP: 2 },
    { switches: 10, expectedSP: 20 },
    { switches: 19, expectedSP: 38 },
    { switches: 20, expectedSP: 40 }, // Exact cap boundary
    { switches: 21, expectedSP: 40 }, // Above cap boundary
    { switches: 50, expectedSP: 40 }, // Substantially above cap
    { switches: 500, expectedSP: 40 }, // Extreme stress
  ];

  for (const { switches, expectedSP } of testCases) {
    const res = FocusScoreCalculator.compute({
      productiveActiveSeconds: 3600,
      neutralActiveSeconds: 0,
      distractingActiveSeconds: 0,
      dominantWorkstreamSeconds: 3600,
      contextSwitchCount: switches,
    });

    assert.equal(
      res.switchPenalty,
      expectedSP,
      `Switch count ${switches} must produce penalty ${expectedSP}, got ${res.switchPenalty}`
    );
  }

  // Model metrics bounding
  const visitList: Visit[] = Array.from({ length: 30 }, (_, i) => ({
    id: `v-${i}`,
    stream: "dev",
    start: i * 1000,
    end: (i + 1) * 1000,
    switched: true,
    title: "Test",
    url: "https://github.com",
    tabId: i,
  }));

  const m = metrics(visitList, 0, 30000);
  assert.equal(m.penalty, 40, "Model metrics penalty must be capped at 40");
});

test("Tier 2 (Boundary): Rapid switch dwell interval boundary — 45s (SW=1.5) vs 46s (SW=1.0)", () => {
  const now = 2_000_000;

  // Unrelated categories: base penalty CU = 4
  // Interval 1: Exactly 45s ago (<= 45s => rapid switch SW = 1.5 => 4 * 1.5 = 6)
  const rapid45 = ContextSwitchEvaluator.evaluate({
    fromWorkstreamId: "ws-work",
    toWorkstreamId: "ws-entertainment",
    fromCategory: "Technology",
    toCategory: "Entertainment",
    lastSwitchTimestamp: now - 45 * 1000, // 45 seconds ago
    now,
  });

  assert.equal(rapid45.isSwitch, true);
  assert.equal(rapid45.isRapidSwitch, true, "45s must be classified as rapid switch");
  assert.equal(rapid45.penaltyPoints, 6, "Rapid unrelated switch (SW=1.5, CU=4) must equal 6 points");

  // Interval 2: 46s ago (> 45s => standard switch SW = 1.0 => 4 * 1.0 = 4)
  const standard46 = ContextSwitchEvaluator.evaluate({
    fromWorkstreamId: "ws-work",
    toWorkstreamId: "ws-entertainment",
    fromCategory: "Technology",
    toCategory: "Entertainment",
    lastSwitchTimestamp: now - 46 * 1000, // 46 seconds ago
    now,
  });

  assert.equal(standard46.isSwitch, true);
  assert.equal(standard46.isRapidSwitch, false, "46s must NOT be classified as rapid switch");
  assert.equal(standard46.penaltyPoints, 4, "Standard unrelated switch (SW=1.0, CU=4) must equal 4 points");

  // Interval 3: Same category switch CU = 1
  // 45s rapid: round(1 * 1.5) = 2
  const rapidSame = ContextSwitchEvaluator.evaluate({
    fromWorkstreamId: "ws-1",
    toWorkstreamId: "ws-2",
    fromCategory: "Technology",
    toCategory: "Technology",
    lastSwitchTimestamp: now - 30 * 1000,
    now,
  });
  assert.equal(rapidSame.isRapidSwitch, true);
  assert.equal(rapidSame.penaltyPoints, 2);

  // 46s standard: 1 * 1.0 = 1
  const standardSame = ContextSwitchEvaluator.evaluate({
    fromWorkstreamId: "ws-1",
    toWorkstreamId: "ws-2",
    fromCategory: "Technology",
    toCategory: "Technology",
    lastSwitchTimestamp: now - 60 * 1000,
    now,
  });
  assert.equal(standardSame.isRapidSwitch, false);
  assert.equal(standardSame.penaltyPoints, 1);
});

test("Tier 2 (Boundary): Zero Tracked Time (T=0) display invariants and boundary clamping", () => {
  // 1. Zero dwell time returns baseline 0 with clear explanation
  const zeroRes = FocusScoreCalculator.compute({
    productiveActiveSeconds: 0,
    neutralActiveSeconds: 0,
    distractingActiveSeconds: 0,
    dominantWorkstreamSeconds: 0,
    contextSwitchCount: 0,
  });

  assert.equal(zeroRes.score, 0);
  assert.equal(zeroRes.productiveRatio, 0);
  assert.equal(zeroRes.stabilityRatio, 0);
  assert.equal(zeroRes.switchPenalty, 0);
  assert.ok(zeroRes.explanation.includes("No active browsing"));

  // In metrics model, T=0 explicitly returns null score (displays as '—' in HUD)
  const zeroMetrics = metrics([], 0, 10000);
  assert.equal(zeroMetrics.score, null, "Zero dwell must yield null score for '—' dash display");

  // 2. Clamping at 0 (Extreme distraction and switching cannot produce negative score)
  const negativeClamped = FocusScoreCalculator.compute({
    productiveActiveSeconds: 0,
    neutralActiveSeconds: 10,
    distractingActiveSeconds: 1000,
    dominantWorkstreamSeconds: 10,
    contextSwitchCount: 100, // max 40 penalty
  });
  assert.equal(negativeClamped.score, 0, "Score must clamp at 0");

  // 3. Clamping at 100 (Cannot exceed 100)
  const topClamped = FocusScoreCalculator.compute({
    productiveActiveSeconds: 7200,
    neutralActiveSeconds: 0,
    distractingActiveSeconds: 0,
    dominantWorkstreamSeconds: 7200,
    contextSwitchCount: 0,
  });
  assert.equal(topClamped.score, 100, "Score must clamp at 100");
});

test("Tier 2 (Boundary): Max Tabs Stress — 100 open tabs partitioned and cleaned in batch", () => {
  // 1 active tab (id 1), 10 pinned tabs (ids 2..11), 89 unpinned background tabs (ids 12..100)
  const tabs: TabInfo[] = [];

  // Active tab
  tabs.push({ id: 1, windowId: 1, url: "https://active.com", title: "Active", active: true, pinned: false });

  // Pinned tabs
  for (let i = 2; i <= 11; i++) {
    tabs.push({ id: i, windowId: 1, url: `https://pinned-${i}.com`, title: `Pinned ${i}`, active: false, pinned: true });
  }

  // Unpinned background tabs
  for (let i = 12; i <= 100; i++) {
    tabs.push({ id: i, windowId: 1, url: `https://bg-${i}.com`, title: `Background ${i}`, active: false, pinned: false });
  }

  const t0 = performance.now();
  const evaluation = FocusModeManager.evaluateTabsToClose(tabs);
  const latency = performance.now() - t0;

  assert.equal(evaluation.tabsToClose.length, 89, "Must mark all 89 unpinned background tabs to close");
  assert.equal(evaluation.tabsToKeep.length, 11, "Must keep 1 active tab + 10 pinned tabs");
  assert.ok(evaluation.tabsToKeep.includes(1), "Active tab must be kept");
  assert.equal(evaluation.toastMessage, "Closed 89 background tabs");
  assert.ok(latency < 10, `Evaluation of 100 tabs must take <10ms (took ${latency.toFixed(2)}ms)`);
});
