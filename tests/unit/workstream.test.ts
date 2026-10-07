import { test } from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity, computeWorkstreamSimilarity } from "../../src/workstreams/similarity";
import { ContextSwitchEvaluator } from "../../src/workstreams/contextSwitch";

test("Workstream Similarity: Cosine similarity vector math", () => {
  const v1 = [1, 0, 0];
  const v2 = [1, 0, 0];
  const v3 = [0, 1, 0];

  assert.equal(Math.round(cosineSimilarity(v1, v2) * 100), 100);
  assert.equal(cosineSimilarity(v1, v3), 0.0);

  // Orthogonal / empty vectors
  assert.equal(cosineSimilarity([], []), 0.0);
  assert.equal(cosineSimilarity(undefined, [1, 2]), 0.0);
});

test("Workstream Similarity: Multi-factor similarity score", () => {
  const now = Date.now();

  // High similarity: same category, same domain, matching vector, recent activity
  const highSim = computeWorkstreamSimilarity({
    pageVector: [1, 0, 0],
    workstreamCentroid: [1, 0, 0],
    pageCategory: "Technology",
    workstreamCategory: "Technology",
    pageActivity: "Coding",
    pageDomain: "github.com",
    workstreamDomains: ["github.com", "stackoverflow.com"],
    lastActiveTimestamp: now - 30000,
    currentTimestamp: now,
  });

  // Low similarity: unrelated category, distinct domain, long time elapsed
  const lowSim = computeWorkstreamSimilarity({
    pageCategory: "Entertainment",
    workstreamCategory: "Technology",
    pageActivity: "Streaming",
    pageDomain: "netflix.com",
    workstreamDomains: ["github.com"],
    lastActiveTimestamp: now - 3600000,
    currentTimestamp: now,
  });

  assert.ok(highSim > 0.6, `High similarity should be > 0.6, got ${highSim}`);
  assert.ok(lowSim < 0.3, `Low similarity should be < 0.3, got ${lowSim}`);
});

test("Context Switch Evaluator: Switch classification and rapid switch penalties", () => {
  const now = Date.now();

  // 1. Within workstream = 0 penalty
  const within = ContextSwitchEvaluator.evaluate({
    fromWorkstreamId: "ws-1",
    toWorkstreamId: "ws-1",
    fromCategory: "Technology",
    toCategory: "Technology",
    lastSwitchTimestamp: now - 10000,
    now,
  });
  assert.equal(within.isSwitch, false);
  assert.equal(within.penaltyPoints, 0);

  // 2. Same category switch
  const sameCat = ContextSwitchEvaluator.evaluate({
    fromWorkstreamId: "ws-1",
    toWorkstreamId: "ws-2",
    fromCategory: "Technology",
    toCategory: "Technology",
    lastSwitchTimestamp: now - 100000, // not rapid
    now,
  });
  assert.equal(sameCat.isSwitch, true);
  assert.equal(sameCat.switchType, "same_category");
  assert.equal(sameCat.penaltyPoints, 1);

  // 3. Unrelated category rapid switch (e.g. Work -> Entertainment within 20s)
  const rapidUnrelated = ContextSwitchEvaluator.evaluate({
    fromWorkstreamId: "ws-work",
    toWorkstreamId: "ws-fun",
    fromCategory: "Work",
    toCategory: "Entertainment",
    lastSwitchTimestamp: now - 15000, // 15s ago = rapid switch (<= 45s)
    now,
  });
  assert.equal(rapidUnrelated.isSwitch, true);
  assert.equal(rapidUnrelated.isRapidSwitch, true);
  assert.equal(rapidUnrelated.switchType, "unrelated");
  assert.ok(rapidUnrelated.penaltyPoints >= 6, "Rapid unrelated switch should have elevated penalty");
});
