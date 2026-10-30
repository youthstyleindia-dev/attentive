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
import { SnapshotRepository } from "../../src/db/repositories/snapshotRepository";
import { RetentionManager } from "../../src/db/retentionManager";
import { DatabaseWriteBuffer } from "../../src/db/writeBuffer";

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
  assert.equal(
    activeRules[0].rule_id,
    "rule-2",
    "Higher priority rule should be first",
  );
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

test("Database: Snapshot repository CRUD, workstream grouping, and export", async () => {
  await db.snapshots.clear();

  const snap1 = await SnapshotRepository.save({
    title: "Machine Learning Research",
    workstream_id: "ws-ml",
    saved_tabs: [
      { url: "https://arxiv.org/abs/2301.0001", title: "ML Paper 1" },
      {
        url: "https://colab.research.google.com/drive/123",
        title: "Colab Notebook",
      },
    ],
    timestamp: Date.now() - 5000,
  });

  const snap2 = await SnapshotRepository.save({
    title: "Web Development",
    workstream_id: "ws-web",
    saved_tabs: [
      { url: "https://react.dev", title: "React Docs" },
      { url: "https://github.com", title: "GitHub Repo" },
      { url: "https://developer.mozilla.org", title: "MDN Web Docs" },
    ],
    timestamp: Date.now(),
  });

  // Verify getById
  const fetched = await SnapshotRepository.getById(snap1.snapshot_id);
  assert.ok(fetched);
  assert.equal(fetched?.title, "Machine Learning Research");
  assert.equal(fetched?.saved_tabs.length, 2);

  // Verify listRecent (newest first)
  const recent = await SnapshotRepository.listRecent(10);
  assert.equal(recent.length, 2);
  assert.equal(
    recent[0].snapshot_id,
    snap2.snapshot_id,
    "Newest snapshot should be first",
  );

  // Verify listByWorkstream
  const mlSnapshots = await SnapshotRepository.listByWorkstream("ws-ml");
  assert.equal(mlSnapshots.length, 1);
  assert.equal(mlSnapshots[0].workstream_id, "ws-ml");

  // Verify update
  const updated = await SnapshotRepository.update(snap1.snapshot_id, {
    title: "Updated ML Research Session",
  });
  assert.equal(updated?.title, "Updated ML Research Session");
  const checkUpdated = await SnapshotRepository.getById(snap1.snapshot_id);
  assert.equal(checkUpdated?.title, "Updated ML Research Session");

  // Verify exportAll
  const exported = await SnapshotRepository.exportAll();
  assert.equal(exported.length, 2);

  // Verify delete
  const deleted = await SnapshotRepository.delete(snap1.snapshot_id);
  assert.equal(deleted, true);
  const remaining = await SnapshotRepository.listRecent(10);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].snapshot_id, snap2.snapshot_id);
});

