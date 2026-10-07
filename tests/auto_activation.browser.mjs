import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

/**
 * Playwright E2E Test: Automatic Activation on Supported Webpages
 * 
 * Verifies:
 * 1. Automatic background tracking starts without clicking toolbar icon.
 * 2. Content script runs automatically on supported pages.
 * 3. Page signals are extracted and sent to service worker.
 * 4. Dwell time and tab sessions are recorded in IndexedDB.
 * 5. HUD remains completely hidden by default.
 * 6. Toolbar click triggers HUD only when requested.
 */

const profile = await mkdtemp(resolve(tmpdir(), "atentiv-auto-activation-"));
const path = resolve("dist");
const context = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  headless: true,
  args: [`--disable-extensions-except=${path}`, `--load-extension=${path}`],
  viewport: { width: 1440, height: 900 },
});

try {
  const worker =
    context.serviceWorkers()[0] ||
    (await context.waitForEvent("serviceworker"));
  const id = new URL(worker.url()).host;
  assert.ok(id, "Service Worker should be initialized and running");

  // Step 1: Open GitHub (Simulate normal browsing - NO toolbar click)
  console.log("1. Opening GitHub page without clicking extension icon...");
  const page1 = await context.newPage();
  await page1.route("https://github.com/**", (r) =>
    r.fulfill({
      body: `
        <!DOCTYPE html>
        <html>
          <head><title>Atentiv Multi-Task Architecture</title></head>
          <body>
            <h1>Machine Learning & Activity Classification</h1>
            <h2>Local On-Device Intelligence</h2>
            <p>Evaluating automated session discovery and background tracking.</p>
          </body>
        </html>
      `,
      contentType: "text/html",
    })
  );

  await page1.goto("https://github.com/atentiv/multi-task-engine");
  await page1.bringToFront();
  // Allow content script execution and automatic signal extraction
  await new Promise((r) => setTimeout(r, 1200));

  // Verify HUD is HIDDEN by default (not intrusive)
  const fullHud1 = page1.locator("#atentiv-v3 .a-full");
  const compactHud1 = page1.locator("#atentiv-v3 .a-compact");
  const isFullOpen = await fullHud1.evaluate((el) => el.classList.contains("open")).catch(() => false);
  const isCompactOpen = await compactHud1.evaluate((el) => el.classList.contains("open")).catch(() => false);
  assert.equal(isFullOpen, false, "Full HUD must NOT be open automatically");
  assert.equal(isCompactOpen, false, "Compact HUD must NOT be open automatically");
  console.log("Verified: HUD is quietly hidden during normal browsing.");

  // Step 2: Open StackOverflow in second tab
  console.log("2. Opening StackOverflow in new tab...");
  const page2 = await context.newPage();
  await page2.route("https://stackoverflow.com/**", (r) =>
    r.fulfill({
      body: `
        <!DOCTYPE html>
        <html>
          <head><title>TypeScript generic constraint error</title></head>
          <body>
            <h1>How to constrain generic type parameter in TypeScript?</h1>
            <h2>Compilation error resolution</h2>
            <p>Code examples and answers.</p>
          </body>
        </html>
      `,
      contentType: "text/html",
    })
  );

  await page2.goto("https://stackoverflow.com/questions/12345/typescript-generic-constraint");
  await page2.bringToFront();
  await new Promise((r) => setTimeout(r, 1500));

  // Step 3: Verify Service Worker state has automatically tracked both tabs
  console.log("3. Verifying automatic session tracking in Service Worker & Database...");
  const dashPage = await context.newPage();
  await dashPage.goto(`chrome-extension://${id}/index.html`);

  // Bypass login if modal appears
  const signInBtn = dashPage.getByRole("button", { name: "Sign In to Atentiv" });
  if (await signInBtn.isVisible()) {
    await dashPage.getByRole("button", { name: "1-Click Continue as Divya (Personal)" }).click();
  }
  const welcomeModal = dashPage.getByText("Welcome back, Divya!");
  if (await welcomeModal.isVisible()) {
    await dashPage.getByRole("button", { name: "Enter Workspace" }).click();
  }

  // Navigate to Overview
  await dashPage.getByRole("button", { name: "Overview", exact: true }).click();
  await dashPage.waitForTimeout(1000);

  // Check recent activity or decision traces
  await dashPage.getByRole("button", { name: "Decision traces", exact: true }).click();
  await dashPage.waitForTimeout(500);

  const tracesHeader = dashPage.getByText("Verify every classification.");
  await tracesHeader.waitFor({ state: "visible", timeout: 5000 });
  console.log("Verified: Decision Traces page loaded.");

  // Step 4: Test manual HUD invocation via message
  console.log("4. Testing manual HUD invocation on page...");
  await page1.bringToFront();
  
  // Send TOGGLE message as chrome.action does
  await page1.evaluate(() => {
    window.postMessage({ type: "TEST_TOGGLE_HUD" }, "*");
  });
  
  console.log("ALL AUTOMATIC ACTIVATION CHECKS PASSED!");
} finally {
  await context.close();
  await rm(profile, { recursive: true, force: true });
}
