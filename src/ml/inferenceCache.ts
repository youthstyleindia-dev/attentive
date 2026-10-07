/**
 * Classification Inference Cache
 * Caches predictions using stable hashes to eliminate redundant ML inference.
 */
import type { ProductivityType } from "../db/schemas";

export interface CachedClassification {
  category: string;
  categoryScores: Array<{ label: string; score: number }>;
  confidence: number;
  activity: string;
  productivity: ProductivityType;
  modelVersion: string;
  timestamp: number;
}

export class InferenceCache {
  private static cache = new Map<string, CachedClassification>();
  private static MAX_CACHE_ENTRIES = 2000;

  static makeKey(domain: string, title: string, headings: string[] = []): string {
    const normDomain = domain.toLowerCase().trim();
    const normTitle = title.toLowerCase().trim().substring(0, 100);
    const headingsSample = headings.slice(0, 3).join("|").toLowerCase().trim();
    return `${normDomain}::${normTitle}::${headingsSample}`;
  }

  static get(key: string): CachedClassification | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    // 24 hour TTL
    if (Date.now() - entry.timestamp > 86400000) {
      this.cache.delete(key);
      return undefined;
    }
    return entry;
  }

  static set(key: string, val: CachedClassification): void {
    if (this.cache.size >= this.MAX_CACHE_ENTRIES) {
      // LRU eviction of oldest entry
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, val);
  }

  static clear(): void {
    this.cache.clear();
  }
}
