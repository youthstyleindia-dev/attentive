/**
 * Atentiv Runtime Preprocessing Pipeline
 * Pure, unit-testable implementation of the 11-stage processing gates.
 * Conforms to SRS Revision 3.1 / Submission Version 3.0 and docs/architecture/preprocessing-spec.md.
 */

import { ExclusionEngine } from "../privacy/exclusionEngine";
import { RuleEngine, type PageContext } from "../rules/ruleEngine";
import { DomainRepository } from "../db/repositories/domainRepository";
import { InferenceCache } from "../ml/inferenceCache";
import { ModelLoader } from "../ml/modelLoader";
import type {
  UserRuleRecord,
  ProductivityType,
  DecisionTraceRecord,
} from "../db/schemas";

import productivityRulesJson from "../../libraries/productivity/productivity_rules.json";
import devKeywords from "../../libraries/keywords/development.json";
import researchKeywords from "../../libraries/keywords/research.json";
import learningKeywords from "../../libraries/keywords/learning.json";
import commsKeywords from "../../libraries/keywords/communication.json";
import entertainmentKeywords from "../../libraries/keywords/entertainment.json";

// ── Types & Reason Codes ───────────────────────────────────────────────────

export type GateStatus = "PASSED" | "BLOCKED" | "SKIPPED" | "PAUSED";

export interface PipelineGateResult<T> {
  gateName: string;
  status: GateStatus;
  reasonCode: string;
  data: T;
}

export interface ExtractedRawFeatures {
  url: string;
  title: string;
  description?: string;
  headings?: string[];
  mainText?: string;
  hasAudioPlaying?: boolean;
  hasVideoPlaying?: boolean;
}

export interface ScrubbedUrlResult {
  scrubbedUrl: string;
  domain: string;
  strippedParams: string[];
}

export interface LinkRelationship {
  sourceUrl: string | null;
  destinationUrl: string;
  timestamp: number;
  workstreamId: string | null;
}

export interface ActiveTimeState {
  isFocused: boolean;
  dwellAllowed: boolean;
  isIdle: boolean;
  isSleepGap: boolean;
  dwellMs: number;
}

export interface RuntimePipelineOutput {
  status: "TRACKABLE" | "UNTRACKABLE" | "EXCLUDED" | "PAUSED";
  reasonCode: string;
  category: string;
  activity: string;
  productivity: ProductivityType;
  confidence: number;
  compositeText: string;
  scrubbedUrl: string;
  domain: string;
  linkRelationship: LinkRelationship;
  decisionTrace: Omit<DecisionTraceRecord, "decision_id">;
  inferenceLatencyMs: number;
}

// ── Spec-Compliant Text Normalization ──────────────────────────────────────

/**
 * Normalizes single text block per docs/architecture/preprocessing-spec.md
 * 1. Unicode NFKC
 * 2. Control characters -> space
 * 3. URLs -> space
 * 4. Emails -> space
 * 5. Long digit runs (>=7 digits) -> space
 * 6. Allowed chars: alphanumeric, '.', '-', '_', spaces
 * 7. Lowercase
 * 8. Collapse whitespace and trim
 */
export function normalizeText(text: string, maxChars?: number): string {
  if (!text) return "";
  let s = String(text);

  // 1. Unicode NFKC
  try {
    s = s.normalize("NFKC");
  } catch {}

  // 2. Control characters (\u0000-\u0008, \u000B-\u001F, \u007F-\u009F)
  s = s.replace(/[\u0000-\u0008\u000B-\u001F\u007F-\u009F]/g, " ");

  // 3. URLs
  s = s.replace(/https?:\/\/[^\s]+/gi, " ");

  // 4. Emails
  s = s.replace(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g, " ");

  // 5. Long digit runs (7+ consecutive digits)
  s = s.replace(/\b\d{7,}\b/g, " ");

  // 6. Keep alphanumeric, dots, dashes, underscores, spaces
  s = s.replace(/[^\w\s\.\-_]/g, " ");

  // 7. Lowercase
  s = s.toLowerCase();

  // 8. Collapse whitespace and trim
  s = s.replace(/\s+/g, " ").trim();

  if (typeof maxChars === "number" && maxChars > 0) {
    s = s.substring(0, maxChars).trim();
  }
  return s;
}

/**
 * Normalizes and joins fields in exact order per spec:
 * title (300) -> description (500) -> headings (20 items, 150 each) -> main_text (2048)
 * Clamped to 4096 composite chars maximum.
 */
