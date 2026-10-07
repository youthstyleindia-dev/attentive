/**
 * ATLAS — Atentiv Tab Lifecycle and Activity-State System Engine
 *
 * Implements:
 * Algorithm 1: ATLAS Tab State Machine (STOPPED, RECORDING, IDLE, PAUSED)
 * Algorithm 2: Tab Switch Detection Algorithm (Pure Tab Changes)
 * Algorithm 3: Activity Segment Construction (Granitzer et al. Event Block Aggregation)
 * Algorithm 7: Switch Burden Algorithm (Disruptive Severity Metric)
 * Algorithm 8: Focus Score & Active Coverage Engine
 */

import type {
  AtlasTrackingState,
  BrowserEventType,
  BrowserEventRecord,
  ActivitySegmentRecord,
  TabSwitchEventRecord,
  SwitchBurdenLevel,
  ProductivityType,
} from "../db/schemas";

// ─── Observable vs. Inferred State Model ────────────────────────────────────

export interface ObservableState {
  activeTabId: number | null;
  activeWindowId: number | null;
  trackingState: AtlasTrackingState;
  activeSince: number;
  activeDwellSeconds: number;
  idleSeconds: number;
  switchCount: number;
}

export interface InferredState {
  domain: string;
  category: string;
  activity: string;
  productivity: ProductivityType;
  workstreamId: string;
  workstreamName: string;
  switchBurden: SwitchBurdenLevel;
  switchBurdenScore: number;
  confidence: number;
  isTentative?: boolean;
}

export interface AtlasState {
  observable: ObservableState;
  inferred: InferredState;
}

// ─── Algorithm 1: ATLAS Tab State Machine ───────────────────────────────────

export class AtlasStateMachine {
  private state: AtlasTrackingState = "RECORDING";
  private idleStartTime: number | null = null;
  private lastActivityTime = Date.now();
  private idleThresholdSeconds = 180; // 3 minutes default

  constructor(thresholdSeconds = 180) {
    this.idleThresholdSeconds = thresholdSeconds;
  }

  setIdleThreshold(seconds: number) {
    this.idleThresholdSeconds = Math.max(30, seconds);
  }

  getIdleThreshold(): number {
    return this.idleThresholdSeconds;
  }

  getState(): AtlasTrackingState {
    return this.state;
  }

  isRecording(): boolean {
    return this.state === "RECORDING";
  }

  isIdle(): boolean {
    return this.state === "IDLE" || this.state === "IDLE_CANDIDATE";
  }

  start(): AtlasTrackingState {
    this.state = "RECORDING";
    this.lastActivityTime = Date.now();
    this.idleStartTime = null;
    return this.state;
  }

  pause(): AtlasTrackingState {
    this.state = "PAUSED";
    return this.state;
  }

  stop(): AtlasTrackingState {
    this.state = "STOPPED";
    return this.state;
  }

  /**
   * User interaction detected (keypress, click, scroll, tab activation)
   */
  onUserActivity(now = Date.now()): { wasIdle: boolean; idleDurationMs: number } {
    const wasIdle = this.state === "IDLE" || this.state === "IDLE_CANDIDATE";
    let idleDurationMs = 0;
    if (wasIdle && this.idleStartTime) {
      idleDurationMs = Math.max(0, now - this.idleStartTime);
    }
    this.lastActivityTime = now;
    this.idleStartTime = null;
    if (this.state !== "STOPPED" && this.state !== "PAUSED") {
      this.state = "RECORDING";
    }
    return { wasIdle, idleDurationMs };
  }

  /**
   * Periodic watchdog tick to test inactivity
   */
  checkInactivity(now = Date.now()): { transitionedToIdle: boolean; state: AtlasTrackingState } {
    if (this.state !== "RECORDING") {
      return { transitionedToIdle: false, state: this.state };
    }
    const elapsedSeconds = (now - this.lastActivityTime) / 1000;
    if (elapsedSeconds >= this.idleThresholdSeconds) {
      this.state = "IDLE";
      if (!this.idleStartTime) {
        this.idleStartTime = now - (elapsedSeconds - this.idleThresholdSeconds) * 1000;
      }
      return { transitionedToIdle: true, state: this.state };
    }
    return { transitionedToIdle: false, state: this.state };
  }
}

// ─── Algorithm 2: Tab Switch Detection Algorithm ────────────────────────────

