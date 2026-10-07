import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

const profile = await mkdtemp(resolve(tmpdir(), "atentiv-run-"));
const path = resolve("dist");

console.log("Launching Chromium with Atentiv extension...");
const context = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  headless: false,
  args: [
    `--disable-extensions-except=${path}`,
    `--load-extension=${path}`,
    `--window-size=1000,920`,
    `--window-position=40,40`,
  ],
  viewport: null,
});

const worker =
  context.serviceWorkers()[0] ||
  (await context.waitForEvent("serviceworker"));
const id = new URL(worker.url()).host;

// 1. Open sample web page (e.g. GitHub repository)
const webPage = await context.newPage();
try {
  await webPage.goto("https://github.com/facebook/react", { timeout: 15000 });
} catch {
  await webPage.goto("https://example.com");
}

// 2. Open side companion window docked on the right side of the screen
try {
  await worker.evaluate(async (extId) => {
    await chrome.windows.create({
      url: `chrome-extension://${extId}/index.html?mode=sidepanel`,
      type: "popup",
      width: 440,
      height: 920,
      left: 1050,
      top: 40,
      focused: true,
    });
  }, id);
} catch (e) {
  console.log("Notice: Side window creation fallback:", e.message);
  const sidePage = await context.newPage();
  await sidePage.goto(`chrome-extension://${id}/index.html?mode=sidepanel`);
}

console.log(`\n======================================================`);
console.log(`Atentiv Extension is running!`);
console.log(`- Webpage running on left (1000px)`);
console.log(`- Atentiv Sidebar docked on right (440px): chrome-extension://${id}/index.html?mode=sidepanel`);
console.log(`- In-Page Sidebar: Click the floating 'Atentiv' badge on any webpage or press Alt+A`);
console.log(`- Native Side Panel: Click the Atentiv action icon in the Chrome toolbar`);
console.log(`======================================================\n`);