export function normalizeAndJoinCompositeText(fields: {
  title?: string;
  description?: string;
  headings?: string[];
  mainText?: string;
}): string {
  const parts: string[] = [];

  // 1. Title (up to 300)
  if (fields.title) {
    const t = normalizeText(fields.title, 300);
    if (t) parts.push(t);
  }

  // 2. Description (up to 500)
  if (fields.description) {
    const d = normalizeText(fields.description, 500);
    if (d) parts.push(d);
  }

  // 3. Headings (up to 20 headings, each max 150)
  if (fields.headings && Array.isArray(fields.headings)) {
    const cleanHeadings: string[] = [];
    for (const h of fields.headings.slice(0, 20)) {
      const ch = normalizeText(h, 150);
      if (ch) cleanHeadings.push(ch);
    }
    if (cleanHeadings.length > 0) {
      parts.push(cleanHeadings.join(" "));
    }
  }

  // 4. Main text (up to 2048)
  if (fields.mainText) {
    const mt = normalizeText(fields.mainText, 2048);
    if (mt) parts.push(mt);
  }

  if (parts.length === 0) return "";
  const joined = parts.join(" ").replace(/\s+/g, " ").trim();
  return joined.substring(0, 4096).trim();
}

// ── Stage 1: Eligibility Gate ──────────────────────────────────────────────

const UNTRACKABLE_SCHEMES = [
  "chrome://",
  "chrome-extension://",
  "edge://",
  "about:",
  "brave://",
  "opera://",
  "devtools://",
  "view-source:",
  "data:",
  "blob:",
  "javascript:",
];

export function checkEligibilityGate(
  url: string,
): PipelineGateResult<{ isEligible: boolean; url: string }> {
  if (!url) {
    return {
      gateName: "EligibilityGate",
      status: "BLOCKED",
      reasonCode: "GATE1_EMPTY_URL",
      data: { isEligible: false, url: "" },
    };
  }
  const lower = url.trim().toLowerCase();
  for (const scheme of UNTRACKABLE_SCHEMES) {
    if (lower.startsWith(scheme)) {
      return {
        gateName: "EligibilityGate",
        status: "BLOCKED",
        reasonCode: `GATE1_INTERNAL_SCHEME_${scheme.replace(/[^a-z0-9]/g, "_").toUpperCase()}`,
        data: { isEligible: false, url },
      };
    }
  }
  return {
    gateName: "EligibilityGate",
    status: "PASSED",
    reasonCode: "GATE1_ELIGIBLE_WEB_URL",
    data: { isEligible: true, url },
  };
}

// ── Stage 2: Exclusion Gate ────────────────────────────────────────────────

export function checkExclusionGate(
  domain: string,
  url: string,
  userExclusions: string[] = [],
): PipelineGateResult<{ isExcluded: boolean; reason: string }> {
  const result = ExclusionEngine.check(domain, url, userExclusions);
  if (result.isExcluded) {
    return {
      gateName: "ExclusionGate",
      status: "BLOCKED",
      reasonCode: `GATE2_EXCLUDED_${(result.reason || "PRIVACY").replace(/[^a-zA-Z0-9]/g, "_").toUpperCase()}`,
      data: {
        isExcluded: true,
        reason: result.reason || "Excluded by privacy rules",
      },
    };
  }
  return {
    gateName: "ExclusionGate",
    status: "PASSED",
    reasonCode: "GATE2_NOT_EXCLUDED",
    data: { isExcluded: false, reason: "" },
  };
}

// ── Stage 3: Active-Time Gate ──────────────────────────────────────────────