export interface TabSwitchEventPayload {
  previousTabId: number;
  newTabId: number;
  timestamp: number;
  url?: string;
  title?: string;
}

export class TabSwitchDetector {
  private currentTabId: number | null = null;
  private currentWindowId: number | null = null;
  private totalSwitches = 0;

  getSwitchCount(): number {
    return this.totalSwitches;
  }

  setSwitchCount(count: number) {
    this.totalSwitches = Math.max(0, count);
  }

  getCurrentTab(): { tabId: number | null; windowId: number | null } {
    return { tabId: this.currentTabId, windowId: this.currentWindowId };
  }

  /**
   * Evaluates active tab transition
   * Context Switch Event = Active Tab A -> Active Tab B
   */
  evaluateSwitch(newTabId: number, windowId = 1, timestamp = Date.now()): {
    isSwitch: boolean;
    previousTabId: number | null;
    newTabId: number;
    switchCount: number;
  } {
    const previous = this.currentTabId;
    this.currentWindowId = windowId;

    if (previous === null) {
      // Initial tab session boot
      this.currentTabId = newTabId;
      return { isSwitch: false, previousTabId: null, newTabId, switchCount: this.totalSwitches };
    }

    if (previous === newTabId) {
      // Same tab re-focused or updated
      return { isSwitch: false, previousTabId: previous, newTabId, switchCount: this.totalSwitches };
    }

    // Pure observable tab switch!
    this.totalSwitches += 1;
    this.currentTabId = newTabId;
    return { isSwitch: true, previousTabId: previous, newTabId, switchCount: this.totalSwitches };
  }
}

// ─── Algorithm 7: Switch Burden Algorithm ───────────────────────────────────

export interface SwitchBurdenInput {
  previousDomain: string;
  newDomain: string;
  previousCategory: string;
  newCategory: string;
  previousProductivity: ProductivityType;
  newProductivity: ProductivityType;
  previousWorkstreamId?: string;
  newWorkstreamId?: string;
  dwellTimeBeforeMs: number;
}

export interface SwitchBurdenResult {
  burden: SwitchBurdenLevel;
  burdenScore: number; // 0 to 100
  workstreamSwitched: boolean;
  reason: string;
}

export class SwitchBurdenEvaluator {
  static evaluate(input: SwitchBurdenInput): SwitchBurdenResult {
    let score = 10;
    const workstreamSwitched =
      Boolean(input.previousWorkstreamId && input.newWorkstreamId) &&
      input.previousWorkstreamId !== input.newWorkstreamId;

    // 1. Workstream continuity
    if (workstreamSwitched) {
      score += 35;
    }

    // 2. Category disparity
    if (input.previousCategory && input.newCategory && input.previousCategory !== input.newCategory) {
      score += 20;
    }

    // 3. Productivity transition (Productive -> Distracting/Unproductive carries high friction)
    if (input.previousProductivity === "productive" && input.newProductivity === "distracting") {
      score += 35;
    } else if (input.newProductivity === "distracting") {
      score += 20;
    }

    // 4. Rapidity friction (rapid context thrashing within <15 seconds)
    if (input.dwellTimeBeforeMs > 0 && input.dwellTimeBeforeMs < 15000) {
      score += 20;
    }

    const clamped = Math.min(100, Math.max(0, score));
    const burden: SwitchBurdenLevel = clamped >= 60 ? "high" : clamped >= 30 ? "medium" : "low";

    const reason =
      burden === "high"
        ? "Cross-workstream shift with distinct behavioral context"
        : burden === "medium"
        ? "Context transition with moderate domain or category difference"
        : "Low-friction tab switch within consistent task space";

    return {
      burden,
      burdenScore: clamped,
      workstreamSwitched,
      reason,
    };
  }
}

// ─── Algorithm 3: Activity Segment Construction (Granitzer et al.) ──────────

export class ActivitySegmentBuilder {
  private currentSegment: Partial<ActivitySegmentRecord> | null = null;

