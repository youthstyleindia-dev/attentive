import { chromium } from "@playwright/test";
import path from "node:path";
import os from "node:os";

const profile = path.resolve(os.tmpdir(), "test-hud-prof-" + Date.now());
const extPath = path.resolve(process.cwd(), "dist");

async function test() {
  const context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`, "--no-sandbox"],
    viewport: { width: 1920, height: 1080 },
  });
  const worker = context.serviceWorkers()[0] || (await context.waitForEvent("serviceworker", { timeout: 15000 }));
  const extId = new URL(worker.url()).host;
  console.log("ExtId:", extId);

  const page = await context.newPage();
  await page.goto("https://github.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);

  const host = page.locator("#atentiv-v3");
  console.log("Host attached:", await host.count());
  await context.close();
}
test();