export function checkActiveTimeGate(input: {
  isTabFocused: boolean;
  idleSeconds: number;
  inactivityThresholdSeconds?: number;
  heartbeatGapSeconds?: number;
  hasMediaPlaying?: boolean;
}): PipelineGateResult<ActiveTimeState> {
  const threshold = input.inactivityThresholdSeconds ?? 180;
  const isSleep = (input.heartbeatGapSeconds ?? 0) > 90;

  if (!input.isTabFocused) {
    return {
      gateName: "ActiveTimeGate",
      status: "PAUSED",
      reasonCode: "GATE3_TAB_NOT_FOCUSED",
      data: {
        isFocused: false,
        dwellAllowed: false,
        isIdle: false,
        isSleepGap: isSleep,
        dwellMs: 0,
      },
    };
  }

  if (isSleep) {
    return {
      gateName: "ActiveTimeGate",
      status: "PAUSED",
      reasonCode: "GATE3_SYSTEM_SLEEP_DETECTED",
      data: {
        isFocused: true,
        dwellAllowed: false,
        isIdle: true,
        isSleepGap: true,
        dwellMs: 0,
      },
    };
  }

  // Active media playing suppresses inactivity timeout (FR-03)
  const isIdle = input.idleSeconds >= threshold && !input.hasMediaPlaying;
  if (isIdle) {
    return {
      gateName: "ActiveTimeGate",
      status: "PAUSED",
      reasonCode: "GATE3_INACTIVITY_TIMEOUT_EXCEEDED",
      data: {
        isFocused: true,
        dwellAllowed: false,
        isIdle: true,
        isSleepGap: false,
        dwellMs: 0,
      },
    };
  }

  return {
    gateName: "ActiveTimeGate",
    status: "PASSED",
    reasonCode:
      input.hasMediaPlaying && input.idleSeconds >= threshold
        ? "GATE3_MEDIA_PLAYBACK_ACTIVE_OVERRIDE"
        : "GATE3_USER_ACTIVE",
    data: {
      isFocused: true,
      dwellAllowed: true,
      isIdle: false,
      isSleepGap: false,
      dwellMs: 1000,
    },
  };
}

// ── Stage 5: Dynamic Page Feature Hash ─────────────────────────────────────

export function computeFeatureHash(signals: {
  title: string;
  headings?: string[];
}): string {
  const hParts = (signals.headings || []).slice(0, 5).join("|");
  return `${signals.title}::${hParts}`;
}

export function checkDynamicHashGate(
  currentHash: string,
  previousHash: string,
): PipelineGateResult<{ hasChanged: boolean }> {
  if (currentHash === previousHash) {
    return {
      gateName: "DynamicHashGate",
      status: "SKIPPED",
      reasonCode: "GATE5_FEATURE_HASH_UNCHANGED",
      data: { hasChanged: false },
    };
  }
  return {
    gateName: "DynamicHashGate",
    status: "PASSED",
    reasonCode: "GATE5_FEATURE_HASH_UPDATED",
    data: { hasChanged: true },
  };
}

// ── Stage 6: URL Scrubbing ─────────────────────────────────────────────────

const SENSITIVE_QUERY_PARAMS = new Set([
  "auth",
  "token",
  "access_token",
  "id_token",
  "refresh_token",
  "password",
  "pwd",
  "pass",
  "key",
  "api_key",
  "apikey",
  "session",
  "session_id",
  "sessionid",
  "secret",
  "sig",
  "signature",
  "code",
  "state",
]);

export function scrubUrl(rawUrl: string): ScrubbedUrlResult {
  try {
    const parsed = new URL(rawUrl);
    let domain = parsed.hostname.toLowerCase();
    if (domain.startsWith("www.")) {
      domain = domain.substring(4);
    }

    const stripped: string[] = [];
    const searchParams = new URLSearchParams(parsed.search);
    const keysToRemove: string[] = [];

    searchParams.forEach((_, key) => {
      const lowerKey = key.toLowerCase();
      if (
        SENSITIVE_QUERY_PARAMS.has(lowerKey) ||
        lowerKey.includes("token") ||
        lowerKey.includes("secret")
      ) {
        keysToRemove.push(key);
        stripped.push(key);
      }
    });

    for (const k of keysToRemove) {
      searchParams.delete(k);
    }

    parsed.search = searchParams.toString()
      ? `?${searchParams.toString()}`
      : "";
    parsed.hash = "";
    parsed.username = "";
    parsed.password = "";

    return {
      scrubbedUrl: parsed.toString().replace(/\/$/, ""),
      domain,
      strippedParams: stripped,
    };
  } catch {
    return {
      scrubbedUrl: rawUrl,
      domain: "",
      strippedParams: [],
    };
  }
}

// ── Stage 7: Link Relationships ────────────────────────────────────────────

export function recordLinkRelationship(
  sourceUrl: string | null | undefined,
  destinationUrl: string,
  workstreamId: string | null | undefined,
  timestamp = Date.now(),
): LinkRelationship {
  return {
    sourceUrl:
      sourceUrl && sourceUrl.trim().length > 0 ? sourceUrl.trim() : null,
    destinationUrl: destinationUrl.trim(),
    timestamp,
    workstreamId: workstreamId ?? null,
  };
}

// ── Stage 9: Categorisation Precedence ─────────────────────────────────────

export interface ClassificationPrecedenceInput {
  domain: string;
  url: string;
  title: string;
  compositeText: string;
  userRules?: UserRuleRecord[];
  userFeedbackCategory?: string;
  userExclusions?: string[];
}

