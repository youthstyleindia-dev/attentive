/**
 * Rule Engine & Matcher — Atentiv
 * Implements strict hierarchical decision matching where user rules strictly take precedence.
 */
import type { UserRuleRecord, UserRuleCondition, UserRuleAction } from "../db/schemas";

export interface PageContext {
  domain: string;
  url: string;
  title: string;
  headings?: string[];
  category?: string;
  activity?: string;
  workstreamId?: string;
  timestamp?: number;
}

export interface RuleMatchResult {
  matchedRule: UserRuleRecord;
  action: UserRuleAction;
  reason: string;
}

export class RuleEngine {
  static match(rules: UserRuleRecord[], ctx: PageContext): RuleMatchResult | null {
    // Sort active rules by priority descending
    const activeRules = rules
      .filter((r) => r.enabled)
      .sort((a, b) => b.priority - a.priority);

    for (const rule of activeRules) {
      if (this.evalCondition(rule.condition, ctx)) {
        return {
          matchedRule: rule,
          action: rule.action,
          reason: `User Rule '${rule.name}' (priority ${rule.priority}) matched`,
        };
      }
    }
    return null;
  }

  private static evalCondition(cond: UserRuleCondition, ctx: PageContext): boolean {
    const cleanDomain = ctx.domain.toLowerCase().trim();

    // Domain exact
    if (cond.domain_exact && cleanDomain !== cond.domain_exact.toLowerCase().trim()) {
      return false;
    }

    // Domain wildcard
    if (cond.domain_wildcard) {
      const pattern = "^" + cond.domain_wildcard.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$";
      if (!new RegExp(pattern, "i").test(cleanDomain)) {
        return false;
      }
    }

    // URL path prefix
    if (cond.url_path_prefix) {
      try {
        const path = new URL(ctx.url).pathname.toLowerCase();
        if (!path.startsWith(cond.url_path_prefix.toLowerCase())) {
          return false;
        }
      } catch {
        return false;
      }
    }

    // Title contains
    if (cond.title_contains) {
      const titleLower = ctx.title.toLowerCase();
      if (Array.isArray(cond.title_contains)) {
        const matchesAny = cond.title_contains.some((term) =>
          titleLower.includes(String(term).toLowerCase())
        );
        if (!matchesAny) return false;
      } else {
        if (!titleLower.includes(String(cond.title_contains).toLowerCase())) {
          return false;
        }
      }
    }

    // Title regex
    if (cond.title_regex) {
      try {
        if (!new RegExp(cond.title_regex, "i").test(ctx.title)) {
          return false;
        }
      } catch {
        return false;
      }
    }

    // Headings contain
    if (cond.heading_contains && ctx.headings && ctx.headings.length > 0) {
      const combined = ctx.headings.join(" ").toLowerCase();
      if (Array.isArray(cond.heading_contains)) {
        const matchesAny = cond.heading_contains.some((term) =>
          combined.includes(String(term).toLowerCase())
        );
        if (!matchesAny) return false;
      } else {
        if (!combined.includes(String(cond.heading_contains).toLowerCase())) {
          return false;
        }
      }
    }

    // Page category
    if (cond.page_category && ctx.category) {
      if (ctx.category.toLowerCase() !== cond.page_category.toLowerCase()) {
        return false;
      }
    }

    // Time of day & Day of week
    if (cond.time_of_day_start !== undefined || cond.day_of_week) {
      const now = new Date(ctx.timestamp || Date.now());
      if (cond.time_of_day_start !== undefined && cond.time_of_day_end !== undefined) {
        const hour = now.getHours();
        if (hour < cond.time_of_day_start || hour > cond.time_of_day_end) {
          return false;
        }
      }
      if (cond.day_of_week && cond.day_of_week.length > 0) {
        const day = now.getDay();
        if (!cond.day_of_week.includes(day)) {
          return false;
        }
      }
    }

    return true;
  }
}
