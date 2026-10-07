/**
 * Decision Trace Repository — Dexie AtentivDB
 */
import { db } from "../database";
import type { DecisionTraceRecord } from "../schemas";

export class TraceRepository {
  static async record(trace: DecisionTraceRecord): Promise<void> {
    await db.decision_traces.put(trace);
  }

  static async getById(decisionId: string): Promise<DecisionTraceRecord | undefined> {
    return await db.decision_traces.get(decisionId);
  }

  static async getBySession(sessionId: string): Promise<DecisionTraceRecord | undefined> {
    return await db.decision_traces.where("session_id").equals(sessionId).first();
  }

  static async getRecent(limit = 20): Promise<DecisionTraceRecord[]> {
    return await db.decision_traces
      .orderBy("timestamp")
      .reverse()
      .limit(limit)
      .toArray();
  }
}