export interface PrecedenceResult {
  category: string;
  activity: string;
  productivity: ProductivityType;
  confidence: number;
  reasonCode: string;
  traceReasons: string[];
  modelVersion: string;
}

export async function resolveCategorisationPrecedence(
  input: ClassificationPrecedenceInput,
): Promise<PrecedenceResult> {
  const {
    domain,
    url,
    title,
    compositeText,
    userRules,
    userFeedbackCategory,
    userExclusions,
  } = input;
  const traceReasons: string[] = [];

  // Step 1: Exclusion
  const excl = ExclusionEngine.check(domain, url, userExclusions || []);
  if (excl.isExcluded) {
    return {
      category: "Private",
      activity: "Excluded",
      productivity: "neutral",
      confidence: 1.0,
      reasonCode: "GATE9_EXCLUSION_RULE",
      traceReasons: [excl.reason || "Excluded domain"],
      modelVersion: "none",
    };
  }

  // Step 2: User Rule (Must NEVER be overridden by fastText)
  const pageCtx: PageContext = {
    domain,
    url,
    title,
    headings: [],
    timestamp: Date.now(),
  };
  const ruleMatch = RuleEngine.match(userRules || [], pageCtx);
  if (ruleMatch) {
    traceReasons.push(
      `User rule matched: ${ruleMatch.matchedRule.name} -> ${ruleMatch.action.category || "Rule"}`,
    );
    return {
      category: ruleMatch.action.category || "Technology",
      activity: ruleMatch.action.activity_type || "Development",
      productivity: ruleMatch.action.productivity_type || "productive",
      confidence: 1.0,
      reasonCode: "GATE9_USER_RULE",
      traceReasons,
      modelVersion: "user-rule",
    };
  }

  // Step 3: User Feedback
  if (userFeedbackCategory) {
    traceReasons.push(`User feedback active: ${userFeedbackCategory}`);
    return {
      category: userFeedbackCategory,
      activity: "Feedback Override",
      productivity: "productive",
      confidence: 1.0,
      reasonCode: "GATE9_USER_FEEDBACK",
      traceReasons,
      modelVersion: "user-feedback",
    };
  }

  // Step 4: Curated Domain
  const curated = await DomainRepository.getByDomain(domain);
  if (curated) {
    traceReasons.push(
      `Curated domain matched: ${domain} -> ${curated.category}`,
    );
    return {
      category: curated.category,
      activity: curated.default_activity || "General Browsing",
      productivity: curated.productivity_type || "neutral",
      confidence: curated.confidence || 0.95,
      reasonCode: "GATE9_CURATED_DOMAIN",
      traceReasons,
      modelVersion: "curated-db",
    };
  }

  // Step 5: Cache
  const cacheKey = InferenceCache.makeKey(domain, title, []);
  const cached = InferenceCache.get(cacheKey);
  if (cached) {
    traceReasons.push(
      `Inference cache hit (confidence ${cached.confidence.toFixed(2)})`,
    );
    return {
      category: cached.category,
      activity: cached.activity || "General Browsing",
      productivity: cached.productivity || "neutral",
      confidence: cached.confidence,
      reasonCode: "GATE9_CACHE_HIT",
      traceReasons,
      modelVersion: cached.modelVersion || "cache",
    };
  }

  // Step 6: fastText (WASM)
  if (compositeText.length >= 3) {
    try {
      let model = ModelLoader.getActiveModel();
      if (!model && typeof window !== "undefined") {
        model = await ModelLoader.load();
      }
      if (model && model.isLoaded) {
        const preds = model.predict(compositeText, 3, 0.0);
        if (preds && preds.length > 0 && preds[0].score > 0.35) {
          const top = preds[0];
          traceReasons.push(
            `fastText WASM predicted: ${top.label} (score: ${top.score.toFixed(2)})`,
          );
          const inferredProd = inferProductivityFromCategory(top.label);
          InferenceCache.set(cacheKey, {
            category: top.label,
            categoryScores: preds,
            confidence: top.score,
            activity: "FastText Inference",
            productivity: inferredProd,
            modelVersion: model.version,
            timestamp: Date.now(),
          });
          return {
            category: top.label,
            activity: "FastText Inference",
            productivity: inferredProd,
            confidence: top.score,
            reasonCode: "GATE9_FASTTEXT_WASM",
            traceReasons,
            modelVersion: model.version,
          };
        }
      }
    } catch {
      traceReasons.push(
        "fastText WASM failed; falling back to keyword scoring",
      );
    }
  }

  // Step 7: Keyword Scoring
  const kwResult = scoreKeywords(compositeText);
  if (kwResult) {
    traceReasons.push(`Keyword heuristics matched: ${kwResult.category}`);
    return {
      category: kwResult.category,
      activity: kwResult.activity,
      productivity: kwResult.productivity,
      confidence: kwResult.confidence,
      reasonCode: "GATE9_KEYWORD_HEURISTIC",
      traceReasons,
      modelVersion: "keyword-scoring",
    };
  }

  // Step 8: Other / Neutral
  traceReasons.push("Safe fallback: Uncategorized");
  return {
    category: "Uncategorized",
    activity: "General Browsing",
    productivity: "neutral",
    confidence: 0.5,
    reasonCode: "GATE9_FALLBACK_NEUTRAL",
    traceReasons,
    modelVersion: "fallback",
  };
}

