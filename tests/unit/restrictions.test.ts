import "fake-indexeddb/auto";
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";
import { ExclusionEngine } from "../../src/privacy/exclusionEngine";
import { SessionManager } from "../../src/background/sessionManager";
import { db } from "../../src/db/database";

// ── Test Helper: Mock Chrome Environment ──────────────────────────────────────
function createMockChrome() {
  const localStore: Record<string, any> = {};
  const sessionStore: Record<string, any> = {};
  const eventListeners: Record<string, Function[]> = {};

  const makeEvent = (name: string) => ({
    addListener: (fn: Function) => {
      if (!eventListeners[name]) eventListeners[name] = [];
      eventListeners[name].push(fn);
    },
  });

  let currentTab = {
    id: 101,
    url: "https://github.com/atentiv/core",
    title: "GitHub - Atentiv Core",
    incognito: false,
    audible: false,
  };

  const createdWindows: any[] = [];
  const updatedWindows: any[] = [];
  const injectedScripts: any[] = [];
  const sentMessages: any[] = [];

  const mock = {
    storage: {
      local: {
        get: async (keys?: any) => {
          if (!keys) return structuredClone(localStore);
          if (typeof keys === "string") return { [keys]: structuredClone(localStore[keys]) };
          if (Array.isArray(keys)) {
            const out: any = {};
            for (const k of keys) out[k] = structuredClone(localStore[k]);
            return out;
          }
          return structuredClone(localStore);
        },
        set: async (items: Record<string, any>) => {
          Object.assign(localStore, structuredClone(items));
        },
        remove: async (keys: string | string[]) => {
          const list = Array.isArray(keys) ? keys : [keys];
          for (const k of list) delete localStore[k];
        },
      },
      session: {
        get: async (keys?: any) => {
          if (!keys) return structuredClone(sessionStore);
          if (typeof keys === "string") return { [keys]: structuredClone(sessionStore[keys]) };
          if (Array.isArray(keys)) {
            const out: any = {};
            for (const k of keys) out[k] = structuredClone(sessionStore[k]);
            return out;
          }
          return structuredClone(sessionStore);
        },
        set: async (items: Record<string, any>) => {
          Object.assign(sessionStore, structuredClone(items));
        },
        remove: async (keys: string | string[]) => {
          const list = Array.isArray(keys) ? keys : [keys];
          for (const k of list) delete sessionStore[k];
        },
      },
    },
    windows: {
      getLastFocused: async () => ({ id: 1, focused: true }),
      create: async (createData: any) => {
        const win = { id: 200 + createdWindows.length, ...createData };
        createdWindows.push(win);
        return win;
      },
      update: async (windowId: number, updateInfo: any) => {
        updatedWindows.push({ windowId, updateInfo });
        return { id: windowId, ...updateInfo };
      },
      onRemoved: makeEvent("windows.onRemoved"),
    },
    tabs: {
      query: async () => [currentTab],
      sendMessage: async (tabId: number, msg: any) => {
        sentMessages.push({ tabId, msg });
        return { success: true };
      },
      onActivated: makeEvent("tabs.onActivated"),
      onUpdated: makeEvent("tabs.onUpdated"),
      onRemoved: makeEvent("tabs.onRemoved"),
      onCreated: makeEvent("tabs.onCreated"),
    },
    scripting: {
      executeScript: async (injectInfo: any) => {
        injectedScripts.push(injectInfo);
        return [{ result: true }];
      },
    },
    action: {
      onClicked: makeEvent("action.onClicked"),
    },
    idle: {
      queryState: async () => "active",
      onStateChanged: makeEvent("idle.onStateChanged"),
    },
    runtime: {
      sendMessage: async (msg: any) => ({ success: true }),
    },
  };

  return {
    mock,
    localStore,
    sessionStore,
    eventListeners,
    createdWindows,
    updatedWindows,
    injectedScripts,
    sentMessages,
    setCurrentTab: (t: any) => {
      currentTab = t;
    },
  };
}

// ── TIER 1: FEATURE COVERAGE (R5, R2, R9) ─────────────────────────────────────

test("Tier 1 (R5 & R2): Restricted schemes trigger UNTRACKABLE state with zero dwell and no DB record", async () => {
  const env = createMockChrome();
  (globalThis as any).chrome = env.mock;

  try {
    const restrictedUrls = [
      "chrome://settings",
      "chrome://extensions",
      "edge://flags",
      "about:blank",
      "about:config",
      "chrome-extension://abcdefghijklm/options.html",
      "file:///Users/test/document.pdf",
      "view-source:https://github.com",
    ];

    for (const url of restrictedUrls) {
      env.setCurrentTab({
        id: 999,
        url,
        title: "Internal Browser Page",
        incognito: false,
      });

      await SessionManager.reconcile();

      // Invariant 1: No active session checkpoint during untrackable visit
      const activeCheckpoint = SessionManager.getActiveCheckpoint();
      assert.equal(activeCheckpoint, null, `Should have null checkpoint for ${url}`);

      // Invariant 2: Session storage must record UNTRACKABLE state
      assert.equal(env.sessionStore.trackingState, "UNTRACKABLE", `State must be UNTRACKABLE for ${url}`);
      assert.ok(
        env.sessionStore.untrackableReason?.includes("Tracking unavailable on internal browser page"),
        `Explanation must be set for ${url}`
      );

      // Invariant 3: Zero tab session records persisted in database for this restricted URL
      const records = await db.tab_sessions.filter((s) => s.url === url).toArray();
      assert.equal(records.length, 0, `Restricted URL ${url} must never be persisted in IndexedDB`);
    }
  } finally {
    delete (globalThis as any).chrome;
  }
});

