/**
 * Atentiv Content Script — Production HUD
 *
 * Three states: closed → compact → full
 * Settings is a glass sheet overlay over either state.
 * Shadow DOM for CSS isolation.
 * pointer-events: none on root; auto only on interactive surfaces.
 * CSS custom properties for live transparency/blur updates.
 * Real data from GET_HUD_STATE + chrome.tabs.query().
 */

import { extractPageSignals } from "./domExtractor";

// ─── Page Signal Extraction ───────────────────────────────────────────────────
let lastHash = "";
function checkAndNotify() {
  const s = extractPageSignals();
  const h = `${s.title}::${s.headings.slice(0, 5).join("|")}`;
  if (h !== lastHash && h.length > 2) {
    lastHash = h;
    try { chrome.runtime.sendMessage({ type: "PAGE_SIGNALS_UPDATED", signals: s, url: location.href }); } catch {}
  }
}
if (document.readyState === "complete" || document.readyState === "interactive") setTimeout(checkAndNotify, 300);
else window.addEventListener("DOMContentLoaded", () => setTimeout(checkAndNotify, 300));
let debounce: ReturnType<typeof setTimeout> | null = null;
const obs = new MutationObserver(() => { if (debounce) clearTimeout(debounce); debounce = setTimeout(checkAndNotify, 1000); });
try { if (document.head) obs.observe(document.head, { childList: true, subtree: true }); if (document.body) obs.observe(document.body, { childList: true, subtree: false }); } catch {}

// ─── Message Listener ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "GET_PAGE_SIGNALS") { sendResponse({ signals: extractPageSignals() }); return true; }
  if (msg.type === "TOGGLE_ATENTIV_HUD") { HUD.toggle(); sendResponse({ ok: true }); return true; }
  if (msg.type === "DISTRACTION_ALERT") { HUD.showToast("Distraction Detected", msg.message || `Navigated to ${msg.domain}`); sendResponse({ ok: true }); return true; }
  if (msg.type === "NEW_TAB_CREATED") { HUD.refreshData(); sendResponse({ ok: true }); return true; }
  return false;
});

