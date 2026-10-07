import { test } from "node:test";
import assert from "node:assert/strict";
import { RuleEngine, type PageContext } from "../../src/rules/ruleEngine";
import { ExclusionEngine } from "../../src/privacy/exclusionEngine";
import type { UserRuleRecord } from "../../src/db/schemas";

test("Rule Engine: Priority-based rule resolution", () => {
  const rules: UserRuleRecord[] = [
    {
      rule_id: "r1",
      name: "Low Priority Tech",
      priority: 10,
      enabled: true,
      condition: { domain_exact: "youtube.com" },
      action: { category: "Entertainment", productivity_type: "distracting" },
      created_at: 0,
      updated_at: 0,
    },
    {
      rule_id: "r2",
      name: "High Priority Education Override",
      priority: 90,
      enabled: true,
      condition: {
        domain_exact: "youtube.com",
        title_contains: ["lecture", "tutorial"],
      },
      action: { category: "Education", productivity_type: "productive" },
      created_at: 0,
      updated_at: 0,
    },
  ];

  const lectureContext: PageContext = {
    domain: "youtube.com",
    url: "https://www.youtube.com/watch?v=123",
    title: "MIT Deep Learning Lecture 1",
  };

  const match1 = RuleEngine.match(rules, lectureContext);
  assert.ok(match1, "Should match high priority rule");
  assert.equal(match1?.matchedRule.rule_id, "r2");
  assert.equal(match1?.action.category, "Education");
  assert.equal(match1?.action.productivity_type, "productive");

  const musicContext: PageContext = {
    domain: "youtube.com",
    url: "https://www.youtube.com/watch?v=456",
    title: "Relaxing Lo-Fi Music Stream",
  };

  const match2 = RuleEngine.match(rules, musicContext);
  assert.ok(match2, "Should match low priority rule");
  assert.equal(match2?.matchedRule.rule_id, "r1");
  assert.equal(match2?.action.category, "Entertainment");
});

test("Rule Engine: Domain wildcard and path prefix matching", () => {
  const rules: UserRuleRecord[] = [
    {
      rule_id: "r-wildcard",
      name: "All Google subdomains",
      priority: 50,
      enabled: true,
      condition: { domain_wildcard: "*.google.com" },
      action: { category: "Work" },
      created_at: 0,
      updated_at: 0,
    },
    {
      rule_id: "r-path",
      name: "GitHub Docs path",
      priority: 80,
      enabled: true,
      condition: {
        domain_exact: "github.com",
        url_path_prefix: "/docs",
      },
      action: { category: "Education", activity_type: "Documentation" },
      created_at: 0,
      updated_at: 0,
    },
  ];

  const docsContext: PageContext = {
    domain: "github.com",
    url: "https://github.com/docs/get-started",
    title: "Getting Started with GitHub",
  };

  const matchDocs = RuleEngine.match(rules, docsContext);
  assert.ok(matchDocs);
  assert.equal(matchDocs?.action.activity_type, "Documentation");

  const driveContext: PageContext = {
    domain: "drive.google.com",
    url: "https://drive.google.com/drive/folders",
    title: "My Drive",
  };

  const matchDrive = RuleEngine.match(rules, driveContext);
  assert.ok(matchDrive);
  assert.equal(matchDrive?.action.category, "Work");
});

test("Privacy & Exclusion Engine: Sensitive domain filtering", () => {
  const excludedUser = ["mysecretproject.internal", "personal-blog.org"];

  // 1. Check curated sensitive domains (banking, auth)
  assert.ok(ExclusionEngine.isExcluded("login.chase.com", excludedUser));
  assert.ok(ExclusionEngine.isExcluded("accounts.google.com", excludedUser));
  assert.ok(ExclusionEngine.isExcluded("app.1password.com", excludedUser));

  // 2. Check user exclusions
  assert.ok(ExclusionEngine.isExcluded("mysecretproject.internal", excludedUser));
  assert.ok(ExclusionEngine.isExcluded("sub.personal-blog.org", excludedUser));

  // 3. Allowed domain
  assert.ok(!ExclusionEngine.isExcluded("github.com", excludedUser));
  assert.ok(!ExclusionEngine.isExcluded("en.wikipedia.org", excludedUser));

  // 4. URL Sanitization
  const sanitized = ExclusionEngine.sanitizeUrl("https://github.com/divya/atentiv?secret_token=abc#section-1");
  assert.equal(sanitized, "https://github.com/divya/atentiv");
});