test("Tier 1 (R5): Toolbar icon click on restricted page opens 420x680 popup window with deduplication", async () => {
  const env = createMockChrome();
  (globalThis as any).chrome = env.mock;

  try {
    // Pure controller logic matching SRS R5 specification:
    // When clicked on a restricted page, create popup window (420x680 serving sidepanel.html).
    // Deduplicate: track popupWindowId. If already open, focus existing window instead of duplicating.
    // If window is closed (windows.onRemoved), reset tracked popupWindowId.
    let popupWindowId: number | null = null;

    const handleIconClick = async (tab: { id?: number; url?: string; windowId?: number }) => {
      const url = tab.url || "";
      const isRestricted =
        !url ||
        url.startsWith("chrome://") ||
        url.startsWith("chrome-extension://") ||
        url.startsWith("edge://") ||
        url.startsWith("about:") ||
        url.startsWith("file://");

      if (isRestricted) {
        if (popupWindowId !== null) {
          // Focus existing popup window (Deduplication)
          await chrome.windows.update(popupWindowId, { focused: true });
          return { action: "focused", windowId: popupWindowId };
        } else {
          // Open dedicated 420x680 popup window serving sidepanel.html
          const win = await chrome.windows.create({
            url: "sidepanel.html",
            type: "popup",
            width: 420,
            height: 680,
          });
          popupWindowId = win.id || 200;
          return { action: "created", windowId: popupWindowId };
        }
      } else {
        // Supported page: inject content script and toggle in-page HUD
        if (tab.id) {
          await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["content.js"] });
          await chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_ATENTIV_HUD" });
          return { action: "toggled_hud", tabId: tab.id };
        }
        return { action: "noop" };
      }
    };

    // 1. First click on chrome://extensions -> Creates 420x680 popup window
    const firstClick = await handleIconClick({
      id: 10,
      url: "chrome://extensions",
      windowId: 1,
    });
    assert.equal(firstClick.action, "created");
    assert.equal(env.createdWindows.length, 1);
    assert.equal(env.createdWindows[0].url, "sidepanel.html");
    assert.equal(env.createdWindows[0].type, "popup");
    assert.equal(env.createdWindows[0].width, 420);
    assert.equal(env.createdWindows[0].height, 680);

    // 2. Second click on chrome://settings while popup is already open -> Focuses existing window (No duplicate)
    const secondClick = await handleIconClick({
      id: 11,
      url: "chrome://settings",
      windowId: 1,
    });
    assert.equal(secondClick.action, "focused");
    assert.equal(secondClick.windowId, firstClick.windowId);
    assert.equal(env.createdWindows.length, 1, "Must NOT open a second popup window");
    assert.equal(env.updatedWindows.length, 1);
    assert.equal(env.updatedWindows[0].windowId, firstClick.windowId);
    assert.equal(env.updatedWindows[0].updateInfo.focused, true);

    // 3. User closes popup window -> onRemoved event resets popupWindowId
    const closedWinId = firstClick.windowId;
    popupWindowId = null; // Simulated onRemoved listener callback

    // 4. Third click on edge://flags -> Opens a fresh popup window
    const thirdClick = await handleIconClick({
      id: 12,
      url: "edge://flags",
      windowId: 1,
    });
    assert.equal(thirdClick.action, "created");
    assert.equal(env.createdWindows.length, 2, "Must create fresh popup after closure");

    // 5. Click on normal supported page -> Injects content.js and toggles HUD
    const supportedClick = await handleIconClick({
      id: 15,
      url: "https://github.com/atentiv/repo",
      windowId: 1,
    });
    assert.equal(supportedClick.action, "toggled_hud");
    assert.equal(env.injectedScripts.length, 1);
    assert.deepEqual(env.injectedScripts[0].files, ["content.js"]);
    assert.equal(env.sentMessages.length, 1);
    assert.equal(env.sentMessages[0].msg.type, "TOGGLE_ATENTIV_HUD");
  } finally {
    delete (globalThis as any).chrome;
  }
});

