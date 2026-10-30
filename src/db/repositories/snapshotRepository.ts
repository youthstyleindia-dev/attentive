/**
 * Snapshot Repository — Dexie AtentivDB
 * Manages saved workspace contexts for one-click tab restoration and context resumption.
 * Complies with SRS Sections 4.5, 5.3, and Workflows 19 & 20.
 */
import { db } from "../database";
import type { SnapshotRecord, SavedTabEntry } from "../schemas";

export class SnapshotRepository {
  /**
   * Save a new context snapshot or update an existing one.
   */
  static async save(
    data: Partial<SnapshotRecord> & {
      title: string;
      saved_tabs: SavedTabEntry[];
      workstream_id?: string;
    },
  ): Promise<SnapshotRecord> {
    const now = Date.now();
    const record: SnapshotRecord = {
      snapshot_id: data.snapshot_id || crypto.randomUUID(),
      title:
        data.title.trim() ||
        `Workspace Snapshot ${new Date(now).toLocaleDateString()}`,
      workstream_id: data.workstream_id || "general",
      saved_tabs: data.saved_tabs.map((t) => ({
        url: t.url,
        title: t.title || t.url,
        favicon: t.favicon,
        category: t.category,
      })),
      window_layout: data.window_layout,
      timestamp: data.timestamp || now,
    };

    if ((data as any).note) {
      (record as any).note = String((data as any).note);
    }

    await db.snapshots.put(record);
    return record;
  }

  /**
   * Get snapshot by ID.
   */
  static async getById(
    snapshotId: string,
  ): Promise<SnapshotRecord | undefined> {
    if (!snapshotId) return undefined;
    return await db.snapshots.get(snapshotId);
  }

  /**
   * List recent snapshots sorted chronologically descending.
   */
  static async listRecent(limit = 50): Promise<SnapshotRecord[]> {
    return await db.snapshots
      .orderBy("timestamp")
      .reverse()
      .limit(limit)
      .toArray();
  }

  /**
   * List all snapshots associated with a specific workstream.
   */
  static async listByWorkstream(
    workstreamId: string,
  ): Promise<SnapshotRecord[]> {
    return await db.snapshots
      .where("workstream_id")
      .equals(workstreamId)
      .reverse()
      .sortBy("timestamp");
  }

  /**
   * Update snapshot details (e.g. rename title, update notes, or modify tabs).
   */
  static async update(
    snapshotId: string,
    updates: Partial<SnapshotRecord>,
  ): Promise<SnapshotRecord | undefined> {
    const existing = await db.snapshots.get(snapshotId);
    if (!existing) return undefined;

    const updated: SnapshotRecord = {
      ...existing,
      ...updates,
      snapshot_id: existing.snapshot_id, // Immutable ID
    };

    await db.snapshots.put(updated);
    return updated;
  }

  /**
   * Delete a snapshot by ID.
   */
  static async delete(snapshotId: string): Promise<boolean> {
    if (!snapshotId) return false;
    const existing = await db.snapshots.get(snapshotId);
    if (!existing) return false;
    await db.snapshots.delete(snapshotId);
    return true;
  }

  /**
   * Export all snapshots for data backup.
   */
  static async exportAll(): Promise<SnapshotRecord[]> {
    return await db.snapshots.toArray();
  }

  /**
   * Clear all snapshots.
   */
  static async clearAll(): Promise<void> {
    await db.snapshots.clear();
  }

  /**
   * Count total saved snapshots.
   */
  static async count(): Promise<number> {
    return await db.snapshots.count();
  }
}
