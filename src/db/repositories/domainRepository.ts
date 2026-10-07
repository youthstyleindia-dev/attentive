/**
 * Domain Repository — Dexie AtentivDB
 */
import { db } from "../database";
import type { DomainRecord, ProductivityType } from "../schemas";
import defaultDomainsJson from "../../../libraries/domains/domains.json";

export class DomainRepository {
  static async getByDomain(domain: string): Promise<DomainRecord | undefined> {
    const cleanDomain = domain.toLowerCase().trim();
    // 1. Exact match
    const exact = await db.domains.where("domain").equals(cleanDomain).first();
    if (exact) return exact;

    // 2. Check parent domains (e.g. docs.github.com -> github.com)
    const parts = cleanDomain.split(".");
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join(".");
      const match = await db.domains.where("domain").equals(parent).first();
      if (match) return match;
    }
    return undefined;
  }

  static async upsert(record: Omit<DomainRecord, "id">): Promise<void> {
    const existing = await db.domains.where("domain").equals(record.domain).first();
    if (existing && existing.id) {
      await db.domains.update(existing.id, {
        ...record,
        updated_at: Date.now(),
      });
    } else {
      await db.domains.add({
        ...record,
        created_at: Date.now(),
        updated_at: Date.now(),
      });
    }
  }

  static async seedDefaults(): Promise<number> {
    const count = await db.domains.count();
    if (count > 0) return 0; // Already seeded

    const defaults = (defaultDomainsJson as any).domains || [];
    const now = Date.now();
    const records: DomainRecord[] = defaults.map((d: any) => ({
      domain: d.domain,
      category: d.category,
      default_activity: d.activity || d.default_activity || "General Browsing",
      productivity_type: (d.defaultProductivity || d.productivity_type || "neutral") as ProductivityType,
      keywords: d.keywords || [],
      source: (d.source || "curated") as "curated" | "user" | "learned",
      confidence: d.confidence ?? 1.0,
      user_override: false,
      created_at: now,
      updated_at: now,
    }));
    await db.domains.bulkAdd(records);
    return records.length;
  }

  static async listAll(): Promise<DomainRecord[]> {
    return await db.domains.toArray();
  }
}
