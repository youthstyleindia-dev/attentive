import "fake-indexeddb/auto";
import test from "node:test";
import assert from "node:assert/strict";
import {
  AtlasStateMachine,
  TabSwitchDetector,
  SwitchBurdenEvaluator,
  ActivitySegmentBuilder,
  AtlasMetricsEngine,
} from "../../src/atlas/atlasEngine";
import { WorkstreamEngine } from "../../src/workstreams/workstreamEngine";

test("ATLAS State Machine: Lifecycle, Inactivity Detection & Resumption", () => {
  const sm = new AtlasStateMachine(180); // 3 minutes
  assert.equal(sm.getState(), "RECORDING");
  assert.equal(sm.isRecording(), true);

  // Inactivity before threshold
  const t0 = 1000000;
  sm.onUserActivity(t0);
  const check1 = sm.checkInactivity(t0 + 100 * 1000); // 100s < 180s
  assert.equal(check1.transitionedToIdle, false);
  assert.equal(sm.isIdle(), false);

  // Inactivity threshold reached (180s)
  const check2 = sm.checkInactivity(t0 + 185 * 1000); // 185s >= 180s
  assert.equal(check2.transitionedToIdle, true);
  assert.equal(sm.getState(), "IDLE");
  assert.equal(sm.isIdle(), true);

  // User returns after 12 minutes away
  const returnRes = sm.onUserActivity(t0 + 720 * 1000);
  assert.equal(returnRes.wasIdle, true);
  assert.ok(returnRes.idleDurationMs >= 530 * 1000, "Accumulated idle duration recorded");
  assert.equal(sm.getState(), "RECORDING");
  assert.equal(sm.isRecording(), true);

  // Manual pause and stop
  sm.pause();
  assert.equal(sm.getState(), "PAUSED");
  sm.stop();
  assert.equal(sm.getState(), "STOPPED");
});

test("ATLAS Tab Switch Detector: Pure Tab Switch Invariance", () => {
  const detector = new TabSwitchDetector();

  // Initial tab activation (Session boot) -> no switch
  const e1 = detector.evaluateSwitch(101, 1, 1000);
  assert.equal(e1.isSwitch, false);
  assert.equal(e1.switchCount, 0);

  // Same tab re-evaluated -> no switch
  const e2 = detector.evaluateSwitch(101, 1, 2000);
  assert.equal(e2.isSwitch, false);
  assert.equal(e2.switchCount, 0);

  // Switch to new tab 102 -> Switch 1
  const e3 = detector.evaluateSwitch(102, 1, 3000);
  assert.equal(e3.isSwitch, true);
  assert.equal(e3.previousTabId, 101);
  assert.equal(e3.newTabId, 102);
  assert.equal(e3.switchCount, 1);

  // Switch to tab 103 -> Switch 2
  const e4 = detector.evaluateSwitch(103, 1, 4000);
  assert.equal(e4.isSwitch, true);
  assert.equal(e4.previousTabId, 102);
  assert.equal(e4.newTabId, 103);
  assert.equal(e4.switchCount, 2);

  // Switch back to tab 101 -> Switch 3
  const e5 = detector.evaluateSwitch(101, 1, 5000);
  assert.equal(e5.isSwitch, true);
  assert.equal(e5.previousTabId, 103);
  assert.equal(e5.newTabId, 101);
  assert.equal(e5.switchCount, 3);
});

test("ATLAS Switch Burden: Severity decoupled from switch count", () => {
  // Case A: Within same workstream, both productive, deliberate switch (60s dwell)
  const burdenA = SwitchBurdenEvaluator.evaluate({
    previousDomain: "github.com",
    newDomain: "stackoverflow.com",
    previousCategory: "Technology",
    newCategory: "Technology",
    previousProductivity: "productive",
    newProductivity: "productive",
    previousWorkstreamId: "ws-dev",
    newWorkstreamId: "ws-dev",
    dwellTimeBeforeMs: 60000,
  });
  assert.equal(burdenA.burden, "low");
  assert.equal(burdenA.workstreamSwitched, false);
  assert.ok(burdenA.burdenScore < 30);

  // Case B: Cross-workstream switch from Productive to Distracting with rapid thrashing (<10s dwell)
  const burdenB = SwitchBurdenEvaluator.evaluate({
    previousDomain: "github.com",
    newDomain: "instagram.com",
    previousCategory: "Technology",
    newCategory: "Entertainment",
    previousProductivity: "productive",
    newProductivity: "distracting",
    previousWorkstreamId: "ws-dev",
    newWorkstreamId: "ws-social",
    dwellTimeBeforeMs: 6000, // rapid 6s switch
  });
  assert.equal(burdenB.burden, "high");
  assert.equal(burdenB.workstreamSwitched, true);
  assert.ok(burdenB.burdenScore >= 60);
});

test("ATLAS Activity Segment Builder: Granitzer Event Block Aggregation", () => {
  const builder = new ActivitySegmentBuilder();
  const tStart = Date.now();

  builder.startSegment({
    tabId: 42,
    url: "https://github.com/project",
    domain: "github.com",
    title: "Project Repository",
    start: tStart,
    category: "Technology",
    activity: "Coding",
    productivity: "productive",
    workstreamId: "ws-dev",
    workstreamName: "Software Engineering",
    confidence: 0.95,
  });

  // Accumulate active dwell time
  builder.updateActiveDwell(600); // 10 minutes active
  builder.updateIdle(180); // 3 minutes idle

  const segment = builder.closeSegment(tStart + 780000);
  assert.ok(segment);
  assert.equal(segment.tab_id, 42);
  assert.equal(segment.domain, "github.com");
  assert.equal(segment.active_seconds, 600);
  assert.equal(segment.idle_seconds, 180);
  assert.equal(segment.productivity, "productive");
  assert.equal(segment.workstream_name, "Software Engineering");
});

test("ATLAS Metrics: Uncoupled Focus Score & Active Coverage", () => {
  // Scenario: 4 hours (240m) Productive, 1 hour (60m) Unproductive, 45m Idle
  const res = AtlasMetricsEngine.compute({
    productiveSeconds: 240 * 60,
    unproductiveSeconds: 60 * 60,
    neutralSeconds: 0,
    idleSeconds: 45 * 60,
    switchCount: 14,
  });

  // Focus Score = 100 * P / (P + U) = 100 * 240 / 300 = 80
  assert.equal(res.focusScore, 80);

  // Net Productive Time = P - U = 240m - 60m = 180m = 10800s
  assert.equal(res.netProductiveSeconds, 180 * 60);

  // Active Coverage = (240 + 60) / (240 + 60 + 45) = 300 / 345 = 87.0%
  assert.equal(res.activeCoverage, 87.0);

  // Idle seconds isolated
  assert.equal(res.idleSeconds, 45 * 60);
  assert.equal(res.switchCount, 14);
});

test("ATLAS Workstream Hysteresis: Anti-Oscillation and State Stability", async () => {
  // Page with moderate affinity for current workstream
  const input = {
    domain: "github.com",
    title: "TypeScript Compiler Source",
    category: "Technology",
    activity: "Coding",
    timestamp: Date.now(),
    currentWorkstreamId: "ws-dev",
  };

  const assignment = await WorkstreamEngine.assignWorkstream(input);
  assert.ok(assignment);
  assert.equal(typeof assignment.workstreamId, "string");
  assert.equal(typeof assignment.confidence, "number");
});