test("Database: Automated 30-Day Activity Retention Pruning across multiple tables", async () => {
  // Clear temporal tables
  await db.tab_sessions.clear();
  await db.activities.clear();
  await db.workstream_events.clear();
  await db.decision_traces.clear();
  await db.browser_events.clear();
  await db.activity_segments.clear();
  await db.tab_switch_events.clear();
  await db.feature_snapshots.clear();

  const now = Date.now();
  const dayMs = 86400000;
  const oldTime = now - 35 * dayMs; // 35 days ago (expired under 30d retention)
  const recentTime = now - 2 * dayMs; // 2 days ago (active, preserved)

  // 1. Seed expired records
  await db.tab_sessions.bulkAdd([
    {
      session_id: "sess-old-1",
      tab_id: 1,
      window_id: 1,
      url: "https://old-site.com",
      domain: "old-site.com",
      title: "Old Site",
      start_time: oldTime,
      end_time: oldTime + 60000,
      dwell_time: 60000,
      active_time: 60000,
      idle_time: 0,
      category: "News",
      activity_type: "Reading",
      productivity_type: "neutral",
      productivity_score: 50,
      workstream_id: "ws-old",
      workstream_name: "Old Workstream",
      classification_confidence: 1.0,
      classification_latency_ms: 0,
      model_version: "1.0.0",
      created_at: oldTime,
    },
    {
      session_id: "sess-new-1",
      tab_id: 2,
      window_id: 1,
      url: "https://recent-site.com",
      domain: "recent-site.com",
      title: "Recent Site",
      start_time: recentTime,
      end_time: recentTime + 60000,
      dwell_time: 60000,
      active_time: 60000,
      idle_time: 0,
      category: "Technology",
      activity_type: "Coding",
      productivity_type: "productive",
      productivity_score: 95,
      workstream_id: "ws-new",
      workstream_name: "Active Dev",
      classification_confidence: 1.0,
      classification_latency_ms: 0,
      model_version: "1.0.0",
      created_at: recentTime,
    },
  ]);

  await db.activities.bulkAdd([
    {
      activity_id: "act-old-1",
      session_id: "sess-old-1",
      category: "News",
      activity_type: "Reading",
      productivity_type: "neutral",
      productivity_score: 50,
      confidence: 1.0,
      evidence_summary: "Old news reading",
      created_at: oldTime,
    },
    {
      activity_id: "act-new-1",
      session_id: "sess-new-1",
      category: "Technology",
      activity_type: "Coding",
      productivity_type: "productive",
      productivity_score: 95,
      confidence: 1.0,
      evidence_summary: "Recent active coding",
      created_at: recentTime,
    },
  ]);

  await db.workstream_events.bulkAdd([
    {
      workstream_id: "ws-old",
      session_id: "sess-old-1",
      entered_at: oldTime,
      exited_at: oldTime + 60000,
      duration: 60000,
      previous_workstream_id: null,
      switch_penalty: 0,
    },
    {
      workstream_id: "ws-new",
      session_id: "sess-new-1",
      entered_at: recentTime,
      exited_at: recentTime + 60000,
      duration: 60000,
      previous_workstream_id: null,
      switch_penalty: 0,
    },
  ]);

  await db.decision_traces.bulkAdd([
    {
      decision_id: "trace-old-1",
      session_id: "sess-old-1",
      timestamp: oldTime,
      rule_matches: [],
      domain_match: null,
      keyword_matches: [],
      model_predictions: [],
      model_confidence: 0.9,
      selected_activity: "Reading",
      selected_productivity: "neutral",
      selected_workstream: "ws-old",
      workstream_scores: {},
      final_reason: ["Old decision"],
      model_version: "1.0.0",
      feature_schema_version: "1.0.0",
      total_latency_ms: 1,
    },
    {
      decision_id: "trace-new-1",
      session_id: "sess-new-1",
      timestamp: recentTime,
      rule_matches: [],
      domain_match: null,
      keyword_matches: [],
      model_predictions: [],
      model_confidence: 0.95,
      selected_activity: "Coding",
      selected_productivity: "productive",
      selected_workstream: "ws-new",
      workstream_scores: {},
      final_reason: ["Recent decision"],
      model_version: "1.0.0",
      feature_schema_version: "1.0.0",
      total_latency_ms: 1,
    },
  ]);

  // Check stats before pruning
  const statsBefore = await RetentionManager.getRetentionStats();
  assert.equal(statsBefore.totalSessions, 2);
  assert.equal(statsBefore.totalActivities, 2);
  assert.equal(statsBefore.totalWorkstreamEvents, 2);
  assert.equal(statsBefore.totalTraces, 2);
  assert.equal(statsBefore.oldestRecordTimestamp, oldTime);

  // Test zero-pruning when retentionDays = 0 (keep forever)
  const foreverResult = await RetentionManager.pruneExpired(0);
  assert.equal(
    foreverResult.totalPruned,
    0,
    "Retention period 0 should prune nothing",
  );
  assert.equal(await db.tab_sessions.count(), 2);

  // Execute standard 30-day pruning
  const pruneResult = await RetentionManager.pruneExpired(30);
  assert.equal(pruneResult.success, true);
  assert.equal(pruneResult.prunedSessions, 1);
  assert.equal(pruneResult.prunedActivities, 1);
  assert.equal(pruneResult.prunedWorkstreamEvents, 1);
  assert.equal(pruneResult.prunedTraces, 1);
  assert.equal(pruneResult.totalPruned, 4);

  // Verify only recent records remain
  const remainingSessions = await db.tab_sessions.toArray();
  assert.equal(remainingSessions.length, 1);
  assert.equal(remainingSessions[0].session_id, "sess-new-1");

  const remainingTraces = await db.decision_traces.toArray();
  assert.equal(remainingTraces.length, 1);
  assert.equal(remainingTraces[0].decision_id, "trace-new-1");

  // Verify stats reflect pruning
  const statsAfter = await RetentionManager.getRetentionStats();
  assert.equal(statsAfter.totalSessions, 1);
  assert.equal(statsAfter.oldestRecordTimestamp, recentTime);
});

