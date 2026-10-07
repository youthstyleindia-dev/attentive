import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Classifier } from "../../src/ml/classifier";
import { TextFeatureExtractor } from "../../src/features/textFeatures";
import { DomainRepository } from "../../src/db/repositories/domainRepository";

test("Feature Extractor: URL, Title, and Meta text normalization", () => {
  const result = TextFeatureExtractor.extract({
    url: "https://github.com/torvalds/linux/blob/master/Makefile?ref=123#L10",
    title: "Linux Kernel Makefile - Torvalds / Linux Repository",
    metaDescription: "Linux kernel source tree and build automation scripts",
    headings: ["Build targets", "Architecture configuration"],
  });

  assert.equal(result.cleanDomain, "github.com");
  assert.equal(result.sanitizedUrl, "https://github.com/torvalds/linux/blob/master/Makefile");
  assert.ok(result.compositeText.includes("linux"));
  assert.ok(result.compositeText.includes("makefile"));
  assert.ok(result.compositeText.includes("kernel"));
});

test("Classifier: Curated domain lookup and activity inference", async () => {
  await DomainRepository.seedDefaults();

  const result = await Classifier.classify({
    url: "https://github.com/facebook/react",
    title: "React – A JavaScript library for building user interfaces",
  });

  assert.equal(result.category, "Technology");
  assert.equal(result.activity, "Coding");
  assert.equal(result.productivity, "productive");
  assert.ok(result.decisionTrace.domain_match !== null, "Domain match should be present");
  assert.ok(result.inferenceLatencyMs < 2000, "Classification should complete reasonably on disk model cold start (< 2000ms)");

  // Warm classification test
  const warmResult = await Classifier.classify({
    url: "https://github.com/nodejs/node",
    title: "Node.js JavaScript runtime",
  });
  assert.ok(warmResult.inferenceLatencyMs < 50, "Warm classification should be sub-50ms");
});

test("Classifier: Contextual productivity overrides for video/social platforms", async () => {
  // YouTube Educational Tutorial
  const ytEdu = await Classifier.classify({
    url: "https://www.youtube.com/watch?v=abcd",
    title: "PyTorch Deep Learning Full Course - 10 Hour Tutorial for Beginners",
  });
  assert.ok(ytEdu.category === "Technology" || ytEdu.category === "Education");
  assert.ok(ytEdu.activity === "Tutorial" || ytEdu.activity === "Technical Research");
  assert.equal(ytEdu.productivity, "productive");

  // YouTube Music / Entertainment
  const ytFun = await Classifier.classify({
    url: "https://www.youtube.com/watch?v=efgh",
    title: "Top 100 Billboard Songs 2026 - Official Music Video Playlist",
  });
  assert.equal(ytFun.category, "Entertainment");
  assert.equal(ytFun.productivity, "distracting");

  // Reddit Programming Discussion
  const redditTech = await Classifier.classify({
    url: "https://www.reddit.com/r/programming/comments/123/rust_async",
    title: "Why Rust async/await works this way: deep dive into compiler internals",
  });
  assert.equal(redditTech.productivity, "productive");
});

test("Classifier: Decision Trace generation and explainability", async () => {
  const result = await Classifier.classify({
    url: "https://arxiv.org/abs/2301.00000",
    title: "Attention Is All You Need: Transformers in Deep Learning",
  });

  assert.ok(result.decisionTrace.final_reason.length > 0, "final_reason must contain explainability trace");
  assert.ok(result.compositeText.includes("attention"));
  assert.ok(result.compositeText.includes("transformers"));
});
