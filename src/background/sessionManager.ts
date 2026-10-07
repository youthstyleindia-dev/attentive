/**
 * Session Manager — Background Service Worker
 * Manages active dwell time, persistent checkpoints, and transitions.
 */
import { db } from "../db/database";
import { SessionRepository } from "../db/repositories/sessionRepository";
import { WorkstreamEngine } from "../workstreams/workstreamEngine";
import { WorkstreamRepository } from "../db/repositories/workstreamRepository";
import { ContextSwitchEvaluator } from "../workstreams/contextSwitch";
import { Classifier } from "../ml/classifier";
import { TraceRepository } from "../db/repositories/traceRepository";
import { RuleRepository } from "../db/repositories/ruleRepository";
import { ExclusionEngine } from "../privacy/exclusionEngine";
import type { TabSessionRecord, WorkstreamEventRecord } from "../db/schemas";

export type TrackingState = "TRACKING" | "INACTIVE" | "PAUSED" | "SYSTEM_SLEEP" | "UNTRACKABLE" | "NO_ACTIVE_SESSION";

export interface ActiveCheckpoint {
  sessionId: string;
  tabId: number;
  windowId: number;
  url: string;
  domain: string;
  title: string;
  category: string;
  activity: string;
  productivity: "productive" | "neutral" | "distracting";
  workstreamId: string;
  workstreamName: string;
  since: number;
  lastCheckpoint: number;
  dwellTime: number;
}

export class SessionManager {
  private static active: ActiveCheckpoint | null = null;
  private static lastSwitchTime = Date.now();

  static getActiveCheckpoint(): ActiveCheckpoint | null {
    return this.active;
  }

  static async initFromStorage(): Promise<void> {
    try {
      const sessionData = await chrome.storage.session.get("activeCheckpoint");
      if (sessionData && sessionData.activeCheckpoint) {
        this.active = sessionData.activeCheckpoint;
      }
    } catch {
      this.active = null;
    }
  }

