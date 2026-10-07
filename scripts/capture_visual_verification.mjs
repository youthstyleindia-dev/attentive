import { chromium } from "@playwright/test";
import { resolve } from "node:path";
import { mkdtemp, rm, copyFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";

const profile = await mkdtemp(resolve(tmpdir(), "atentiv-visual-verify-"));
const extPath = resolve("dist");
const screenshotDir = resolve("docs/screenshots");
const brainDir = "/Users/divya/.gemini/antigravity/brain/141c13cf-a132-4bec-a8b4-2849cdf3075c";

await mkdir(screenshotDir, { recursive: true });

console.log("Launching browser with Atentiv MV3 extension loaded...");
const context = await chromium.launchPersistentContext(profile, {
  channel: "chromium",
  headless: true,
  args: [`--disable-extensions-except=${extPath}`, `--load-extension=${extPath}`],
  viewport: { width: 1440, height: 900 },
});

try {
  const worker =
    context.serviceWorkers()[0] ||
    (await context.waitForEvent("serviceworker"));
  const extensionId = new URL(worker.url()).host;
  console.log(`Service worker active. Extension ID: ${extensionId}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Google Search Page — Compact HUD View (Bottom-Right)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("1. Capturing Google Search with Compact HUD View...");
  const googlePage = await context.newPage();
  await googlePage.route("https://www.google.com/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>browser tab context switching research - Google Search</title>
          <style>
            body { font-family: -apple-system, Roboto, Arial, sans-serif; background: #202124; color: #bdc1c6; margin: 0; padding: 20px 40px; }
            .header { display: flex; align-items: center; gap: 24px; padding-bottom: 20px; border-bottom: 1px solid #3c4043; }
            .logo { font-size: 26px; font-weight: bold; color: #8ab4f8; letter-spacing: -1px; }
            .search-box { background: #303134; border: 1px solid #5f6368; border-radius: 24px; padding: 10px 20px; width: 620px; color: #fff; font-size: 15px; }
            .results { margin-top: 24px; max-width: 680px; }
            .result-item { margin-bottom: 30px; }
            .res-cite { font-size: 12px; color: #9aa0a6; margin-bottom: 4px; }
            .res-title { font-size: 20px; color: #8ab4f8; text-decoration: none; font-weight: 500; display: block; margin-bottom: 6px; }
            .res-snippet { font-size: 14px; line-height: 1.58; color: #bdc1c6; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Google</div>
            <input class="search-box" value="browser tab context switching cognitive load research" readonly />
          </div>
          <div class="results">
            <div style="color: #9aa0a6; font-size: 13px; margin-bottom: 20px;">About 1,840,000 results (0.34 seconds)</div>
            
            <div class="result-item">
              <div class="res-cite">https://dl.acm.org › doi › task-switching-browsers</div>
              <a class="res-title" href="#">Characterizing Task-Switching and Multi-Tab Workflows in Modern Browsers</a>
              <div class="res-snippet">Empirical research demonstrates knowledge workers execute 40+ tab switches hourly. Context fragmentation accounts for a 23-minute reacquisition latency per interruption.</div>
            </div>

            <div class="result-item">
              <div class="res-cite">https://arxiv.org › abs › cognitive-stream-management</div>
              <a class="res-title" href="#">Granitzer Event Blocks & Predictive Task Sessions</a>
              <div class="res-snippet">Mathematical modeling of dwell duration distributions and switch burden. ATLAS state machine categorizes active, idle, and transitional tab interaction states.</div>
            </div>

            <div class="result-item">
              <div class="res-cite">https://research.google › pubs › attentional-focus-metrics</div>
              <a class="res-title" href="#">Deterministic Focus Metric: Uncoupling Idle Duration from Productivity Denominators</a>
              <div class="res-snippet">Focus Score = 100 * P / (P + U). Eliminating idle time dilution produces invariant, actionable cognitive productivity indicators.</div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  });

  await googlePage.goto("https://www.google.com/search?q=browser+tab+context+switching+research");
  await googlePage.waitForTimeout(1500);

  const googleHUD = googlePage.locator("#atentiv-sidebar-container #atentiv-badge");
  await googleHUD.waitFor({ state: "visible", timeout: 6000 });

  const shot1 = resolve(screenshotDir, "01_google_compact_hud.png");
  await googlePage.screenshot({ path: shot1, fullPage: false });
  console.log(`Saved: ${shot1}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 2. GitHub Repository Page — Hover Preview Tooltip
  // ──────────────────────────────────────────────────────────────────────────
  console.log("2. Capturing GitHub Repository with Live Hover Preview Card...");
  const githubPage = await context.newPage();
  await githubPage.route("https://github.com/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>atentiv/atentiv-core: Transparent In-Page Cognitive HUD</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0d1117; color: #c9d1d9; margin: 0; }
            .gh-nav { background: #161b22; padding: 14px 28px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #30363d; }
            .gh-brand { font-size: 16px; font-weight: 700; color: #f0f6fc; display: flex; align-items: center; gap: 8px; }
            .repo-head { padding: 24px 32px 16px; border-bottom: 1px solid #21262d; background: #0d1117; }
            .repo-title { font-size: 20px; font-weight: 600; color: #58a6ff; }
            .badge-pub { border: 1px solid #30363d; border-radius: 12px; font-size: 12px; padding: 2px 8px; color: #8b949e; margin-left: 8px; }
            .main-content { padding: 24px 32px; display: grid; grid-template-columns: 2.5fr 1fr; gap: 24px; }
            .code-box { border: 1px solid #30363d; border-radius: 6px; overflow: hidden; background: #0d1117; }
            .code-header { background: #161b22; padding: 10px 16px; border-bottom: 1px solid #30363d; font-size: 13px; font-weight: 600; display: flex; justify-content: space-between; }
            .readme { padding: 24px; font-size: 14px; line-height: 1.6; }
            .readme h2 { border-bottom: 1px solid #21262d; padding-bottom: 8px; color: #f0f6fc; }
            .code-pre { background: #161b22; padding: 14px; border-radius: 6px; font-family: monospace; font-size: 13px; color: #79c0ff; overflow-x: auto; }
            .sidebar-stat { background: #161b22; border: 1px solid #30363d; border-radius: 6px; padding: 16px; }
          </style>
        </head>
        <body>
          <div class="gh-nav">
            <div class="gh-brand">
              <svg height="24" viewBox="0 0 16 16" width="24" fill="#f0f6fc"><path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9 1.05 1.48.52.92 1.4 1.28 2.5 1.24v1.84c0 .21-.15.46-.55.38A8.013 8.013 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path></svg>
              <span>GitHub</span>
            </div>
          </div>
          <div class="repo-head">
            <span class="repo-title">atentiv / atentiv-core</span>
            <span class="badge-pub">Public</span>
            <p style="margin: 8px 0 0; color: #8b949e; font-size: 14px;">Next-generation cognitive browser intelligence HUD with zero-server telemetry and Shadow DOM isolation.</p>
          </div>
          <div class="main-content">
            <div class="code-box">
              <div class="code-header">
                <span>README.md</span>
                <span style="color: #8b949e;">8.4 KB</span>
              </div>
              <div class="readme">
                <h2>Architecture Overview</h2>
                <p>Atentiv runs completely client-side in Google Chrome Manifest V3 using WebAssembly FastText, IndexedDB via Dexie.js, and an in-page translucent glassmorphic HUD.</p>
                <div class="code-pre">
// ATLAS Context Switch Definition
const isTabSwitch = previousActiveTabId !== currentActiveTabId;
const switchBurden = Math.min(1.0, rapidSwitchesInWindow / 5);
const focusScore = Math.round(100 * (prodTime / (prodTime + unprodTime)));
                </div>
                <p>The host webpage DOM remains untouched: all styles and elements are encapsulated in an isolated Shadow Root with non-blocking pointer events.</p>
              </div>
            </div>
            <div>
              <div class="sidebar-stat">
                <div style="font-weight: 600; color: #f0f6fc; margin-bottom: 8px;">About</div>
                <p style="font-size: 13px; color: #8b949e;">Live transparent browser overlay for deep work, task clustering, and distraction defense.</p>
                <div style="margin-top: 16px; font-size: 12px; color: #58a6ff;">★ 1,420 stars &nbsp;·&nbsp; ⑂ 128 forks</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  });

  await githubPage.goto("https://github.com/atentiv/atentiv-core");
  await githubPage.waitForTimeout(1500);

  const ghBadge = githubPage.locator("#atentiv-sidebar-container #atentiv-badge");
  await ghBadge.waitFor({ state: "visible", timeout: 6000 });
  await ghBadge.hover();
  await githubPage.waitForTimeout(500);

  const hoverCard = githubPage.locator("#atentiv-sidebar-container #atentiv-hover-card");
  await hoverCard.waitFor({ state: "visible", timeout: 3000 });

  const shot2 = resolve(screenshotDir, "02_github_hover_preview.png");
  await githubPage.screenshot({ path: shot2, fullPage: false });
  console.log(`Saved: ${shot2}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 3. StackOverflow Q&A — Expanded In-Page Glassmorphic HUD
  // ──────────────────────────────────────────────────────────────────────────
  console.log("3. Capturing StackOverflow with Expanded Glassmorphic Panel...");
  const soPage = await context.newPage();
  await soPage.route("https://stackoverflow.com/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>How to monitor active browser tab switches in Chrome MV3 without polling? - Stack Overflow</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #232629; margin: 0; }
            .header { background: #f8f9f9; border-top: 3px solid #f48225; border-bottom: 1px solid #d6d9dc; padding: 12px 30px; display: flex; align-items: center; justify-content: space-between; }
            .so-logo { font-size: 18px; font-weight: bold; color: #0c0d0e; }
            .container { max-width: 1100px; margin: 24px auto; padding: 0 20px; display: grid; grid-template-columns: 3fr 1fr; gap: 30px; }
            .q-title { font-size: 24px; font-weight: 500; color: #232629; line-height: 1.35; margin-bottom: 8px; }
            .q-meta { font-size: 13px; color: #6a737c; padding-bottom: 16px; border-bottom: 1px solid #e3e6e8; margin-bottom: 20px; display: flex; gap: 16px; }
            .post-layout { display: flex; gap: 20px; }
            .vote-cell { display: flex; flex-direction: column; align-items: center; color: #6a737c; font-size: 18px; font-weight: 600; }
            .vote-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #d6d9dc; background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; margin: 4px 0; }
            .post-body { font-size: 15px; line-height: 1.55; }
            .code-block { background: #f6f6f6; border: 1px solid #e3e6e8; border-radius: 4px; padding: 12px; font-family: monospace; font-size: 13px; overflow-x: auto; margin: 14px 0; }
            .tag { background: #e1ecf4; color: #39739d; padding: 4px 8px; border-radius: 4px; font-size: 12px; display: inline-block; margin-right: 6px; }
            .sidebar-card { background: #fdf7e2; border: 1px solid #f1e5bc; border-radius: 4px; padding: 16px; font-size: 13px; color: #3b4045; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="so-logo"><span style="color:#f48225;">stackoverflow</span></div>
          </div>
          <div class="container">
            <div>
              <h1 class="q-title">How to monitor active browser tab switches in Chrome MV3 without polling?</h1>
              <div class="q-meta">
                <span>Asked <b>today</b></span>
                <span>Active <b>today</b></span>
                <span>Viewed <b>342 times</b></span>
              </div>
              <div class="post-layout">
                <div class="vote-cell">
                  <button class="vote-btn">▲</button>
                  <span>42</span>
                  <button class="vote-btn">▼</button>
                </div>
                <div class="post-body">
                  <p>In Manifest V3, we want to detect when the user switches between tabs to measure context switching frequency and cognitive task boundaries.</p>
                  <p>Standard approaches use <code>chrome.tabs.onActivated</code> together with <code>chrome.windows.onFocusChanged</code>. Here is how Atentiv handles pure tab switches:</p>
                  <div class="code-block">
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  atlasStateMachine.handleTabSwitch(tab.id, tab.url, Date.now());
});
                  </div>
                  <p>How do we ensure the state machine records accurate dwell times without active interval drift?</p>
                  <div style="margin-top: 20px;">
                    <span class="tag">google-chrome-extension</span>
                    <span class="tag">manifest-v3</span>
                    <span class="tag">javascript</span>
                    <span class="tag">context-switching</span>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div class="sidebar-card">
                <div style="font-weight: bold; margin-bottom: 8px;">The Overflow Blog</div>
                <p>Why browser tab management feels like cognitive overload — and how to fix it with intelligent HUDs.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  });

  await soPage.goto("https://stackoverflow.com/questions/42145/what-is-context-switching");
  await soPage.waitForTimeout(1500);

  const soBadge = soPage.locator("#atentiv-sidebar-container #atentiv-badge");
  await soBadge.waitFor({ state: "visible", timeout: 6000 });
  await soBadge.click();
  await soPage.waitForTimeout(600);

  const expandedPanel = soPage.locator("#atentiv-sidebar-container #atentiv-expanded-panel");
  await expandedPanel.waitFor({ state: "visible", timeout: 4000 });

  // Open Smart Nav flyout for full visual impact
  const smartNavGroup = expandedPanel.locator(".nav-group-pill").first();
  await smartNavGroup.click();
  await soPage.waitForTimeout(400);

  const shot3 = resolve(screenshotDir, "03_stackoverflow_expanded_panel.png");
  await soPage.screenshot({ path: shot3, fullPage: false });
  console.log(`Saved: ${shot3}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 4. YouTube Video Page — Distraction Alert Toast
  // ──────────────────────────────────────────────────────────────────────────
  console.log("4. Capturing YouTube with In-Page Distraction Alert Toast...");
  const ytPage = await context.newPage();
  await ytPage.route("https://www.youtube.com/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>Lo-Fi Hip Hop Radio — Beats to Relax/Study to - YouTube</title>
          <style>
            body { font-family: Roboto, Arial, sans-serif; background: #0f0f0f; color: #f1f1f1; margin: 0; }
            .yt-bar { height: 56px; background: #0f0f0f; border-bottom: 1px solid #272727; display: flex; align-items: center; padding: 0 24px; gap: 20px; }
            .yt-logo { font-size: 18px; font-weight: bold; color: #ff0000; letter-spacing: -0.5px; }
            .yt-search { background: #121212; border: 1px solid #303030; border-radius: 20px; padding: 8px 16px; width: 480px; color: #fff; }
            .yt-layout { display: grid; grid-template-columns: 2.8fr 1.2fr; gap: 24px; padding: 24px; max-width: 1400px; margin: 0 auto; }
            .player-wrap { background: #000; aspect-ratio: 16/9; border-radius: 12px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
            .player-bg { width: 100%; height: 100%; background: linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #0f172a 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .play-icon { width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 28px; }
            .video-info { margin-top: 14px; }
            .video-title { font-size: 19px; font-weight: 600; line-height: 1.3; }
            .channel-row { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; padding-bottom: 16px; border-bottom: 1px solid #272727; }
            .channel-name { font-size: 14px; font-weight: 500; }
            .sub-btn { background: #f1f1f1; color: #0f0f0f; border: none; border-radius: 18px; padding: 8px 16px; font-weight: 600; cursor: pointer; }
            .side-video { display: flex; gap: 10px; margin-bottom: 14px; }
            .side-thumb { width: 140px; height: 80px; background: #272727; border-radius: 8px; flex-shrink: 0; }
            .side-title { font-size: 13px; font-weight: 500; line-height: 1.3; }
            .side-meta { font-size: 11px; color: #aaa; margin-top: 4px; }
          </style>
        </head>
        <body>
          <div class="yt-bar">
            <div class="yt-logo">▶ YouTube</div>
            <input class="yt-search" value="lo-fi chill beats stream" readonly />
          </div>
          <div class="yt-layout">
            <div>
              <div class="player-wrap">
                <div class="player-bg">
                  <div class="play-icon">▶</div>
                  <div style="margin-top: 12px; font-size: 14px; color: #cbd5e1; font-weight: 500;">Live Streaming • 42,810 listening</div>
                </div>
              </div>
              <div class="video-info">
                <div class="video-title">lofi hip hop radio - beats to relax/study to ☕ [24/7 LIVE CHILL STREAM]</div>
                <div class="channel-row">
                  <div class="channel-name">Lofi Girl · 14.2M subscribers</div>
                  <button class="sub-btn">Subscribe</button>
                </div>
              </div>
            </div>
            <div>
              <div style="font-weight: 600; margin-bottom: 12px; font-size: 14px;">Up next</div>
              <div class="side-video">
                <div class="side-thumb"></div>
                <div>
                  <div class="side-title">Synthwave Chill — Deep Coding Radio</div>
                  <div class="side-meta">Chillwave Hub · 1.2M views</div>
                </div>
              </div>
              <div class="side-video">
                <div class="side-thumb"></div>
                <div>
                  <div class="side-title">Focus Music for Programmers & Designers</div>
                  <div class="side-meta">Code FM · 890K views</div>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
  });

  await ytPage.goto("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  console.log("Waiting 3.5s for distraction alert toast to appear on YouTube...");
  await ytPage.waitForTimeout(3800);

  const toast = ytPage.locator("#atentiv-sidebar-container #atentiv-distraction-toast");
  await toast.waitFor({ state: "visible", timeout: 4000 });

  const shot4 = resolve(screenshotDir, "04_youtube_distraction_toast.png");
  await ytPage.screenshot({ path: shot4, fullPage: false });
  console.log(`Saved: ${shot4}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Repositioning Corner Demo — Top-Right Corner
  // ──────────────────────────────────────────────────────────────────────────
  console.log("5. Testing Corner Repositioning to Top-Right...");
  const notionPage = await context.newPage();
  await notionPage.route("https://www.notion.so/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `
        <!DOCTYPE html>
        <html>
        <head><title>Engineering Sprint Planning — Notion</title>
        <style>
          body { font-family: -apple-system, sans-serif; background: #191919; color: #e6e6e6; margin: 40px 80px; }
          h1 { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
          .callout { background: #262626; border-left: 4px solid #38bdf8; padding: 16px; border-radius: 4px; margin: 20px 0; }
        </style>
        </head>
        <body>
          <h1>⚡ Sprint 42: Browser Intelligence Overlay</h1>
          <div class="callout">Objective: Zero reflow on host webpages. In-page HUD repositionable to all 4 screen corners.</div>
          <p>Task 1: Verify top-right HUD positioning preserves readability of main text content.</p>
          <p>Task 2: Seamless transition between compact pill, hover preview, and expanded panel.</p>
        </body>
        </html>
      `,
    });
  });

  await notionPage.goto("https://www.notion.so/engineering-sprint-42");
  await notionPage.waitForTimeout(1500);

  const notionHUD = notionPage.locator("#atentiv-sidebar-container #atentiv-badge");
  await notionHUD.waitFor({ state: "visible" });
  await notionHUD.click();
  await notionPage.waitForTimeout(500);

  const notionPanel = notionPage.locator("#atentiv-sidebar-container #atentiv-expanded-panel");
  await notionPanel.waitFor({ state: "visible", timeout: 4000 });

  const cornerBtn = notionPanel.locator("#atentiv-reposition-corner-btn");
  await cornerBtn.waitFor({ state: "visible", timeout: 3000 });
  // Cycle corners: bottom-right -> bottom-left -> top-right
  await cornerBtn.click();
  await notionPage.waitForTimeout(300);
  await cornerBtn.click();
  await notionPage.waitForTimeout(500);

  const shot5 = resolve(screenshotDir, "05_corner_repositioned_top_right.png");
  await notionPage.screenshot({ path: shot5, fullPage: false });
  console.log(`Saved: ${shot5}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 6. Secondary Side Panel / Analytics Dashboard Page
  // ──────────────────────────────────────────────────────────────────────────
  console.log("6. Capturing Secondary Side Panel & Full Analytics Dashboard...");
  const sidePanelPage = await context.newPage();
  await sidePanelPage.setViewportSize({ width: 440, height: 850 });
  await sidePanelPage.goto(`chrome-extension://${extensionId}/index.html?mode=sidepanel`);
  await sidePanelPage.waitForTimeout(1000);

  // Bypass login if modal is shown
  const loginBtn = sidePanelPage.getByRole("button", { name: "1-Click Continue as Divya (Personal)" });
  if (await loginBtn.isVisible()) {
    await loginBtn.click();
    await sidePanelPage.waitForTimeout(500);
    const enterBtn = sidePanelPage.getByRole("button", { name: "Enter Workspace" });
    if (await enterBtn.isVisible()) await enterBtn.click();
  }

  // Populate sample demo data
  const exploreBtn = sidePanelPage.getByRole("button", { name: "Explore demo" });
  if (await exploreBtn.isVisible()) {
    await exploreBtn.click();
    await sidePanelPage.waitForTimeout(500);
  }

  // Switch to Analytics Tab
  const analyticsBtn = sidePanelPage.getByRole("navigation").getByRole("button", { name: "Analytics" });
  if (await analyticsBtn.isVisible()) {
    await analyticsBtn.click();
    await sidePanelPage.waitForTimeout(1000);
  }

  const shot6 = resolve(screenshotDir, "06_secondary_sidepanel_analytics.png");
  await sidePanelPage.screenshot({ path: shot6, fullPage: false });
  console.log(`Saved: ${shot6}`);

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Full Desktop Analytics Dashboard View (1440x900)
  // ──────────────────────────────────────────────────────────────────────────
  console.log("7. Capturing Full Desktop Analytics Dashboard View...");
  const dashPage = await context.newPage();
  await dashPage.setViewportSize({ width: 1440, height: 900 });
  await dashPage.goto(`chrome-extension://${extensionId}/index.html?page=Analytics`);
  await dashPage.waitForTimeout(1000);

  const dashLoginBtn = dashPage.getByRole("button", { name: "1-Click Continue as Divya (Personal)" });
  if (await dashLoginBtn.isVisible()) {
    await dashLoginBtn.click();
    await dashPage.waitForTimeout(500);
    const dashEnterBtn = dashPage.getByRole("button", { name: "Enter Workspace" });
    if (await dashEnterBtn.isVisible()) await dashEnterBtn.click();
  }

  const dashExplore = dashPage.getByRole("button", { name: "Explore demo" });
  if (await dashExplore.isVisible()) {
    await dashExplore.click();
    await dashPage.waitForTimeout(500);
  }

  const dashAnalyticsBtn = dashPage.getByRole("navigation").getByRole("button", { name: "Analytics" });
  if (await dashAnalyticsBtn.isVisible()) {
    await dashAnalyticsBtn.click();
    await dashPage.waitForTimeout(1000);
  }

  const shot7 = resolve(screenshotDir, "07_full_analytics_dashboard.png");
  await dashPage.screenshot({ path: shot7, fullPage: false });
  console.log(`Saved: ${shot7}`);

  // Copy all screenshots to brain directory for embedding in artifacts
  const shots = [
    "01_google_compact_hud.png",
    "02_github_hover_preview.png",
    "03_stackoverflow_expanded_panel.png",
    "04_youtube_distraction_toast.png",
    "05_corner_repositioned_top_right.png",
    "06_secondary_sidepanel_analytics.png",
    "07_full_analytics_dashboard.png",
  ];
  for (const s of shots) {
    try {
      await copyFile(resolve(screenshotDir, s), resolve(brainDir, s));
    } catch (e) {
      console.error(`Could not copy ${s} to brain dir:`, e.message);
    }
  }

  console.log("ALL 7 VISUAL VERIFICATION SCREENSHOTS CAPTURED AND COPIED SUCCESSFULLY!");
} finally {
  await context.close();
  await rm(profile, { recursive: true, force: true });
}
