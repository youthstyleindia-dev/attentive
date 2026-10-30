import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const projectRoot = process.cwd();
const rawRecordDir = path.join(projectRoot, "scripts/demo_video/raw_tour_record");
const finalOutputMp4 = path.join(projectRoot, "Atentiv_Live_Extension_Walkthrough.mp4");

// Clean and prepare output folder
if (fs.existsSync(rawRecordDir)) {
  fs.rmSync(rawRecordDir, { recursive: true, force: true });
}
fs.mkdirSync(rawRecordDir, { recursive: true });

const profile = path.resolve(os.tmpdir(), "atentiv-tour-profile-" + Date.now());
const extPath = path.resolve(projectRoot, "dist");

console.log("==================================================================");
console.log("  ATENTIV LIVE EXTENSION FULL SCREEN & NAVIGATION TOUR RECORDER");
console.log("==================================================================");
console.log(`- Extension Path:  ${extPath}`);
console.log(`- Recording Size:  1920 x 1080 (Full HD, 60fps)`);
console.log(`- Output Target:   ${finalOutputMp4}`);
console.log("==================================================================\n");

async function recordTour() {
  console.log("1. Launching Chromium with real unpacked Atentiv extension...");
  const context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: true,
    args: [
      `--disable-extensions-except=${extPath}`,
      `--load-extension=${extPath}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--hide-scrollbars",
      "--enable-gpu",
    ],
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: rawRecordDir,
      size: { width: 1920, height: 1080 },
    },
  });

  // Acquire Extension ID
  const worker =
    context.serviceWorkers()[0] ||
    (await context.waitForEvent("serviceworker", { timeout: 15000 }));
  const extId = new URL(worker.url()).host;
  console.log(`✓ Service Worker active. Real Extension ID: ${extId}`);

  // Create primary recording page
  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 1: Live Web Browsing & Floating Focus Pill (GitHub Page)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 1/8] Live Web Browsing & Floating Focus Pill...");
  await page.route("https://github.com/facebook/react**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>facebook/react: The library for web and native user interfaces</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; padding: 0; }
            .gh-nav { background: #161b22; padding: 16px 36px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #30363d; }
            .gh-brand { font-size: 18px; font-weight: 700; color: #f0f6fc; display: flex; align-items: center; gap: 10px; }
            .repo-head { padding: 36px 48px 24px; border-bottom: 1px solid #21262d; background: #0d1117; }
            .repo-title { font-size: 26px; font-weight: 600; color: #58a6ff; }
            .badge-pub { border: 1px solid #30363d; border-radius: 12px; font-size: 13px; padding: 3px 10px; color: #8b949e; margin-left: 10px; }
            .main-content { padding: 36px 48px; display: grid; grid-template-columns: 2.8fr 1.2fr; gap: 36px; }
            .readme-box { border: 1px solid #30363d; border-radius: 8px; padding: 36px; background: #0d1117; }
            h1 { font-size: 32px; color: #f0f6fc; border-bottom: 1px solid #21262d; padding-bottom: 12px; margin-top: 0; }
            p { font-size: 16px; line-height: 1.6; color: #c9d1d9; }
            .code-sample { background: #161b22; padding: 18px; border-radius: 6px; font-family: monospace; font-size: 14px; margin: 20px 0; border: 1px solid #30363d; }
          </style>
        </head>
        <body>
          <div class="gh-nav">
            <div class="gh-brand"><span>🐙</span> GitHub / facebook / react</div>
            <div style="font-size: 14px; color: #8b949e;">⭐ 232,000 stars &bull; 46,000 forks</div>
          </div>
          <div class="repo-head">
            <div class="repo-title">facebook / react <span class="badge-pub">Public</span></div>
            <p style="color: #8b949e; margin-top: 8px;">The library for web and native user interfaces.</p>
          </div>
          <div class="main-content">
            <div class="readme-box">
              <h1>React &bull; Fast Declarative UI</h1>
              <p>React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".</p>
              <div class="code-sample">
                function MyComponent() {<br/>
                &nbsp;&nbsp;return &lt;h1&gt;Hello Atentiv User&lt;/h1&gt;;<br/>
                }
              </div>
              <p>Autonomous dwell tracking is actively measuring engagement on this tab with 0 network egress.</p>
            </div>
            <div>
              <div style="border: 1px solid #30363d; border-radius: 8px; padding: 24px; background: #161b22;">
                <h3 style="margin-top:0; color:#f0f6fc;">About Repository</h3>
                <p style="font-size: 14px; color: #8b949e;">Topics: react, javascript, library, frontend, ui</p>
                <div style="margin-top: 16px; font-size: 14px; color: #58a6ff;">License: MIT &bull; 1,600 releases</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  });

  await page.goto("https://github.com/facebook/react", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Locate the actual injected Atentiv host and floating indicator
  const atentivHost = page.locator("#atentiv-v3");
  await atentivHost.waitFor({ state: "attached", timeout: 8000 });
  console.log("✓ Injected Atentiv #atentiv-v3 host attached to DOM.");

  // Hover and pause on the floating indicator in the bottom-right corner
  const indicator = atentivHost.locator("#a-indicator");
  await indicator.waitFor({ state: "visible", timeout: 5000 });
  await page.waitForTimeout(2000);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 2: Expanding the Real Transparent Glass HUD (Alt+A)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 2/8] Expanding Real Transparent Glass HUD...");
  await indicator.click();
  await page.waitForTimeout(1000);

  const compactHUD = atentivHost.locator("#a-compact");
  await compactHUD.waitFor({ state: "visible", timeout: 5000 });
  console.log("✓ Real Compact HUD panel visible and interactive.");
  await page.waitForTimeout(3000);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 3: Expanding to Full 3-Column Glass HUD View
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 3/8] Opening Full 3-Column Glass HUD...");
  const fullViewBtn = compactHUD.locator("#c-full-view-btn");
  if (await fullViewBtn.isVisible()) {
    await fullViewBtn.click();
    await page.waitForTimeout(1000);
    const fullHUD = atentivHost.locator("#a-full");
    await fullHUD.waitFor({ state: "visible", timeout: 5000 });
    console.log("✓ Full 3-Column HUD opened.");
    await page.waitForTimeout(3500);

    // Minimize back to compact
    const minBtn = fullHUD.locator("#f-min-btn");
    if (await minBtn.isVisible()) {
      await minBtn.click();
      await page.waitForTimeout(1000);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 4: Real Background Audio Tab & FastText Distraction Classifier
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 4/8] Live Audio Test Bench & FastText WASM Distraction Scoring...");
  const audioPage = await context.newPage();
  await audioPage.setViewportSize({ width: 1920, height: 1080 });
  await audioPage.goto(`chrome-extension://${extId}/audio-test.html`, {
    waitUntil: "networkidle",
  });
  await audioPage.waitForTimeout(1500);

  // Click Educational Lecture button (Lo-Fi / MIT Lecture)
  console.log("  -> Playing MIT Deep Learning Lecture (Focus Aid)...");
  await audioPage.click("#play-edu");
  await audioPage.waitForTimeout(2500);

  // Bring GitHub tab back to foreground to show background audio detection in HUD
  await page.bringToFront();
  await page.waitForTimeout(1500);

  // Check if Compact HUD shows the Background Audio Stream card
  const audioCard = compactHUD.locator("#c-audio-section");
  if (await audioCard.isVisible()) {
    console.log("✓ Live Background Audio Stream card actively rendered in Glass HUD!");
  }
  await page.waitForTimeout(3000);

  // Switch back to audio tab and play distracting gaming stream
  await audioPage.bringToFront();
  console.log("  -> Switching to Twitch GTA V Gaming Stream (Distracting Media)...");
  await audioPage.click("#play-ent");
  await audioPage.waitForTimeout(2500);

  // Switch back to work tab and view updated distraction alert
  await page.bringToFront();
  await page.waitForTimeout(3000);

  // Close audio tab cleanly
  await audioPage.close();
  console.log("✓ Audio tab closed; audio session finalized.");
  await page.waitForTimeout(1500);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 5: The Extension Toolbar Popup (index.html)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 5/8] Navigating to Extension Toolbar Popup (index.html)...");
  await page.goto(`chrome-extension://${extId}/index.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(3500);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 6: Companion Side Panel UI (sidepanel.html)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 6/8] Navigating to Chrome Side Panel (sidepanel.html)...");
  await page.goto(`chrome-extension://${extId}/sidepanel.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(3500);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 7: Full-Screen Analytics Dashboard (dashboard.html)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 7/8] Navigating to Full-Screen Analytics Dashboard (dashboard.html)...");
  await page.goto(`chrome-extension://${extId}/dashboard.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(4000);

  // ──────────────────────────────────────────────────────────────────────────
  // STAGE 8: Extension Options & Rules Surface (options.html)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("\n[STAGE 8/8] Navigating to Settings & Rules (options.html)...");
  await page.goto(`chrome-extension://${extId}/options.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(3500);

  // Finalize video recording
  console.log("\nFinalizing Playwright live recording stream...");
  await page.close();
  await context.close();

  // Find the captured WebM video
  const files = fs.readdirSync(rawRecordDir).filter((f) => f.endsWith(".webm"));
  if (files.length === 0) {
    throw new Error("No recorded WebM video found in " + rawRecordDir);
  }
  const rawWebmPath = path.join(rawRecordDir, files[0]);
  console.log(`Captured raw WebM tour stream: ${rawWebmPath}`);

  // Transcode to high-quality MP4 using FFmpeg
  console.log("Compiling final 1080p MP4 with FFmpeg...");
  const ffmpegCmd = `ffmpeg -y -i "${rawWebmPath}" \
    -f lavfi -i "anoisesrc=c=pink:r=44100:a=0.015,lowpass=f=350" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    "${finalOutputMp4}"`;

  execSync(ffmpegCmd, { stdio: "inherit" });

  // Clean up temporary profile
  try {
    fs.rmSync(profile, { recursive: true, force: true });
  } catch {}

  const stats = fs.statSync(finalOutputMp4);
  console.log("\n==================================================================");
  console.log("  ACTUAL EXTENSION TOUR VIDEO RECORDED & RENDERED SUCCESSFULLY!");
  console.log("==================================================================");
  console.log(`- Final MP4:   ${finalOutputMp4}`);
  console.log(`- File Size:   ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log("==================================================================\n");
}

recordTour().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});
