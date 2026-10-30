/**
 * Automated Data Retention & Pruning Manager — AtentivDB
 * Enforces user-configured data retention policies (default: 30 days; 7, 14, 30, 90, 0=forever)
 * to prevent unbounded IndexedDB growth and guarantee privacy/data minimization.
 * Complies with SRS Section 45, Data Dictionary, and Non-Functional Standards.
 */
import { db } from "./database";

export interface RetentionStats {
  retentionDays: number;
  cutoffTimestamp: number;
  totalSessions: number;
  totalActivities: number;
  totalWorkstreamEvents: number;
  totalTraces: number;
  totalBrowserEvents: number;
  totalSegments: number;
  totalSwitchEvents: number;
  totalFeatureSnapshots: number;
  oldestRecordTimestamp: number | null;
}

export interface PruneResult {
  success: boolean;
  retentionDays: number;
  cutoffTimestamp: number;
  prunedSessions: number;
  prunedActivities: number;
  prunedWorkstreamEvents: number;
  prunedTraces: number;
  prunedBrowserEvents: number;
  prunedSegments: number;
  prunedSwitchEvents: number;
  prunedFeatureSnapshots: number;
  totalPruned: number;
  durationMs: number;
}

export class RetentionManager {
  public static readonly DEFAULT_RETENTION_DAYS = 30;

  /**
   * Retrieves the configured retention period in days from chrome.storage.local.
   * Defaults to 30 days. Value of 0 means "keep forever".
   */
  static async getConfiguredRetentionDays(): Promise<number> {
    try {
      if (typeof chrome !== "undefined" && chrome.storage?.local) {
        const data = await chrome.storage.local.get("atentiv_settings");
        const settings = data.atentiv_settings;
        if (settings && typeof settings.retentionDays === "number") {
          return settings.retentionDays;
        }
      }
    } catch {
      // Fallback in test or headless environment
    }
    return this.DEFAULT_RETENTION_DAYS;
  }

  /**
   * Calculates retention statistics across all analytical object stores.
   */
  static async getRetentionStats(): Promise<RetentionStats> {
    const retentionDays = await this.getConfiguredRetentionDays();
    const cutoffTimestamp =
      retentionDays > 0 ? Date.now() - retentionDays * 86400000 : 0;

    const [
      totalSessions,
      totalActivities,
      totalWorkstreamEvents,
      totalTraces,
      totalBrowserEvents,
      totalSegments,
      totalSwitchEvents,
      totalFeatureSnapshots,
    ] = await Promise.all([
      db.tab_sessions.count(),
      db.activities.count(),
      db.workstream_events.count(),
      db.decision_traces.count(),
      db.browser_events.count(),
      db.activity_segments.count(),
      db.tab_switch_events.count(),
      db.feature_snapshots.count(),
    ]);

    // Find oldest session timestamp
    const oldestSession = await db.tab_sessions.orderBy("start_time").first();
    const oldestRecordTimestamp = oldestSession
      ? oldestSession.start_time
      : null;

    return {
      retentionDays,
      cutoffTimestamp,
      totalSessions,
      totalActivities,
      totalWorkstreamEvents,
      totalTraces,
      totalBrowserEvents,
      totalSegments,
      totalSwitchEvents,
      totalFeatureSnapshots,
      oldestRecordTimestamp,
    };
  }

  /**
   * Prunes all temporal session, event, segment, and trace data older than the retention threshold.
   * User rules, domain knowledge, saved snapshots, and workstream definitions are permanently preserved.
   *
   * @param overrideRetentionDays Optional manual override for retention period in days
   */
  static async pruneExpired(
    overrideRetentionDays?: number,
  ): Promise<PruneResult> {
    const startTime = performance.now();
    const retentionDays =
      overrideRetentionDays !== undefined
        ? overrideRetentionDays
        : await this.getConfiguredRetentionDays();

    // 0 means keep forever — no pruning executed
    if (retentionDays === 0) {
      return {
        success: true,
        retentionDays: 0,
        cutoffTimestamp: 0,
        prunedSessions: 0,
        prunedActivities: 0,
        prunedWorkstreamEvents: 0,
        prunedTraces: 0,
        prunedBrowserEvents: 0,
        prunedSegments: 0,
        prunedSwitchEvents: 0,
        prunedFeatureSnapshots: 0,
        totalPruned: 0,
        durationMs: performance.now() - startTime,
      };
    }

    const cutoffTimestamp = Date.now() - retentionDays * 86400000;

    // Execute atomic deletions across all temporal analytical tables
    let prunedSessions = 0;
    let prunedActivities = 0;
    let prunedWorkstreamEvents = 0;
    let prunedTraces = 0;
    let prunedBrowserEvents = 0;
    let prunedSegments = 0;
    let prunedSwitchEvents = 0;
    let prunedFeatureSnapshots = 0;

    await db.transaction(
      "rw",
      [
        db.tab_sessions,
        db.activities,
        db.workstream_events,
        db.decision_traces,
        db.browser_events,
        db.activity_segments,
        db.tab_switch_events,
        db.feature_snapshots,
      ],
      async () => {
        // 1. Tab sessions older than cutoff
        prunedSessions = await db.tab_sessions
          .where("start_time")
          .below(cutoffTimestamp)
          .delete();

        // 2. Activities older than cutoff
        prunedActivities = await db.activities
          .where("created_at")
          .below(cutoffTimestamp)
          .delete();

        // 3. Workstream events older than cutoff
        prunedWorkstreamEvents = await db.workstream_events
          .where("entered_at")
          .below(cutoffTimestamp)
          .delete();

        // 4. Decision traces older than cutoff
        prunedTraces = await db.decision_traces
          .where("timestamp")
          .below(cutoffTimestamp)
          .delete();

        // 5. Browser raw events older than cutoff
        prunedBrowserEvents = await db.browser_events
          .where("timestamp")
          .below(cutoffTimestamp)
          .delete();

        // 6. Activity segments older than cutoff
        prunedSegments = await db.activity_segments
          .where("start")
          .below(cutoffTimestamp)
          .delete();

        // 7. Tab switch events older than cutoff
        prunedSwitchEvents = await db.tab_switch_events
          .where("timestamp")
          .below(cutoffTimestamp)
          .delete();

        // 8. Feature snapshots older than cutoff
        prunedFeatureSnapshots = await db.feature_snapshots
          .where("created_at")
          .below(cutoffTimestamp)
          .delete();
      },
    );

    const totalPruned =
      prunedSessions +
      prunedActivities +
      prunedWorkstreamEvents +
      prunedTraces +
      prunedBrowserEvents +
      prunedSegments +
      prunedSwitchEvents +
      prunedFeatureSnapshots;

    const durationMs = performance.now() - startTime;

    return {
      success: true,
      retentionDays,
      cutoffTimestamp,
      prunedSessions,
      prunedActivities,
      prunedWorkstreamEvents,
      prunedTraces,
      prunedBrowserEvents,
      prunedSegments,
      prunedSwitchEvents,
      prunedFeatureSnapshots,
      totalPruned,
      durationMs,
    };
  }
}
