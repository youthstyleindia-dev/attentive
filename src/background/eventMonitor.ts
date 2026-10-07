/**
 * Browser Event Monitor — Atentiv
 * Monitors tab activations, window focus changes, idle states, and alarms with serialization.
 */
import { SessionManager } from "./sessionManager";

let queue = Promise.resolve();
export const serial = (fn: () => Promise<unknown>) => {
  queue = queue.then(fn).then(
    () => {},
    (e) => console.error("Atentiv EventMonitor Error:", e)
  );
  return queue;
};

export class EventMonitor {
  static setupListeners(): void {
    // Alarms (30s periodic heartbeat checkpoint)
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "atentiv-heartbeat") {
        serial(() => SessionManager.reconcile());
      }
    });

    // Tab Events
    if (chrome.tabs.onCreated?.addListener) {
      chrome.tabs.onCreated.addListener((tab) => {
        serial(async () => {
          await SessionManager.reconcile();
          try {
            const allTabs = await chrome.tabs.query({});
            for (const t of allTabs) {
              if (t.id && t.url && (t.url.startsWith("http://") || t.url.startsWith("https://"))) {
                chrome.tabs.sendMessage(t.id, { type: "NEW_TAB_CREATED", tabId: tab.id }).catch(() => {});
              }
            }
          } catch {}
        });
      });
    }

    chrome.tabs.onActivated.addListener(() => serial(() => SessionManager.reconcile()));

    chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
      if (tab.active && (changeInfo.url || changeInfo.status === "complete")) {
        serial(() => SessionManager.reconcile());
      }
    });

    chrome.tabs.onRemoved.addListener(() => serial(() => SessionManager.reconcile()));

    // Window Focus
    chrome.windows.onFocusChanged.addListener(() => serial(() => SessionManager.reconcile()));

    // Idle Changes
    chrome.idle.onStateChanged.addListener(() => serial(() => SessionManager.reconcile()));

    // Extension Lifecycle
    chrome.runtime.onInstalled.addListener(() => {
      serial(async () => {
        await chrome.alarms.create("atentiv-heartbeat", { periodInMinutes: 0.5 });
        const existing = await chrome.storage.local.get("atentiv_settings");
        if (!existing.atentiv_settings || existing.atentiv_settings.enabled === undefined) {
          await chrome.storage.local.set({
            atentiv_settings: {
              enabled: true,
              exclusions: [],
              retentionDays: 30,
              targetWorkstream: null,
            },
          });
        }
        await SessionManager.initFromStorage();
        await SessionManager.reconcile();
      });
    });

    chrome.runtime.onStartup.addListener(() => {
      serial(async () => {
        await chrome.storage.session.remove("activeCheckpoint");
        await chrome.alarms.create("atentiv-heartbeat", { periodInMinutes: 0.5 });
        await SessionManager.reconcile();
      });
    });
  }
}
