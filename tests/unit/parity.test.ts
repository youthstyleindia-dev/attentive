import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeAndJoinCompositeText } from "../../src/intelligence/runtimePipeline";

interface GoldenFixture {
  id: string;
  raw: {
    url: string;
    title: string;
    description?: string;
    headings?: string[];
    mainText?: string;
  };
  expectedNormalized: string;
  expectedLabel: string;
}

test("Parity Verification (TS vs Spec): All 200 golden fixtures match expected normalized text character-for-character", () => {
  const fixturePath = resolve(
    process.cwd(),
    "tests/fixtures/golden_preprocessing.json",
  );
  const rawData = readFileSync(fixturePath, "utf-8");
  const fixtures: GoldenFixture[] = JSON.parse(rawData);

  assert.ok(
    fixtures.length >= 100,
    `Expected at least 100 golden fixtures, got ${fixtures.length}`,
  );

  let mismatches = 0;
  const failureDetails: string[] = [];

  for (let i = 0; i < fixtures.length; i++) {
    const f = fixtures[i];
    const actual = normalizeAndJoinCompositeText({
      title: f.raw.title,
      description: f.raw.description,
      headings: f.raw.headings,
      mainText: f.raw.mainText,
    });

    if (actual !== f.expectedNormalized) {
      mismatches++;
      failureDetails.push(
        `Fixture [${i}] ID ${f.id} MISMATCH:\n` +
          `  Actual:   "${actual}"\n` +
          `  Expected: "${f.expectedNormalized}"`,
      );
    }
  }

  assert.equal(
    mismatches,
    0,
    `Parity Check Failed! ${mismatches}/${fixtures.length} fixtures did not match:\n${failureDetails.slice(0, 5).join("\n")}`,
  );
});