  startSegment(params: {
    tabId: number;
    url: string;
    domain: string;
    title: string;
    start: number;
    category: string;
    activity: string;
    productivity: ProductivityType;
    workstreamId: string;
    workstreamName: string;
    confidence: number;
    modelVersion?: string;
    isTentative?: boolean;
  }): Partial<ActivitySegmentRecord> {
    this.currentSegment = {
      segment_id: `seg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tab_id: params.tabId,
      url: params.url,
      domain: params.domain,
      title: params.title,
      start: params.start,
      end: params.start,
      active_seconds: 0,
      idle_seconds: 0,
      category: params.category,
      activity: params.activity,
      productivity: params.productivity,
      workstream_id: params.workstreamId,
      workstream_name: params.workstreamName,
      confidence: params.confidence,
      model_version: params.modelVersion || "fasttext-wasm-1.0.0",
      is_tentative: params.isTentative ?? false,
    };
    return this.currentSegment;
  }

  updateActiveDwell(elapsedActiveSeconds: number) {
    if (this.currentSegment) {
      this.currentSegment.active_seconds = (this.currentSegment.active_seconds || 0) + elapsedActiveSeconds;
      this.currentSegment.end = Date.now();
    }
  }

  updateIdle(elapsedIdleSeconds: number) {
    if (this.currentSegment) {
      this.currentSegment.idle_seconds = (this.currentSegment.idle_seconds || 0) + elapsedIdleSeconds;
      this.currentSegment.end = Date.now();
    }
  }

  closeSegment(now = Date.now()): ActivitySegmentRecord | null {
    if (!this.currentSegment) return null;
    const finalSegment: ActivitySegmentRecord = {
      segment_id: this.currentSegment.segment_id || `seg_${now}`,
      tab_id: this.currentSegment.tab_id || 0,
      domain: this.currentSegment.domain || "unknown",
      url: this.currentSegment.url || "",
      title: this.currentSegment.title || "",
      start: this.currentSegment.start || now,
      end: now,
      active_seconds: Math.max(1, Math.round(this.currentSegment.active_seconds || 0)),
      idle_seconds: Math.max(0, Math.round(this.currentSegment.idle_seconds || 0)),
      category: this.currentSegment.category || "General",
      activity: this.currentSegment.activity || "Browsing",
      productivity: this.currentSegment.productivity || "neutral",
      workstream_id: this.currentSegment.workstream_id || "general",
      workstream_name: this.currentSegment.workstream_name || "General Browsing",
      confidence: this.currentSegment.confidence || 0.85,
      model_version: this.currentSegment.model_version || "1.0.0",
      is_tentative: this.currentSegment.is_tentative,
    };
    this.currentSegment = null;
    return finalSegment;
  }

  getCurrent(): Partial<ActivitySegmentRecord> | null {
    return this.currentSegment;
  }
}

// ─── Algorithm 8: Focus Score & Active Coverage Engine ──────────────────────

export interface AtlasMetricsInput {
  productiveSeconds: number; // P
  unproductiveSeconds: number; // U
  neutralSeconds: number; // N
  idleSeconds: number; // I
  switchCount: number;
  averageBurdenScore?: number;
}

export interface AtlasMetricsResult {
  focusScore: number; // 100 * P / (P + U)
  netProductiveSeconds: number; // P - U
  activeCoverage: number; // (P + U + N) / (P + U + N + I)
  activeTotalSeconds: number; // P + U + N
  idleSeconds: number;
  switchCount: number;
  switchBurdenScore: number;
}

export class AtlasMetricsEngine {
  static compute(input: AtlasMetricsInput): AtlasMetricsResult {
    const P = Math.max(0, input.productiveSeconds);
    const U = Math.max(0, input.unproductiveSeconds);
    const N = Math.max(0, input.neutralSeconds);
    const I = Math.max(0, input.idleSeconds);

    // Primary Focus Score: 100 * P / (P + U)
    // Idle does NOT enter the denominator!
    let focusScore = 0;
    if (P + U > 0) {
      focusScore = Math.round((P / (P + U)) * 100);
    } else if (P === 0 && U === 0 && N > 0) {
      focusScore = 50; // Neutral baseline
    }

    // Net Productive Time = P - U
    const netProductiveSeconds = P - U;

    // Active Total Time = P + U + N
    const activeTotalSeconds = P + U + N;

    // Active Coverage = (P + U + N) / (P + U + N + I)
    const grandTotal = activeTotalSeconds + I;
    const activeCoverage = grandTotal > 0 ? (activeTotalSeconds / grandTotal) * 100 : 100;

    return {
      focusScore: Math.min(100, Math.max(0, focusScore)),
      netProductiveSeconds,
      activeCoverage: Math.round(activeCoverage * 10) / 10,
      activeTotalSeconds,
      idleSeconds: I,
      switchCount: input.switchCount,
      switchBurdenScore: input.averageBurdenScore ?? 15,
    };
  }
}