  static async reconcile(reset = false): Promise<void> {
    const now = Date.now();
    const settings = await chrome.storage.local.get("atentiv_settings");
    const enabled = settings.atentiv_settings?.enabled ?? true; // default true: track until user explicitly disables
    const userExclusions: string[] = settings.atentiv_settings?.exclusions || [];

    if (!enabled) {
      if (this.active) {
        await SessionRepository.close(this.active.sessionId, now);
        this.active = null;
        await chrome.storage.session.remove("activeCheckpoint");
      }
      await chrome.storage.session.set({
        trackingState: "PAUSED",
      });
      return;
    }

    if (reset && this.active) {
      await SessionRepository.close(this.active.sessionId, now);
      this.active = null;
      await chrome.storage.session.remove("activeCheckpoint");
    }

    try {
      // 1. Inspect currently focused window and active tab
      const window = await chrome.windows.getLastFocused().catch(() => null);
      if (!window || window.id === undefined) {
        if (this.active) {
          const elapsedActive = Math.min(now - this.active.lastCheckpoint, 60000);
          if (elapsedActive > 0) {
            await SessionRepository.updateDwell(this.active.sessionId, elapsedActive, now);
          }
          await SessionRepository.close(this.active.sessionId, now);
          this.active = null;
          await chrome.storage.session.remove("activeCheckpoint");
        }
        await chrome.storage.session.set({ trackingState: "NO_ACTIVE_SESSION" });
        return;
      }

      const [tab] = await chrome.tabs.query({ active: true, windowId: window.id });
      if (!tab || !tab.url || tab.incognito) {
        if (this.active) {
          const elapsedActive = Math.min(now - this.active.lastCheckpoint, 60000);
          if (elapsedActive > 0) {
            await SessionRepository.updateDwell(this.active.sessionId, elapsedActive, now);
          }
          await SessionRepository.close(this.active.sessionId, now);
          this.active = null;
          await chrome.storage.session.remove("activeCheckpoint");
        }
        await chrome.storage.session.set({
          trackingState: tab?.incognito ? "UNTRACKABLE" : "NO_ACTIVE_SESSION",
        });
        return;
      }

      // Check for untrackable restricted protocols (chrome://, edge://, about:, extension pages)
      const isUntrackable = !tab.url.startsWith("http://") && !tab.url.startsWith("https://");
      if (isUntrackable) {
        if (this.active) {
          const elapsedActive = Math.min(now - this.active.lastCheckpoint, 60000);
          if (elapsedActive > 0) {
            await SessionRepository.updateDwell(this.active.sessionId, elapsedActive, now);
          }
          await SessionRepository.close(this.active.sessionId, now);
          this.active = null;
          await chrome.storage.session.remove("activeCheckpoint");
        }
        await chrome.storage.session.set({
          trackingState: "UNTRACKABLE",
          untrackableReason: "Tracking unavailable on internal browser page. Atentiv will resume automatically on a supported webpage.",
        });
        return;
      }

      const sanitizedTabUrl = ExclusionEngine.sanitizeUrl(tab.url);

      // 2. Check if we are still on the same tab
      const isSameTab =
        this.active &&
        this.active.tabId === tab.id &&
        (this.active.url === tab.url || this.active.url === sanitizedTabUrl);

      if (isSameTab && this.active) {
        // Tab is unchanged. Check idle state with configurable threshold (default 180s / 3m)
        const idleThresholdSec = Math.max(60, Math.min(600, settings.atentiv_settings?.idleThresholdSeconds ?? 180));
        const idleState = await chrome.idle.queryState(idleThresholdSec).catch(() => "active");
        const isAudible = Boolean(tab.audible);
        const isQualifyingCategory = ["Education", "Technology", "Research", "Communication", "Learning"].includes(this.active.category);
        const mediaException = isAudible && isQualifyingCategory;

        if (idleState !== "active" && !mediaException) {
          // User is away/idle: keep session alive, pause active dwell, update idle_time
          const elapsedIdle = Math.min(now - this.active.lastCheckpoint, 60000);
          if (elapsedIdle > 0) {
            await SessionRepository.updateIdle(this.active.sessionId, elapsedIdle, now);
          }
          this.active.lastCheckpoint = now;
          await chrome.storage.session.set({ activeCheckpoint: this.active, trackingState: "INACTIVE" });
          return;
        }

        // Active dwell tick
        const elapsedActive = Math.min(now - this.active.lastCheckpoint, 60000);
        if (elapsedActive > 0) {
          this.active.dwellTime += elapsedActive;
          this.active.lastCheckpoint = now;
          await SessionRepository.updateDwell(this.active.sessionId, elapsedActive, now);
          await chrome.storage.session.set({ activeCheckpoint: this.active, trackingState: "TRACKING" });
        }
        return;
      }

      // 3. Tab has changed or newly focused!
      const previousActive = this.active;
      // Close previous session if switching tabs
      if (this.active) {
        const elapsedActive = Math.min(now - this.active.lastCheckpoint, 60000);
        if (elapsedActive > 0) {
          await SessionRepository.updateDwell(this.active.sessionId, elapsedActive, now);
        }
        await SessionRepository.close(this.active.sessionId, now);
        this.active = null;
        await chrome.storage.session.remove("activeCheckpoint");
      }

      // 4. Classify new tab
      const userRules = await RuleRepository.listActive();
      const classification = await Classifier.classify({
        url: tab.url,
        title: tab.title || "",
        sessionId: crypto.randomUUID(),
        userRules,
        userExclusions,
      });

      if (classification.isExcluded) {
        this.active = null;
        await chrome.storage.session.remove("activeCheckpoint");
        return;
      }

      // 5. Workstream Matching
      const wsAssignment = await WorkstreamEngine.assignWorkstream({
        domain: new URL(tab.url).hostname.replace(/^www\./, ""),
        title: tab.title || "",
        category: classification.category,
        activity: classification.activity,
        sentenceVector: classification.sentenceVector,
        timestamp: now,
      });

      // 6. Context Switch Evaluation (Pure tab switch + workstream context)
      const switchEval = ContextSwitchEvaluator.evaluate({
        fromWorkstreamId: previousActive?.workstreamId || "",
        toWorkstreamId: wsAssignment.workstreamId,
        fromCategory: previousActive?.category || "",
        toCategory: classification.category,
        fromTabId: previousActive?.tabId,
        toTabId: tab.id,
        fromUrl: previousActive?.url,
        toUrl: tab.url,
        lastSwitchTimestamp: this.lastSwitchTime,
        now,
      });

      if (switchEval.isSwitch) {
        this.lastSwitchTime = now;
        const wsEvent: WorkstreamEventRecord = {
          workstream_id: wsAssignment.workstreamId,
          session_id: classification.decisionTrace.session_id,
          entered_at: now,
          exited_at: now,
          duration: 0,
          previous_workstream_id: previousActive?.workstreamId || null,
          switch_penalty: switchEval.penaltyPoints,
        };
        await WorkstreamRepository.recordEvent(wsEvent);
      }

      // 7. Persist Tab Session Record
      const newSession: TabSessionRecord = {
        session_id: classification.decisionTrace.session_id,
        tab_id: tab.id || 0,
        window_id: window.id,
        url: ExclusionEngine.sanitizeUrl(tab.url),
        domain: new URL(tab.url).hostname.replace(/^www\./, ""),
        title: tab.title || new URL(tab.url).hostname,
        start_time: now,
        end_time: now,
        dwell_time: 0,
        active_time: 0,
        idle_time: 0,
        category: classification.category,
        activity_type: classification.activity,
        productivity_type: classification.productivity,
        productivity_score: classification.productivityScore,
        workstream_id: wsAssignment.workstreamId,
        workstream_name: wsAssignment.workstreamName,
        classification_confidence: classification.confidence,
        classification_latency_ms: classification.inferenceLatencyMs,
        model_version: classification.modelVersion,
        created_at: now,
      };

      await SessionRepository.create(newSession);

      // Save complete decision trace
      await TraceRepository.record({
        decision_id: crypto.randomUUID(),
        ...classification.decisionTrace,
        selected_workstream: wsAssignment.workstreamName,
        workstream_scores: wsAssignment.similarityScores,
      });

      // 8. Update ephemeral session checkpoint
      this.active = {
        sessionId: newSession.session_id,
        tabId: newSession.tab_id,
        windowId: newSession.window_id,
        url: newSession.url,
        domain: newSession.domain,
        title: newSession.title,
        category: newSession.category,
        activity: newSession.activity_type,
        productivity: newSession.productivity_type,
        workstreamId: newSession.workstream_id,
        workstreamName: newSession.workstream_name,
        since: now,
        lastCheckpoint: now,
        dwellTime: 0,
      };

      await chrome.storage.session.set({
        activeCheckpoint: this.active,
        trackingState: "TRACKING",
      });
    } catch (err) {
      console.error("SessionManager reconcile error:", err);
    }
  }
}
