/**
 * Workstream Repository — Dexie AtentivDB
 */
import { db } from "../database";
import type { WorkstreamRecord, WorkstreamEventRecord } from "../schemas";
export class WorkstreamRepository {
  static async create(data: Partial<WorkstreamRecord> & { workstream_id: string; name: string; category: string }): Promise<WorkstreamRecord> {
    const now = Date.now();
    const ws: WorkstreamRecord = {
      workstream_id: data.workstream_id,
      name: data.name,
      category: data.category,
      centroid: data.centroid,
      created_at: data.created_at || now,
      updated_at: data.updated_at || now,
      first_seen: data.first_seen || now,
      last_active: data.last_active || now,
      total_active_seconds: data.total_active_seconds || 0,
      confidence: data.confidence ?? 1.0,
      status: data.status || "active",
    };
    await db.workstreams.put(ws);
    return ws;
  }

  static async getById(workstreamId: string): Promise<WorkstreamRecord | undefined> {
    return await db.workstreams.get(workstreamId);
  }

  static async listActive(limit = 20): Promise<WorkstreamRecord[]> {
    return await db.workstreams
      .where("status")
      .equals("active")
      .sortBy("last_active")
      .then((res) => res.reverse().slice(0, limit));
  }

  static async upsert(record: WorkstreamRecord): Promise<void> {
    await db.workstreams.put(record);
  }

  static async updateCentroid(workstreamId: string, newCentroid: number[], activeDurationSeconds: number): Promise<void> {
    const ws = await db.workstreams.get(workstreamId);
    if (!ws) return;
    await db.workstreams.update(workstreamId, {
      centroid: newCentroid,
      total_active_seconds: ws.total_active_seconds + activeDurationSeconds,
      last_active: Date.now(),
      updated_at: Date.now(),
    });
  }

  static async recordEvent(event: WorkstreamEventRecord): Promise<void> {
    await db.workstream_events.add(event);
  }

  static async getRecentEvents(limit = 50): Promise<WorkstreamEventRecord[]> {
    return await db.workstream_events
      .orderBy("entered_at")
      .reverse()
      .limit(limit)
      .toArray();
  }
}
