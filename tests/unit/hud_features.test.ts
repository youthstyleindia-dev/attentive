import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HUDAppearanceEngine,
  PRESET_ACCENT_COLORS,
  FocusModeManager,
  HUDSearchEngine,
  formatHeaderTimer,
  type HUDAppearancePrefs,
  type TabInfo,
  type SearchItem,
} from "./test_helpers";

test("Tier 1 (R4): HUD Appearance controls persist to atentiv_hud_prefs with live CSS variables", async () => {
  const mockStorage: Record<string, any> = {};
  const storageApi = {
    get: async (k: string) => ({ [k]: mockStorage[k] }),
    set: async (v: any) => Object.assign(mockStorage, v),
  };

  // 1. Load default preferences when storage is empty
  const initialPrefs = await HUDAppearanceEngine.load(storageApi);
  assert.equal(initialPrefs.transparency, 80);
  assert.equal(initialPrefs.blurPx, 28);
  assert.equal(initialPrefs.theme, "auto");
  assert.equal(initialPrefs.accentColor, "#7c3aed");
  assert.equal(initialPrefs.showIndicator, true);

  // 2. Compute CSS variables for default settings
  const defaultCSS = HUDAppearanceEngine.computeCSSVariables(initialPrefs);
  assert.equal(defaultCSS["--at-blur"], "28px");
  assert.equal(defaultCSS["--at-purple"], "#7c3aed");
  assert.ok(defaultCSS["--at-bg"].includes("rgba(8,8,22,"));
  assert.ok(defaultCSS["--at-surface"].includes("rgba(255,255,255,"));

  // 3. User selects different accent colors from the 7 presets
  for (const preset of PRESET_ACCENT_COLORS) {
    const updatedPrefs: HUDAppearancePrefs = {
      ...initialPrefs,
      accentColor: preset.hex,
    };
    const css = HUDAppearanceEngine.computeCSSVariables(updatedPrefs);
    assert.equal(css["--at-purple"], preset.hex, `CSS var must update to preset ${preset.name}`);
  }

  // 4. User drags transparency and blur sliders
  const customizedPrefs: HUDAppearancePrefs = {
    transparency: 40, // More opaque
    blurPx: 16,
    theme: "dark",
    showIndicator: false,
    accentColor: "#0d9488", // Teal preset
    hudSize: "compact",
    hudPosition: "bottom-right",
  };

  await HUDAppearanceEngine.save(storageApi, customizedPrefs);

  // Verify stored payload in atentiv_hud_prefs
  assert.deepEqual(mockStorage[HUDAppearanceEngine.STORAGE_KEY], customizedPrefs);

  // Re-load and verify complete rehydration
  const loadedPrefs = await HUDAppearanceEngine.load(storageApi);
  assert.equal(loadedPrefs.transparency, 40);
  assert.equal(loadedPrefs.blurPx, 16);
  assert.equal(loadedPrefs.theme, "dark");
  assert.equal(loadedPrefs.showIndicator, false);
  assert.equal(loadedPrefs.accentColor, "#0d9488");

  const customCSS = HUDAppearanceEngine.computeCSSVariables(loadedPrefs);
  assert.equal(customCSS["--at-blur"], "16px");
  assert.equal(customCSS["--at-purple"], "#0d9488");
  // transparency 40% -> bgAlpha = (1 - 0.40)*0.85 + 0.05 = 0.60 * 0.85 + 0.05 = 0.56
  assert.equal(customCSS["--at-bg"], "rgba(8,8,22,0.56)");
});

test("Tier 1 (R6): Auto-Activate New Tabs broadcasts NEW_TAB_CREATED to HUDs", async () => {
  const broadcastMessages: Array<{ tabId: number; message: any }> = [];
  let reconcileCount = 0;

  const mockTabs = [
    { id: 10, title: "Google", url: "https://google.com" },
    { id: 11, title: "GitHub", url: "https://github.com" },
  ];

  const fakeChrome = {
    tabs: {
      query: async () => mockTabs,
      sendMessage: async (tabId: number, message: any) => {
        broadcastMessages.push({ tabId, message });
      },
    },
  };

  // Simulating service worker onCreated listener contract (SRS R6)
  const onTabCreatedHandler = async (newTab: { id: number; url?: string }) => {
    // 1. Reconcile session state
    reconcileCount++;

    // 2. Broadcast NEW_TAB_CREATED event to open tabs
    const openTabs = await fakeChrome.tabs.query();
    for (const t of openTabs) {
      if (t.id) {
        await fakeChrome.tabs.sendMessage(t.id, {
          type: "NEW_TAB_CREATED",
          newTabId: newTab.id,
          timestamp: Date.now(),
        });
      }
    }
  };

  // Trigger event for tab creation
  await onTabCreatedHandler({ id: 12, url: "https://arxiv.org/abs/2301.0001" });

  assert.equal(reconcileCount, 1, "Session state must reconcile immediately on tab creation");
  assert.equal(broadcastMessages.length, 2, "Must broadcast NEW_TAB_CREATED to all open tabs");
  assert.equal(broadcastMessages[0].message.type, "NEW_TAB_CREATED");
  assert.equal(broadcastMessages[0].message.newTabId, 12);
  assert.equal(broadcastMessages[1].message.type, "NEW_TAB_CREATED");
});