test("Database: Resilient WriteBuffer queue, retry, and flush mechanics", async () => {
  DatabaseWriteBuffer.clear();

  // 1. Direct write through write buffer succeeds on valid table
  const success = await DatabaseWriteBuffer.executeWithRetry(
    "tab_sessions",
    "put",
    {
      session_id: "sess-buf-1",
      tab_id: 10,
      window_id: 1,
      url: "https://buffer-test.org",
      domain: "buffer-test.org",
      title: "Buffer Test",
      start_time: Date.now(),
      end_time: Date.now(),
      dwell_time: 1000,
      active_time: 1000,
      idle_time: 0,
      category: "Technology",
      activity_type: "Testing",
      productivity_type: "productive",
      productivity_score: 80,
      workstream_id: "ws-test",
      workstream_name: "Testing",
      classification_confidence: 1.0,
      classification_latency_ms: 0,
      model_version: "1.0.0",
      created_at: Date.now(),
    },
  );
  assert.equal(success, true);
  const found = await db.tab_sessions.get("sess-buf-1");
  assert.ok(found);

  // 2. Buffer inspection
  const status = DatabaseWriteBuffer.getBufferStatus();
  assert.ok(status.totalFlushed >= 1);
  assert.equal(status.queueLength, 0);

  // 3. Clear buffer resets state
  DatabaseWriteBuffer.clear();
  assert.equal(DatabaseWriteBuffer.getBufferStatus().queueLength, 0);
});

test("Database: Scalability compound queries, pagination, and bulk inserts", async () => {
  await db.tab_sessions.clear();
  const baseTime = Date.now() - 100000;

  // Bulk create 20 test sessions across two workstreams
  const batchSessions = Array.from({ length: 20 }, (_, i) => ({
    session_id: `batch-${i}`,
    tab_id: i + 1,
    window_id: 1,
    url: `https://domain-${i % 4}.com/page`,
    domain: `domain-${i % 4}.com`,
    title: `Session ${i}`,
    start_time: baseTime + i * 1000,
    end_time: baseTime + i * 1000 + 500,
    dwell_time: 500,
    active_time: 500,
    idle_time: 0,
    category: "Technology",
    activity_type: "Browsing",
    productivity_type: (i % 2 === 0 ? "productive" : "neutral") as any,
    productivity_score: 70,
    workstream_id: i % 2 === 0 ? "ws-even" : "ws-odd",
    workstream_name: i % 2 === 0 ? "Even Workstream" : "Odd Workstream",
    classification_confidence: 1.0,
    classification_latency_ms: 0,
    model_version: "1.0.0",
    created_at: baseTime + i * 1000,
  }));

  await SessionRepository.bulkCreate(batchSessions);
  const totalCount = await SessionRepository.countTotal();
  assert.equal(totalCount, 20);

  // Paged range query: Page 1 (offset 0, limit 5)
  const page1 = await SessionRepository.getRangePaged(
    baseTime - 1000,
    baseTime + 25000,
    0,
    5,
  );
  assert.equal(page1.total, 20);
  assert.equal(page1.sessions.length, 5);
  assert.equal(page1.sessions[0].session_id, "batch-0");

  // Page 2 (offset 5, limit 5)
  const page2 = await SessionRepository.getRangePaged(
    baseTime - 1000,
    baseTime + 25000,
    5,
    5,
  );
  assert.equal(page2.sessions.length, 5);
  assert.equal(page2.sessions[0].session_id, "batch-5");

  // Compound query: getByWorkstreamRange
  const evenSessions = await SessionRepository.getByWorkstreamRange(
    "ws-even",
    baseTime,
    baseTime + 20000,
  );
  assert.equal(evenSessions.length, 10);
  assert.ok(evenSessions.every((s) => s.workstream_id === "ws-even"));

  // Compound query: getByDomainRange
  const domain0Sessions = await SessionRepository.getByDomainRange(
    "domain-0.com",
    baseTime,
    baseTime + 20000,
  );
  assert.equal(domain0Sessions.length, 5);
  assert.ok(domain0Sessions.every((s) => s.domain === "domain-0.com"));

  // Delete test
  await SessionRepository.delete("batch-0");
  assert.equal(await SessionRepository.countTotal(), 19);
});
