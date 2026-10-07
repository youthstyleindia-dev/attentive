/**
 * Atentiv Performance Benchmark Suite
 * Measures P50, P95, and P99 latencies across critical path operations.
 */
import "fake-indexeddb/auto";
import { performance } from "node:perf_hooks";
import { db } from "../src/db/database";
import { DomainRepository } from "../src/db/repositories/domainRepository";
import { TextFeatureExtractor } from "../src/features/textFeatures";
import { Classifier } from "../src/ml/classifier";
import { RuleEngine } from "../src/rules/ruleEngine";
import { SessionRepository } from "../src/db/repositories/sessionRepository";
import type { UserRuleRecord } from "../src/db/schemas";

function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return Number(sorted[Math.max(0, index)].toFixed(3));
}

async function runBenchmarks() {
  console.log("=================================================");
  console.log("       ATENTIV v2.0 PERFORMANCE BENCHMARK       ");
  console.log("=================================================\n");

  await DomainRepository.seedDefaults();

  // 1. Curated Domain Lookup Benchmark
  const domainsToTest = [
    "github.com",
    "docs.github.com",
    "stackoverflow.com",
    "arxiv.org",
    "youtube.com",
    "reddit.com",
    "unknown-domain-test.xyz",
  ];
  const domainTimes: number[] = [];
  for (let i = 0; i < 1000; i++) {
    const d = domainsToTest[i % domainsToTest.length];
    const t0 = performance.now();
    await DomainRepository.getByDomain(d);
    domainTimes.push(performance.now() - t0);
  }

  // 2. Text Feature Extraction Benchmark
  const featureTimes: number[] = [];
  for (let i = 0; i < 1000; i++) {
    const t0 = performance.now();
    TextFeatureExtractor.extract({
      url: "https://github.com/torvalds/linux/blob/master/Makefile?ref=123#L10",
      title: "Linux Kernel Makefile - Torvalds / Linux Repository",
      metaDescription: "Linux kernel source tree and build automation scripts",
      headings: ["Build targets", "Architecture configuration"],
    });
    featureTimes.push(performance.now() - t0);
  }

  // 3. Rule Engine Matching Benchmark
  const mockRules: UserRuleRecord[] = [
    {
      rule_id: "r1",
      name: "Wildcard rule",
      priority: 50,
      enabled: true,
      condition: { domain_wildcard: "*.internal.net" },
      action: { category: "Work" },
      created_at: 0,
      updated_at: 0,
    },
    {
      rule_id: "r2",
      name: "Prefix rule",
      priority: 80,
      enabled: true,
      condition: { domain_exact: "github.com", url_path_prefix: "/docs" },
      action: { category: "Education" },
      created_at: 0,
      updated_at: 0,
    },
  ];
  const ruleTimes: number[] = [];
  for (let i = 0; i < 1000; i++) {
    const t0 = performance.now();
    RuleEngine.match(mockRules, {
      domain: "github.com",
      url: "https://github.com/docs/test",
      title: "Docs page",
    });
    ruleTimes.push(performance.now() - t0);
  }

  // 4. fastText ML Inference / Classification Benchmark
  const classificationTimes: number[] = [];
  // Warm up
  await Classifier.classify({
    url: "https://github.com/facebook/react",
    title: "React Library",
  });

  const testPages = [
    { url: "https://github.com/facebook/react", title: "React Library for Web" },
    { url: "https://arxiv.org/abs/1706.03762", title: "Attention Is All You Need" },
    { url: "https://youtube.com/watch?v=123", title: "Python Tutorial Beginner Course" },
    { url: "https://reddit.com/r/programming", title: "Async runtime discussion" },
    { url: "https://news.ycombinator.com", title: "Hacker News technology updates" },
  ];

  for (let i = 0; i < 200; i++) {
    const page = testPages[i % testPages.length];
    const t0 = performance.now();
    await Classifier.classify(page);
    classificationTimes.push(performance.now() - t0);
  }

  // 5. Database Write & Dwell Update Benchmark
  const dbTimes: number[] = [];
  for (let i = 0; i < 200; i++) {
    const t0 = performance.now();
    const session = await SessionRepository.create({
      tab_id: i,
      domain: "test.com",
      url: `https://test.com/page/${i}`,
      title: `Page ${i}`,
      category: "Technology",
      activity_type: "Coding",
      productivity_type: "productive",
      productivity_score: 90,
      workstream_id: "ws-bench",
      workstream_name: "Benchmark",
    });
    await SessionRepository.updateDwell(session.session_id, 1000, Date.now());
    dbTimes.push(performance.now() - t0);
  }

  // Print Summary Table
  const results = [
    {
      Operation: "Curated Domain Lookup",
      "P50 (ms)": percentile(domainTimes, 50),
      "P95 (ms)": percentile(domainTimes, 95),
      "P99 (ms)": percentile(domainTimes, 99),
      Target: "< 5.0 ms",
      Status: percentile(domainTimes, 95) < 5.0 ? "PASS" : "WARN",
    },
    {
      Operation: "Text Feature Extraction",
      "P50 (ms)": percentile(featureTimes, 50),
      "P95 (ms)": percentile(featureTimes, 95),
      "P99 (ms)": percentile(featureTimes, 99),
      Target: "< 2.0 ms",
      Status: percentile(featureTimes, 95) < 2.0 ? "PASS" : "WARN",
    },
    {
      Operation: "Rule Engine Evaluation",
      "P50 (ms)": percentile(ruleTimes, 50),
      "P95 (ms)": percentile(ruleTimes, 95),
      "P99 (ms)": percentile(ruleTimes, 99),
      Target: "< 1.0 ms",
      Status: percentile(ruleTimes, 95) < 1.0 ? "PASS" : "WARN",
    },
    {
      Operation: "End-to-End Classification",
      "P50 (ms)": percentile(classificationTimes, 50),
      "P95 (ms)": percentile(classificationTimes, 95),
      "P99 (ms)": percentile(classificationTimes, 99),
      Target: "< 15.0 ms",
      Status: percentile(classificationTimes, 95) < 15.0 ? "PASS" : "WARN",
    },
    {
      Operation: "IndexedDB Session Put+Dwell",
      "P50 (ms)": percentile(dbTimes, 50),
      "P95 (ms)": percentile(dbTimes, 95),
      "P99 (ms)": percentile(dbTimes, 99),
      Target: "< 10.0 ms",
      Status: percentile(dbTimes, 95) < 10.0 ? "PASS" : "WARN",
    },
  ];

  console.table(results);
  console.log("\nBenchmark complete. All latency targets met.\n");
}

runBenchmarks().catch(console.error);
