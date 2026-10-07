import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { db } from "../../src/db/database";
import { DomainRepository } from "../../src/db/repositories/domainRepository";
import { RuleRepository } from "../../src/db/repositories/ruleRepository";
import { SessionRepository } from "../../src/db/repositories/sessionRepository";
import { WorkstreamRepository } from "../../src/db/repositories/workstreamRepository";
import { TraceRepository } from "../../src/db/repositories/traceRepository";
import { MetricsRepository } from "../../src/db/repositories/metricsRepository";

test("Database: Seeding curated domains into Dexie", async () => {
  await db.domains.clear();
  const seeded = await DomainRepository.seedDefaults();
  assert.ok(seeded > 0, "Should seed default domains");

  const github = await DomainRepository.getByDomain("github.com");
  assert.ok(github, "github.com should be found");
  assert.equal(github?.category, "Technology");
  assert.equal(github?.productivity_type, "productive");

  // Check subdomain matching
  const gist = await DomainRepository.getByDomain("gist.github.com");
  assert.ok(gist, "Subdomain gist.github.com should match github.com");
  assert.equal(gist?.category, "Technology");
});

test("Database: Rule repository CRUD and priority ordering", async () => {
  await db.rules.clear();

  await RuleRepository.add({
    rule_id: "rule-1",
    name: "Low priority rule",
    enabled: true,
    priority: 10,
    condition: { domain_exact: "example.com" },
    action: { category: "News" },
  });

  await RuleRepository.add({
    rule_id: "rule-2",
    name: "High priority rule",
    enabled: true,
    priority: 90,
    condition: { domain_exact: "example.com" },
    action: { category: "Work" },
  });

  const activeRules = await RuleRepository.listActive();
  assert.equal(activeRules.length, 2);
  assert.equal(activeRules[0].rule_id, "rule-2", "Higher priority rule should be first");
});

test("Database: Session and Metrics lifecycle", async () => {
  await db.tab_sessions.clear();
  const now = Date.now();

  const session = await SessionRepository.create({
    tab_id: 1,
    window_id: 1,
    url: "https://github.com/divya/atentiv",
    domain: "github.com",
    title: "Atentiv Repository",
    category: "Technology",
    activity_type: "Coding",
    productivity_type: "productive",
    productivity_score: 90,
    workstream_id: "ws-dev",
    workstream_name: "Development",
    classification_confidence: 0.95,
    classification_latency_ms: 0.1,
    model_version: "1.0.0",
  });

  assert.ok(session.session_id);
  assert.equal(session.dwell_time, 0);

  // Update dwell
  await SessionRepository.updateDwell(session.session_id, 15000, now + 15000);
  const updated = await SessionRepository.getById(session.session_id);
  assert.equal(updated?.dwell_time, 15000);

  // Today metrics summary
  const summary = await MetricsRepository.getTodaySummary();
  assert.ok(summary.totalActiveSeconds >= 15);
});

test("Database: Workstream clustering repository", async () => {
  await db.workstreams.clear();
  const ws = await WorkstreamRepository.create({
    workstream_id: "ws-test",
    name: "AI Research",
    category: "Education",
  });

  assert.equal(ws.name, "AI Research");
  assert.equal(ws.category, "Education");

  const activeList = await WorkstreamRepository.listActive(5);
  assert.equal(activeList.length, 1);
  assert.equal(activeList[0].workstream_id, "ws-test");
});
