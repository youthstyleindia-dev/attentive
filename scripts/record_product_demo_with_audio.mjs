import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const projectRoot = process.cwd();
const rawRecordDir = path.join(projectRoot, "scripts/demo_video/raw_full_walkthrough");
const audioWavPath = path.join(projectRoot, "scripts/demo_video/final_demo_audio.wav");
const videoDir = path.join(projectRoot, "media/videos");
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}
const finalOutputMp4 = path.join(videoDir, "Atentiv_Full_Product_Demo_With_Audio_Verification.mp4");

// Clean and prepare output folder
if (fs.existsSync(rawRecordDir)) {
  fs.rmSync(rawRecordDir, { recursive: true, force: true });
}
fs.mkdirSync(rawRecordDir, { recursive: true });

const profile = path.resolve(os.tmpdir(), "atentiv-demo-profile-" + Date.now());
const extPath = path.resolve(projectRoot, "dist");

console.log("==================================================================");
console.log("  ATENTIV FULL PRODUCT DEMO WITH AUDIO VERIFICATION RECORDER");
console.log("==================================================================");
console.log(`- Extension Path:  ${extPath}`);
console.log(`- Soundtrack:      ${audioWavPath}`);
console.log(`- Resolution:      1920 x 1080 (Full HD, 60fps)`);
console.log(`- Output Target:   ${finalOutputMp4}`);
console.log("==================================================================\n");

async function injectOverlayTools(page) {
  await page.evaluate(() => {
    // 1. Virtual Mouse Pointer
    if (!document.getElementById("atentiv-v-cursor")) {
      const cursor = document.createElement("div");
      cursor.id = "atentiv-v-cursor";
      cursor.innerHTML = `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.7));">
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.85a.5.5 0 0 0-.85.36z" fill="#ffffff" stroke="#0f172a" stroke-width="1.5"/>
        </svg>
      `;
      cursor.style.cssText = `
        position: fixed;
        top: 100px;
        left: 100px;
        width: 28px;
        height: 28px;
        z-index: 2147483647;
        pointer-events: none;
        transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), left 0.4s cubic-bezier(0.22, 1, 0.36, 1), top 0.4s cubic-bezier(0.22, 1, 0.36, 1);
      `;
      document.body.appendChild(cursor);
    }

    // 2. Click ripple helper
    window.__atentivClickRipple = (x, y) => {
      const rip = document.createElement("div");
      rip.style.cssText = `
        position: fixed;
        left: ${x - 18}px;
        top: ${y - 18}px;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: 2px solid #8b5cf6;
        background: rgba(139, 92, 246, 0.35);
        pointer-events: none;
        z-index: 2147483646;
        animation: ripAnim 0.45s ease-out forwards;
      `;
      document.body.appendChild(rip);
      setTimeout(() => rip.remove(), 500);
    };

    if (!document.getElementById("atentiv-anim-styles")) {
      const st = document.createElement("style");
      st.id = "atentiv-anim-styles";
      st.innerHTML = `
        @keyframes ripAnim {
          0% { transform: scale(0.4); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes bannerIn {
          from { opacity: 0; transform: translate(-50%, -18px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `;
      document.head.appendChild(st);
    }
  });
}

async function showBanner(page, { chapter, title, subtitle, badge = "100% ON-DEVICE ML" }) {
  await page.evaluate(({ chapter, title, subtitle, badge }) => {
    let b = document.getElementById("atentiv-cinematic-banner");
    if (!b) {
      b = document.createElement("div");
      b.id = "atentiv-cinematic-banner";
      b.style.cssText = `
        position: fixed;
        top: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(15, 18, 30, 0.94);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(139, 92, 246, 0.4);
        border-radius: 14px;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        gap: 16px;
        z-index: 2147483645;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(124, 60, 255, 0.2);
        animation: bannerIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #ffffff;
      `;
      document.body.appendChild(b);
    }
    b.innerHTML = `
      <div style="background: rgba(124, 60, 255, 0.2); border: 1px solid rgba(139, 92, 246, 0.5); color: #c4b5fd; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">
        ${badge}
      </div>
      <div style="display: flex; flex-direction: column;">
        <div style="font-size: 10px; color: #a78bfa; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase;">
          ${chapter}
        </div>
        <div style="font-size: 14px; font-weight: 700; color: #ffffff;">
          ${title}
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 1px;">
          ${subtitle}
        </div>
      </div>
    `;
  }, { chapter, title, subtitle, badge });
}

