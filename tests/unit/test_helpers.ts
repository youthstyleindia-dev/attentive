// Shared test helpers and types for Atentiv unit test suites

export interface HUDAppearancePrefs {
  transparency: number; // 0 to 100
  blurPx: number; // 0 to 48
  theme: "auto" | "light" | "dark";
  showIndicator: boolean;
  accentColor: string; // 7 presets
  hudSize?: "compact" | "medium" | "expanded";
  hudPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  sessionStartMs?: number;
}

export const PRESET_ACCENT_COLORS = [
  { name: "Purple", hex: "#7c3aed" },
  { name: "Indigo", hex: "#4f46e5" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Teal", hex: "#0d9488" },
  { name: "Green", hex: "#16a34a" },
  { name: "Amber", hex: "#d97706" },
  { name: "Rose", hex: "#e11d48" },
];

export class HUDAppearanceEngine {
  static readonly STORAGE_KEY = "atentiv_hud_prefs";

  static readonly DEFAULT_PREFS: HUDAppearancePrefs = {
    transparency: 80,
    blurPx: 28,
    theme: "auto",
    showIndicator: true,
    accentColor: "#7c3aed",
    hudSize: "medium",
    hudPosition: "top-right",
  };

  static computeCSSVariables(prefs: HUDAppearancePrefs): Record<string, string> {
    const clampedTrans = Math.max(0, Math.min(100, prefs.transparency));
    const clampedBlur = Math.max(0, Math.min(48, prefs.blurPx));
    const bgAlpha = (1 - clampedTrans / 100) * 0.85 + 0.05;
    const surfaceAlpha = Math.max(0.04, 0.12 - clampedTrans * 0.001);

    return {
      "--at-blur": `${clampedBlur}px`,
      "--at-bg": `rgba(8,8,22,${bgAlpha.toFixed(2)})`,
      "--at-surface": `rgba(255,255,255,${surfaceAlpha.toFixed(3)})`,
      "--at-purple": prefs.accentColor || "#7c3aed",
    };
  }

  static async load(storage: { get: (k: string) => Promise<any> }): Promise<HUDAppearancePrefs> {
    const res = await storage.get(this.STORAGE_KEY);
    const saved = res?.[this.STORAGE_KEY] || {};
    return {
      transparency: saved.transparency ?? this.DEFAULT_PREFS.transparency,
      blurPx: saved.blurPx ?? this.DEFAULT_PREFS.blurPx,
      theme: saved.theme ?? this.DEFAULT_PREFS.theme,
      showIndicator: saved.showIndicator ?? this.DEFAULT_PREFS.showIndicator,
      accentColor: saved.accentColor ?? this.DEFAULT_PREFS.accentColor,
      hudSize: saved.hudSize ?? this.DEFAULT_PREFS.hudSize,
      hudPosition: saved.hudPosition ?? this.DEFAULT_PREFS.hudPosition,
      sessionStartMs: saved.sessionStartMs,
    };
  }

  static async save(
    storage: { set: (v: any) => Promise<any> },
    prefs: HUDAppearancePrefs
  ): Promise<void> {
    await storage.set({ [this.STORAGE_KEY]: prefs });
  }
}

export interface TabInfo {
  id: number;
  windowId: number;
  url: string;
  title: string;
  active: boolean;
  pinned: boolean;
}

export class FocusModeManager {
  static evaluateTabsToClose(tabs: TabInfo[]): {
    tabsToClose: number[];
    tabsToKeep: number[];
    toastMessage: string;
  } {
    const tabsToClose: number[] = [];
    const tabsToKeep: number[] = [];

    for (const tab of tabs) {
      if (tab.active || tab.pinned) {
        tabsToKeep.push(tab.id);
      } else {
        tabsToClose.push(tab.id);
      }
    }

    const toastMessage =
      tabsToClose.length > 0
        ? `Closed ${tabsToClose.length} background tab${tabsToClose.length === 1 ? "" : "s"}`
        : "All background tabs already organized";

    return { tabsToClose, tabsToKeep, toastMessage };
  }

  static async executeFocusMode(
    tabsApi: {
      query: (q: any) => Promise<TabInfo[]>;
      remove: (ids: number[]) => Promise<void>;
    },
    currentWindowId: number
  ): Promise<{ closedCount: number; message: string }> {
    const allTabs = await tabsApi.query({ windowId: currentWindowId });
    const { tabsToClose, toastMessage } = this.evaluateTabsToClose(allTabs);

    if (tabsToClose.length > 0) {
      await tabsApi.remove(tabsToClose);
    }

    return { closedCount: tabsToClose.length, message: toastMessage };
  }
}

export interface SearchItem {
  id: string | number;
  title: string;
  domain: string;
  url?: string;
  category?: string;
  activity?: string;
}

export class HUDSearchEngine {
  static filterItems<T extends SearchItem>(items: T[], rawQuery: string): T[] {
    const query = rawQuery.trim().toLowerCase();
    if (!query) return items;

    const tokens = query.split(/\s+/).filter(Boolean);

    return items.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const domain = (item.domain || "").toLowerCase();
      const url = (item.url || "").toLowerCase();
      const category = (item.category || "").toLowerCase();

      return tokens.every(
        (tok) =>
          title.includes(tok) ||
          domain.includes(tok) ||
          url.includes(tok) ||
          category.includes(tok)
      );
    });
  }

  static isSearchShortcut(event: { key: string; metaKey?: boolean; ctrlKey?: boolean }): boolean {
    return (event.key === "k" || event.key === "K") && Boolean(event.metaKey || event.ctrlKey);
  }
}

export function formatHeaderTimer(elapsedMs: number): string {
  const s = Math.max(0, Math.floor(elapsedMs / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
