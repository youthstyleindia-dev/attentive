/**
 * Session Repository — Dexie AtentivDB
 */
import { db } from "../database";
import type { TabSessionRecord } from "../schemas";

export class SessionRepository {
  static async create(session: Partial<TabSessionRecord> & { url: string; domain: string }): Promise<TabSessionRecord> {
    const now = Date.now();
    const fullSession: TabSessionRecord = {
      session_id: session.session_id || crypto.randomUUID(),
      tab_id: session.tab_id || 0,
      window_id: session.window_id || 0,
      url: session.url,
      domain: session.domain,
      title: session.title || "",
      start_time: session.start_time || now,
      end_time: session.end_time || now,
      dwell_time: session.dwell_time || 0,
      active_time: session.active_time || 0,
      idle_time: session.idle_time || 0,
      category: session.category || "Uncategorized",
      activity_type: session.activity_type || "General Browsing",
      productivity_type: session.productivity_type || "neutral",
      productivity_score: session.productivity_score ?? 50,
      workstream_id: session.workstream_id || "general",
      workstream_name: session.workstream_name || "General",
      classification_confidence: session.classification_confidence ?? 1.0,
      classification_latency_ms: session.classification_latency_ms ?? 0,
      model_version: session.model_version || "1.0.0",
      created_at: session.created_at || now,
    };
    await db.tab_sessions.put(fullSession);
    return fullSession;
  }

  static async getById(sessionId: string): Promise<TabSessionRecord | undefined> {
    return await db.tab_sessions.get(sessionId);
  }

  static async updateDwell(sessionId: string, activeTimeDelta: number, now: number): Promise<void> {
    const existing = await db.tab_sessions.get(sessionId);
    if (!existing) return;
    const newActive = existing.active_time + activeTimeDelta;
    const newDwell = Math.max(existing.dwell_time, newActive);
    await db.tab_sessions.update(sessionId, {
      active_time: newActive,
      dwell_time: newDwell,
      end_time: now,
    });
  }

  static async updateIdle(sessionId: string, idleTimeDelta: number, now: number): Promise<void> {
    const existing = await db.tab_sessions.get(sessionId);
    if (!existing) return;
    await db.tab_sessions.update(sessionId, {
      idle_time: (existing.idle_time || 0) + idleTimeDelta,
      end_time: now,
    });
  }

  static async close(sessionId: string, endTime: number): Promise<void> {
    const existing = await db.tab_sessions.get(sessionId);
    if (!existing) return;
    await db.tab_sessions.update(sessionId, {
      end_time: endTime,
      dwell_time: existing.dwell_time,
    });
  }

  static async getRange(from: number, to: number): Promise<TabSessionRecord[]> {
    return await db.tab_sessions
      .where("start_time")
      .between(from, to, true, true)
      .toArray();
  }

  static async getRecent(limit = 100): Promise<TabSessionRecord[]> {
    return await db.tab_sessions
      .orderBy("start_time")
      .reverse()
      .limit(limit)
      .toArray();
  }

  static async getByWorkstream(workstreamId: string): Promise<TabSessionRecord[]> {
    return await db.tab_sessions
      .where("workstream_id")
      .equals(workstreamId)
      .toArray();
  }
}