// ── Stage 10: YouTube Contextual Rule ──────────────────────────────────────

const EDUCATIONAL_TITLE_REGEX =
  /\b(lecture|tutorial|course|documentation|learn|programming|tutorial for beginners|full course|explained)\b/i;

export function evaluateYouTubeGate(
  domain: string,
  title: string,
  currentCategory: string,
  currentProductivity: ProductivityType,
  hasUserRule: boolean,
): {
  category: string;
  productivity: ProductivityType;
  activity: string;
  reasonCode: string;
} {
  if (domain !== "youtube.com" && domain !== "youtu.be") {
    return {
      category: currentCategory,
      productivity: currentProductivity,
      activity: "Standard",
      reasonCode: "GATE10_NOT_YOUTUBE",
    };
  }

  // User rules strictly override
  if (hasUserRule) {
    return {
      category: currentCategory,
      productivity: currentProductivity,
      activity: "User Override",
      reasonCode: "GATE10_YOUTUBE_USER_RULE_OVERRIDE",
    };
  }

  // Educational title promotion
  if (EDUCATIONAL_TITLE_REGEX.test(title)) {
    return {
      category: "Education",
      productivity: "productive",
      activity: "Tutorial / Lecture",
      reasonCode: "GATE10_YOUTUBE_EDUCATIONAL_PROMOTED",
    };
  }

  // Default YouTube is Entertainment / Distracting
  return {
    category: "Entertainment",
    productivity: "distracting",
    activity: "Video Streaming",
    reasonCode: "GATE10_YOUTUBE_DEFAULT_ENTERTAINMENT",
  };
}

// ── Helpers ────────────────────────────────────────────────────────────────

function inferProductivityFromCategory(category: string): ProductivityType {
  const c = category.toLowerCase();
  if (["technology", "education", "work", "research"].includes(c))
    return "productive";
  if (["entertainment", "shop"].includes(c)) return "distracting";
  return "neutral";
}

function scoreKeywords(text: string): {
  category: string;
  activity: string;
  productivity: ProductivityType;
  confidence: number;
} | null {
  const t = text.toLowerCase();
  const kwCategories: Array<{
    category: string;
    activity: string;
    productivity: ProductivityType;
    keywords: string[];
  }> = [
    {
      category: "Technology",
      activity: "Development",
      productivity: "productive",
      keywords: (devKeywords as any).keywords || [],
    },
    {
      category: "Research",
      activity: "Research",
      productivity: "productive",
      keywords: (researchKeywords as any).keywords || [],
    },
    {
      category: "Education",
      activity: "Learning",
      productivity: "productive",
      keywords: (learningKeywords as any).keywords || [],
    },
    {
      category: "Communication",
      activity: "Communication",
      productivity: "neutral",
      keywords: (commsKeywords as any).keywords || [],
    },
    {
      category: "Entertainment",
      activity: "Entertainment",
      productivity: "distracting",
      keywords: (entertainmentKeywords as any).keywords || [],
    },
  ];

  let bestCat = "";
  let bestAct = "";
  let bestProd: ProductivityType = "neutral";
  let maxHits = 0;

  for (const cat of kwCategories) {
    let hits = 0;
    for (const kw of cat.keywords) {
      if (t.includes(kw.toLowerCase())) hits++;
    }
    if (hits > maxHits) {
      maxHits = hits;
      bestCat = cat.category;
      bestAct = cat.activity;
      bestProd = cat.productivity;
    }
  }

  if (maxHits > 0) {
    return {
      category: bestCat,
      activity: bestAct,
      productivity: bestProd,
      confidence: Math.min(0.85, 0.45 + maxHits * 0.1),
    };
  }
  return null;
}