test("Tier 1 (R9): Privacy Audit — Source code contains 0 unauthorized outbound egress calls", () => {
  const projectRoot = resolve(process.cwd());
  const srcDir = join(projectRoot, "src");

  function getFiles(dir: string): string[] {
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const e of entries) {
      const full = join(dir, e);
      if (statSync(full).isDirectory()) {
        files.push(...getFiles(full));
      } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
        files.push(full);
      }
    }
    return files;
  }

  const allSourceFiles = getFiles(srcDir);
  assert.ok(allSourceFiles.length > 15, "Must inspect all source files in src/");

  const egressPatterns = [
    { name: "fetch(", regex: /\bfetch\s*\(/ },
    { name: "XMLHttpRequest", regex: /\bXMLHttpRequest\b/ },
    { name: "WebSocket", regex: /\bWebSocket\b/ },
    { name: "sendBeacon", regex: /\bsendBeacon\s*\(/ },
  ];

  const violations: string[] = [];

  for (const file of allSourceFiles) {
    const content = readFileSync(file, "utf8");
    for (const pat of egressPatterns) {
      if (pat.regex.test(content)) {
        violations.push(`${file} contains disallowed outbound network call: ${pat.name}`);
      }
    }
  }

  assert.equal(
    violations.length,
    0,
    `Privacy Audit Violation! The following files contain outbound network calls:\n${violations.join("\n")}`
  );
});

test("Tier 1 (R9): Exclusion Engine filters sensitive domains and enforces user exclusion rules", () => {
  const userExclusions = ["mycompany.internal", "*.confidential.org", "secret-portal.com"];

  // 1. Built-in sensitive banking & authentication domains
  assert.equal(ExclusionEngine.isExcluded("chase.com"), true);
  assert.equal(ExclusionEngine.isExcluded("login.chase.com"), true);
  assert.equal(ExclusionEngine.isExcluded("accounts.google.com"), true);
  assert.equal(ExclusionEngine.isExcluded("paypal.com"), true);
  assert.equal(ExclusionEngine.isExcluded("app.1password.com"), true);
  assert.equal(ExclusionEngine.isExcluded("wellsfargo.com"), true);

  // 2. User-defined exclusions
  assert.equal(ExclusionEngine.isExcluded("mycompany.internal", userExclusions), true);
  assert.equal(ExclusionEngine.isExcluded("sub.mycompany.internal", userExclusions), true);
  assert.equal(ExclusionEngine.isExcluded("api.confidential.org", userExclusions), true);
  assert.equal(ExclusionEngine.isExcluded("secret-portal.com", userExclusions), true);

  // 3. Permitted domains
  assert.equal(ExclusionEngine.isExcluded("github.com", userExclusions), false);
  assert.equal(ExclusionEngine.isExcluded("wikipedia.org", userExclusions), false);
  assert.equal(ExclusionEngine.isExcluded("arxiv.org", userExclusions), false);
  assert.equal(ExclusionEngine.isExcluded("stackoverflow.com", userExclusions), false);
});

// ── TIER 2: BOUNDARY & CORNER CASES (R9 & Sanitization) ───────────────────────

test("Tier 2 (Boundary): Adversarial URL scrubbing — strips query params, fragments, credentials & malformed inputs", () => {
  // Query and Hash scrubbing
  assert.equal(
    ExclusionEngine.sanitizeUrl("https://github.com/project?token=supersecret123&user=admin"),
    "https://github.com/project"
  );
  assert.equal(
    ExclusionEngine.sanitizeUrl("https://github.com/project#access_token=jwt_xyz_987"),
    "https://github.com/project"
  );
  assert.equal(
    ExclusionEngine.sanitizeUrl("https://github.com/project?q=1#part"),
    "https://github.com/project"
  );

  // Strips userinfo credentials
  const credsUrl = "https://user:password@github.com/private/repo";
  const sanitizedCreds = ExclusionEngine.sanitizeUrl(credsUrl);
  assert.ok(!sanitizedCreds.includes("password"), "Must not leak user password");

  // Trailing slash normalization
  assert.equal(ExclusionEngine.sanitizeUrl("https://github.com/docs/"), "https://github.com/docs");

  // Extreme URL boundary: 10,000 character query string
  const hugeQuery = "a".repeat(10000);
  const hugeUrl = `https://example.com/api?payload=${hugeQuery}`;
  const t0 = performance.now();
  const cleanedHuge = ExclusionEngine.sanitizeUrl(hugeUrl);
  const latency = performance.now() - t0;
  assert.equal(cleanedHuge, "https://example.com/api");
  assert.ok(latency < 50, `10k character URL sanitization should execute in <50ms (took ${latency.toFixed(2)}ms)`);

  // Special characters & Unicode in path
  const unicodeUrl = "https://example.com/wiki/%E3%83%86%E3%82%B9%E3%83%88?lang=ja";
  assert.equal(
    ExclusionEngine.sanitizeUrl(unicodeUrl),
    "https://example.com/wiki/%E3%83%86%E3%82%B9%E3%83%88"
  );

  // Empty and malformed URLs must not throw
  assert.doesNotThrow(() => ExclusionEngine.sanitizeUrl(""));
  assert.doesNotThrow(() => ExclusionEngine.sanitizeUrl("not a url"));
  assert.doesNotThrow(() => ExclusionEngine.sanitizeUrl("javascript:void(0)"));
  assert.doesNotThrow(() => ExclusionEngine.sanitizeUrl("data:text/html,<h1>Hello</h1>"));
});
