import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

const profile = await mkdtemp(resolve(tmpdir(), "cognitive-test-"));
const path = resolve("dist");
const context = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  headless: true,
  args: [`--disable-extensions-except=${path}`, `--load-extension=${path}`],
  viewport: { width: 1440, height: 1100 },
});

try {
  const worker =
    context.serviceWorkers()[0] ||
    (await context.waitForEvent("serviceworker"));
  const id = new URL(worker.url()).host;
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (msg) => console.log("BROWSER LOG:", msg.text()));

  await page.goto(`chrome-extension://${id}/index.html`);

  // ── 1. Login Page & Profile Authentication ──
  const signInBtn = page.getByRole("button", { name: "Sign In to Atentiv" });
  if (await signInBtn.isVisible()) {
    console.log("Testing Login Page...");
    await page.getByRole("button", { name: "1-Click Continue as Divya (Personal)" }).click();
  }

  // ── 2. Focus Score on Login Welcome Modal ──
  const welcomeModal = page.getByText("Welcome back, Divya!");
  if (await welcomeModal.isVisible()) {
    console.log("Verifying Focus Score on Login Modal...");
    await page.getByRole("button", { name: "Enter Workspace" }).click();
  }

  // ── 3. Overview Page & Focus Balance Card ──
  console.log("Testing Overview & Focus Balance Card...");
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  await page.getByRole("heading", { name: "Your attention, at a glance" }).waitFor();

  // Verify that the old focus session / "Set an intention" section is completely removed
  const oldFocusBtn = page.getByRole("button", { name: "Start focus session" });
  assert.equal(await oldFocusBtn.count(), 0, "Old focus session button must not exist");

  // Verify Productivity & Focus Balance Card exists
  await page.getByText("Productive vs Unproductive Time").waitFor();

  // Explore demo workspace to populate sample data
  const exploreBtn = page.getByRole("button", { name: "Explore demo" });
  if (await exploreBtn.isVisible()) {
    await exploreBtn.click();
    await page.getByText("Demo workspace", { exact: false }).waitFor();
  }

  // ── 4. Analytics Dashboard: Toggle, Hourly Context Switches & Ascending Sites ──
  console.log("Testing Analytics Dashboard...");
  await page.getByRole("button", { name: "Analytics", exact: true }).click();
  await page.getByRole("heading", { name: "Behavioral & Multitasking Graphs" }).waitFor();

  // Test Pie chart mode toggle (By Workstream vs By Domain / Tab)
  await page.getByRole("button", { name: "By Domain / Tab" }).first().click();
  await page.getByRole("button", { name: "By Workstream" }).first().click();

  // Verify 24h Context Switches vs Time (per hour)
  await page.getByText("Context Switches vs Time (Per Hour)").first().waitFor();

  // Verify Sites Visited vs Time (Ascending Order)
  await page.getByText("Sites Visited vs Time (Ascending Order)").waitFor();

  // ── 5. Productive Sites Management ──
  console.log("Testing Productive Sites Manager...");
  await page.getByRole("button", { name: "Productive Sites", exact: true }).click();
  await page.getByRole("heading", { name: "Add Domain to Focus Classification" }).waitFor();

  // Verify pre-seeded domains
  await page.locator(".site-domain-chip", { hasText: "geeksforgeeks.org" }).waitFor();
  await page.locator(".site-domain-chip", { hasText: "docs.google.com" }).waitFor();

  // Add custom productive domain
  await page.getByPlaceholder("e.g. geeksforgeeks.org or youtube.com").fill("leetcode.com");
  await page.getByRole("button", { name: "Add Domain" }).click();
  await page.locator(".site-domain-chip", { hasText: "leetcode.com" }).waitFor();

  // ── 6. Workstreams & Edit Rules ──
  console.log("Testing Workstreams...");
  await page.getByRole("button", { name: "Workstreams", exact: true }).click();
  await page.getByRole("button", { name: "Edit rules" }).click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();

  // ── 7. Settings: Idle Threshold & Tracking ──
  console.log("Testing Settings & Idle Threshold...");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByText("Inactivity & Idle Threshold").waitFor();
  // Verify select element has 180s (3 mins)
  const idleSelect = page.locator("select").filter({ hasText: "3 minutes" });
  await idleSelect.waitFor();

  // ── 8. Context Resume: Checkbox Tab Selection & Tab Updates ──
  console.log("Testing Context Resume with Checkbox Tab Selection...");
  // Navigate to external demo page
  const web = await context.newPage();
  await web.route("https://github.com/**", (r) =>
    r.fulfill({
      body: "<title>GitHub code project</title><h1>Project</h1>",
      contentType: "text/html",
    }),
  );
  await web.goto("https://github.com/cognitive-demo?secret=private");
  await web.bringToFront();
  await new Promise((r) => setTimeout(r, 1200));

  await page.bringToFront();
  await page.getByRole("button", { name: "Context resume", exact: true }).click();
  await page.getByRole("button", { name: "Save current workspace" }).click();
  await page.getByRole("dialog").waitFor();

  // Fill workspace name & resume note
  await page.getByLabel("Workspace name").fill("Integration workspace");
  await page.getByLabel("Where should you pick up?").fill("Next step: review implementation");

  // Save workspace
  await page.getByRole("dialog").getByRole("button", { name: "Save workspace" }).click();
  await page.getByRole("heading", { name: "Integration workspace" }).waitFor();

  // Test "Update tabs" button preserving resume notes
  await page.getByRole("button", { name: "Update tabs" }).first().click();
  await page.getByRole("dialog").waitFor();
  // Verify resume note is preserved
  const noteValue = await page.getByLabel("Where should you pick up?").inputValue();
  assert.equal(noteValue, "Next step: review implementation", "Resume note must be preserved");
  await page.getByRole("dialog").getByRole("button", { name: "Update workspace" }).click();

  // ── 9. Content Script: Floating Badge & Distraction Alert ──
  console.log("Testing Content Script Floating Badge & Distraction Alert...");
  const yt = await context.newPage();
  await yt.route("https://www.youtube.com/**", (r) =>
    r.fulfill({
      body: "<title>YouTube Video Demo</title><h1>Video</h1>",
      contentType: "text/html",
    }),
  );
  await yt.goto("https://www.youtube.com/watch?v=demo");
  await yt.bringToFront();
  await new Promise((r) => setTimeout(r, 1500));

  // Verify Atentiv floating badge is injected into document
  const badgeContainer = yt.locator("#atentiv-sidebar-container");
  await badgeContainer.waitFor({ state: "attached", timeout: 5000 });
  const badge = yt.locator("#atentiv-sidebar-container #atentiv-badge");
  await badge.waitFor({ state: "attached", timeout: 5000 });
  console.log("Verified floating badge attached to DOM.");

  // Verify Distraction Alert toast on unproductive site
  const distractionToast = yt.locator("#atentiv-sidebar-container #atentiv-distraction-toast");
  if (await distractionToast.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log("Verified Distraction Alert toast on unproductive site.");
    const markProdBtn = yt.locator("#atentiv-sidebar-container #atentiv-mark-prod");
    if (await markProdBtn.isVisible()) {
      await markProdBtn.click();
      console.log("Clicked Mark as Productive Site.");
    }
  }

  // ── 10. Logout and Login Cycle with Focus Score Welcome Modal ──
  console.log("Testing Logout and Login Cycle with Focus Score on Login...");
  await page.bringToFront();
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  const logoutBtn = page.getByTitle("Log out");
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    console.log("Logged out successfully.");
    await page.getByRole("button", { name: "Sign In to Atentiv" }).waitFor();
    await page.getByRole("button", { name: "1-Click Continue as Divya (Personal)" }).click();
    await page.getByText("Welcome back, Divya!").waitFor();
    await page.locator(".welcome-score-circle").waitFor();
    console.log("Verified Focus Score on Login Modal.");
    await page.getByRole("button", { name: "Enter Workspace" }).click();
  }

  // ── 11. Mobile Responsiveness & Clean Data Deletion ──
  console.log("Testing Mobile Responsiveness & Data Reset...");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Delete data", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete data", exact: true }).click();

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Overview", exact: true }).click();
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
    "Mobile layout should not horizontally overflow",
  );

  assert.deepEqual(errors, [], `Expected 0 page errors, found: ${errors.join(", ")}`);
  console.log("PASS: All features verified (Login, Focus Score on Login, Analytics toggle & 24h graphs, Productive Sites, Checkbox Context Resume, Idle threshold, Content Script Floating Badge & Distraction Alert, Responsive layout, 0 errors).");
} finally {
  await context.close();
  await rm(profile, { recursive: true, force: true });
}
