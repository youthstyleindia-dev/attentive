/**
 * Atentiv Service Worker Entry Point
 * Manifest V3 — toolbar click toggles the in-page HUD overlay.
 * Side Panel opens only via explicit 'Open Dashboard' inside the HUD.
 */
import { EventMonitor, serial } from "./eventMonitor";
import { MessageRouter } from "./messageRouter";
import { SessionManager } from "./sessionManager";
import { DomainRepository } from "../db/repositories/domainRepository";

console.log("Atentiv Service Worker initializing...");

// Track popup window ID to deduplicate and focus existing window per R5
let popupWindowId: number | null = null;

if (chrome.windows?.onRemoved?.addListener) {
  chrome.windows.onRemoved.addListener((closedWinId) => {
    if (closedWinId === popupWindowId) {
      popupWindowId = null;
    }
  });
}

async function openOrFocusRestrictedPopup(): Promise<void> {
  if (popupWindowId !== null) {
    try {
      await chrome.windows.update(popupWindowId, { focused: true });
      return;
    } catch {
      popupWindowId = null;
    }
  }

  try {
    const popupUrl = chrome.runtime?.getURL ? chrome.runtime.getURL("sidepanel.html") : "sidepanel.html";
    const win = await chrome.windows.create({
      url: popupUrl,
      type: "popup",
      width: 420,
      height: 680,
    });
    if (win && win.id !== undefined) {
      popupWindowId = win.id;
    }
  } catch (err) {
    console.warn("Atentiv: Failed to create restricted page popup window:", err);
  }
}

// Toolbar icon click → toggle HUD on supported pages, open 420x680 popup on restricted pages
chrome.action.onClicked.addListener((tab) => {
  const url = tab.url || "";
  const tabId = tab.id;

  // chrome://, extension pages, edge://, about: cannot receive content scripts.
  // Open 420x680 popup window serving sidepanel.html with deduplication per R5.
  if (
    !url ||
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("file://")
  ) {
    openOrFocusRestrictedPopup();
    return;
  }

  // Normal webpage — inject content script then toggle HUD.
  // executeScript is async but sidePanel.open is NOT needed here,
  // so gesture-context rules do not apply to this branch.
  if (!tabId) return;
  chrome.scripting
    .executeScript({ target: { tabId }, files: ["content.js"] })
    .catch(() => { /* already injected — safe to ignore */ })
    .finally(() => {
      // Small delay lets content.js finish boot() on first inject
      setTimeout(() => {
        chrome.tabs
          .sendMessage(tabId, { type: "TOGGLE_ATENTIV_HUD" })
          .catch((e) => console.warn("Atentiv: Could not send TOGGLE_ATENTIV_HUD", e));
      }, 150);
    });
});

MessageRouter.setupRouter();
EventMonitor.setupListeners();

serial(async () => {
  await DomainRepository.seedDefaults();
  await SessionManager.initFromStorage();
  await SessionManager.reconcile();
  console.log("Atentiv Service Worker ready.");
});