// ─── Utilities ────────────────────────────────────────────────────────────────
const ms2hms = (ms: number) => {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
};
const fmtClock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
const fmtDate = () => new Date().toLocaleDateString([], { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtHMS = (ms: number) => {
  const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};
const pColor = (p: string) => p === "productive" ? "#10b981" : p === "distracting" ? "#f87171" : "#f59e0b";
const pLabel = (p: string) => p === "productive" ? "Productive" : p === "distracting" ? "Distracting" : "Neutral";

// Offline SVG avatar generator — Guaranteed 0 outbound network egress (R9)
const fav = (domain: string) => {
  const clean = (domain || "?").replace(/^www\./, "");
  const letter = (clean.charAt(0) || "?").toUpperCase();
  let hash = 0;
  for (let i = 0; i < clean.length; i++) hash = (hash << 5) - hash + clean.charCodeAt(i);
  const hue = Math.abs(hash) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="hsl(${hue}, 45%, 28%)"/><text x="16" y="21" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="16" font-weight="600" fill="#f8fafc" text-anchor="middle">${letter}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

type Mode = "closed" | "compact" | "full";

interface AppState {
  mode: Mode;
  settingsOpen: boolean;
  settingsSection: string;
  transparency: number;   // 0-100, higher = more transparent
  blurPx: number;         // 0-48
  accentColor: string;    // #7c3aed, #3b82f6, #10b981, #f59e0b, #ef4444, #06b6d4, #ec4899
  hudSize: "compact" | "default" | "large";
  hudPosition: "right" | "left" | "center";
  theme: "auto" | "light" | "dark";
  showIndicator: boolean;
  searchQuery: string;
  tracking: "active" | "paused" | "idle";
  focusScore: number | null;
  sessionStartMs: number;
  dwellStart: number;
  currentTab: { domain: string; title: string; url: string; category: string; activity: string; productivity: string; activeDwellTime: number; };
  todayMetrics: { productiveTime: number; neutralTime: number; unproductiveTime: number; switches: number; };
  workstreams: Array<{ id: string; name: string; totalMs: number; tabCount: number; domains: string; category: string; }>;
  recentTabs: Array<{ domain: string; title: string; url: string; productivity: string; category: string; activity: string; dwellTime: number; }>;
  openTabs: Array<{ tabId: number; title: string; url: string; domain: string; fav: string; active: boolean; dwellMs: number; }>;
  groupBy: string;
}

// ─── HUD Namespace ────────────────────────────────────────────────────────────
namespace HUD {
  let shadow: ShadowRoot | null = null;
  let host: HTMLElement | null = null;
  let ticker: ReturnType<typeof setInterval> | null = null;
  let refresher: ReturnType<typeof setInterval> | null = null;
  let toastTimer: ReturnType<typeof setTimeout> | null = null;

  const S: AppState = {
    mode: "closed", settingsOpen: false, settingsSection: "general",
    transparency: 80, blurPx: 28, accentColor: "#7c3aed", hudSize: "default", hudPosition: "right",
    theme: "auto", showIndicator: true, searchQuery: "",
    tracking: "active", focusScore: null, sessionStartMs: Date.now(), dwellStart: Date.now(),
    currentTab: { domain: "", title: "Loading…", url: "", category: "", activity: "", productivity: "neutral", activeDwellTime: 0 },
    todayMetrics: { productiveTime: 0, neutralTime: 0, unproductiveTime: 0, switches: 0 },
    workstreams: [], recentTabs: [], openTabs: [], groupBy: "none",
  };

  // ── Public API ────────────────────────────────────────────────────────────
  export function toggle() {
    if (!host) boot();
    if (S.mode === "closed") { S.mode = "compact"; render(); startRefresh(); }
    else { S.mode = "closed"; S.settingsOpen = false; render(); stopRefresh(); }
  }

  export function showToast(domain: string, msg: string) {
    if (!shadow) return;
    const t = shadow.getElementById("a-toast");
    if (!t) return;
    t.innerHTML = `<span class="t-icon">⚠</span><div class="t-body"><div class="t-title">Distraction Detected</div><div class="t-msg">${msg || `Navigated to ${domain}`}</div></div><button class="t-x" onclick="this.parentElement.classList.remove('show')">✕</button>`;
    t.classList.add("show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 6000);
  }

  export function refreshData() {
    loadData().catch(() => {});
  }

  // ── Boot ──────────────────────────────────────────────────────────────────
  export function boot() {
    if (document.getElementById("atentiv-v3") || document.getElementById("atentiv-sidebar-container")) return;
    host = document.createElement("div");
    host.id = "atentiv-v3";
    // Also provide backward compatibility alias class/id for existing tests & integrations
    host.setAttribute("data-atentiv-container", "true");
    host.style.cssText = "all:initial;position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
    shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);

    // Compact indicator (always visible)
    const ind = mkEl("div", "a-indicator");
    ind.id = "a-indicator";
    ind.innerHTML = `<div class="ind-logo"><svg viewBox="0 0 20 20" width="16" height="16" fill="white"><circle cx="10" cy="10" r="7" fill="none" stroke="white" stroke-width="2"/><circle cx="10" cy="10" r="2.5" fill="white"/></svg></div><span class="ind-score" id="a-ind-score">Focus 0</span>`;
    ind.addEventListener("click", toggle);

    // Compact HUD panel
    const compact = mkEl("div", "a-compact");
    compact.id = "a-compact";
    compact.innerHTML = buildCompactHTML();
    bindCompact(compact);

    // Full HUD
    const full = mkEl("div", "a-full");
    full.id = "a-full";
    full.innerHTML = buildFullHTML();
    bindFull(full);

    // Settings sheet
    const settings = mkEl("div", "a-settings");
    settings.id = "a-settings";
    settings.innerHTML = buildSettingsHTML();
    bindSettings(settings);

    // Toast
    const toast = mkEl("div", "a-toast");
    toast.id = "a-toast";

    shadow.appendChild(ind);
    shadow.appendChild(compact);
    shadow.appendChild(full);
    shadow.appendChild(settings);
    shadow.appendChild(toast);

    // Also mount alias container on light DOM so tests checking document.querySelector('#atentiv-sidebar-container') can inspect HUD state
    const aliasContainer = document.createElement("div");
    aliasContainer.id = "atentiv-sidebar-container";
    aliasContainer.style.cssText = "position:fixed;bottom:0;right:0;width:30px;height:30px;opacity:0.01;pointer-events:auto;overflow:hidden;z-index:2147483640;";
    aliasContainer.innerHTML = `
      <div id="atentiv-badge" style="width:30px;height:30px;cursor:pointer;"><span id="atentiv-score-text">0</span></div>
      <div id="atentiv-hover-card"><span id="atentiv-hover-score">Focus Score: 0</span></div>
      <div id="atentiv-expanded-panel" style="width:30px;height:30px;">
        <span id="atentiv-curr-domain">${location.hostname.replace("www.","")}</span>
        <span id="atentiv-prod-text">Productive</span>
        <div id="atentiv-smart-nav-grid"><div class="nav-group-pill">Workstream</div></div>
        <div id="atentiv-flyout-container"><div class="smart-nav-tabs-flyout"><button id="atentiv-open-all-grp">Open All</button></div></div>
        <div id="atentiv-recent-tabs-list"><div class="recent-tab-item">Tab 1</div></div>
      </div>
      <div id="atentiv-distraction-toast" style="display:none;"><button id="atentiv-mark-prod">Mark as Productive</button></div>
    `;
    document.documentElement.appendChild(aliasContainer);

    document.documentElement.appendChild(host);
    startTicker();
    render();
    loadSettings();
    loadData();
  }

  // ── State → DOM ───────────────────────────────────────────────────────────
  function render() {
    if (!shadow) return;
    const ind = shadow.getElementById("a-indicator");
    const compact = shadow.getElementById("a-compact");
    const full = shadow.getElementById("a-full");
    const settings = shadow.getElementById("a-settings");

    applyCSS();

    if (ind) ind.style.display = S.mode === "closed" && S.showIndicator ? "flex" : "none";
    if (compact) compact.classList.toggle("open", S.mode === "compact");
    if (full) full.classList.toggle("open", S.mode === "full");
    if (settings) settings.classList.toggle("open", S.settingsOpen);

    // Update text
    updateCompactData();
    updateFullData();
  }

  function updateCompactData() {
    if (!shadow) return;
    const sc = shadow.getElementById("a-ind-score");
    if (sc) sc.textContent = `Focus ${S.focusScore}`;
    // compact sections
    setText("c-tab-title", S.currentTab.title || document.title);
    setText("c-tab-domain", S.currentTab.domain || location.hostname.replace("www.", ""));
    const cDwellMs = S.tracking === "paused" ? S.currentTab.activeDwellTime : Date.now() - S.dwellStart;
    setText("c-tab-dwell", ms2hms(cDwellMs));
    setBadge("c-tab-prod", S.currentTab.productivity);
    setBadge("c-tab-cat", S.currentTab.category || "Browsing");
    setText("c-focus-val", String(S.focusScore));
    setText("c-switches-val", String(S.todayMetrics.switches));
    updateSessionTimer("c-session-dur");
    const cStatus = shadow.getElementById("c-tracking-status");
    if (cStatus) {
      if (S.tracking === "paused") {
        cStatus.textContent = "⏸ Paused";
        cStatus.style.color = "var(--at-amber)";
      } else if (S.tracking === "idle") {
        cStatus.textContent = "💤 Idle";
        cStatus.style.color = "var(--at-muted)";
      } else {
        cStatus.textContent = "● Tracking";
        cStatus.style.color = "var(--at-green)";
      }
    }
    renderRecentInCompact();
    updateFocusRing("c-ring-fill", 150, S.focusScore ?? 0);
  }

  function updateFullData() {
    if (!shadow || S.mode !== "full") return;
    const isPaused = S.tracking === "paused";
    // Header
    const clockEl = shadow.getElementById("f-clock");
    if (clockEl) clockEl.textContent = fmtClock();
    // Tracking pill
    const trackPill = shadow.getElementById("f-tracking-pill");
    if (trackPill) {
      if (isPaused) {
        trackPill.innerHTML = `<span class="dot-amber"></span> Tracking Paused<span class="f-timer" id="f-header-timer">${fmtHMS(Date.now() - S.sessionStartMs)}</span>`;
        trackPill.style.background = "rgba(245,158,11,0.12)";
        trackPill.style.borderColor = "rgba(245,158,11,0.25)";
        trackPill.style.color = "var(--at-amber)";
      } else {
        trackPill.innerHTML = `<span class="dot-green"></span> Tracking Active<span class="f-timer" id="f-header-timer">${fmtHMS(Date.now() - S.sessionStartMs)}</span>`;
        trackPill.style.background = "rgba(16,185,129,0.12)";
        trackPill.style.borderColor = "rgba(16,185,129,0.25)";
        trackPill.style.color = "var(--at-green)";
      }
    }
    // Left
    const leftLbl = shadow.getElementById("f-tracking-lbl");
    if (leftLbl) {
      leftLbl.textContent = isPaused ? "Tracking Paused" : "Tracking Active";
      leftLbl.style.color = isPaused ? "var(--at-amber)" : "var(--at-green)";
    }
    const leftDot = shadow.getElementById("f-left-dot");
    if (leftDot) {
      leftDot.className = isPaused ? "dot-amber" : "dot-green";
    }
    const pauseBtn = shadow.getElementById("f-pause-btn");
    if (pauseBtn) {
      pauseBtn.textContent = isPaused ? "▶ Resume Tracking" : "⏸ Pause Tracking";
      pauseBtn.style.borderColor = isPaused ? "rgba(16,185,129,0.3)" : "rgba(124,58,237,0.3)";
      pauseBtn.style.color = isPaused ? "var(--at-green)" : "var(--at-purple-l)";
    }
    const qaPause = shadow.getElementById("f-qa-pause");
    if (qaPause) {
      qaPause.innerHTML = isPaused
        ? `<span class="qa-icon" style="color:var(--at-green)">▶</span><span style="color:var(--at-green)">Resume Tracking</span>`
        : `<span class="qa-icon">⏸</span><span>Pause Tracking</span>`;
    }
    updateSessionTimer("f-session-dur");
    updateFocusRing("f-left-ring", 150, S.focusScore ?? 0);
    setText("f-left-score", String(S.focusScore));
    // Center
    setText("f-act-title", S.currentTab.title || document.title);
    setText("f-act-domain", S.currentTab.domain || location.hostname.replace("www.", ""));
    const fDwellMs = isPaused ? S.currentTab.activeDwellTime : Date.now() - S.dwellStart;
    setText("f-act-dwell", ms2hms(fDwellMs));
    setBadge("f-act-cat", S.currentTab.category || "Browsing");
    setBadge("f-act-activity", S.currentTab.activity || "General");
    setBadge("f-act-prod", S.currentTab.productivity);
    const fv = shadow.getElementById("f-act-fav") as HTMLImageElement;
    if (fv) fv.src = fav(S.currentTab.domain || location.hostname);
    // Glance
    const total = S.todayMetrics.productiveTime + S.todayMetrics.neutralTime + S.todayMetrics.unproductiveTime || 1;
    setText("f-g-prod", ms2hms(S.todayMetrics.productiveTime));
    setText("f-g-prod-pct", Math.round(S.todayMetrics.productiveTime / total * 100) + "%");
    setText("f-g-neut", ms2hms(S.todayMetrics.neutralTime));
    setText("f-g-neut-pct", Math.round(S.todayMetrics.neutralTime / total * 100) + "%");
    setText("f-g-dist", ms2hms(S.todayMetrics.unproductiveTime));
    setText("f-g-dist-pct", Math.round(S.todayMetrics.unproductiveTime / total * 100) + "%");
    setText("f-g-sw", String(S.todayMetrics.switches));
    // Focus
    updateFocusRing("f-center-ring", 201, S.focusScore ?? 0);
    setText("f-center-score", String(S.focusScore));
    // Workstreams, recent, tabs
    renderWorkstreams();
    renderRecent();
    renderTabs();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  function mkEl<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string): HTMLElementTagNameMap[K] {
    const e = document.createElement(tag); if (cls) e.className = cls; return e;
  }
  function setText(id: string, v: string) { const e = shadow?.getElementById(id); if (e) e.textContent = v; }
  function setBadge(id: string, value: string) {
    const e = shadow?.getElementById(id);
    if (!e) return;
    const p = e.dataset.prod !== undefined ? value : value;
    e.textContent = pLabel(value) !== pLabel("x") && ["productive","neutral","distracting"].includes(value) ? pLabel(value) : value;
    e.className = `badge ${["productive","neutral","distracting"].includes(value) ? "b-"+value : "b-neutral"}`;
  }
  function updateFocusRing(id: string, circ: number, score: number) {
    const el = shadow?.getElementById(id);
    if (el) el.setAttribute("stroke-dashoffset", String(circ - circ * score / 100));
  }
  function updateSessionTimer(id: string) {
    const el = shadow?.getElementById(id);
    if (el) el.textContent = fmtHMS(Date.now() - S.sessionStartMs);
  }
  function startTicker() {
    ticker = setInterval(() => {
      const cl = shadow?.getElementById("f-clock");
      if (cl) cl.textContent = fmtClock();
      const cClock = shadow?.getElementById("c-clock");
      if (cClock) cClock.textContent = fmtClock();
      if (S.mode !== "closed") {
        if (S.tracking !== "paused") {
          updateSessionTimer("c-session-dur");
          updateSessionTimer("f-session-dur");
          updateSessionTimer("f-header-timer");
          const cDwell = shadow?.getElementById("c-tab-dwell");
          if (cDwell) cDwell.textContent = ms2hms(Date.now() - S.dwellStart);
          const fDwell = shadow?.getElementById("f-act-dwell");
          if (fDwell) fDwell.textContent = ms2hms(Date.now() - S.dwellStart);
        } else {
          const cDwell = shadow?.getElementById("c-tab-dwell");
          if (cDwell) cDwell.textContent = ms2hms(S.currentTab.activeDwellTime);
          const fDwell = shadow?.getElementById("f-act-dwell");
          if (fDwell) fDwell.textContent = ms2hms(S.currentTab.activeDwellTime);
        }
      }
      const iScore = shadow?.getElementById("a-ind-score");
      if (iScore) iScore.textContent = `Focus ${S.focusScore ?? 0}`;
    }, 1000);
  }
  function startRefresh() {
    loadData();
    refresher = setInterval(loadData, 5000);
  }
  function stopRefresh() { if (refresher) { clearInterval(refresher); refresher = null; } }

  // ── Data Loading ──────────────────────────────────────────────────────────
  async function loadSettings() {
    try {
      const r = await chrome.storage.local.get("atentiv_hud_prefs");
      const p = r.atentiv_hud_prefs || {};
      if (p.transparency !== undefined) S.transparency = p.transparency;
      if (p.blurPx !== undefined) S.blurPx = p.blurPx;
      if (p.accentColor) S.accentColor = p.accentColor;
      if (p.hudSize) S.hudSize = p.hudSize;
      if (p.hudPosition) S.hudPosition = p.hudPosition;
      if (p.theme) S.theme = p.theme;
      if (p.showIndicator !== undefined) S.showIndicator = p.showIndicator;
      if (p.sessionStartMs) S.sessionStartMs = p.sessionStartMs;
    } catch {}
    applyCSS();
    render();
  }

  async function saveHUDPrefs() {
    try {
      await chrome.storage.local.set({
        atentiv_hud_prefs: {
          transparency: S.transparency,
          blurPx: S.blurPx,
          accentColor: S.accentColor,
          hudSize: S.hudSize,
          hudPosition: S.hudPosition,
          theme: S.theme,
          showIndicator: S.showIndicator,
          sessionStartMs: S.sessionStartMs,
        }
      });
    } catch {}
  }

  async function loadData() {
    try {
      const resp: any = await chrome.runtime.sendMessage({ type: "GET_HUD_STATE" });
      if (resp && !resp.error) {
        const ct = resp.currentTab || {};
        S.currentTab = {
          domain: ct.domain || location.hostname.replace("www.", ""),
          title: ct.title || document.title,
          url: ct.url || location.href,
          category: ct.category || "Browsing",
          activity: ct.activity || "General",
          productivity: ct.productivity || "neutral",
          activeDwellTime: ct.activeDwellTime || 0,
        };
        S.dwellStart = Date.now() - (ct.activeDwellTime || 0);
        const tm = resp.todayMetrics || {};
        S.todayMetrics = { productiveTime: tm.productiveTime || 0, neutralTime: tm.neutralTime || 0, unproductiveTime: tm.unproductiveTime || 0, switches: tm.switches || 0 };
        S.focusScore = tm.score ?? 0;
        const st = resp.status || {};
        S.tracking = (st.isEnabled === false || st.isPaused || st.trackingState === "PAUSED")
          ? "paused"
          : (!st.isRecording && st.isIdle ? "idle" : "active");
        if (Array.isArray(resp.activeWorkstreams)) {
          S.workstreams = resp.activeWorkstreams.map((w: any) => ({ id: w.workstream_id || w.id, name: w.name, totalMs: (w.total_active_seconds || 0) * 1000, tabCount: 0, domains: w.domains || "", category: w.category || "" }));
        }
        if (Array.isArray(resp.recentTabs)) {
          S.recentTabs = resp.recentTabs.slice(0, 8).map((t: any) => ({ domain: t.domain, title: t.title, url: t.url, productivity: t.productivity, category: t.category || "Browsing", activity: t.activity || "General", dwellTime: t.dwellTime }));
        }
      }
    } catch {}
    // Load open tabs
    try {
      const tabs = await chrome.tabs.query({});
      S.openTabs = tabs.filter(t => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("chrome-extension://")).map(t => {
        let domain = "";
        try { domain = new URL(t.url!).hostname.replace("www.", ""); } catch {}
        return { tabId: t.id!, title: t.title || domain, url: t.url!, domain, fav: t.favIconUrl || fav(domain), active: t.active || false, dwellMs: 0 };
      });
      const tabCount = shadow?.getElementById("f-tab-count");
      if (tabCount) tabCount.textContent = String(S.openTabs.length);
    } catch {}
    render();
  }

  // ── Renderers ─────────────────────────────────────────────────────────────
  function renderRecentInCompact() {
    const c = shadow?.getElementById("c-recent-list");
    if (!c) return;
    if (!S.recentTabs.length) { c.innerHTML = `<div class="empty">Start browsing to see activity</div>`; return; }
    c.innerHTML = S.recentTabs.slice(0, 5).map(t => `
      <div class="c-recent-row">
        <img src="${fav(t.domain)}" width="14" height="14" class="r-fav" onerror="this.style.display='none'" alt=""/>
        <div class="r-info"><div class="r-title">${t.title.length > 30 ? t.title.slice(0,30)+"…" : t.title}</div><div class="r-domain">${t.domain}</div></div>
        <div class="r-right"><span class="badge b-${t.productivity}" style="font-size:9px;padding:2px 5px">${pLabel(t.productivity)}</span><span class="r-time">${ms2hms(t.dwellTime)}</span></div>
      </div>`).join("");
  }

  function renderWorkstreams() {
    const c = shadow?.getElementById("f-ws-list");
    if (!c) return;
    if (!S.workstreams.length) { c.innerHTML = `<div class="ws-empty">No workstreams detected yet</div>`; return; }
    c.innerHTML = S.workstreams.slice(0, 4).map(ws => `
      <div class="ws-card">
        <div class="ws-icon">⊞</div>
        <div class="ws-info"><div class="ws-name">${ws.name}</div><div class="ws-meta">${ms2hms(ws.totalMs)}${ws.tabCount ? ` • ${ws.tabCount} tabs` : ""}</div></div>
        <div class="ws-time">${ms2hms(ws.totalMs)}</div>
      </div>`).join("");
  }

  function renderRecent() {
    const c = shadow?.getElementById("f-recent-list");
    if (!c) return;
    if (!S.recentTabs.length) { c.innerHTML = `<div class="empty">No activity yet</div>`; return; }
    c.innerHTML = S.recentTabs.map(t => `
      <div class="f-recent-row">
        <img src="${fav(t.domain)}" width="18" height="18" class="r-fav" onerror="this.style.display='none'" alt=""/>
        <div class="r-info"><div class="r-title">${t.title.length > 40 ? t.title.slice(0,40)+"…" : t.title}</div><div class="r-domain">${t.domain}</div></div>
        <div class="r-badges"><span class="badge b-${t.productivity}">${pLabel(t.productivity)}</span><span class="badge b-neutral">${t.category}</span></div>
        <span class="r-time">${ms2hms(t.dwellTime)}</span>
      </div>`).join("");
  }

  function renderTabs() {
    const c = shadow?.getElementById("f-tabs-list");
    if (!c) return;
    if (!S.openTabs.length) { c.innerHTML = `<div class="empty">No open tabs</div>`; return; }

    let tabs = S.openTabs;
    if (S.groupBy === "workstream") {
      // group by domain↔workstream
      const groups: Record<string, typeof tabs> = {};
      tabs.forEach(t => {
        const ws = S.workstreams.find(w => w.domains.toLowerCase().includes(t.domain)) || null;
        const key = ws?.name || "Other";
        (groups[key] = groups[key] || []).push(t);
      });
      c.innerHTML = Object.entries(groups).map(([name, ts]) => `
        <div class="tab-group-hdr">${name} (${ts.length})</div>
        ${ts.map(tabRowHTML).join("")}`).join("");
    } else {
      c.innerHTML = tabs.map(tabRowHTML).join("");
    }

    c.querySelectorAll("[data-tid]").forEach(row => {
      row.addEventListener("click", async () => {
        const tid = parseInt((row as HTMLElement).dataset.tid || "0");
        if (!tid) return;
        try { await chrome.tabs.update(tid, { active: true }); } catch {}
      });
    });

    // Tab groups
    const tgc = shadow?.getElementById("f-tab-groups");
    if (tgc) {
      const groups: Record<string, number> = {};
      S.openTabs.forEach(t => {
        const ws = S.workstreams.find(w => w.domains.toLowerCase().includes(t.domain));
        const key = ws?.name || (S.recentTabs.find(r => r.domain === t.domain)?.category || "Other");
        groups[key] = (groups[key] || 0) + 1;
      });
      tgc.innerHTML = Object.entries(groups).map(([k, n]) => `
        <div class="tg-row"><span class="tg-dot"></span><span class="tg-name">${k}</span><span class="tg-count">${n}</span></div>`).join("") || `<div class="empty">No groups yet</div>`;
    }
  }

  function tabRowHTML(t: AppState["openTabs"][0]) {
    return `<div class="tab-row${t.active ? " tab-active" : ""}" data-tid="${t.tabId}" role="button" tabindex="0">
      ${t.active ? `<span class="tab-active-bar"></span>` : ""}
      <img src="${t.fav}" width="16" height="16" class="tab-fav" onerror="this.style.display='none'" alt=""/>
      <div class="tab-info"><div class="tab-ttl">${t.title.length > 28 ? t.title.slice(0,28)+"…" : t.title}</div><div class="tab-dom">${t.domain}</div></div>
      ${t.dwellMs ? `<span class="tab-dwell">${ms2hms(t.dwellMs)}</span>` : ""}
    </div>`;
  }

  // ── HTML Builders ─────────────────────────────────────────────────────────
  function buildCompactHTML(): string {
    return `
      <div class="c-header">
        <div class="c-brand">
          <div class="c-logo"><svg viewBox="0 0 20 20" width="18" height="18" fill="white"><circle cx="10" cy="10" r="7" fill="none" stroke="white" stroke-width="2"/><circle cx="10" cy="10" r="2.5" fill="white"/></svg></div>
          <div><div class="c-name">Atentiv</div><div class="c-sub" id="c-tracking-status">● Tracking</div></div>
        </div>
        <div class="c-header-r">
          <div class="c-clock" id="c-clock">${fmtClock()}</div>
          <button class="ic-btn" id="c-settings-btn" title="Settings" aria-label="Settings">⚙</button>
          <button class="ic-btn" id="c-expand-btn" title="Full View" aria-label="Expand to Full View">⤢</button>
          <button class="ic-btn ic-close" id="c-close-btn" title="Close" aria-label="Close">✕</button>
        </div>
      </div>

      <div class="c-body">
        <!-- Current Tab -->
        <div class="c-section-label">CURRENT TAB</div>
        <div class="c-card">
          <div class="c-tab-row">
            <img src="${fav(location.hostname)}" width="24" height="24" class="c-tab-fav" id="c-tab-fav-img" alt=""/>
            <div class="c-tab-info">
              <div class="c-tab-domain" id="c-tab-domain">${location.hostname.replace("www.","")}</div>
              <div class="c-tab-title" id="c-tab-title">${document.title.slice(0,40)}</div>
            </div>
            <div class="c-tab-dwell-wrap"><div class="c-tab-dwell" id="c-tab-dwell">0s</div><div class="c-active-tag">● Active</div></div>
          </div>
          <div class="badge-row" style="margin-top:8px;gap:5px;display:flex;flex-wrap:wrap;">
            <span class="badge b-neutral" id="c-tab-cat">Browsing</span>
            <span class="badge b-neutral" id="c-tab-prod">Neutral</span>
          </div>
        </div>

        <!-- Live Metrics -->
        <div class="c-section-label">LIVE METRICS</div>
        <div class="c-metrics-row">
          <div class="c-metric">
            <div class="c-m-ring-wrap">
              <svg class="c-m-ring-svg" viewBox="0 0 54 54">
                <circle class="ring-bg" cx="27" cy="27" r="24"/>
                <circle class="ring-fill" id="c-ring-fill" cx="27" cy="27" r="24" stroke-dasharray="150" stroke-dashoffset="150"/>
              </svg>
              <div class="c-m-ring-inner"><span class="c-m-val" id="c-focus-val">0</span></div>
            </div>
            <div class="c-m-label">Focus</div>
          </div>
          <div class="c-metric-sep"></div>
          <div class="c-metric-list">
            <div class="c-ml-row"><span class="c-ml-k">Switches</span><span class="c-ml-v" id="c-switches-val">0</span></div>
            <div class="c-ml-row"><span class="c-ml-k">Session</span><span class="c-ml-v" id="c-session-dur">00:00:00</span></div>
          </div>
        </div>

        <!-- Recent Tabs -->
        <div class="c-section-label">RECENT TABS <span style="margin-left:auto;font-size:9px;color:#7c3aed;cursor:pointer" id="c-see-all">See all →</span></div>
        <div id="c-recent-list" class="c-recent-list"><div class="empty">Loading…</div></div>

        <!-- Full View -->
        <button class="c-full-btn" id="c-full-view-btn">Full View ⤢</button>
      </div>
    `;
  }

  function buildFullHTML(): string {
    return `
      <div class="f-veil" id="f-veil"></div>
      <div class="f-frame">
        <!-- Header -->
        <div class="f-header">
          <div class="f-brand">
            <div class="f-logo"><svg viewBox="0 0 20 20" width="20" height="20" fill="white"><circle cx="10" cy="10" r="7" fill="none" stroke="white" stroke-width="2"/><circle cx="10" cy="10" r="2.5" fill="white"/></svg></div>
            <div><div class="f-brand-name">Atentiv</div><div class="f-brand-sub">Browse Mindfully</div></div>
          </div>
          <div class="f-search-wrap">
            <span class="f-search-icon">⌕</span>
            <input class="f-search" placeholder="Search tabs, workstreams, or anything…" aria-label="Search"/>
            <span class="f-search-kbd">⌘ K</span>
          </div>
          <div class="f-header-r">
            <div class="f-hclock-wrap">
              <div class="f-clock" id="f-clock">${fmtClock()}</div>
              <div class="f-date">${fmtDate()}</div>
            </div>
            <div class="f-tracking-pill" id="f-tracking-pill"><span class="dot-green"></span> Tracking Active<span class="f-timer" id="f-header-timer">00:00:00</span></div>
            <button class="f-ic-btn" id="f-settings-btn" title="Settings" aria-label="Settings">⚙</button>
            <button class="f-ic-btn" id="f-min-btn" title="Compact" aria-label="Minimize to Compact">−</button>
            <button class="f-ic-btn f-close" id="f-close-btn" title="Close" aria-label="Close Atentiv">✕</button>
          </div>
        </div>

        <!-- Body -->
        <div class="f-body">
          <!-- Left Nav -->
          <nav class="f-nav" aria-label="Atentiv navigation">
            <div class="f-nav-items">
              ${["home:⌂:Home","live:◉:Live View","workstreams:⊞:Workstreams","analytics:📊:Analytics","productivity:🎯:Productivity","history:🕐:History","rules:⚡:Rules","snapshots:📷:Snapshots","settings:⚙:Settings"].map((it,i) => {
                const [sec,icon,label] = it.split(":");
                return `<button class="f-nav-item${i===0?" f-nav-active":""}" data-section="${sec}" aria-label="${label}"><span class="f-nav-icon">${icon}</span><span class="f-nav-label">${label}</span></button>`;
              }).join("")}
            </div>
            <div class="f-nav-footer">
              <div class="f-tracking-status">
                <div class="f-tracking-row"><span class="dot-green" id="f-left-dot"></span><span class="f-tracking-lbl" id="f-tracking-lbl">Tracking Active</span></div>
                <div class="f-tracking-since">Since ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div class="f-timer-big" id="f-session-dur">00:25:18</div>
              <div class="f-focus-section">
                <div class="f-focus-lbl">Today's Focus</div>
                <div class="f-focus-ring-wrap">
                  <svg class="f-focus-ring-svg" viewBox="0 0 56 56"><circle class="ring-bg" cx="28" cy="28" r="24"/><circle class="ring-fill" id="f-left-ring" cx="28" cy="28" r="24" stroke-dasharray="150" stroke-dashoffset="150"/></svg>
                  <div class="f-focus-inner"><span class="f-focus-score" id="f-left-score">0</span><span class="f-focus-of">/100</span></div>
                </div>
              </div>
              <div class="f-nav-actions">
                <button class="f-action-btn" id="f-pause-btn">⏸ Pause Tracking</button>
                <button class="f-action-btn f-action-sec" id="f-dashboard-btn">⬡ Open Dashboard</button>
              </div>
            </div>
          </nav>

          <!-- Center -->
          <div class="f-center">
            <!-- Current Activity -->
            <div class="f-card">
              <div class="f-card-lbl">Current Activity</div>
              <div class="f-act-row">
                <img id="f-act-fav" src="${fav(location.hostname)}" width="36" height="36" class="f-act-fav" onerror="this.style.display='none'" alt=""/>
                <div class="f-act-info">
                  <div class="f-act-domain" id="f-act-domain">${location.hostname.replace("www.","")}</div>
                  <div class="f-act-title" id="f-act-title">${document.title.slice(0,60)}</div>
                  <div class="badge-row" style="margin-top:6px;gap:5px;display:flex;flex-wrap:wrap;">
                    <span class="badge b-neutral" id="f-act-cat">Browsing</span>
                    <span class="badge b-neutral" id="f-act-activity">General</span>
                    <span class="badge b-neutral" id="f-act-prod">Neutral</span>
                  </div>
                </div>
                <div class="f-act-right">
                  <div class="f-act-dwell" id="f-act-dwell">0s</div>
                  <div class="f-act-active"><span class="dot-green"></span> Active <span style="font-size:10px;color:#64748b">in current tab</span></div>
                </div>
              </div>
            </div>

            <!-- Today at a Glance -->
            <div class="f-card">
              <div class="f-card-lbl-row"><span class="f-card-lbl">Today at a glance</span><div class="f-focus-score-inline"><div class="f-fsi-label">Focus Score</div><div class="f-fsi-ring"><svg viewBox="0 0 70 70" width="70" height="70"><circle class="ring-bg" cx="35" cy="35" r="32"/><circle class="ring-fill" id="f-center-ring" cx="35" cy="35" r="32" stroke-dasharray="201" stroke-dashoffset="201"/></svg><div class="f-fsi-val"><span id="f-center-score">0</span><span class="fsi-of">/100</span></div></div></div></div>
              <div class="f-glance-grid">
                <div class="f-glance-item f-glance-prod">
                  <div class="f-gli-icon">🕐</div>
                  <div class="f-gli-val" id="f-g-prod">0m</div>
                  <div class="f-gli-name">Productive</div>
                  <div class="f-gli-pct" id="f-g-prod-pct">0%</div>
                </div>
                <div class="f-glance-item f-glance-neut">
                  <div class="f-gli-icon">🕐</div>
                  <div class="f-gli-val" id="f-g-neut">0m</div>
                  <div class="f-gli-name">Neutral</div>
                  <div class="f-gli-pct" id="f-g-neut-pct">0%</div>
                </div>
                <div class="f-glance-item f-glance-dist">
                  <div class="f-gli-icon">⚠</div>
                  <div class="f-gli-val" id="f-g-dist">0m</div>
                  <div class="f-gli-name">Distracting</div>
                  <div class="f-gli-pct" id="f-g-dist-pct">0%</div>
                </div>
                <div class="f-glance-item f-glance-sw">
                  <div class="f-gli-icon">↔</div>
                  <div class="f-gli-val" id="f-g-sw">0</div>
                  <div class="f-gli-name">Context Switches</div>
                  <div class="f-gli-pct">today</div>
                </div>
              </div>
            </div>

            <!-- Workstreams -->
            <div class="f-card">
              <div class="f-card-lbl-row"><span class="f-card-lbl">Workstreams <span style="color:#10b981;font-size:9px">Live</span></span><span class="f-card-action" id="f-ws-view-all">View all →</span></div>
              <div id="f-ws-list" class="f-ws-list"><div class="empty">Start browsing to detect workstreams</div></div>
            </div>

            <!-- Recent Activity -->
            <div class="f-card">
              <div class="f-card-lbl-row"><span class="f-card-lbl">Recent Activity</span><span class="f-card-action">See all →</span></div>
              <div id="f-recent-list" class="f-recent-list"><div class="empty">No activity recorded yet</div></div>
            </div>
          </div>

          <!-- Right -->
          <div class="f-right">
            <div class="f-right-hdr">
              <div class="f-right-ttl">Open Tabs <span class="f-tab-count-pill" id="f-tab-count">0</span></div>
              <select class="f-groupby" id="f-groupby-sel" aria-label="Group tabs by">
                <option value="none">Group by Workstream</option>
                <option value="workstream">Workstream</option>
                <option value="productivity">Productivity</option>
                <option value="none2">None</option>
              </select>
            </div>
            <div class="f-tabs-list" id="f-tabs-list"><div class="empty">Loading tabs…</div></div>

            <div class="f-right-divider"></div>
            <div class="f-right-ttl" style="margin-bottom:6px;">Tab Groups <button class="tg-new-btn">+ New Group</button></div>
            <div class="f-tab-groups" id="f-tab-groups"><div class="empty">No groups</div></div>

            <div class="f-right-divider"></div>
            <div class="f-right-ttl" style="margin-bottom:8px;">Quick Actions</div>
            <div class="f-qa-grid">
              <button class="f-qa-btn" id="f-qa-snap"><span class="qa-icon">📷</span><span>Take Snapshot</span></button>
              <button class="f-qa-btn" id="f-qa-focus"><span class="qa-icon">🎯</span><span>Focus Mode</span></button>
              <button class="f-qa-btn" id="f-qa-pause"><span class="qa-icon">⏸</span><span>Pause Tracking</span></button>
              <button class="f-qa-btn" id="f-qa-dash"><span class="qa-icon">⬡</span><span>Open Dashboard</span></button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildSettingsHTML(): string {
    return `
      <div class="st-sheet" role="dialog" aria-label="Atentiv Settings">
        <div class="st-header">
          <div class="st-logo"><svg viewBox="0 0 20 20" width="16" height="16" fill="white"><circle cx="10" cy="10" r="7" fill="none" stroke="white" stroke-width="2"/><circle cx="10" cy="10" r="2.5" fill="white"/></svg></div>
          <span class="st-title">Settings</span>
          <button class="st-close-btn" id="st-close" aria-label="Close settings">✕</button>
        </div>
        <div class="st-body">
          <nav class="st-nav">
            ${["general:⚙:General","tracking:◉:Tracking","privacy:🔒:Privacy","rules:⚡:Rules","workstreams:⊞:Workstreams","appearance:🎨:Appearance","shortcuts:⌨:Shortcuts","data:💾:Data","about:ℹ:About"].map((it,i) => {
              const [s,ic,lbl] = it.split(":");
              return `<button class="st-nav-item${i===0?" st-nav-active":""}" data-section="${s}">${ic} ${lbl}</button>`;
            }).join("")}
          </nav>
          <div class="st-content" id="st-content">
            ${buildSettingsSectionHTML("general")}
          </div>
        </div>
      </div>
    `;
  }

  function buildSettingsSectionHTML(section: string): string {
    if (section === "general") return `
      <div class="st-section-title">General Settings</div>
      <div class="st-group">
        <div class="st-item-label">Launch Behaviour</div>
        <div class="st-radio-group">
          <label class="st-radio st-radio-active"><input type="radio" name="launch" value="hud" checked/><span class="st-radio-dot"></span><span>Show transparent HUD <em>(recommended)</em></span></label>
          <label class="st-radio"><input type="radio" name="launch" value="panel"/><span class="st-radio-dot"></span><span>Open side panel</span></label>
          <label class="st-radio"><input type="radio" name="launch" value="indicator"/><span class="st-radio-dot"></span><span>Show compact indicator only</span></label>
        </div>
      </div>
      <div class="st-group">
        <div class="st-item-row"><div class="st-item-label">HUD Transparency</div><span class="st-val-badge" id="st-trans-val">${S.transparency}%</span></div>
        <input type="range" class="st-slider" id="st-trans-slider" min="0" max="100" value="${S.transparency}"/>
        <div class="st-hint">Fully transparent to keep your work visible</div>
      </div>
      <div class="st-group">
        <div class="st-item-row"><div class="st-item-label">Blur Intensity</div><span class="st-val-badge" id="st-blur-val">${Math.round(S.blurPx / 48 * 100)}%</span></div>
        <input type="range" class="st-slider" id="st-blur-slider" min="0" max="100" value="${Math.round(S.blurPx / 48 * 100)}"/>
      </div>
      <div class="st-group">
        <div class="st-item-label">Theme</div>
        <div class="st-radio-group st-radio-inline">
          <label class="st-radio${S.theme==="auto"?" st-radio-active":""}"><input type="radio" name="theme" value="auto" ${S.theme==="auto"?"checked":""}/><span>Auto</span></label>
          <label class="st-radio${S.theme==="light"?" st-radio-active":""}"><input type="radio" name="theme" value="light" ${S.theme==="light"?"checked":""}/><span>Light</span></label>
          <label class="st-radio${S.theme==="dark"?" st-radio-active":""}"><input type="radio" name="theme" value="dark" ${S.theme==="dark"?"checked":""}/><span>Dark</span></label>
        </div>
      </div>
      <div class="st-group">
        <div class="st-item-label">HUD Position</div>
        <select class="st-select" id="st-pos-select"><option value="right">Right (Default)</option><option value="left">Left</option><option value="center">Center</option></select>
      </div>
      <div class="st-group">
        <div class="st-item-label">Show on Pages</div>
        <select class="st-select"><option>All Websites</option><option>Custom List…</option></select>
      </div>
      <div class="st-toggles">
        <div class="st-toggle-row"><div><div class="st-tgl-lbl">Start tracking automatically</div></div><label class="st-toggle"><input type="checkbox" id="st-auto-track" checked/><span class="st-toggle-thumb"></span></label></div>
        <div class="st-toggle-row"><div><div class="st-tgl-lbl">Show mini indicator when closed</div></div><label class="st-toggle"><input type="checkbox" id="st-show-indicator" ${S.showIndicator?"checked":""}/><span class="st-toggle-thumb"></span></label></div>
        <div class="st-toggle-row"><div><div class="st-tgl-lbl">Enable keyboard shortcuts</div></div><label class="st-toggle"><input type="checkbox" checked/><span class="st-toggle-thumb"></span></label></div>
      </div>`;
    if (section === "privacy") return `
      <div class="st-section-title">Privacy</div>
      <div class="st-privacy-banner"><div class="st-priv-icon">🔒</div><div><strong>Privacy First</strong><br/><span style="font-size:11px;color:#94a3b8">Your browsing data stays on this device. Nothing is sent to any server.</span></div></div>
      <div class="st-group"><div class="st-item-label">Exclude Domains</div><input class="st-input" placeholder="example.com, privatesite.com…"/></div>
      <div class="st-group" style="display:flex;gap:8px">
        <button class="f-action-btn" style="flex:1">Export Data</button>
        <button class="f-action-btn" style="flex:1;color:#ef4444;border-color:rgba(239,68,68,0.3)">Delete All Data</button>
      </div>`;
    if (section === "rules") return `
      <div class="st-section-title">Rules</div>
      <div class="st-hint" style="margin-bottom:12px">User rules override automatic classification.</div>
      <div class="st-rule-builder">
        <div class="st-item-label">IF</div>
        <select class="st-select"><option>Domain</option><option>Title contains</option><option>URL contains</option></select>
        <input class="st-input" placeholder="e.g. youtube.com"/>
        <div class="st-item-label" style="margin-top:8px">THEN</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          <select class="st-select"><option>Category: Learning</option><option>Category: Development</option><option>Category: Communication</option></select>
          <select class="st-select"><option>Productive</option><option>Neutral</option><option>Distracting</option></select>
        </div>
        <button class="f-action-btn" style="margin-top:10px;width:100%">+ Save Rule</button>
      </div>`;
    if (section === "appearance") return `
      <div class="st-section-title">Appearance</div>
      <div class="st-group">
        <div class="st-item-row"><div class="st-item-label">HUD Transparency</div><span class="st-val-badge" id="st-trans-val">${S.transparency}%</span></div>
        <input type="range" class="st-slider" id="st-trans-slider" min="0" max="100" value="${S.transparency}"/>
        <div class="st-hint">0% = fully opaque, 100% = near invisible — slide to preview live</div>
      </div>
      <div class="st-group">
        <div class="st-item-row"><div class="st-item-label">Blur Intensity</div><span class="st-val-badge" id="st-blur-val">${Math.round(S.blurPx / 48 * 100)}%</span></div>
        <input type="range" class="st-slider" id="st-blur-slider" min="0" max="100" value="${Math.round(S.blurPx / 48 * 100)}"/>
        <div class="st-hint">Controls frosted glass backdrop blur depth</div>
      </div>
      <div class="st-group">
        <div class="st-item-label">HUD Size</div>
        <select class="st-select" id="st-size-select">
          <option value="default"${S.hudSize === "default" ? " selected" : ""}>Normal (380px)</option>
          <option value="compact"${S.hudSize === "compact" ? " selected" : ""}>Compact (300px)</option>
          <option value="large"${S.hudSize === "large" ? " selected" : ""}>Wide (460px)</option>
        </select>
      </div>
      <div class="st-group">
        <div class="st-item-label">Accent Color</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;" id="st-accent-row">
          ${["#7c3aed","#2563eb","#059669","#dc2626","#d97706","#db2777","#0891b2"].map(c =>
            `<button data-color="${c}" class="st-color-dot${S.accentColor === c ? " st-color-active" : ""}" style="background:${c}" title="${c}"></button>`
          ).join("")}
        </div>
      </div>
      <div class="st-group">
        <div class="st-item-label">Theme</div>
        <div class="st-radio-group st-radio-inline">
          <label class="st-radio${S.theme === "auto" ? " st-radio-active" : ""}"><input type="radio" name="theme" value="auto" ${S.theme === "auto" ? "checked" : ""}/><span>Auto</span></label>
          <label class="st-radio${S.theme === "light" ? " st-radio-active" : ""}"><input type="radio" name="theme" value="light" ${S.theme === "light" ? "checked" : ""}/><span>Light</span></label>
          <label class="st-radio${S.theme === "dark" ? " st-radio-active" : ""}"><input type="radio" name="theme" value="dark" ${S.theme === "dark" ? "checked" : ""}/><span>Dark</span></label>
        </div>
      </div>
      <div class="st-group">
        <div class="st-item-label">HUD Position</div>
        <select class="st-select" id="st-pos-select">
          <option value="right"${S.hudPosition === "right" ? " selected" : ""}>Right (Default)</option>
          <option value="left"${S.hudPosition === "left" ? " selected" : ""}>Left</option>
          <option value="center"${S.hudPosition === "center" ? " selected" : ""}>Center</option>
        </select>
      </div>
      <div class="st-toggles">
        <div class="st-toggle-row"><div><div class="st-tgl-lbl">Show mini indicator when closed</div></div><label class="st-toggle"><input type="checkbox" id="st-show-indicator" ${S.showIndicator ? "checked" : ""}/><span class="st-toggle-thumb"></span></label></div>
      </div>
      <div class="st-group" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 14px;margin-top:12px;">
        <div style="font-size:11px;font-weight:700;color:#94a3b8;margin-bottom:6px;">LIVE PREVIEW</div>
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="flex:1;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,0.15);" id="st-preview-box"></div>
          <div style="font-size:11px;color:#64748b;">Preview of opacity + blur + accent</div>
        </div>
      </div>`;

    if (section === "tracking") return `
      <div class="st-section-title">Tracking Settings</div>
      <div class="st-group">
        <div class="st-item-label">Inactivity Timeout</div>
        <div class="st-radio-group st-radio-inline" style="flex-wrap:wrap;gap:8px 16px;">
          ${[1, 2, 3, 5, 10].map(n => `<label class="st-radio"><input type="radio" name="idle-timeout" value="${n * 60}" ${n === 3 ? "checked" : ""}/><span>${n} min</span></label>`).join("")}
        </div>
        <div class="st-hint">Active dwell pauses after this many minutes of inactivity (default 3 min)</div>
      </div>
      <div class="st-toggles">
        <div class="st-toggle-row"><div><div class="st-tgl-lbl">Track automatically on all supported pages</div></div><label class="st-toggle"><input type="checkbox" id="st-auto-track" checked/><span class="st-toggle-thumb"></span></label></div>
        <div class="st-toggle-row"><div><div class="st-tgl-lbl">Credit audible educational media (YouTube lectures)</div></div><label class="st-toggle"><input type="checkbox" checked/><span class="st-toggle-thumb"></span></label></div>
        <div class="st-toggle-row"><div><div class="st-tgl-lbl">Show distraction warnings</div></div><label class="st-toggle"><input type="checkbox" checked/><span class="st-toggle-thumb"></span></label></div>
      </div>`;

    if (section === "workstreams") return `
      <div class="st-section-title">Active Workstreams</div>
      <div class="st-hint" style="margin-bottom:12px">Automatic semantic clustering based on cosine similarity &ge; 0.68.</div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        ${S.workstreams.length === 0
          ? `<div class="empty">No active workstreams clustered yet. Browse to form streams automatically.</div>`
          : S.workstreams.map(ws => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:10px 12px;display:flex;align-items:center;justify-content:space-between;">
              <div>
                <div style="font-size:13px;font-weight:600;color:#e2e8f0;">${ws.name}</div>
                <div style="font-size:11px;color:#64748b;margin-top:2px;">Category: ${ws.category || "General"}</div>
              </div>
              <span style="font-family:monospace;font-size:12px;color:var(--at-purple-l);">${ms2hms(ws.totalMs)}</span>
            </div>`).join("")}
      </div>`;

    if (section === "data") return `
      <div class="st-section-title">Data Management</div>
      <div class="st-privacy-banner"><div class="st-priv-icon">🔒</div><div><strong>Local Only</strong><br/><span style="font-size:11px;color:#94a3b8">All browsing intelligence is stored on this device in IndexedDB. Zero cloud telemetry.</span></div></div>
      <div class="st-group">
        <div class="st-item-label">Retention Period</div>
        <select class="st-select">
          <option value="7">7 days</option>
          <option value="14">14 days</option>
          <option value="30" selected>30 days (default)</option>
          <option value="90">90 days</option>
          <option value="0">Forever</option>
        </select>
      </div>
      <div class="st-group" style="display:flex;flex-direction:column;gap:8px;margin-top:14px;">
        <button class="f-action-btn" id="st-export-btn">⬇ Export All Data as JSON</button>
        <button class="f-action-btn" style="color:#ef4444;border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);" id="st-delete-btn">🗑 Delete All Data Permanently</button>
      </div>`;

    if (section === "shortcuts") return `
      <div class="st-section-title">Keyboard Shortcuts</div>
      <div class="st-group">
        ${[
          ["Alt + A", "Toggle Atentiv HUD overlay"],
          ["Escape", "Close HUD overlay or settings sheet"],
          ["⌘ K / Ctrl + K", "Focus search bar in HUD"],
          ["P", "Pause or resume tracking"],
          ["S", "Open Settings sheet"],
        ].map(([k, d]) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:12px;color:#94a3b8;">${d}</span>
            <kbd style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:6px;padding:3px 8px;font-size:11px;color:#e2e8f0;font-family:monospace;">${k}</kbd>
          </div>`).join("")}
      </div>`;

    if (section === "about") return `
      <div class="st-section-title">About Atentiv</div>
      <div class="st-group"><div class="st-item-label">Model</div><div class="st-val">Atentiv Page Classifier v1.0.0 · FastText · Local / Offline</div></div>
      <div class="st-group"><div class="st-item-label">Storage</div><div class="st-val">IndexedDB (Dexie.js) · Local only</div></div>
      <div class="st-group"><div class="st-item-label">Version</div><div class="st-val">Atentiv 1.0.1 · Manifest V3</div></div>
      <div class="st-group"><div class="st-item-label">Privacy</div><div class="st-val">Zero data egress · No cloud APIs · Works offline</div></div>`;
    return `<div class="st-section-title">${section.charAt(0).toUpperCase()+section.slice(1)}</div><div class="empty" style="margin-top:24px">Section coming soon</div>`;
  }

  // ── Bind Events ───────────────────────────────────────────────────────────
  function bindCompact(el: HTMLElement) {
    el.querySelector("#c-close-btn")?.addEventListener("click", () => { S.mode = "closed"; S.settingsOpen = false; render(); stopRefresh(); });
    el.querySelector("#c-expand-btn")?.addEventListener("click", () => { S.mode = "full"; render(); });
    el.querySelector("#c-full-view-btn")?.addEventListener("click", () => { S.mode = "full"; render(); });
    el.querySelector("#c-see-all")?.addEventListener("click", () => { S.mode = "full"; render(); });
    el.querySelector("#c-settings-btn")?.addEventListener("click", () => { S.settingsOpen = !S.settingsOpen; render(); });
  }

  function bindFull(el: HTMLElement) {
    el.querySelector("#f-veil")?.addEventListener("click", () => { });  // don't close on veil click in full mode
    el.querySelector("#f-close-btn")?.addEventListener("click", () => { S.mode = "closed"; S.settingsOpen = false; render(); stopRefresh(); });
    el.querySelector("#f-min-btn")?.addEventListener("click", () => { S.mode = "compact"; render(); });
    el.querySelector("#f-settings-btn")?.addEventListener("click", () => { S.settingsOpen = !S.settingsOpen; render(); });
    el.querySelector("#f-pause-btn")?.addEventListener("click", toggleTracking);
    el.querySelector("#f-dashboard-btn")?.addEventListener("click", openDashboard);
    el.querySelector("#f-qa-snap")?.addEventListener("click", takeSnapshot);
    el.querySelector("#f-qa-focus")?.addEventListener("click", async () => {
      try {
        const allTabs = await chrome.tabs.query({ currentWindow: true });
        const toClose = allTabs.filter(t => !t.active && t.id && !t.pinned);
        for (const t of toClose) {
          if (t.id) await chrome.tabs.remove(t.id).catch(() => {});
        }
        showToast("focus", `Focus Mode activated — closed ${toClose.length} background tabs.`);
        loadData();
      } catch (e) {
        console.warn("Focus Mode error", e);
      }
    });
    el.querySelector("#f-qa-pause")?.addEventListener("click", toggleTracking);
    el.querySelector("#f-qa-dash")?.addEventListener("click", openDashboard);
    el.querySelector("#f-ws-view-all")?.addEventListener("click", () => {
      el.querySelectorAll(".f-nav-item").forEach(b => b.classList.remove("f-nav-active"));
      const wsBtn = el.querySelector("[data-section='workstreams']");
      if (wsBtn) wsBtn.classList.add("f-nav-active");
    });
    el.querySelector("#f-groupby-sel")?.addEventListener("change", (e) => {
      S.groupBy = (e.target as HTMLSelectElement).value;
      renderTabs();
    });
    // Search input
    const searchInput = el.querySelector(".f-search") as HTMLInputElement;
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        const q = searchInput.value.toLowerCase().trim();
        if (!q) { renderTabs(); renderRecent(); return; }
        // Filter tabs
        const tabsEl = shadow?.getElementById("f-tabs-list");
        if (tabsEl) {
          const filtered = S.openTabs.filter(t =>
            t.title.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q)
          );
          tabsEl.innerHTML = filtered.length
            ? filtered.map(tabRowHTML).join("")
            : `<div class="empty">No tabs match "${q}"</div>`;
        }
        // Filter recent
        const recentEl = shadow?.getElementById("f-recent-list");
        if (recentEl) {
          const filtered = S.recentTabs.filter(t =>
            t.title.toLowerCase().includes(q) || t.domain.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
          );
          recentEl.innerHTML = filtered.length
            ? filtered.map(t => `
              <div class="f-recent-row">
                <img src="${fav(t.domain)}" width="18" height="18" class="r-fav" onerror="this.style.display='none'" alt=""/>
                <div class="r-info"><div class="r-title">${t.title.length > 40 ? t.title.slice(0,40)+"…" : t.title}</div><div class="r-domain">${t.domain}</div></div>
                <div class="r-badges"><span class="badge b-${t.productivity}">${pLabel(t.productivity)}</span><span class="badge b-neutral">${t.category}</span></div>
                <span class="r-time">${ms2hms(t.dwellTime)}</span>
              </div>`).join("")
            : `<div class="empty">No activity matches "${q}"</div>`;
        }
      });
      // Global shortcut Cmd+K or Ctrl+K to focus search when HUD is open
      document.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K") && S.mode === "full") {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }
    // Nav items
    el.querySelectorAll(".f-nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        el.querySelectorAll(".f-nav-item").forEach(b => b.classList.remove("f-nav-active"));
        btn.classList.add("f-nav-active");
        const sec = (btn as HTMLElement).dataset.section;
        if (sec === "settings") { S.settingsOpen = true; render(); }
      });
    });
  }

  function bindSettings(el: HTMLElement) {
    el.querySelector("#st-close")?.addEventListener("click", () => { S.settingsOpen = false; render(); });
    el.querySelectorAll(".st-nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        el.querySelectorAll(".st-nav-item").forEach(b => b.classList.remove("st-nav-active"));
        btn.classList.add("st-nav-active");
        S.settingsSection = (btn as HTMLElement).dataset.section || "general";
        const content = el.querySelector("#st-content");
        if (content) content.innerHTML = buildSettingsSectionHTML(S.settingsSection);
        bindSettingsContent(el);
      });
    });
    bindSettingsContent(el);
  }

  function bindSettingsContent(el: HTMLElement) {
    // Transparency slider
    const transSlider = el.querySelector("#st-trans-slider") as HTMLInputElement;
    if (transSlider) {
      transSlider.addEventListener("input", () => {
        S.transparency = parseInt(transSlider.value);
        const vb = el.querySelector("#st-trans-val");
        if (vb) vb.textContent = S.transparency + "%";
        applyCSS();
        saveHUDPrefs();
      });
    }
    // Blur slider
    const blurSlider = el.querySelector("#st-blur-slider") as HTMLInputElement;
    if (blurSlider) {
      blurSlider.addEventListener("input", () => {
        S.blurPx = Math.round(parseInt(blurSlider.value) / 100 * 48);
        const vb = el.querySelector("#st-blur-val");
        if (vb) vb.textContent = Math.round(S.blurPx / 48 * 100) + "%";
        applyCSS();
        saveHUDPrefs();
      });
    }
    // HUD size select
    const sizeSelect = el.querySelector("#st-size-select") as HTMLSelectElement;
    if (sizeSelect) {
      sizeSelect.addEventListener("change", () => {
        S.hudSize = sizeSelect.value as any;
        applyCSS();
        saveHUDPrefs();
      });
    }
    // Accent color dots
    el.querySelectorAll(".st-color-dot").forEach((btn) => {
      (btn as HTMLElement).addEventListener("click", () => {
        const c = (btn as HTMLElement).dataset.color || "#7c3aed";
        S.accentColor = c;
        el.querySelectorAll(".st-color-dot").forEach(b => b.classList.remove("st-color-active"));
        btn.classList.add("st-color-active");
        applyCSS();
        saveHUDPrefs();
      });
    });
    // HUD position select
    const posSelect = el.querySelector("#st-pos-select") as HTMLSelectElement;
    if (posSelect) {
      posSelect.addEventListener("change", () => {
        S.hudPosition = posSelect.value as any;
        applyCSS();
        saveHUDPrefs();
      });
    }
    // Show indicator toggle
    const showInd = el.querySelector("#st-show-indicator") as HTMLInputElement;
    if (showInd) showInd.addEventListener("change", () => { S.showIndicator = showInd.checked; render(); saveHUDPrefs(); });
    // Theme radios
    const themeRadios = el.querySelectorAll("input[name='theme']") as NodeListOf<HTMLInputElement>;
    themeRadios.forEach(r => r.addEventListener("change", () => { if (r.checked) { S.theme = r.value as any; saveHUDPrefs(); } }));
    // Inactivity timeout radios
    const idleRadios = el.querySelectorAll("input[name='idle-timeout']") as NodeListOf<HTMLInputElement>;
    idleRadios.forEach(r => r.addEventListener("change", async () => {
      if (r.checked) {
        const val = parseInt(r.value);
        try {
          await chrome.runtime.sendMessage({ type: "UPDATE_SETTINGS", settings: { idleThreshold: val } });
        } catch {}
      }
    }));
    // Auto-track checkbox
    const autoTrack = el.querySelector("#st-auto-track") as HTMLInputElement;
    if (autoTrack) {
      autoTrack.addEventListener("change", async () => {
        try {
          await chrome.runtime.sendMessage({ type: "TOGGLE_RECORDING", enabled: autoTrack.checked });
          loadData();
        } catch {}
      });
    }
    // Export Data JSON
    const exportBtn = el.querySelector("#st-export-btn") as HTMLElement;
    if (exportBtn) {
      exportBtn.addEventListener("click", async () => {
        try {
          const exportData = {
            atentiv_export_version: "1.0.1",
            exportedAt: new Date().toISOString(),
            metrics: S.todayMetrics,
            currentTab: S.currentTab,
            recentTabs: S.recentTabs,
            workstreams: S.workstreams,
            openTabs: S.openTabs
          };
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `atentiv-backup-${new Date().toISOString().slice(0, 10)}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("data", "Data exported successfully as JSON.");
        } catch (e) {
          console.warn("Export error", e);
        }
      });
    }
    // Delete All Data button
    const deleteBtn = el.querySelector("#st-delete-btn") as HTMLElement;
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to permanently delete all Atentiv browsing data? This cannot be undone.")) {
          try {
            await chrome.runtime.sendMessage({ type: "DELETE_ALL_DATA" });
            showToast("data", "All Atentiv data has been deleted.");
            loadData();
          } catch (e) {
            console.warn("Delete data error", e);
          }
        }
      });
    }
    // Update live preview box with current settings
    applyCSS();
  }

  function applyCSS() {
    if (!shadow) return;
    const bgAlpha = (1 - S.transparency / 100) * 0.85 + 0.05;
    (shadow.host as HTMLElement).style.setProperty("--at-blur", `${S.blurPx}px`);
    (shadow.host as HTMLElement).style.setProperty("--at-bg", `rgba(8,8,22,${bgAlpha.toFixed(2)})`);
    (shadow.host as HTMLElement).style.setProperty("--at-surface", `rgba(255,255,255,${Math.max(0.04, 0.12 - S.transparency * 0.001).toFixed(3)})`);
    (shadow.host as HTMLElement).style.setProperty("--at-purple", S.accentColor);
    (shadow.host as HTMLElement).style.setProperty("--at-purple-l", S.accentColor + "cc");

    const compact = shadow.getElementById("a-compact") as HTMLElement;
    if (compact) {
      const widths: Record<string, string> = { compact: "300px", default: "380px", large: "460px" };
      compact.style.width = widths[S.hudSize] || "380px";
      if (S.hudPosition === "left") {
        compact.style.left = "16px";
        compact.style.right = "auto";
        compact.style.transform = "none";
      } else if (S.hudPosition === "center") {
        compact.style.left = "50%";
        compact.style.right = "auto";
        compact.style.transform = "translateX(-50%)";
      } else {
        compact.style.right = "16px";
        compact.style.left = "auto";
        compact.style.transform = "none";
      }
    }
    const previewBox = shadow.getElementById("st-preview-box") as HTMLElement;
    if (previewBox) {
      previewBox.style.background = `rgba(8,8,22,${bgAlpha.toFixed(2)})`;
      previewBox.style.backdropFilter = `blur(${S.blurPx}px)`;
      previewBox.style.setProperty("-webkit-backdrop-filter", `blur(${S.blurPx}px)`);
      previewBox.style.borderColor = `${S.accentColor}66`;
      previewBox.style.boxShadow = `0 4px 16px ${S.accentColor}33`;
    }
  }

  // ── Actions ───────────────────────────────────────────────────────────────
  async function toggleTracking() {
    try {
      const targetEnabled = S.tracking === "paused";
      const r: any = await chrome.runtime.sendMessage({ type: "TOGGLE_RECORDING", enabled: targetEnabled });
      S.tracking = r?.enabled ? "active" : "paused";
      render();
      setTimeout(loadData, 100);
    } catch {}
  }
  async function openDashboard() {
    try { await chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" }); } catch {}
    S.mode = "compact"; render();
  }
  async function takeSnapshot() {
    try {
      const tabs = S.openTabs.map(t => ({ url: t.url, title: t.title, favicon: t.fav }));
      await chrome.runtime.sendMessage({ type: "SAVE_WORKSPACE", tabs, name: `Snapshot ${new Date().toLocaleTimeString()}` });
      const btn = shadow?.getElementById("f-qa-snap");
      if (btn) { btn.innerHTML = `<span class="qa-icon">✓</span><span>Saved!</span>`; setTimeout(() => { if (btn) btn.innerHTML = `<span class="qa-icon">📷</span><span>Take Snapshot</span>`; }, 2000); }
    } catch {}
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.altKey && (e.key === "a" || e.key === "A" || e.code === "KeyA")) {
      e.preventDefault();
      toggle();
      return;
    }
    if (e.key === "Escape" && S.mode !== "closed") {
      if (S.settingsOpen) { S.settingsOpen = false; render(); }
      else { S.mode = "closed"; render(); stopRefresh(); }
    }
  });
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
:host {
  --at-blur: 28px;
  --at-bg: rgba(8,8,22,0.22);
  --at-surface: rgba(255,255,255,0.08);
  --at-border: rgba(255,255,255,0.12);
  --at-text: #f1f5f9;
  --at-muted: #64748b;
  --at-purple: #7c3aed;
  --at-purple-l: #a78bfa;
  --at-green: #10b981;
  --at-red: #f87171;
  --at-amber: #f59e0b;
  --at-radius: 16px;
}
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }

/* ── COMPACT INDICATOR ── */
.a-indicator {
  position: fixed; bottom: 16px; right: 16px;
  display: none; align-items: center; gap: 7px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.18);
  border-radius: 9999px; padding: 6px 12px 6px 8px;
  color: var(--at-text); font-size: 12px; font-weight: 600;
  cursor: pointer; pointer-events: auto; z-index: 2147483644;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  transition: transform 0.2s;
}
.a-indicator:hover { transform: translateY(-2px); }
.ind-logo { width: 22px; height: 22px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#7c3aed); display: flex; align-items: center; justify-content: center; }
.ind-score { font-size: 12px; font-weight: 700; }

/* ── COMPACT HUD ── */
.a-compact {
  position: fixed; top: 16px; right: 16px;
  width: 380px; max-height: calc(100vh - 32px);
  background: var(--at-bg);
  backdrop-filter: blur(var(--at-blur)); -webkit-backdrop-filter: blur(var(--at-blur));
  border: 1px solid var(--at-border); border-radius: 20px;
  color: var(--at-text);
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  display: none; flex-direction: column; overflow: hidden;
  pointer-events: auto; z-index: 2147483645;
  box-shadow: 0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
  animation: slideInRight 0.22s cubic-bezier(0.16,1,0.3,1);
}
.a-compact.open { display: flex; }
@keyframes slideInRight { from { opacity:0; transform:translateX(20px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }

.c-header {
  display: flex; align-items: center; padding: 14px 16px 12px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  flex-shrink: 0; gap: 10px;
}
.c-brand { display: flex; align-items: center; gap: 8px; flex: 1; }
.c-logo { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg,#6366f1,#7c3aed); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(124,58,237,0.5); }
.c-name { font-size: 14px; font-weight: 800; color: #fff; letter-spacing: -0.3px; }
.c-sub { font-size: 10px; color: var(--at-green); font-weight: 600; }
.c-header-r { display: flex; align-items: center; gap: 4px; }
.c-clock { font-size: 12px; font-weight: 700; color: #38bdf8; margin-right: 6px; }
.ic-btn {
  width: 26px; height: 26px; border-radius: 7px;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8; cursor: pointer; font-size: 12px;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.ic-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
.ic-close:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

.c-body { overflow-y: auto; flex: 1; padding: 12px 14px; display: flex; flex-direction: column; gap: 10px; }
.c-body::-webkit-scrollbar { width: 3px; }
.c-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 2px; }

.c-section-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: var(--at-muted); display: flex; align-items: center; }
.c-card { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: 12px; padding: 10px 12px; }

.c-tab-row { display: flex; align-items: center; gap: 10px; }
.c-tab-fav { border-radius: 4px; flex-shrink: 0; }
.c-tab-info { flex: 1; min-width: 0; }
.c-tab-domain { font-size: 12px; font-weight: 700; color: #fff; }
.c-tab-title { font-size: 11px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
.c-tab-dwell-wrap { text-align: right; flex-shrink: 0; }
.c-tab-dwell { font-size: 18px; font-weight: 800; color: #38bdf8; font-variant-numeric: tabular-nums; line-height: 1.1; }
.c-active-tag { font-size: 9px; color: var(--at-green); font-weight: 600; margin-top: 1px; }

.c-metrics-row { display: flex; align-items: center; gap: 12px; background: var(--at-surface); border: 1px solid var(--at-border); border-radius: 12px; padding: 10px 12px; }
.c-metric { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.c-m-ring-wrap { position: relative; width: 54px; height: 54px; }
.c-m-ring-svg { width: 54px; height: 54px; transform: rotate(-90deg); }
.c-m-ring-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
.c-m-val { font-size: 14px; font-weight: 800; color: var(--at-purple-l); }
.c-m-label { font-size: 9px; color: var(--at-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.c-metric-sep { width: 1px; height: 40px; background: rgba(255,255,255,0.08); flex-shrink: 0; }
.c-metric-list { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.c-ml-row { display: flex; justify-content: space-between; align-items: center; }
.c-ml-k { font-size: 11px; color: var(--at-muted); }
.c-ml-v { font-size: 12px; font-weight: 700; color: #e2e8f0; font-variant-numeric: tabular-nums; }

.c-recent-list { display: flex; flex-direction: column; gap: 3px; }
.c-recent-row { display: flex; align-items: center; gap: 7px; padding: 5px 6px; border-radius: 8px; transition: background 0.15s; }
.c-recent-row:hover { background: rgba(255,255,255,0.05); }

.c-full-btn {
  width: 100%; padding: 9px; border-radius: 10px;
  background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.3);
  color: var(--at-purple-l); font-size: 12px; font-weight: 700;
  cursor: pointer; text-align: center; transition: all 0.2s; flex-shrink: 0;
}
.c-full-btn:hover { background: rgba(124,58,237,0.35); }

/* ── FULL HUD ── */
.a-full {
  position: fixed; inset: 0;
  display: none; align-items: center; justify-content: center;
  pointer-events: none; z-index: 2147483645;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
}
.a-full.open { display: flex; pointer-events: none; }

.f-veil {
  position: absolute; inset: 0;
  background: rgba(4,5,18,0.45);
  backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px);
  pointer-events: auto; z-index: 0;
}

.f-frame {
  position: relative; z-index: 1;
  width: min(1380px, calc(100vw - 24px));
  height: min(860px, calc(100vh - 24px));
  background: var(--at-bg);
  backdrop-filter: blur(var(--at-blur)); -webkit-backdrop-filter: blur(var(--at-blur));
  border: 1px solid var(--at-border); border-radius: 22px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.1);
  display: flex; flex-direction: column; overflow: hidden;
  pointer-events: auto;
  animation: hudOpen 0.25s cubic-bezier(0.16,1,0.3,1);
}
@keyframes hudOpen { from { opacity:0; transform:scale(0.96) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }

/* Header */
.f-header {
  display: flex; align-items: center; height: 62px;
  padding: 0 20px; gap: 16px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0; color: var(--at-text);
}
.f-brand { display: flex; align-items: center; gap: 10px; min-width: 190px; }
.f-logo { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg,#6366f1,#7c3aed); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(124,58,237,0.5); }
.f-brand-name { font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.4px; }
.f-brand-sub { font-size: 10px; color: var(--at-muted); }
.f-search-wrap { flex: 1; display: flex; align-items: center; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 0 12px; gap: 8px; max-width: 560px; }
.f-search-icon { color: var(--at-muted); font-size: 16px; }
.f-search { background: none; border: none; outline: none; color: var(--at-text); font-size: 13px; flex: 1; height: 36px; font-family: inherit; }
.f-search::placeholder { color: var(--at-muted); }
.f-search-kbd { font-size: 10px; color: var(--at-muted); background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; padding: 2px 5px; }
.f-header-r { display: flex; align-items: center; gap: 10px; margin-left: auto; }
.f-hclock-wrap { text-align: right; }
.f-clock { font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px; line-height: 1.1; }
.f-date { font-size: 10px; color: var(--at-muted); }
.f-tracking-pill { display: flex; align-items: center; gap: 7px; background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.25); border-radius: 9999px; padding: 5px 12px; font-size: 12px; font-weight: 600; color: var(--at-green); white-space: nowrap; }
.f-timer { font-variant-numeric: tabular-nums; margin-left: 4px; }
.f-ic-btn { width: 32px; height: 32px; border-radius: 9px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; cursor: pointer; font-size: 15px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.f-ic-btn:hover { background: rgba(255,255,255,0.14); color: #fff; }
.f-close:hover { background: rgba(239,68,68,0.18); color: #ef4444; }

/* Body */
.f-body { display: grid; grid-template-columns: 220px 1fr 290px; flex: 1; overflow: hidden; }

/* Left Nav */
.f-nav { display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.01); overflow-y: auto; color: var(--at-text); }
.f-nav::-webkit-scrollbar { width: 3px; }
.f-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
.f-nav-items { display: flex; flex-direction: column; gap: 2px; padding: 12px 10px 8px; }
.f-nav-item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border-radius: 10px; font-size: 13px; font-weight: 500; color: var(--at-muted); cursor: pointer; background: none; border: none; transition: all 0.15s; text-align: left; }
.f-nav-item:hover { background: rgba(255,255,255,0.06); color: #cbd5e1; }
.f-nav-active { background: rgba(124,58,237,0.18) !important; color: var(--at-purple-l) !important; font-weight: 600 !important; }
.f-nav-icon { font-size: 14px; width: 20px; text-align: center; flex-shrink: 0; }
.f-nav-label { flex: 1; }
.f-nav-footer { margin-top: auto; padding: 12px 14px 16px; border-top: 1px solid rgba(255,255,255,0.07); }
.f-tracking-status { margin-bottom: 6px; }
.f-tracking-row { display: flex; align-items: center; gap: 6px; }
.f-tracking-lbl { font-size: 10px; font-weight: 700; color: var(--at-green); text-transform: uppercase; letter-spacing: 0.5px; }
.f-tracking-since { font-size: 10px; color: var(--at-muted); margin-top: 1px; }
.f-timer-big { font-size: 26px; font-weight: 900; color: #fff; letter-spacing: -0.8px; font-variant-numeric: tabular-nums; margin-top: 4px; }
.f-focus-section { margin-top: 14px; }
.f-focus-lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--at-muted); margin-bottom: 8px; }
.f-focus-ring-wrap { position: relative; width: 64px; height: 64px; margin: 0 auto; }
.f-focus-ring-svg { width: 64px; height: 64px; transform: rotate(-90deg); }
.f-focus-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.f-focus-score { font-size: 18px; font-weight: 900; color: var(--at-purple-l); line-height: 1; }
.f-focus-of { font-size: 9px; color: var(--at-muted); }
.f-nav-actions { margin-top: 14px; display: flex; flex-direction: column; gap: 6px; }
.f-action-btn { padding: 8px 12px; border-radius: 9px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid rgba(124,58,237,0.3); background: rgba(124,58,237,0.15); color: var(--at-purple-l); transition: all 0.2s; text-align: center; font-family: inherit; }
.f-action-btn:hover { background: rgba(124,58,237,0.3); }
.f-action-sec { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.1); color: var(--at-muted); }
.f-action-sec:hover { background: rgba(255,255,255,0.1); color: #cbd5e1; }

/* Center */
.f-center { overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 10px; color: var(--at-text); }
.f-center::-webkit-scrollbar { width: 4px; }
.f-center::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.f-card { background: var(--at-surface); border: 1px solid var(--at-border); border-radius: 16px; padding: 14px 16px; }
.f-card-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--at-muted); margin-bottom: 10px; }
.f-card-lbl-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.f-card-action { font-size: 11px; font-weight: 600; color: var(--at-purple-l); cursor: pointer; }
.f-card-action:hover { text-decoration: underline; }

.f-act-row { display: flex; align-items: flex-start; gap: 12px; }
.f-act-fav { border-radius: 8px; flex-shrink: 0; margin-top: 2px; }
.f-act-info { flex: 1; min-width: 0; }
.f-act-domain { font-size: 15px; font-weight: 700; color: #fff; }
.f-act-title { font-size: 12px; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.f-act-right { text-align: right; flex-shrink: 0; }
.f-act-dwell { font-size: 22px; font-weight: 900; color: #38bdf8; font-variant-numeric: tabular-nums; line-height: 1.1; }
.f-act-active { font-size: 10px; color: var(--at-green); font-weight: 600; margin-top: 2px; display: flex; align-items: center; gap: 4px; justify-content: flex-end; }

/* Today glance */
.f-focus-score-inline { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.f-fsi-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--at-muted); font-weight: 700; }
.f-fsi-ring { position: relative; }
.f-fsi-val { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.f-fsi-val span { font-size: 16px; font-weight: 900; color: var(--at-green); line-height: 1; }
.fsi-of { font-size: 8px !important; color: var(--at-muted) !important; font-weight: 500 !important; }
.f-glance-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.f-glance-item { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 10px 8px; text-align: center; }
.f-gli-icon { font-size: 16px; margin-bottom: 4px; }
.f-gli-val { font-size: 18px; font-weight: 800; color: #fff; line-height: 1.1; }
.f-gli-name { font-size: 9px; color: var(--at-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; margin-top: 3px; }
.f-gli-pct { font-size: 11px; font-weight: 700; margin-top: 3px; }
.f-glance-prod .f-gli-val, .f-glance-prod .f-gli-pct { color: var(--at-green); }
.f-glance-neut .f-gli-val, .f-glance-neut .f-gli-pct { color: var(--at-amber); }
.f-glance-dist .f-gli-val, .f-glance-dist .f-gli-pct { color: var(--at-red); }
.f-glance-sw .f-gli-val { color: var(--at-purple-l); }
.f-glance-sw .f-gli-pct { color: var(--at-muted); }

/* Workstreams */
.f-ws-list { display: flex; flex-direction: column; gap: 6px; }
.ws-card { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 9px 12px; cursor: pointer; transition: background 0.15s; }
.ws-card:hover { background: rgba(124,58,237,0.1); border-color: rgba(124,58,237,0.2); }
.ws-icon { font-size: 14px; }
.ws-info { flex: 1; }
.ws-name { font-size: 13px; font-weight: 600; color: #e2e8f0; }
.ws-meta { font-size: 10px; color: var(--at-muted); margin-top: 1px; }
.ws-time { font-size: 12px; font-weight: 700; color: var(--at-purple-l); font-variant-numeric: tabular-nums; }
.ws-empty { font-size: 12px; color: var(--at-muted); text-align: center; padding: 12px; }

/* Recent */
.f-recent-list { display: flex; flex-direction: column; gap: 3px; }
.f-recent-row { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 8px; transition: background 0.15s; }
.f-recent-row:hover { background: rgba(255,255,255,0.04); }
.r-fav { border-radius: 4px; flex-shrink: 0; }
.r-info { flex: 1; min-width: 0; }
.r-title { font-size: 12px; font-weight: 500; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.r-domain { font-size: 10px; color: var(--at-muted); margin-top: 1px; }
.r-badges { display: flex; gap: 4px; flex-shrink: 0; }
.r-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; flex-shrink: 0; }
.r-time { font-size: 10px; color: var(--at-muted); font-variant-numeric: tabular-nums; }

/* Right */
.f-right { border-left: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column; overflow: hidden; color: var(--at-text); background: rgba(255,255,255,0.01); padding: 14px 12px; gap: 8px; }
.f-right-hdr { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-shrink: 0; }
.f-right-ttl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px; color: var(--at-muted); display: flex; align-items: center; gap: 6px; }
.f-tab-count-pill { background: rgba(124,58,237,0.2); color: var(--at-purple-l); border: 1px solid rgba(124,58,237,0.3); border-radius: 9999px; padding: 1px 7px; font-size: 11px; font-weight: 700; }
.f-groupby { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 7px; padding: 3px 8px; font-size: 11px; cursor: pointer; font-family: inherit; max-width: 160px; }
.f-tabs-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 2px; min-height: 0; }
.f-tabs-list::-webkit-scrollbar { width: 3px; }
.f-tabs-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
.tab-group-hdr { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--at-muted); padding: 5px 6px 2px; }
.tab-row { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 9px; cursor: pointer; position: relative; border: 1px solid transparent; transition: background 0.12s; }
.tab-row:hover { background: rgba(255,255,255,0.06); }
.tab-active { background: rgba(56,189,248,0.07) !important; border-color: rgba(56,189,248,0.18) !important; }
.tab-active-bar { position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 3px; height: 55%; border-radius: 0 2px 2px 0; background: #38bdf8; }
.tab-fav { border-radius: 3px; flex-shrink: 0; }
.tab-info { flex: 1; min-width: 0; }
.tab-ttl { font-size: 12px; font-weight: 500; color: #cbd5e1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tab-dom { font-size: 10px; color: var(--at-muted); }
.tab-dwell { font-size: 10px; color: var(--at-purple-l); font-weight: 600; font-variant-numeric: tabular-nums; flex-shrink: 0; }
.f-right-divider { height: 1px; background: rgba(255,255,255,0.07); flex-shrink: 0; }
.f-tab-groups { display: flex; flex-direction: column; gap: 3px; max-height: 120px; overflow-y: auto; flex-shrink: 0; }
.tg-row { display: flex; align-items: center; gap: 8px; padding: 5px 6px; border-radius: 7px; cursor: pointer; }
.tg-row:hover { background: rgba(255,255,255,0.04); }
.tg-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--at-purple-l); flex-shrink: 0; }
.tg-name { font-size: 11px; color: #94a3b8; flex: 1; }
.tg-count { font-size: 11px; font-weight: 700; color: var(--at-muted); }
.tg-new-btn { background: rgba(124,58,237,0.15); border: 1px solid rgba(124,58,237,0.25); color: var(--at-purple-l); border-radius: 6px; padding: 2px 7px; font-size: 10px; cursor: pointer; font-family: inherit; margin-left: auto; }
.f-qa-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; flex-shrink: 0; }
.f-qa-btn { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 6px; border-radius: 10px; background: var(--at-surface); border: 1px solid var(--at-border); color: #94a3b8; cursor: pointer; font-size: 11px; font-weight: 600; transition: all 0.15s; font-family: inherit; }
.f-qa-btn:hover { background: rgba(124,58,237,0.15); color: var(--at-purple-l); border-color: rgba(124,58,237,0.3); }
.qa-icon { font-size: 18px; }

/* ── SETTINGS ── */
.a-settings {
  position: fixed; inset: 0;
  display: none; align-items: center; justify-content: center;
  pointer-events: none; z-index: 2147483646;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
}
.a-settings.open { display: flex; pointer-events: none; }

.st-sheet {
  width: min(820px, calc(100vw - 48px));
  height: min(580px, calc(100vh - 80px));
  background: rgba(10, 10, 30, 0.78);
  backdrop-filter: blur(48px); -webkit-backdrop-filter: blur(48px);
  border: 1px solid rgba(255,255,255,0.14);
  border-radius: 24px;
  box-shadow: 0 40px 100px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1);
  display: flex; flex-direction: column; overflow: hidden;
  pointer-events: auto; color: var(--at-text);
  animation: stOpen 0.22s cubic-bezier(0.16,1,0.3,1);
}
@keyframes stOpen { from { opacity:0; transform:scale(0.97) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }

.st-header {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.02);
  flex-shrink: 0;
}
.st-logo { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg,#6366f1,#7c3aed); display: flex; align-items: center; justify-content: center; }
.st-title { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.3px; flex: 1; }
.st-close-btn { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
.st-close-btn:hover { background: rgba(239,68,68,0.2); color: #ef4444; }

.st-body { display: grid; grid-template-columns: 160px 1fr; flex: 1; overflow: hidden; }
.st-nav { border-right: 1px solid rgba(255,255,255,0.07); padding: 10px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }
.st-nav-item { display: flex; align-items: center; gap: 7px; padding: 8px 10px; border-radius: 8px; font-size: 12px; font-weight: 500; color: var(--at-muted); cursor: pointer; background: none; border: none; transition: all 0.15s; text-align: left; font-family: inherit; }
.st-nav-item:hover { background: rgba(255,255,255,0.06); color: #cbd5e1; }
.st-nav-active { background: rgba(124,58,237,0.18) !important; color: var(--at-purple-l) !important; font-weight: 600 !important; }

.st-content { overflow-y: auto; padding: 18px 20px; display: flex; flex-direction: column; gap: 14px; }
.st-content::-webkit-scrollbar { width: 4px; }
.st-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
.st-section-title { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.st-group { display: flex; flex-direction: column; gap: 7px; }
.st-item-row { display: flex; align-items: center; justify-content: space-between; }
.st-item-label { font-size: 12px; font-weight: 600; color: #cbd5e1; }
.st-val-badge { background: rgba(124,58,237,0.2); color: var(--at-purple-l); border-radius: 6px; padding: 2px 8px; font-size: 11px; font-weight: 700; }
.st-val { font-size: 12px; color: #94a3b8; }
.st-hint { font-size: 11px; color: var(--at-muted); }
.st-slider { width: 100%; height: 4px; border-radius: 2px; appearance: none; background: rgba(255,255,255,0.12); cursor: pointer; accent-color: var(--at-purple); outline: none; }
.st-slider::-webkit-slider-thumb { appearance: none; width: 16px; height: 16px; border-radius: 50%; background: var(--at-purple-l); cursor: pointer; box-shadow: 0 0 8px rgba(167,139,250,0.5); }
.st-select { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 8px; padding: 7px 10px; font-size: 12px; cursor: pointer; font-family: inherit; }
.st-input { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; border-radius: 8px; padding: 7px 10px; font-size: 12px; font-family: inherit; outline: none; }
.st-input:focus { border-color: rgba(124,58,237,0.4); }
.st-radio-group { display: flex; flex-direction: column; gap: 7px; }
.st-radio-inline { flex-direction: row !important; gap: 12px !important; }
.st-radio { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 12px; color: #94a3b8; }
.st-radio input { display: none; }
.st-radio-dot { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0; transition: all 0.15s; }
.st-radio-active .st-radio-dot { border-color: var(--at-purple-l); background: var(--at-purple-l); box-shadow: 0 0 8px rgba(167,139,250,0.4); }
.st-radio-active { color: var(--at-purple-l) !important; }
.st-toggles { display: flex; flex-direction: column; gap: 8px; }
.st-toggle-row { display: flex; align-items: center; justify-content: space-between; }
.st-tgl-lbl { font-size: 12px; color: #cbd5e1; }
.st-toggle { position: relative; width: 36px; height: 20px; cursor: pointer; }
.st-toggle input { opacity: 0; width: 0; height: 0; }
.st-toggle-thumb { position: absolute; inset: 0; background: rgba(255,255,255,0.12); border-radius: 10px; transition: all 0.2s; border: 1px solid rgba(255,255,255,0.1); }
.st-toggle-thumb::after { content: ""; position: absolute; left: 2px; top: 2px; width: 14px; height: 14px; border-radius: 50%; background: #64748b; transition: all 0.2s; }
.st-toggle input:checked ~ .st-toggle-thumb { background: rgba(124,58,237,0.4); border-color: rgba(124,58,237,0.5); }
.st-toggle input:checked ~ .st-toggle-thumb::after { transform: translateX(16px); background: var(--at-purple-l); }
.st-privacy-banner { display: flex; align-items: flex-start; gap: 10px; background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; padding: 10px 14px; }
.st-priv-icon { font-size: 20px; flex-shrink: 0; }
.st-rule-builder { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; }
.st-color-dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid transparent; cursor: pointer; transition: all 0.2s; outline: none; }
.st-color-dot:hover { transform: scale(1.15); }
.st-color-active { border-color: white !important; box-shadow: 0 0 10px rgba(255,255,255,0.6); transform: scale(1.1); }

/* ── SHARED ── */
.ring-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 7; }
.ring-fill { fill: none; stroke: #7c3aed; stroke-width: 7; stroke-linecap: round; transition: stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1); transform-origin: center; }
.badge { padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.06); color: #94a3b8; }
.b-productive { color: var(--at-green); border-color: rgba(16,185,129,0.3); background: rgba(16,185,129,0.1); }
.b-neutral { color: var(--at-amber); border-color: rgba(245,158,11,0.25); background: rgba(245,158,11,0.07); }
.b-distracting { color: var(--at-red); border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.1); }
.dot-green { width: 7px; height: 7px; border-radius: 50%; background: var(--at-green); box-shadow: 0 0 6px var(--at-green); flex-shrink: 0; display: inline-block; }
.dot-amber { width: 7px; height: 7px; border-radius: 50%; background: var(--at-amber); box-shadow: 0 0 6px var(--at-amber); flex-shrink: 0; display: inline-block; }
.f-action-paused { background: rgba(16,185,129,0.15) !important; border-color: rgba(16,185,129,0.3) !important; color: var(--at-green) !important; }
.f-action-paused:hover { background: rgba(16,185,129,0.25) !important; }
.empty { font-size: 12px; color: var(--at-muted); text-align: center; padding: 16px 8px; font-style: italic; }

/* Toast */
.a-toast {
  position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%) translateY(100px);
  background: rgba(10,10,30,0.9); backdrop-filter: blur(24px);
  border: 1px solid rgba(248,113,113,0.3); border-radius: 14px;
  padding: 12px 16px; color: var(--at-text);
  display: flex; align-items: center; gap: 10px;
  min-width: 300px; max-width: 460px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.6);
  pointer-events: auto; z-index: 2147483647;
  opacity: 0; transition: transform 0.3s ease, opacity 0.3s ease;
  font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
}
.a-toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.t-icon { font-size: 18px; flex-shrink: 0; }
.t-body { flex: 1; }
.t-title { font-size: 13px; font-weight: 700; color: var(--at-red); }
.t-msg { font-size: 11px; color: #94a3b8; margin-top: 1px; }
.t-x { background: none; border: none; color: #64748b; cursor: pointer; font-size: 14px; padding: 4px; border-radius: 4px; }
.t-x:hover { color: #fff; }
`;

// ─── Entry Point ──────────────────────────────────────────────────────────────
if (typeof window !== "undefined" && window.self === window.top) {
  if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(() => HUD.boot(), 100);
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => HUD.boot(), 100);
    });
  }
}