async function moveCursor(page, x, y, click = false) {
  await page.evaluate(({ x, y, click }) => {
    const c = document.getElementById("atentiv-v-cursor");
    if (c) {
      c.style.left = `${x}px`;
      c.style.top = `${y}px`;
    }
    if (click && window.__atentivClickRipple) {
      window.__atentivClickRipple(x, y);
    }
  }, { x, y, click });
}

async function recordTour() {
  console.log("Launching Headless Chromium with Extension Loaded...");
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

  const worker = context.serviceWorkers()[0] || (await context.waitForEvent("serviceworker", { timeout: 15000 }));
  const extId = new URL(worker.url()).host;
  console.log(`✓ Service Worker active. Extension ID: ${extId}`);

  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const tourStartTime = Date.now();
  async function syncTo(targetSeconds) {
    const elapsed = (Date.now() - tourStartTime) / 1000;
    const remaining = Math.max(0, targetSeconds - elapsed);
    if (remaining > 0) {
      await page.waitForTimeout(remaining * 1000);
    }
  }

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 1: Intro Title & Architecture Card (0.0s - 7.5s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 1/8] Intro Card & Architecture Overview...");
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          background: radial-gradient(circle at 50% 20%, #17112d 0%, #080914 50%, #030408 100%);
          color: #ffffff;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
        }
        .grid-bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(to right, rgba(124, 60, 255, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(124, 60, 255, 0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          border-radius: 9999px;
          background: rgba(124, 60, 255, 0.16);
          border: 1px solid rgba(139, 92, 246, 0.45);
          color: #c4b5fd;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 24px;
          z-index: 2;
        }
        h1 {
          font-size: 82px;
          font-weight: 800;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 55%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 18px;
          z-index: 2;
        }
        p {
          font-size: 25px;
          color: #94a3b8;
          max-width: 950px;
          text-align: center;
          line-height: 1.5;
          margin-bottom: 36px;
          z-index: 2;
        }
        .pills {
          display: flex;
          gap: 16px;
          z-index: 2;
        }
        .pill {
          padding: 12px 24px;
          border-radius: 12px;
          background: rgba(18, 22, 38, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="badge">● ATENTIV V1.0.1 PRODUCTION SYSTEM</div>
      <h1>Atentiv</h1>
      <p>The privacy-first, on-device AI focus companion designed for intentional web browsing.</p>
      <div class="pills">
        <div class="pill"><span class="dot"></span> 100% On-Device FastText ML</div>
        <div class="pill"><span class="dot"></span> Tab Workstream Clustering</div>
        <div class="pill"><span class="dot"></span> Audio Verification Subsystem</div>
        <div class="pill"><span class="dot"></span> Zero Telemetry / Local IndexedDB</div>
      </div>
    </body>
    </html>
  `);
  await syncTo(7.5);

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 2: In-Page Glass HUD (Live GitHub) (7.5s - 16.0s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 2/8] Live Web Browsing & In-Page Focus Pill...");
  await page.goto("https://github.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await injectOverlayTools(page);
  await showBanner(page, {
    chapter: "CHAPTER 1/7",
    title: "In-Page Floating Glass HUD",
    subtitle: "Real-time focus rating & workstream tagging injected via Shadow DOM",
    badge: "ZERO CONFLICTS",
  });

  await moveCursor(page, 960, 400);
  await page.waitForTimeout(1000);
  await moveCursor(page, 1820, 980);
  await syncTo(16.0);

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 3: Compact Glass HUD (16.0s - 23.5s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 3/8] Expanding Real Compact Glass HUD...");
  const host = page.locator("#atentiv-v3");
  const indicator = host.locator("#a-indicator");
  if (await indicator.isVisible()) {
    await moveCursor(page, 1840, 990, true);
    await indicator.click();
  }
  await page.waitForTimeout(800);
  await showBanner(page, {
    chapter: "CHAPTER 2/7",
    title: "Compact Glass HUD Cockpit",
    subtitle: "Live session duration, real-time focus gauge, and quick focus toggles",
    badge: "COMPACT COCKPIT",
  });

  const compactHUD = host.locator("#a-compact");
  await moveCursor(page, 1680, 850);
  await page.waitForTimeout(1200);
  await moveCursor(page, 1750, 920);
  await syncTo(23.5);

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 4: Full 3-Column Cockpit & Tab Grouping (23.5s - 32.0s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 4/8] Opening Full 3-Column Cockpit with Tab Workstream Grouping...");
  const expandBtn = compactHUD.locator("#c-expand");
  if (await expandBtn.isVisible()) {
    await moveCursor(page, 1870, 780, true);
    await expandBtn.click();
  }
  await page.waitForTimeout(800);
  await showBanner(page, {
    chapter: "CHAPTER 3/7",
    title: "Full 3-Column Glass Cockpit",
    subtitle: "Clustered workstreams, focus metrics, and tabs grouped by workstream",
    badge: "TAB GROUPING",
  });

  // Hover over Column 1 (Workstreams), Column 2 (Metrics), Column 3 (Open Tabs Grouped)
  await moveCursor(page, 450, 540);
  await page.waitForTimeout(1200);
  await moveCursor(page, 960, 540);
  await page.waitForTimeout(1200);
  await moveCursor(page, 1650, 240); // Focus on Group by Workstream selector
  await page.waitForTimeout(1200);

  // Close full HUD
  const closeFullBtn = host.locator("#f-close");
  if (await closeFullBtn.isVisible()) {
    await moveCursor(page, 1850, 160, true);
    await closeFullBtn.click();
  }
  await syncTo(32.0);

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 5: Toolbar Popup & Split-Screen Side Panel (32.0s - 40.0s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 5/8] Demonstrating Chrome Popup & Side Panel...");
  await page.evaluate((id) => {
    const popupWrap = document.createElement("div");
    popupWrap.id = "demo-popup-container";
    popupWrap.style.cssText = `
      position: fixed; top: 14px; right: 32px; width: 384px; height: 600px;
      border-radius: 16px; box-shadow: 0 32px 90px rgba(0, 0, 0, 0.85), 0 0 30px rgba(124, 60, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.18); overflow: hidden; z-index: 2147483640;
      animation: bannerIn 0.35s ease-out;
    `;
    popupWrap.innerHTML = `<iframe src="chrome-extension://${id}/index.html" style="width:100%; height:100%; border:none; background:#13151f;"></iframe>`;
    document.body.appendChild(popupWrap);
  }, extId);

  await showBanner(page, {
    chapter: "CHAPTER 4/7",
    title: "Chrome Toolbar Popup Surface",
    subtitle: "Instant focus quotient ring, active workstream, and quick productivity toggle",
    badge: "INSTANT POPUP",
  });
  await moveCursor(page, 1720, 220);
  await page.waitForTimeout(1500);
  await moveCursor(page, 1720, 480, true);
  await page.waitForTimeout(2000);

  // Remove popup container
  await page.evaluate(() => {
    document.getElementById("demo-popup-container")?.remove();
  });
  await syncTo(40.0);

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 6: Full Dashboard Scenic Home & Right Panel (40.0s - 61.5s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 6/8] Full Dashboard, Scenic Home & Right Panel Tab Groups...");
  await page.goto(`chrome-extension://${extId}/dashboard.html`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await injectOverlayTools(page);

  // Seed / Explore demo mode
  const exploreBtn = page.getByRole("button", { name: "Explore demo" });
  if (await exploreBtn.isVisible()) {
    await moveCursor(page, 1600, 26, true);
    await exploreBtn.click();
    await page.waitForTimeout(800);
  }

  await showBanner(page, {
    chapter: "DASHBOARD 1/3",
    title: "Scenic Home & Daily Focus Quotient",
    subtitle: "Dynamic greeting, attention heatmap, and focus streak ring",
    badge: "SCENIC HOME",
  });
  await moveCursor(page, 960, 380);
  await syncTo(48.5);

  // Focus on Right Panel Open Tabs & Workstream Grouping
  await showBanner(page, {
    chapter: "DASHBOARD 2/3",
    title: "Open Tabs Clustered by Workstream",
    subtitle: "Collapsible workstream cards, audio indicators, + Save snapshot, and 1-click restore",
    badge: "GROUP BY WORKSTREAM",
  });

  // Move to right panel Open Tabs
  await moveCursor(page, 1750, 140); // Dropdown: Group by Workstream
  await page.waitForTimeout(1000);
  await moveCursor(page, 1750, 210); // First group header (Design & Development)
  await page.waitForTimeout(1000);

  // Click "+ Save" button on the workstream cluster!
  console.log("  -> Clicking + Save on Workstream Group header to open Snapshot modal...");
  const saveClusterBtn = page.locator('.right-panel button:has-text("+ Save")').first();
  if (await saveClusterBtn.isVisible()) {
    await moveCursor(page, 1870, 210, true);
    await saveClusterBtn.click();
    await page.waitForTimeout(1500);

    // Close or save modal
    const cancelModal = page.locator('.modal button:has-text("Cancel"), .overlay button:has-text("Cancel"), button[aria-label="Close"]').first();
    if (await cancelModal.isVisible()) {
      await cancelModal.click();
      await page.waitForTimeout(600);
    } else {
      await page.evaluate(() => {
        const btn = document.querySelector('.overlay button.quiet, .modal button.quiet, button[aria-label="Close"]');
        if (btn) btn.click();
      });
      await page.waitForTimeout(400);
    }
  }

  // Ensure any lingering modal/overlay is closed
  await page.evaluate(() => {
    const btn = document.querySelector('.overlay button.quiet, button[aria-label="Close"]');
    if (btn) btn.click();
  });

  // Highlight Tab Groups section underneath
  await moveCursor(page, 1750, 480);
  await syncTo(61.5);

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 7: Audio Classification & Distraction Verification (61.5s - 78.0s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 7/8] Audio Classification & Distraction Subsystem (Exp 9 & 10)...");
  
  // Navigate to Audio Classification page
  const audioNavBtn = page.locator('.sidebar-nav button:has-text("Audio Classification"), .sidebar-nav button:has-text("Audio")').first();
  if (await audioNavBtn.isVisible()) {
    await moveCursor(page, 80, 440, true);
    await audioNavBtn.click({ force: true });
    await page.waitForTimeout(1200);
  }

  await showBanner(page, {
    chapter: "AUDIO INTELLIGENCE",
    title: "On-Device Audio Distraction Classification",
    subtitle: "Simulated Web Audio tone, lecture exception (FR-03), and entertainment distraction scoring",
    badge: "FASTTEXT AUDIO ML",
  });

  // 1. Trigger Tone Generator
  console.log("  -> Triggering Web Audio Tone Generator to verify live audible tab detection...");
  const playToneBtn = page.locator('button:has-text("Simulate Audible Tab Audio"), button:has-text("Play Audible Tone")').first();
  if (await playToneBtn.isVisible()) {
    await moveCursor(page, 520, 240, true);
    await playToneBtn.click();
    await page.waitForTimeout(1500);
  }

  // 2. Click MIT Lecture (Focus Aid)
  console.log("  -> Testing MIT Deep Learning Lecture Scenario...");
  const mitPresetBtn = page.locator('.audio-preset-btn:has-text("MIT Deep Learning Lecture")').first();
  if (await mitPresetBtn.isVisible()) {
    await moveCursor(page, 480, 420, true);
    await mitPresetBtn.click();
    await page.waitForTimeout(2000);
  }

  // 3. Click Twitch Stream (Distraction)
  console.log("  -> Testing Twitch GTA V Gaming Stream Scenario...");
  const twitchPresetBtn = page.locator('.audio-preset-btn:has-text("Twitch GTA V")').first();
  if (await twitchPresetBtn.isVisible()) {
    await moveCursor(page, 850, 420, true);
    await twitchPresetBtn.click();
    await page.waitForTimeout(2000);
  }

  // Scroll to inspect FastText Explainability Matrix
  await moveCursor(page, 960, 600);
  await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
  await page.waitForTimeout(1500);

  // Stop Tone
  const stopToneBtn = page.locator('button:has-text("Stop Audible Tone")').first();
  if (await stopToneBtn.isVisible()) {
    await stopToneBtn.click();
  }
  await syncTo(78.0);

  // ════════════════════════════════════════════════════════════════════════════
  // SCENE 8: Settings & Rules Engine (78.0s - 89.0s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[SCENE 8/8] Settings, Rules Engine & Privacy Exclusions...");
  const settingsNavBtn = page.locator('.sidebar-nav button:has-text("Settings")').first();
  if (await settingsNavBtn.isVisible()) {
    await moveCursor(page, 80, 520, true);
    await settingsNavBtn.click({ force: true });
    await page.waitForTimeout(1200);
  }

  await showBanner(page, {
    chapter: "CONFIGURATION",
    title: "Tracking Rules & Privacy Exclusions",
    subtitle: "Custom priority rules, domain exclusions, and 100% on-device IndexedDB storage",
    badge: "PRIVACY GUARANTEED",
  });

  // Click Tracking Rules sub-tab
  const rulesTab = page.locator('.settings-subnav-btn:has-text("Tracking Rules"), button:has-text("Tracking Rules")').first();
  if (await rulesTab.isVisible()) {
    await moveCursor(page, 320, 160, true);
    await rulesTab.click();
    await page.waitForTimeout(1500);
  }

  // Click Exclusions sub-tab
  const exclTab = page.locator('.settings-subnav-btn:has-text("Exclusions"), button:has-text("Exclusions")').first();
  if (await exclTab.isVisible()) {
    await moveCursor(page, 440, 160, true);
    await exclTab.click();
    await page.waitForTimeout(1500);
  }
  await syncTo(89.0);

  // ════════════════════════════════════════════════════════════════════════════
  // OUTRO: Architecture Invariants Card (89.0s - 98.0s)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[OUTRO] Rendering Architecture Invariants Card...");
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          background: radial-gradient(circle at 50% 25%, #181232 0%, #090a16 55%, #030408 100%);
          color: #ffffff;
          width: 100vw;
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .card {
          background: rgba(18, 22, 38, 0.92);
          border: 1px solid rgba(139, 92, 246, 0.45);
          border-radius: 24px;
          padding: 48px 64px;
          text-align: center;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8), 0 0 40px rgba(124, 60, 255, 0.2);
          max-width: 950px;
        }
        h2 {
          font-size: 54px;
          font-weight: 800;
          letter-spacing: -1.5px;
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 55%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 12px;
        }
        p {
          font-size: 20px;
          color: #94a3b8;
          margin-bottom: 36px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: left;
        }
        .item {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
        }
        .item h3 {
          font-size: 16px;
          font-weight: 700;
          color: #e2e8f0;
          margin-bottom: 8px;
        }
        .item span {
          font-size: 13px;
          color: #94a3b8;
          line-height: 1.5;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Atentiv — Browse Mindfully</h2>
        <p>The privacy-first focus companion designed for intentional web browsing.</p>
        <div class="grid">
          <div class="item">
            <h3>🔒 100% On-Device ML</h3>
            <span>Local FastText WASM inference and audio classification with zero remote API requests.</span>
          </div>
          <div class="item">
            <h3>🧭 Multi-Surface Cockpit</h3>
            <span>Seamless navigation across In-Page Glass HUD, Toolbar Popup, Sidepanel, and Dashboard.</span>
          </div>
          <div class="item">
            <h3>⚡ Privacy Invariant</h3>
            <span>100% on-device Dexie storage with instant local data export, reset, and zero telemetry.</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  await syncTo(98.5);

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

  // Transcode to high-quality MP4 with the master audio soundtrack using FFmpeg
  console.log("Compiling final 1080p MP4 with Master Voiceover Soundtrack using FFmpeg...");
  const ffmpegCmd = `ffmpeg -y -i "${rawWebmPath}" -i "${audioWavPath}" \
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p \
    -c:a aac -b:a 192k -shortest \
    "${finalOutputMp4}"`;

  execSync(ffmpegCmd, { stdio: "inherit" });

  const walkthroughMp4 = path.join(videoDir, "Atentiv_Full_Extension_Walkthrough.mp4");
  fs.copyFileSync(finalOutputMp4, walkthroughMp4);

  try {
    fs.rmSync(profile, { recursive: true, force: true });
  } catch {}

  const stats = fs.statSync(finalOutputMp4);
  console.log("\n==================================================================");
  console.log("  FULL PRODUCT DEMO WITH AUDIO VERIFICATION RENDERED SUCCESSFULLY!");
  console.log("==================================================================");
  console.log(`- Final MP4:       ${finalOutputMp4}`);
  console.log(`- Walkthrough MP4: ${walkthroughMp4}`);
  console.log(`- File Size:       ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log("==================================================================\n");
  console.log(`- File Size:   ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log("==================================================================\n");
}

recordTour().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});
