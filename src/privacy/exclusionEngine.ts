/**
 * Privacy Exclusion Engine
 * Guarantees that private, banking, authentication, or user-excluded domains
 * are intercepted immediately and stopped from feature extraction and tracking.
 */
import sensitiveDomainsJson from "../../libraries/privacy/sensitive_domains.json";

export interface ExclusionCheckResult {
  isExcluded: boolean;
  reason?: string;
}

export class ExclusionEngine {
  private static sensitiveSet: Set<string> | null = null;
  private static sensitivePatterns: string[] = [];

  private static init() {
    if (this.sensitiveSet) return;
    this.sensitiveSet = new Set();
    const categories = sensitiveDomainsJson.sensitive_categories as Record<string, string[]>;
    for (const list of Object.values(categories)) {
      for (const d of list) {
        this.sensitiveSet.add(d.toLowerCase());
      }
    }
    this.sensitivePatterns = sensitiveDomainsJson.sensitive_url_patterns || [];
  }

  static check(domain: string, fullUrl = "", userExclusions: string[] = []): ExclusionCheckResult {
    this.init();
    const cleanDomain = domain.toLowerCase().trim();

    // 1. User exclusions (exact or wildcard)
    for (const excl of userExclusions) {
      const e = excl.toLowerCase().trim();
      if (!e) continue;
      if (cleanDomain === e || cleanDomain.endsWith("." + e)) {
        return { isExcluded: true, reason: `User exclusion rule matched: ${excl}` };
      }
      if (e.includes("*")) {
        const regexStr = "^" + e.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
        if (new RegExp(regexStr).test(cleanDomain)) {
          return { isExcluded: true, reason: `User wildcard exclusion matched: ${excl}` };
        }
      }
    }

    // 2. Built-in sensitive domain library
    if (this.sensitiveSet!.has(cleanDomain)) {
      return { isExcluded: true, reason: "Built-in sensitive domain protection" };
    }
    const parts = cleanDomain.split(".");
    for (let i = 1; i < parts.length - 1; i++) {
      const parent = parts.slice(i).join(".");
      if (this.sensitiveSet!.has(parent)) {
        return { isExcluded: true, reason: "Built-in sensitive domain protection (subdomain)" };
      }
    }

    // 3. Sensitive URL path check (e.g. /login, /checkout)
    if (fullUrl) {
      try {
        const path = new URL(fullUrl).pathname.toLowerCase();
        for (const pattern of this.sensitivePatterns) {
          if (path.includes(pattern)) {
            return { isExcluded: true, reason: `Sensitive URL pattern detected: ${pattern}` };
          }
        }
      } catch {
        // Invalid url
      }
    }

    return { isExcluded: false };
  }

  static isExcluded(domain: string, userExclusions: string[] = [], fullUrl = ""): boolean {
    return this.check(domain, fullUrl, userExclusions).isExcluded;
  }

  static sanitizeUrl(rawUrl: string): string {
    try {
      const parsed = new URL(rawUrl);
      parsed.search = "";
      parsed.hash = "";
      parsed.username = "";
      parsed.password = "";
      return parsed.toString().replace(/\/$/, "");
    } catch {
      return rawUrl;
    }
  }
}

