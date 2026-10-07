/**
 * Metrics Repository — Aggregated Dashboard & Analytics Queries
 */
import { db } from "../database";
import type { TabSessionRecord, FocusMetricRecord } from "../schemas";

export interface AggregateSummary {
  totalActiveSeconds: number;
  productiveSeconds: number;
  neutralSeconds: number;
  distractingSeconds: number;
  switchCount: number;
  switchPenalty: number;
  focusScore: number;
  topDomains: Array<{ domain: string; activeSeconds: number; percentage: number }>;
  categoryDistribution: Record<string, number>;
  activityDistribution: Record<string, number>;
  workstreamSummary: Array<{ id: string; name: string; category: string; activeSeconds: number }>;
}

export class MetricsRepository {
  static async getSummary(from: number, to: number): Promise<AggregateSummary> {
    const sessions = await db.tab_sessions
      .where("start_time")
      .between(from, to, true, true)
      .toArray();

    let totalActiveMs = 0;
    let productiveMs = 0;
    let neutralMs = 0;
    let distractingMs = 0;

    const domainTimes: Record<string, number> = {};
    const catTimes: Record<string, number> = {};
    const actTimes: Record<string, number> = {};
    const wsTimes: Record<string, { id: string; name: string; category: string; ms: number }> = {};

    let switchCount = 0;
    let prevWs: string | null = null;

    // Sort chronologically for switch detection
    const sorted = sessions.slice().sort((a, b) => a.start_time - b.start_time);

    for (const s of sorted) {
      const activeMs = s.active_time || (s.end_time - s.start_time) || 0;
      totalActiveMs += activeMs;

      if (s.productivity_type === "productive") productiveMs += activeMs;
      else if (s.productivity_type === "distracting") distractingMs += activeMs;
      else neutralMs += activeMs;

      domainTimes[s.domain] = (domainTimes[s.domain] || 0) + activeMs;
      catTimes[s.category] = (catTimes[s.category] || 0) + activeMs;
      actTimes[s.activity_type] = (actTimes[s.activity_type] || 0) + activeMs;

      if (s.workstream_id) {
        if (!wsTimes[s.workstream_id]) {
          wsTimes[s.workstream_id] = {
            id: s.workstream_id,
            name: s.workstream_name || "General",
            category: s.category,
            ms: 0,
          };
        }
        wsTimes[s.workstream_id].ms += activeMs;

        if (prevWs && prevWs !== s.workstream_id) {
          switchCount++;
        }
        prevWs = s.workstream_id;
      }
    }

    const totalActiveSeconds = Math.round(totalActiveMs / 1000);
    const productiveSeconds = Math.round(productiveMs / 1000);
    const neutralSeconds = Math.round(neutralMs / 1000);
    const distractingSeconds = Math.round(distractingMs / 1000);

    // Calculate Focus Score (Section 32)
    // productive_ratio = productive / total
    // stability_ratio = dominant_workstream_time / total
    // penalty = min(40, switch_count * 2)
    const dominantWsMs = Object.values(wsTimes).reduce((max, w) => Math.max(max, w.ms), 0);
    const prodRatio = totalActiveMs > 0 ? productiveMs / totalActiveMs : 0;
    const stabilityRatio = totalActiveMs > 0 ? dominantWsMs / totalActiveMs : 0;
    const switchPenalty = Math.min(40, switchCount * 2);

    let focusScore = 0;
    if (totalActiveSeconds > 0) {
      const rawFocus = 100 * (0.65 * prodRatio + 0.35 * stabilityRatio) - switchPenalty;
      focusScore = Math.max(0, Math.min(100, Math.round(rawFocus)));
    }

    // Top Domains
    const topDomains = Object.entries(domainTimes)
      .map(([domain, ms]) => ({
        domain,
        activeSeconds: Math.round(ms / 1000),
        percentage: totalActiveMs > 0 ? Math.round((ms / totalActiveMs) * 100) : 0,
      }))
      .sort((a, b) => b.activeSeconds - a.activeSeconds)
      .slice(0, 10);

    // Category Distribution in seconds
    const categoryDistribution: Record<string, number> = {};
    for (const [k, v] of Object.entries(catTimes)) {
      categoryDistribution[k] = Math.round(v / 1000);
    }

    // Activity Distribution in seconds
    const activityDistribution: Record<string, number> = {};
    for (const [k, v] of Object.entries(actTimes)) {
      activityDistribution[k] = Math.round(v / 1000);
    }

    // Workstream summary
    const workstreamSummary = Object.values(wsTimes)
      .map((w) => ({
        id: w.id,
        name: w.name,
        category: w.category,
        activeSeconds: Math.round(w.ms / 1000),
      }))
      .sort((a, b) => b.activeSeconds - a.activeSeconds);

    return {
      totalActiveSeconds,
      productiveSeconds,
      neutralSeconds,
      distractingSeconds,
      switchCount,
      switchPenalty,
      focusScore,
      topDomains,
      categoryDistribution,
      activityDistribution,
      workstreamSummary,
    };
  }

  static async getTodaySummary(): Promise<AggregateSummary> {
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    const now = Date.now();
    return await this.getSummary(startOfToday, now);
  }

  static async getWeekSummary(): Promise<AggregateSummary> {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;
    return await this.getSummary(sevenDaysAgo, now);
  }
}
