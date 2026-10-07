/**
 * Message Router — Background Service Worker
 * Handles communication between Side Panel, Dashboard, Options, and Content Scripts.
 */
import { SessionManager } from "./sessionManager";
import { MetricsRepository } from "../db/repositories/metricsRepository";
import { TraceRepository } from "../db/repositories/traceRepository";
import { RuleRepository } from "../db/repositories/ruleRepository";
import { WorkstreamRepository } from "../db/repositories/workstreamRepository";
import { db } from "../db/database";
import type { SnapshotRecord, UserFeedbackRecord } from "../db/schemas";
import { sanitizeUrl } from "../features/textFeatures";
import { ExclusionEngine } from "../privacy/exclusionEngine";
import { DEFAULT_PRODUCTIVE_DOMAINS, DEFAULT_UNPRODUCTIVE_DOMAINS } from "../model";
import { SmartNavigationEngine } from "./smartNavigationEngine";

export class MessageRouter {
  static setupRouter(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender)
        .then((res) => sendResponse(res))
        .catch((err) => sendResponse({ error: String(err) }));
      return true; // Keep channel open for async response
    });
  }

  private static async handleMessage(
    msg: { type: string; [key: string]: any },
    sender?: chrome.runtime.MessageSender
  ): Promise<any> {
    switch (msg.type) {
      case "read":
      case "GET_STATE": {
        await SessionManager.reconcile();
        const active = SessionManager.getActiveCheckpoint();
        const todayMetrics = await MetricsRepository.getTodaySummary();
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const activeWorkstreams = await WorkstreamRepository.listActive(10);
        const rules = await RuleRepository.listAll();
        const dbSnapshots = await db.snapshots.orderBy("timestamp").reverse().toArray();
        const dbSessions = await db.tab_sessions.orderBy("start_time").reverse().limit(100).toArray();
        const traces = await TraceRepository.getRecent(msg.limit || 50);

        const categoryColors: Record<string, string> = {
          Technology: "#6366f1",
          Education: "#10b981",
          Work: "#3b82f6",
          Chat: "#f59e0b",
          Entertainment: "#ec4899",
          Shop: "#8b5cf6",
          News: "#06b6d4",
          Government: "#64748b",
          Health: "#ef4444",
          Travel: "#14b8a6",
          Uncategorized: "#94a3b8",
        };

        const visits = dbSessions.map((s) => ({
          id: s.session_id,
          title: s.title,
          url: s.url,
          stream: s.workstream_id,
          start: s.start_time,
          end: s.start_time + s.dwell_time,
          tabId: s.tab_id,
          switched: false,
          category: s.category,
          activity: s.activity_type,
          productivity: s.productivity_type,
          domain: s.domain,
          dwellTime: s.dwell_time,
        }));

        const streams = activeWorkstreams.length > 0
          ? activeWorkstreams.map((ws) => ({
              id: ws.workstream_id,
              name: ws.name,
              color: categoryColors[ws.category] || "#6366f1",
              keywords: (ws as any).keywords ? (ws as any).keywords.join(", ") : "",
              domains: (ws as any).domains ? (ws as any).domains.join(", ") : "",
            }))
          : [
              { id: "ws-tech", name: "Engineering & Tech", color: "#6366f1", keywords: "code, dev", domains: "github.com" },
              { id: "ws-edu", name: "Research & Learning", color: "#10b981", keywords: "study, docs", domains: "arxiv.org" },
              { id: "ws-other", name: "General Browsing", color: "#94a3b8", keywords: "", domains: "" },
            ];

        const snapshots = dbSnapshots.map((s) => ({
          id: s.snapshot_id,
          name: s.title,
          note: (s as any).note || "",
          created: s.timestamp,
          tabs: s.saved_tabs.map((t) => ({ title: t.title, url: t.url })),
        }));

        const goalData = await chrome.storage.local.get("atentiv_goal");
        const currentGoal = goalData.atentiv_goal || { goal: "", end: 0, stream: "" };

        const legacyState = {
          enabled: settings.enabled ?? true,
          streams,
          visits,
          snapshots,
          excluded: (settings.exclusions || []).join(", "),
          goal: currentGoal.goal || "",
          goalEnd: currentGoal.end || 0,
          goalStream: currentGoal.stream || "",
          productiveDomains: settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS,
          unproductiveDomains: settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS,
          idleThresholdSeconds: settings.idleThresholdSeconds ?? 180,
          idleSeconds: 0,
          isIdle: false,
        };

        await chrome.storage.local.set({ state: legacyState });

        return {
          state: legacyState,
          active,
          todayMetrics,
          settings,
          activeWorkstreams,
          rules,
          snapshots: dbSnapshots,
          traces,
        };
      }

      case "GET_HUD_STATE": {
        // Lightweight HUD-optimized state response
        await SessionManager.reconcile();
        const active = SessionManager.getActiveCheckpoint();
        const todayMetrics = await MetricsRepository.getTodaySummary();
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const enabled = settings.enabled ?? true;

        const sessionMeta = await chrome.storage.session.get(["trackingState", "untrackableReason"]);
        const trackingState = sessionMeta?.trackingState || (active ? "TRACKING" : !enabled ? "PAUSED" : "INACTIVE");
        const isUntrackable = trackingState === "UNTRACKABLE";
        const isIdle = !isUntrackable && active === null && enabled;

        const activeWorkstreams = await WorkstreamRepository.listActive(10);
        const recentSessions = await db.tab_sessions
          .orderBy("start_time")
          .reverse()
          .limit(8)
          .toArray();

        const recentTabs = recentSessions.map((s) => ({
          domain: s.domain,
          title: s.title,
          url: s.url,
          productivity: s.productivity_type,
          category: s.category || "Browsing",
          activity: s.activity_type || "General",
          workstream: s.workstream_name || "",
          dwellTime: s.dwell_time,
        }));

        let openTabs: any[] = [];
        try {
          if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
            const allTabs = await chrome.tabs.query({});
            openTabs = allTabs
              .filter((t) => {
                const u = t.url || (t as any).pendingUrl || "";
                return !u.startsWith("chrome://") && !u.startsWith("chrome-extension://") && !u.startsWith("edge://");
              })
              .map((t) => {
                let domain = "";
                try { domain = new URL(t.url || "").hostname.replace(/^www\./, ""); } catch {}
                return {
                  id: t.id,
                  title: t.title || domain || t.url || "New Tab",
                  url: t.url || "",
                  domain,
                  favIconUrl: t.favIconUrl,
                  active: t.active,
                };
              });
          }
        } catch {}

        const currentTabInfo = active
          ? {
              domain: active.domain,
              title: active.title,
              url: active.url,
              category: active.category,
              activity: active.activity,
              productivity: active.productivity as "productive" | "neutral" | "distracting",
              activeDwellTime: active.dwellTime,
            }
          : {
              domain: isUntrackable ? "Restricted Page" : "",
              title: isUntrackable
                ? "Tracking unavailable on internal browser page (chrome://, edge://, about:). Atentiv will resume automatically on a supported webpage."
                : "",
              url: "",
              category: isUntrackable ? "Untrackable" : "Browsing",
              activity: isUntrackable ? "System" : "General",
              productivity: "neutral" as const,
              activeDwellTime: 0,
            };

        // Compute score: FR-12: T = 0 returns no score (null/hasData: false)
        let score: number | null = null;
        let productiveMs = 0;
        let distractingMs = 0;
        let neutralMs = 0;
        let switchCount = 0;
        let hasData = false;

        if (todayMetrics && todayMetrics.totalActiveSeconds > 0) {
          score = isNaN(todayMetrics.focusScore) ? 0 : Math.round(todayMetrics.focusScore);
          productiveMs = todayMetrics.productiveSeconds * 1000;
          distractingMs = todayMetrics.distractingSeconds * 1000;
          neutralMs = todayMetrics.neutralSeconds * 1000;
          switchCount = todayMetrics.switchCount;
          hasData = true;
        } else if (active && active.dwellTime > 0) {
          const liveProductivity = active.productivity;
          const liveDwellMs = active.dwellTime;
          productiveMs = liveProductivity === "productive" ? liveDwellMs : 0;
          distractingMs = liveProductivity === "distracting" ? liveDwellMs : 0;
          neutralMs = liveProductivity === "neutral" ? liveDwellMs : 0;
          const prodRatio = liveProductivity === "productive" ? 1 : 0;
          score = Math.max(0, Math.min(100, Math.round(100 * (0.65 * prodRatio + 0.35 * 1.0))));
          hasData = true;
        }

        return {
          currentTab: currentTabInfo,
          todayMetrics: {
            score,
            hasData,
            productiveTime: productiveMs,
            unproductiveTime: distractingMs,
            neutralTime: neutralMs,
            idleTime: 0,
            switches: switchCount,
          },
          status: {
            trackingState,
            isEnabled: enabled,
            isRecording: enabled && !isUntrackable && active !== null,
            isPaused: !enabled,
            isIdle,
            isUntrackable,
            state: !enabled ? "paused" : isUntrackable ? "untrackable" : active ? "active" : "idle",
            message: isUntrackable
              ? "Tracking unavailable on internal browser page (chrome://, edge://, about:). Atentiv will resume automatically on a supported webpage."
              : !enabled
              ? "Tracking paused by user."
              : isIdle
              ? "Tracking paused — inactive."
              : "Tracking active",
          },
          activeWorkstreams,
          recentTabs,
          openTabs,
        };
      }

      case "GET_TRACES": {
        const traces = await TraceRepository.getRecent(msg.limit || 50);
        return { traces };
      }

      case "SAVE_WORKSPACE":
      case "saveSnapshot":
      case "save": {
        let validTabs: Array<{ url: string; title: string; favicon?: string }> = [];
        if (Array.isArray(msg.tabs) && msg.tabs.length > 0) {
          validTabs = msg.tabs.map((t: any) => ({
            url: sanitizeUrl(t.url)?.sanitized || t.url,
            title: t.title || t.url,
            favicon: t.favicon,
          }));
        } else {
          const tabs = await chrome.tabs.query({ currentWindow: true });
          for (const t of tabs) {
            if (!t.url || t.incognito) continue;
            const urlInfo = sanitizeUrl(t.url);
            if (!urlInfo) continue;
            if (ExclusionEngine.isExcluded(urlInfo.domain)) continue;
            validTabs.push({
              url: urlInfo.sanitized,
              title: t.title || urlInfo.domain,
              favicon: t.favIconUrl,
            });
          }
        }

        const snapshot: SnapshotRecord = {
          snapshot_id: crypto.randomUUID(),
          title: String(msg.name || msg.title || "Saved Workspace"),
          workstream_id: msg.workstreamId || "general",
          saved_tabs: validTabs,
          timestamp: Date.now(),
        };

        if (msg.note) {
          (snapshot as any).note = String(msg.note);
        }

        await db.snapshots.put(snapshot);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, snapshot, state: readRes.state };
      }

      case "UPDATE_SNAPSHOT":
      case "update_snapshot": {
        const snapId = msg.id || msg.snapshotId;
        const existing = await db.snapshots.get(snapId);
        if (!existing) throw new Error("Snapshot not found");
        let validTabs = existing.saved_tabs || [];
        if (Array.isArray(msg.tabs) && msg.tabs.length > 0) {
          validTabs = msg.tabs.map((t: any) => ({
            url: sanitizeUrl(t.url)?.sanitized || t.url,
            title: t.title || t.url,
            favicon: t.favicon,
          }));
        }
        existing.title = String(msg.name || existing.title);
        if (msg.note !== undefined) {
          (existing as any).note = String(msg.note);
        }
        existing.saved_tabs = validTabs;
        await db.snapshots.put(existing);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, snapshot: existing, state: readRes.state };
      }

      case "RESTORE_WORKSPACE":
      case "restore": {
        const snap = await db.snapshots.get(msg.snapshotId || msg.id);
        if (!snap || !snap.saved_tabs) throw new Error("Snapshot not found");

        for (const tab of snap.saved_tabs) {
          if (tab.url) {
            await chrome.tabs.create({ url: tab.url, active: false });
          }
        }
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "DELETE_SNAPSHOT":
      case "delete_snapshot":
      case "deleteSnapshot": {
        await db.snapshots.delete(msg.snapshotId || msg.id);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "USER_FEEDBACK": {
        // Section 35: Feedback immediately generates a personalized rule override
        const feedback: UserFeedbackRecord = {
          feedback_id: crypto.randomUUID(),
          session_id: msg.sessionId || crypto.randomUUID(),
          input_features: msg.inputFeatures || {},
          predicted_category: msg.predictedCategory || "",
          predicted_activity: msg.predictedActivity || "",
          predicted_productivity: msg.predictedProductivity || "neutral",
          user_category: msg.userCategory,
          user_activity: msg.userActivity,
          user_productivity: msg.userProductivity,
          user_workstream: msg.userWorkstream,
          reason: msg.reason || "User manual correction",
          timestamp: Date.now(),
          model_version: "1.0.0",
        };

        await db.user_feedback.put(feedback);

        if (msg.domain) {
          // Immediately create or update personalized user rule
          await RuleRepository.add({
            rule_id: crypto.randomUUID(),
            name: `User Override for ${msg.domain}`,
            enabled: true,
            priority: 100, // High priority user rule
            condition: { domain_exact: msg.domain },
            action: {
              category: msg.userCategory,
              activity_type: msg.userActivity,
              productivity_type: msg.userProductivity,
              force_workstream: msg.userWorkstream,
            },
          });
        }

        await SessionManager.reconcile(true);
        return { success: true };
      }

      case "ADD_PRODUCTIVE_DOMAIN": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const prod = new Set<string>(settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS);
        const unprod = new Set<string>(settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS);
        const dom = String(msg.domain || "").trim().toLowerCase();
        if (dom) {
          prod.add(dom);
          unprod.delete(dom);
        }
        const updated = {
          ...settings,
          productiveDomains: Array.from(prod),
          unproductiveDomains: Array.from(unprod),
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "ADD_UNPRODUCTIVE_DOMAIN": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const prod = new Set<string>(settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS);
        const unprod = new Set<string>(settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS);
        const dom = String(msg.domain || "").trim().toLowerCase();
        if (dom) {
          unprod.add(dom);
          prod.delete(dom);
        }
        const updated = {
          ...settings,
          productiveDomains: Array.from(prod),
          unproductiveDomains: Array.from(unprod),
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "REMOVE_DOMAIN_OVERRIDE": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const prod = (settings.productiveDomains || DEFAULT_PRODUCTIVE_DOMAINS).filter((d: string) => d !== msg.domain);
        const unprod = (settings.unproductiveDomains || DEFAULT_UNPRODUCTIVE_DOMAINS).filter((d: string) => d !== msg.domain);
        const updated = {
          ...settings,
          productiveDomains: prod,
          unproductiveDomains: unprod,
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "UPDATE_SETTINGS":
      case "settings": {
        const current = (await chrome.storage.local.get("atentiv_settings")).atentiv_settings || {};
        const updated = {
          ...current,
          enabled: msg.enabled ?? current.enabled ?? true,
          idleThresholdSeconds: msg.idleThresholdSeconds ?? current.idleThresholdSeconds ?? 180,
          productiveDomains: msg.productiveDomains ?? current.productiveDomains ?? DEFAULT_PRODUCTIVE_DOMAINS,
          unproductiveDomains: msg.unproductiveDomains ?? current.unproductiveDomains ?? DEFAULT_UNPRODUCTIVE_DOMAINS,
          exclusions: typeof msg.excluded === "string"
            ? msg.excluded.split(",").map((s: string) => s.trim()).filter(Boolean)
            : (msg.exclusions ?? current.exclusions ?? []),
        };
        await chrome.storage.local.set({ atentiv_settings: updated });
        await SessionManager.reconcile();
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, settings: updated, state: readRes.state };
      }

      case "goal": {
        const goalObj = { goal: msg.goal || "", end: msg.end || 0, stream: msg.stream || "" };
        await chrome.storage.local.set({ atentiv_goal: goalObj });
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, goal: goalObj, state: readRes.state };
      }

      case "DELETE_ALL_DATA":
      case "clear": {
        // Section 45: Completely wipe local IndexedDB
        await db.tab_sessions.clear();
        await db.activities.clear();
        await db.workstream_events.clear();
        await db.workstreams.clear();
        await db.snapshots.clear();
        await db.decision_traces.clear();
        await db.user_feedback.clear();
        await db.focus_metrics.clear();
        await db.feature_snapshots.clear();
        await chrome.storage.session.remove("activeCheckpoint");
        await chrome.storage.local.set({ atentiv_settings: { enabled: false, exclusions: [] } });
        await SessionManager.reconcile(true);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "EXPORT_DATA": {
        // Section 44: Local JSON export
        const exportBlob = {
          exportVersion: "1.0",
          databaseVersion: 1,
          createdAt: new Date().toISOString(),
          settings: (await chrome.storage.local.get("atentiv_settings")).atentiv_settings || {},
          domains: await db.domains.toArray(),
          tab_sessions: await db.tab_sessions.toArray(),
          workstreams: await db.workstreams.toArray(),
          snapshots: await db.snapshots.toArray(),
          rules: await db.rules.toArray(),
          user_feedback: await db.user_feedback.toArray(),
          decision_traces: await db.decision_traces.limit(500).toArray(),
        };
        return { exportData: exportBlob };
      }

      case "PAGE_SIGNALS_UPDATED": {
        // Dynamic DOM mutation notification from content script
        await SessionManager.reconcile();
        return { acknowledged: true };
      }

      case "GET_HUD_DATA": {
        await SessionManager.reconcile();
        const active = SessionManager.getActiveCheckpoint();
        const todayMetrics = await MetricsRepository.getTodaySummary();
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const settings = settingsData.atentiv_settings || {};
        const enabled = settings.enabled ?? true;
        const idleState = await chrome.idle.queryState(60).catch(() => "active");
        const isIdle = idleState !== "active";

        const smartNav = await SmartNavigationEngine.getNavigationGroups();

        const recentSessions = await db.tab_sessions
          .orderBy("start_time")
          .reverse()
          .limit(8)
          .toArray();

        const recentTabs = recentSessions.map((s) => ({
          domain: s.domain,
          title: s.title,
          url: s.url,
          productivity: s.productivity_type,
          dwellTime: s.dwell_time,
          timestamp: s.start_time,
        }));

        const currentTabInfo = {
          domain: active?.domain || (msg.domain || "github.com"),
          title: active?.title || (msg.title || "Atentiv / project-dashboard"),
          url: active?.url || (msg.url || "https://github.com/atentiv/project-dashboard"),
          category: active?.category || "Technology",
          activity: active?.activity || "Development",
          productivity: (active?.productivity as "productive" | "unproductive" | "neutral") || "productive",
          activeDwellTime: active?.dwellTime || 756000, // default 12m 36s if fresh
        };

        const score = todayMetrics ? Math.round(todayMetrics.focusScore) : 82;

        return {
          currentTab: currentTabInfo,
          todayMetrics: {
            score: isNaN(score) ? 82 : score,
            productiveTime: todayMetrics ? todayMetrics.productiveSeconds * 1000 : 15120000, // 4h 12m
            unproductiveTime: todayMetrics ? todayMetrics.distractingSeconds * 1000 : 2280000, // 38m
            idleTime: 2640000, // 44m
            switches: todayMetrics?.switchCount ?? 14,
            activeCoverage: 94,
          },
          status: {
            isRecording: enabled && !isIdle,
            isIdle,
            state: !enabled ? "stopped" : isIdle ? "idle" : "active",
          },
          smartNav,
          recentTabs,
        };
      }

      case "SWITCH_OR_OPEN_TAB": {
        const result = await SmartNavigationEngine.switchOrOpen(msg.url, msg.title);
        return result;
      }

      case "OPEN_GROUP_TABS": {
        if (Array.isArray(msg.tabs)) {
          await SmartNavigationEngine.openGroupTabs(msg.tabs);
        }
        return { success: true };
      }

      case "TOGGLE_RECORDING": {
        const settingsData = await chrome.storage.local.get("atentiv_settings");
        const current = settingsData.atentiv_settings || {};
        const enabled = msg.enabled !== undefined ? !!msg.enabled : !(current.enabled ?? true);
        const updated = { ...current, enabled };
        await chrome.storage.local.set({ atentiv_settings: updated });
        await SessionManager.reconcile(!enabled);
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, enabled, state: readRes.state };
      }

      case "rules": {
        if (Array.isArray(msg.streams)) {
          for (const s of msg.streams) {
            if (s.name) {
              await WorkstreamRepository.create({
                workstream_id: crypto.randomUUID(),
                name: s.name,
                category: s.category || "General",
              }).catch(() => {});
            }
          }
        }
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "log": {
        if (msg.url) {
          try {
            const domain = new URL(msg.url).hostname.replace(/^www\./, "");
            await db.tab_sessions.put({
              session_id: crypto.randomUUID(),
              tab_id: 1,
              url: msg.url,
              domain,
              title: msg.title || msg.url,
              category: "Browsing",
              activity_type: "Browsing",
              productivity_type: "neutral",
              dwell_time: 10,
              idle_time: 0,
              start_time: Date.now() - 10000,
              end_time: Date.now(),
              window_id: 1,
              workstream_id: "default",
              workstream_name: "General Browsing",
              status: "closed",
              is_active: false,
            } as any);
          } catch {}
        }
        const readRes = await this.handleMessage({ type: "read" });
        return { success: true, state: readRes.state };
      }

      case "SET_TAB_PRODUCTIVITY": {
        const { domain, productivity } = msg;
        if (!domain || !productivity) throw new Error("Missing domain or productivity");
        if (productivity === "productive") {
          await this.handleMessage({ type: "ADD_PRODUCTIVE_DOMAIN", domain });
        } else if (productivity === "unproductive") {
          await this.handleMessage({ type: "ADD_UNPRODUCTIVE_DOMAIN", domain });
        } else {
          await this.handleMessage({ type: "REMOVE_DOMAIN_OVERRIDE", domain });
        }
        await RuleRepository.add({
          rule_id: crypto.randomUUID(),
          name: `HUD Override for ${domain}`,
          enabled: true,
          priority: 110,
          condition: { domain_exact: domain },
          action: { productivity_type: productivity },
        });
        await SessionManager.reconcile(true);
        return { success: true };
      }

      case "OPEN_SIDEPANEL": {
        if (chrome.sidePanel && typeof (chrome.sidePanel as any).open === "function") {
          try {
            if (sender?.tab?.id) {
              await (chrome.sidePanel as any).open({ tabId: sender.tab.id });
            } else if (sender?.tab?.windowId) {
              await (chrome.sidePanel as any).open({ windowId: sender.tab.windowId });
            } else {
              const windows = await chrome.windows.getAll();
              if (windows[0]?.id) await (chrome.sidePanel as any).open({ windowId: windows[0].id });
            }
            return { success: true };
          } catch (e) {
            // Side panel failed — DO NOT open a new tab, just report
            console.warn("Atentiv: Could not open side panel", e);
            return { success: false, error: "Side panel could not be opened" };
          }
        } else {
          // No side panel API — DO NOT open a new tab
          return { success: false, error: "Side panel API not available" };
        }
      }

      case "CLOSE_BACKGROUND_TABS": {
        try {
          const window = await chrome.windows.getLastFocused().catch(() => null);
          const queryFilter: chrome.tabs.QueryInfo = window?.id !== undefined ? { windowId: window.id } : { currentWindow: true };
          const tabs = await chrome.tabs.query(queryFilter);
          const tabsToClose = tabs.filter((t) => !t.pinned && !t.active && t.id !== undefined);
          const tabIds = tabsToClose.map((t) => t.id!).filter(Boolean);
          if (tabIds.length > 0) {
            await chrome.tabs.remove(tabIds);
          }
          return { success: true, closedCount: tabIds.length };
        } catch (err) {
          console.error("Error closing background tabs:", err);
          return { success: false, closedCount: 0, error: String(err) };
        }
      }

      default:
        throw new Error(`Unknown message type: ${msg.type}`);
    }
  }
}
