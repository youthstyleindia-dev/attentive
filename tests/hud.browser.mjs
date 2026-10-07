import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

const profile = await mkdtemp(resolve(tmpdir(), "atentiv-hud-test-"));
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
  
  // 1. Open an external web page to test in-page HUD injection
  const page = await context.newPage();
  await page.route("https://github.com/**", (r) =>
    r.fulfill({
      body: `
        <!DOCTYPE html>
        <html>
          <head><title>Atentiv / project-dashboard</title></head>
          <body style="background: #0d1117; color: white;">
            <h1>Atentiv Project Dashboard</h1>
            <p>Developing browser activity intelligence.</p>
          </body>
        </html>
      `,
      contentType: "text/html",
    })
  );

  await page.goto("https://github.com/atentiv/project-dashboard");
  await page.bringToFront();
  await new Promise((r) => setTimeout(r, 1500));

  console.log("1. Verifying In-Page Shadow DOM HUD Container...");
  const hudContainer = page.locator("#atentiv-sidebar-container");
  await hudContainer.waitFor({ state: "attached", timeout: 5000 });

  // 2. Compact View (Always Visible)
  console.log("2. Verifying Tier 1: Compact View & Focus Score...");
  const compactBadge = page.locator("#atentiv-sidebar-container").locator("#atentiv-badge");
  await compactBadge.waitFor({ state: "visible", timeout: 5000 });
  const scoreText = await compactBadge.locator("#atentiv-score-text").textContent();
  console.log(`Compact Badge live score: ${scoreText}`);
  assert.ok(scoreText && parseInt(scoreText) >= 0, "Focus score must be numeric");

  // 3. Hover Preview (Instant)
  console.log("3. Verifying Tier 2: Hover Preview...");
  await compactBadge.hover();
  await new Promise((r) => setTimeout(r, 300));
  const hoverCard = page.locator("#atentiv-sidebar-container").locator("#atentiv-hover-card");
  await hoverCard.waitFor({ state: "attached", timeout: 3000 });
  const hoverScore = await hoverCard.locator("#atentiv-hover-score").textContent();
  console.log(`Hover preview score text: ${hoverScore}`);
  assert.ok(hoverScore.includes("Focus Score"), "Hover card must show focus score");

  // 4. Expanded Panel (On Click)
  console.log("4. Verifying Tier 3: Expanded Panel...");
  await compactBadge.click();
  const panel = page.locator("#atentiv-sidebar-container").locator("#atentiv-expanded-panel");
  await panel.waitFor({ state: "visible", timeout: 3000 });

  // Verify Current Tab Card in Expanded Panel
  const currDomain = await panel.locator("#atentiv-curr-domain").textContent();
  console.log(`Current domain in HUD: ${currDomain}`);
  assert.equal(currDomain, "github.com", "Current domain must match page");

  const prodBadge = panel.locator("#atentiv-prod-text");
  assert.ok((await prodBadge.textContent()).includes("Productive"), "Should show productivity badge");

  // Verify Smart Navigation Cards
  console.log("5. Verifying Tier 4: Smart Navigation & Group Flyout...");
  const smartNav = panel.locator("#atentiv-smart-nav-grid");
  await smartNav.waitFor({ state: "visible" });
  const continueGrp = smartNav.locator(".nav-group-pill").first();
  await continueGrp.click();

  const flyout = panel.locator("#atentiv-flyout-container .smart-nav-tabs-flyout");
  await flyout.waitFor({ state: "visible" });
  const openAllBtn = flyout.locator("#atentiv-open-all-grp");
  await openAllBtn.waitFor({ state: "visible" });
  console.log("Verified Smart Navigation tab flyout and Open All button.");

  // Verify Recent Tabs List
  console.log("6. Verifying Recent Tabs list...");
  const recentList = panel.locator("#atentiv-recent-tabs-list");
  await recentList.waitFor({ state: "visible" });
  const recentCount = await recentList.locator(".recent-tab-item").count();
  console.log(`Recent tabs count in HUD: ${recentCount}`);
  assert.ok(recentCount > 0, "Recent tabs must contain activity items");

  // 7. Test New Tab Scenic Page in Dashboard
  console.log("7. Verifying Scenic New Tab Page in Dashboard...");
  const dashPage = await context.newPage();
  await dashPage.goto(`chrome-extension://${id}/index.html?page=Home`);

  // Bypass login if presented
  const signInBtn = dashPage.getByRole("button", { name: "Sign In to Atentiv" });
  if (await signInBtn.isVisible()) {
    await dashPage.getByRole("button", { name: "1-Click Continue as Divya (Personal)" }).click();
  }
  const welcomeModal = dashPage.getByText("Welcome back, Divya!");
  if (await welcomeModal.isVisible()) {
    await dashPage.getByRole("button", { name: "Enter Workspace" }).click();
  }

  // Verify Scenic Home Elements
  await dashPage.locator(".scenic-home-container").waitFor({ state: "visible", timeout: 5000 });
  await dashPage.locator(".scenic-clock").waitFor({ state: "visible" });
  await dashPage.locator(".scenic-greeting", { hasText: "Good" }).waitFor();
  await dashPage.locator(".scenic-focus-card", { hasText: "Today's Focus" }).waitFor();
  await dashPage.locator(".scenic-dock").waitFor({ state: "visible" });
  console.log("Verified Scenic New Tab Home layout, clock, focus ring, and dock.");

  console.log("ALL IN-PAGE HUD AND NEW TAB EXPERIENCE TESTS PASSED!");
} finally {
  await context.close();
  await rm(profile, { recursive: true, force: true });
}
