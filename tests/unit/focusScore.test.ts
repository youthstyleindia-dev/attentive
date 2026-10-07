import { test } from "node:test";
import assert from "node:assert/strict";
import { FocusScoreCalculator } from "../../src/analytics/focusScore";

test("Focus Score: Zero time returns baseline 0 with clear explanation", () => {
  const result = FocusScoreCalculator.compute({
    productiveActiveSeconds: 0,
    neutralActiveSeconds: 0,
    distractingActiveSeconds: 0,
    dominantWorkstreamSeconds: 0,
    contextSwitchCount: 0,
  });

  assert.equal(result.score, 0);
  assert.equal(result.displayScore, "—");
  assert.equal(result.switchPenalty, 0);
  assert.ok(result.explanation.includes("No active browsing"));
});

test("Focus Score: Pure productive focused session yields top score", () => {
  const result = FocusScoreCalculator.compute({
    productiveActiveSeconds: 3600, // 1 hour productive
    neutralActiveSeconds: 0,
    distractingActiveSeconds: 0,
    dominantWorkstreamSeconds: 3600, // 100% same workstream
    contextSwitchCount: 0, // 0 switches
  });

  assert.equal(result.score, 100);
  assert.equal(result.productiveRatio, 1.0);
  assert.equal(result.stabilityRatio, 1.0);
  assert.equal(result.switchPenalty, 0);
});

test("Focus Score: Context switch penalty is capped at 40 points", () => {
  const result = FocusScoreCalculator.compute({
    productiveActiveSeconds: 3600,
    neutralActiveSeconds: 0,
    distractingActiveSeconds: 0,
    dominantWorkstreamSeconds: 3600,
    contextSwitchCount: 50, // 50 * 2 = 100 points uncapped
  });

  assert.equal(result.switchPenalty, 40, "Switch penalty must cap at 40");
  assert.equal(result.score, 60, "100 base - 40 max penalty = 60");
});

test("Focus Score: Distracting fragmentation drops score to 0", () => {
  const result = FocusScoreCalculator.compute({
    productiveActiveSeconds: 0,
    neutralActiveSeconds: 100,
    distractingActiveSeconds: 900,
    dominantWorkstreamSeconds: 200,
    contextSwitchCount: 30,
  });

  assert.equal(result.score, 0, "Heavy distraction and switching should clamp at 0");
});
