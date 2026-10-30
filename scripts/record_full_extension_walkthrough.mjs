import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const projectRoot = process.cwd();
const rawRecordDir = path.join(projectRoot, "scripts/demo_video/raw_full_walkthrough");
const finalOutputMp4 = path.join(projectRoot, "Atentiv_Full_Extension_Walkthrough.mp4");

// Clean and prepare output folder
if (fs.existsSync(rawRecordDir)) {
  fs.rmSync(rawRecordDir, { recursive: true, force: true });
}
fs.mkdirSync(rawRecordDir, { recursive: true });

const profile = path.resolve(os.tmpdir(), "atentiv-full-tour-profile-" + Date.now());
const extPath = path.resolve(projectRoot, "dist");

console.log("==================================================================");
console.log("  ATENTIV FULL EXTENSION COMPLETE PRODUCT WALKTHROUGH RECORDER");
console.log("==================================================================");
console.log(`- Extension Path:  ${extPath}`);
console.log(`- Recording Size:  1920 x 1080 (Full HD, 60fps)`);
console.log(`- Output Target:   ${finalOutputMp4}`);
console.log("==================================================================\n");

// Helper to inject virtual pointer & chapter banners
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
        z-index: 2147483645;
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 10px 24px;
        background: rgba(11, 15, 25, 0.92);
        border: 1px solid rgba(139, 92, 246, 0.45);
        border-radius: 9999px;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), 0 0 24px rgba(124, 60, 255, 0.25);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        pointer-events: none;
        animation: bannerIn 0.4s ease-out;
      `;
      document.body.appendChild(b);
    }
    b.innerHTML = `
      <span style="background:linear-gradient(135deg, #7c3aed, #06b6d4); color:#ffffff; font-size:11px; font-weight:800; padding:4px 10px; border-radius:9999px; text-transform:uppercase; letter-spacing:0.5px;">${chapter}</span>
      <span style="color:#ffffff; font-size:15px; font-weight:700; letter-spacing:-0.2px;">${title}</span>
      <div style="width:1px; height:18px; background:rgba(255,255,255,0.18);"></div>
      <span style="color:#94a3b8; font-size:13px; font-weight:500;">${subtitle}</span>
      <span style="background:rgba(16, 185, 129, 0.15); color:#10b981; border:1px solid rgba(16,185,129,0.3); font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px; text-transform:uppercase; margin-left:4px;">${badge}</span>
    `;
  }, { chapter, title, subtitle, badge });
}

async function moveCursor(page, x, y, click = false) {
  await page.evaluate(({ x, y, click }) => {
    const cur = document.getElementById("atentiv-v-cursor");
    if (cur) {
      cur.style.left = `${x}px`;
      cur.style.top = `${y}px`;
    }
    if (click && window.__atentivClickRipple) {
      setTimeout(() => window.__atentivClickRipple(x, y), 350);
    }
  }, { x, y, click });
  await page.waitForTimeout(450);
}

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

  const worker =
    context.serviceWorkers()[0] ||
    (await context.waitForEvent("serviceworker", { timeout: 15000 }));
  const extId = new URL(worker.url()).host;
  console.log(`✓ Service Worker active. Real Extension ID: ${extId}`);

  const page = await context.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  // ════════════════════════════════════════════════════════════════════════════
  // INTRO SCENE: Title & Product Overview Card
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[INTRO] Rendering Atentiv Master Product Intro...");
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
          font-size: 84px;
          font-weight: 800;
          letter-spacing: -2px;
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 55%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 18px;
          z-index: 2;
        }
        p {
          font-size: 26px;
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
        .dot { width: 10px; height: 10px; border-radius: 50%; background: #10b981; }
      </style>
    </head>
    <body>
      <div class="grid-bg"></div>
      <div class="badge">ATENTIV V1.0.1 • OFFICIAL PRODUCT TOUR</div>
      <h1>Intelligent Focus Architecture</h1>
      <p>Privacy-Preserving On-Device AI Focus Assistant with Seamless Multi-Surface Chrome Navigation & FastText WASM Categorization.</p>
      <div class="pills">
        <div class="pill"><span class="dot"></span> 100% Local FastText Machine Learning</div>
        <div class="pill"><span class="dot"></span> Transparent Glass HUD Cockpit</div>
        <div class="pill"><span class="dot"></span> Chrome Side Panel & Toolbar Popup</div>
        <div class="pill"><span class="dot"></span> Zero Remote Telemetry</div>
      </div>
    </body>
    </html>
  `);
  await page.waitForTimeout(4500);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 1: Live Web Browsing & Floating Focus Pill
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 1/8] Live Web Browsing & Floating Focus Pill (GitHub)...");
  await page.goto("https://github.com", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  await injectOverlayTools(page);
  await showBanner(page, {
    chapter: "CHAPTER 1/8",
    title: "In-Page Floating Glass HUD",
    subtitle: "Real-time focus rating & workstream tagging injected via Shadow DOM",
    badge: "ZERO DOM CONFLICTS",
  });

  // Move cursor from top of page towards the bottom-right floating pill
  await moveCursor(page, 960, 400);
  await page.waitForTimeout(1000);
  await moveCursor(page, 1820, 980);
  await page.waitForTimeout(1500);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 2: Expanding Compact Glass HUD
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 2/8] Expanding Real Compact Glass HUD...");
  const host = page.locator("#atentiv-v3");
  const indicator = host.locator("#a-indicator");
  if (await indicator.isVisible()) {
    await moveCursor(page, 1840, 990, true);
    await indicator.click();
  }
  await page.waitForTimeout(1000);
  await showBanner(page, {
    chapter: "CHAPTER 2/8",
    title: "Compact Glass HUD Cockpit",
    subtitle: "Live session duration, real-time focus gauge, and quick focus toggles",
    badge: "INTERACTIVE GLASS HUD",
  });

  const compactHUD = host.locator("#a-compact");
  await moveCursor(page, 1680, 850);
  await page.waitForTimeout(1500);
  await moveCursor(page, 1750, 920);
  await page.waitForTimeout(1500);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 3: Opening Full 3-Column Glass HUD Cockpit
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 3/8] Opening Full 3-Column Glass HUD Cockpit...");
  const expandBtn = compactHUD.locator("#c-expand");
  if (await expandBtn.isVisible()) {
    await moveCursor(page, 1870, 780, true);
    await expandBtn.click();
  }
  await page.waitForTimeout(1000);
  await showBanner(page, {
    chapter: "CHAPTER 3/8",
    title: "Full 3-Column Cockpit Overlay",
    subtitle: "Deep contextual workstream tags, domain rules, and recent distraction log",
    badge: "FULL COCKPIT",
  });

  // Hover over Column 1 (Workstreams), Column 2 (Metrics), Column 3 (Domain Rules)
  await moveCursor(page, 450, 540);
  await page.waitForTimeout(1400);
  await moveCursor(page, 960, 540);
  await page.waitForTimeout(1400);
  await moveCursor(page, 1480, 540);
  await page.waitForTimeout(2000);

  // Close full HUD
  const closeFullBtn = host.locator("#f-close");
  if (await closeFullBtn.isVisible()) {
    await moveCursor(page, 1850, 160, true);
    await closeFullBtn.click();
    await page.waitForTimeout(800);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 4: Chrome Extension Toolbar Popup (index.html)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 4/8] Demonstrating Extension Toolbar Popup (index.html)...");
  // Embed realistic popup frame on active web page to simulate clicking extension toolbar icon
  await page.evaluate((id) => {
    const popupWrap = document.createElement("div");
    popupWrap.id = "demo-popup-container";
    popupWrap.style.cssText = `
      position: fixed;
      top: 14px;
      right: 32px;
      width: 384px;
      height: 600px;
      border-radius: 16px;
      box-shadow: 0 32px 90px rgba(0, 0, 0, 0.85), 0 0 30px rgba(124, 60, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.18);
      overflow: hidden;
      z-index: 2147483640;
      animation: bannerIn 0.35s ease-out;
    `;
    popupWrap.innerHTML = `
      <iframe src="chrome-extension://${id}/index.html" style="width:100%; height:100%; border:none; background:#13151f;"></iframe>
    `;
    document.body.appendChild(popupWrap);
  }, extId);

  await showBanner(page, {
    chapter: "CHAPTER 4/8",
    title: "Chrome Toolbar Popup Surface",
    subtitle: "Instant focus quotient ring, active workstream, and quick productivity toggle",
    badge: "INSTANT POPUP",
  });
  await moveCursor(page, 1720, 120);
  await page.waitForTimeout(1500);
  await moveCursor(page, 1720, 240, true);
  await page.waitForTimeout(1500);
  await moveCursor(page, 1720, 520, true);
  await page.waitForTimeout(2000);

  // Remove popup container
  await page.evaluate(() => {
    document.getElementById("demo-popup-container")?.remove();
  });
  await page.waitForTimeout(600);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 5: Chrome Side Panel Companion (sidepanel.html)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 5/8] Demonstrating Chrome Side Panel Companion (sidepanel.html)...");
  await page.evaluate((id) => {
    const spWrap = document.createElement("div");
    spWrap.id = "demo-sidepanel-container";
    spWrap.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 440px;
      height: 100vh;
      border-left: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: -20px 0 60px rgba(0, 0, 0, 0.7);
      overflow: hidden;
      z-index: 2147483640;
      animation: bannerIn 0.35s ease-out;
    `;
    spWrap.innerHTML = `
      <iframe src="chrome-extension://${id}/sidepanel.html" style="width:100%; height:100%; border:none; background:#13151f;"></iframe>
    `;
    document.body.appendChild(spWrap);
  }, extId);

  await showBanner(page, {
    chapter: "CHAPTER 5/8",
    title: "Dedicated Chrome Side Panel",
    subtitle: "Continuous split-screen productivity companion docked alongside your browsing",
    badge: "SPLIT-SCREEN COMPANION",
  });
  await moveCursor(page, 1700, 200);
  await page.waitForTimeout(1800);
  await moveCursor(page, 1700, 420);
  await page.waitForTimeout(1800);
  await moveCursor(page, 1700, 720);
  await page.waitForTimeout(2000);

  // Remove side panel container
  await page.evaluate(() => {
    document.getElementById("demo-sidepanel-container")?.remove();
  });
  await page.waitForTimeout(600);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 6: Full-Screen Analytics Dashboard & All Navigation Pages (dashboard.html)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 6/8] Full Dashboard Cockpit & Navigation Tour...");
  await page.goto(`chrome-extension://${extId}/dashboard.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1200);
  await injectOverlayTools(page);

  // Step 6A: Explore Demo Workspace Data
  const exploreBtn = page.getByRole("button", { name: "Explore demo" });
  if (await exploreBtn.isVisible()) {
    await moveCursor(page, 1600, 26, true);
    await exploreBtn.click();
    await page.waitForTimeout(1000);
  }

  // Tour through Dashboard Tabs:
  // Tab 1: Home (Scenic View)
  await showBanner(page, {
    chapter: "DASHBOARD 1/7",
    title: "Home & Focus Kick-Off",
    subtitle: "Daily focus score, focus streak, inspirational quotes, and quick launcher",
    badge: "SCENIC DASHBOARD",
  });
  const homeBtn = page.locator('.sidebar-nav button:has-text("Home")').first();
  if (await homeBtn.isVisible()) {
    await moveCursor(page, 80, 160, true);
    await homeBtn.click();
    await page.waitForTimeout(2500);
  }

  // Tab 2: Overview (KPIs & Metrics)
  await showBanner(page, {
    chapter: "DASHBOARD 2/7",
    title: "Overview & Attention Analytics",
    subtitle: "Focus Score (88/100), Active Coverage (94%), Context Switch Rate, and Time Distribution",
    badge: "EXECUTIVE METRICS",
  });
  const overviewBtn = page.locator('.sidebar-nav button:has-text("Overview")').first();
  if (await overviewBtn.isVisible()) {
    await moveCursor(page, 80, 200, true);
    await overviewBtn.click();
    await page.waitForTimeout(3000);
  }

  // Tab 3: Workstreams (Semantic Map)
  await showBanner(page, {
    chapter: "DASHBOARD 3/7",
    title: "Workstream Intelligence Map",
    subtitle: "Interactive SVG graph clustering browsing threads: Coding, Research, Communication",
    badge: "SEMANTIC CLUSTERING",
  });
  const wsBtn = page.locator('.sidebar-nav button:has-text("Workstreams")').first();
  if (await wsBtn.isVisible()) {
    await moveCursor(page, 80, 280, true);
    await wsBtn.click();
    await page.waitForTimeout(2000);
    // Interact with workstream map
    await moveCursor(page, 650, 420);
    await page.waitForTimeout(1200);
    await moveCursor(page, 920, 360);
    await page.waitForTimeout(1200);
  }

  // Tab 4: Analytics (Deep Visual Charts)
  await showBanner(page, {
    chapter: "DASHBOARD 4/7",
    title: "Deep Productivity Analytics",
    subtitle: "Hourly attention heatmaps, category splits, and productive dwell time charts",
    badge: "DEEP ANALYTICS",
  });
  const analyticsBtn = page.locator('.sidebar-nav button:has-text("Analytics")').first();
  if (await analyticsBtn.isVisible()) {
    await moveCursor(page, 80, 320, true);
    await analyticsBtn.click();
    await page.waitForTimeout(3200);
  }

  // Tab 5: Productive Sites & Rules Engine
  await showBanner(page, {
    chapter: "DASHBOARD 5/7",
    title: "Productive Sites & Custom Rules",
    subtitle: "Fine-grained domain overrides, custom category weights, and distraction thresholds",
    badge: "RULES ENGINE",
  });
  const sitesBtn = page.locator('.sidebar-nav button:has-text("Productive Sites")').first();
  if (await sitesBtn.isVisible()) {
    await moveCursor(page, 80, 360, true);
    await sitesBtn.click();
    await page.waitForTimeout(2800);
  }

  // Tab 6: Decision Traces (Explainable AI)
  await showBanner(page, {
    chapter: "DASHBOARD 6/7",
    title: "On-Device ML Decision Traces",
    subtitle: "Explainable AI audit log: inspect FastText prediction confidence, tokens & features",
    badge: "EXPLAINABLE ML",
  });
  const tracesBtn = page.locator('.sidebar-nav button:has-text("Decision traces")').first();
  if (await tracesBtn.isVisible()) {
    await moveCursor(page, 80, 400, true);
    await tracesBtn.click();
    await page.waitForTimeout(3000);
  }

  // Tab 7: Context Resume (Workspace Snapshots)
  await showBanner(page, {
    chapter: "DASHBOARD 7/7",
    title: "Context Resume & Session Snapshots",
    subtitle: "Save and restore complex multi-tab research sessions with a single click",
    badge: "CONTEXT RESUME",
  });
  const resumeBtn = page.locator('.sidebar-nav button:has-text("Context resume")').first();
  if (await resumeBtn.isVisible()) {
    await moveCursor(page, 80, 480, true);
    await resumeBtn.click();
    await page.waitForTimeout(2800);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 7: Background Audio Classification & FastText WASM Distraction Scoring
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 7/8] Live Audio Classification & FastText Scoring...");
  const audioPage = await context.newPage();
  await audioPage.setViewportSize({ width: 1920, height: 1080 });
  await audioPage.goto(`chrome-extension://${extId}/audio-test.html`, {
    waitUntil: "networkidle",
  });
  await audioPage.waitForTimeout(1200);
  await injectOverlayTools(audioPage);

  await showBanner(audioPage, {
    chapter: "CHAPTER 6/8",
    title: "On-Device Audio Distraction Classifier",
    subtitle: "Real-time FastText WASM scoring: Focus Aid (Lecture) vs Distracting Media (Gaming)",
    badge: "AUDIO CLASSIFICATION",
  });

  // Play MIT Deep Learning Lecture (Focus Aid)
  console.log("  -> Testing MIT Deep Learning Lecture (Focus Aid)...");
  await moveCursor(audioPage, 620, 280, true);
  await audioPage.click("#play-edu");
  await audioPage.waitForTimeout(2500);

  // Switch to Twitch GTA V Stream (Distraction)
  console.log("  -> Testing Twitch GTA V Gaming Stream (Distraction)...");
  await moveCursor(audioPage, 840, 280, true);
  await audioPage.click("#play-ent");
  await audioPage.waitForTimeout(2500);

  await audioPage.close();
  await page.bringToFront();
  await page.waitForTimeout(1000);

  // ════════════════════════════════════════════════════════════════════════════
  // STAGE 8: Product UI Showcase & Design System (showcase.html)
  // ════════════════════════════════════════════════════════════════════════════
  console.log("\n[STAGE 8/8] Product UI Showcase & Design Tokens (showcase.html)...");
  await page.goto(`chrome-extension://${extId}/showcase.html`, {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1000);
  await injectOverlayTools(page);
  await showBanner(page, {
    chapter: "CHAPTER 7/8",
    title: "Atentiv Design System & Tokens",
    subtitle: "Dark glassmorphic styling, semantic colors, and modular HUD components",
    badge: "DESIGN SYSTEM",
  });

  // Smooth scroll through showcase page
  await moveCursor(page, 960, 400);
  await page.evaluate(() => window.scrollBy({ top: 500, behavior: "smooth" }));
  await page.waitForTimeout(1800);
  await page.evaluate(() => window.scrollBy({ top: 600, behavior: "smooth" }));
  await page.waitForTimeout(1800);

  // ════════════════════════════════════════════════════════════════════════════
  // OUTRO: Architecture & Security Invariants
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
          max-width: 900px;
        }
        h2 {
          font-size: 52px;
          font-weight: 800;
          letter-spacing: -1.5px;
          background: linear-gradient(135deg, #ffffff 0%, #c4b5fd 60%, #38bdf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 18px;
        }
        p {
          font-size: 20px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 32px;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          text-align: left;
        }
        .item {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 20px;
        }
        .item h3 { font-size: 16px; color: #a78bfa; margin-bottom: 6px; }
        .item span { font-size: 13px; color: #cbd5e1; line-height: 1.4; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>Atentiv — Browse Mindfully</h2>
        <p>The privacy-first focus companion designed for the modern web.</p>
        <div class="grid">
          <div class="item">
            <h3>🔒 100% On-Device</h3>
            <span>Local FastText WASM model with zero remote API requests or data leaks.</span>
          </div>
          <div class="item">
            <h3>🧭 Multi-Surface</h3>
            <span>Seamless navigation across In-Page HUD, Popup, Sidepanel, and Dashboard.</span>
          </div>
          <div class="item">
            <h3>⚡ Privacy Invariant</h3>
            <span>Auditable SQLite/Dexie storage with instant local data export & purge.</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  await page.waitForTimeout(4000);

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
  console.log("  FULL EXTENSION TOUR VIDEO RECORDED & RENDERED SUCCESSFULLY!");
  console.log("==================================================================");
  console.log(`- Final MP4:   ${finalOutputMp4}`);
  console.log(`- File Size:   ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log("==================================================================\n");
}

recordTour().catch((err) => {
  console.error("Recording failed:", err);
  process.exit(1);
});
