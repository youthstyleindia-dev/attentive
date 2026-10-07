import { test } from "node:test";
import assert from "node:assert/strict";
import {
  safeUrl,
  excluded,
  classify,
  metrics,
  initial,
  type Visit,
} from "../src/model";
test("URLs strip sensitive query, fragment and credentials; reject internal URLs", () => {
  assert.equal(
    safeUrl("https://user:pass@example.com/path?token=secret#private"),
    "https://example.com/path",
  );
  for (const u of [
    "chrome://settings",
    "file:///tmp/x",
    "javascript:alert(1)",
    "nonsense",
  ])
    assert.equal(safeUrl(u), null);
});
test("domain exclusions match subdomains without suffix collisions", () => {
  assert.equal(excluded("https://mail.example.com/", "example.com"), true);
  assert.equal(excluded("https://notexample.com/", "example.com"), false);
});
test("classification favors domain rules and falls back safely", () => {
  assert.equal(
    classify("https://github.com/", "research", initial().streams),
    "build",
  );
  assert.equal(
    classify("https://unknown.example/", "Untitled", initial().streams),
    "other",
  );
});
const visit = (
  id: string,
  stream: string,
  start: number,
  end: number,
  switched = false,
): Visit => ({
  id,
  stream,
  start,
  end,
  switched,
  title: "Title",
  url: "https://example.com/",
  tabId: 1,
});
test("metrics clip intervals to range and count only switches in range", () => {
  const m = metrics(
    [visit("1", "build", 0, 100, true), visit("2", "research", 100, 200, true)],
    50,
    150,
  );
  assert.equal(m.total, 100);
  assert.equal(m.switches, 1);
  assert.equal(m.score, 48);
});
test("empty data has no score and penalties are bounded", () => {
  assert.equal(metrics([], 0, 100).score, null);
  const v = Array.from({ length: 30 }, (_, i) =>
    visit(String(i), "build", i * 10, i * 10 + 10, true),
  );
  assert.equal(metrics(v, 0, 1000).penalty, 40);
  assert.equal(metrics(v, 0, 1000, "research").score, 0);
});
