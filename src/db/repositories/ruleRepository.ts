/**
 * Rule Repository — Dexie AtentivDB
 */
import { db } from "../database";
import type { UserRuleRecord } from "../schemas";

export class RuleRepository {
  static async listActive(): Promise<UserRuleRecord[]> {
    const rules = await db.rules.orderBy("priority").reverse().toArray();
    return rules.filter((r) => Boolean(r.enabled));
  }

  static async listAll(): Promise<UserRuleRecord[]> {
    return await db.rules.orderBy("priority").reverse().toArray();
  }

  static async add(rule: Omit<UserRuleRecord, "created_at" | "updated_at">): Promise<void> {
    const now = Date.now();
    await db.rules.put({
      ...rule,
      created_at: now,
      updated_at: now,
    });
  }

  static async update(ruleId: string, changes: Partial<UserRuleRecord>): Promise<void> {
    await db.rules.update(ruleId, {
      ...changes,
      updated_at: Date.now(),
    });
  }

  static async remove(ruleId: string): Promise<void> {
    await db.rules.delete(ruleId);
  }
}