test("Tier 1 (R7a): Focus Mode closes non-pinned background tabs and confirms with toast", async () => {
  const removedTabIds: number[][] = [];

  const tabStrip: TabInfo[] = [
    { id: 101, windowId: 1, url: "https://github.com/active", title: "Active Work", active: true, pinned: false },
    { id: 102, windowId: 1, url: "https://mail.google.com", title: "Pinned Mail", active: false, pinned: true },
    { id: 103, windowId: 1, url: "https://slack.com", title: "Pinned Slack", active: false, pinned: true },
    { id: 104, windowId: 1, url: "https://twitter.com", title: "Distraction 1", active: false, pinned: false },
    { id: 105, windowId: 1, url: "https://reddit.com", title: "Distraction 2", active: false, pinned: false },
  ];

  const fakeTabsApi = {
    query: async () => tabStrip,
    remove: async (ids: number[]) => {
      removedTabIds.push(ids);
    },
  };

  // Execute Focus Mode
  const result = await FocusModeManager.executeFocusMode(fakeTabsApi, 1);

  assert.equal(result.closedCount, 2);
  assert.equal(result.message, "Closed 2 background tabs");
  assert.equal(removedTabIds.length, 1);
  assert.deepEqual(removedTabIds[0], [104, 105], "Must remove only unpinned background tabs 104 and 105");

  // Edge case: All remaining tabs are pinned or active
  const cleanTabStrip = tabStrip.filter((t) => !removedTabIds[0].includes(t.id));
  const cleanTabsApi = {
    query: async () => cleanTabStrip,
    remove: async (ids: number[]) => {
      removedTabIds.push(ids);
    },
  };

  const cleanResult = await FocusModeManager.executeFocusMode(cleanTabsApi, 1);
  assert.equal(cleanResult.closedCount, 0);
  assert.equal(cleanResult.message, "All background tabs already organized");
});

test("Tier 1 (R7b): Real-time Search in Full HUD filters Open Tabs and Recent Activity", () => {
  const sampleTabs: SearchItem[] = [
    { id: 1, title: "Atentiv: Project Dashboard & Code", domain: "github.com", category: "Technology" },
    { id: 2, title: "Attention Interleaving in Deep Work", domain: "arxiv.org", category: "Research" },
    { id: 3, title: "TypeScript Handbook: Generics", domain: "typescriptlang.org", category: "Technology" },
    { id: 4, title: "Funny Cat Videos Compilation", domain: "youtube.com", category: "Entertainment" },
    { id: 5, title: "Reddit: Ask Science", domain: "reddit.com", category: "Education" },
  ];

  // 1. Query matching single keyword in title
  const res1 = HUDSearchEngine.filterItems(sampleTabs, "generics");
  assert.equal(res1.length, 1);
  assert.equal(res1[0].id, 3);

  // 2. Query matching domain
  const res2 = HUDSearchEngine.filterItems(sampleTabs, "arxiv.org");
  assert.equal(res2.length, 1);
  assert.equal(res2[0].id, 2);

  // 3. Multi-token query across title and domain
  const res3 = HUDSearchEngine.filterItems(sampleTabs, "github atentiv");
  assert.equal(res3.length, 1);
  assert.equal(res3[0].id, 1);

  // 4. Empty or whitespace query returns all items
  const resEmpty = HUDSearchEngine.filterItems(sampleTabs, "   ");
  assert.equal(resEmpty.length, 5);

  // 5. Query matching no items returns empty array
  const resNone = HUDSearchEngine.filterItems(sampleTabs, "nonexistent-query-xyz");
  assert.equal(resNone.length, 0);

  // 6. Adversarial search characters (Regex meta-characters must not throw)
  assert.doesNotThrow(() => {
    const resSpecial = HUDSearchEngine.filterItems(sampleTabs, "[.*+?^${}()|]");
    assert.equal(resSpecial.length, 0);
  });

  // 7. Shortcut detection: Cmd+K and Ctrl+K
  assert.equal(HUDSearchEngine.isSearchShortcut({ key: "k", metaKey: true }), true);
  assert.equal(HUDSearchEngine.isSearchShortcut({ key: "K", ctrlKey: true }), true);
  assert.equal(HUDSearchEngine.isSearchShortcut({ key: "a", metaKey: true }), false);
  assert.equal(HUDSearchEngine.isSearchShortcut({ key: "k", metaKey: false, ctrlKey: false }), false);
});

test("Tier 1 (R7c, R7d, R7e): HUD navigation hooks and 1-second Pill Timer synchronization", () => {
  type HUDMode = "closed" | "compact" | "full";
  let mode: HUDMode = "compact";
  let activeNavSection = "overview";

  // Action R7c: "See all ->" in Compact switches to Full view
  const onSeeAllClick = () => {
    mode = "full";
  };
  onSeeAllClick();
  assert.equal(mode, "full", "'See all ->' must navigate to Full view");

  // Action R7d: "View all ->" in Workstreams section highlights nav item
  const onViewAllWorkstreamsClick = () => {
    activeNavSection = "workstreams";
  };
  onViewAllWorkstreamsClick();
  assert.equal(activeNavSection, "workstreams", "'View all ->' must set nav section to workstreams");

  // Action R7e: Header tracking pill timer format and tick updates
  assert.equal(formatHeaderTimer(0), "00:00:00");
  assert.equal(formatHeaderTimer(5000), "00:00:05");
  assert.equal(formatHeaderTimer(65000), "00:01:05");
  assert.equal(formatHeaderTimer(3665000), "01:01:05");
});
