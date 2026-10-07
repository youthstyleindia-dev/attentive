/**
 * Atentiv Multi-Stage Page Classifier
 * Integrates Privacy Filter, User Rules, Domain Knowledge, Inference Cache,
 * fastText WASM ML Inference, Activity Taxonomy, and Contextual Productivity.
 */
import { ExclusionEngine } from "../privacy/exclusionEngine";
import { RuleEngine, type PageContext } from "../rules/ruleEngine";
import { DomainRepository } from "../db/repositories/domainRepository";
import { InferenceCache } from "./inferenceCache";
import { ModelLoader } from "./modelLoader";
import { buildCompositeFeatureText, sanitizeUrl } from "../features/textFeatures";
import type { UserRuleRecord, ProductivityType, DecisionTraceRecord } from "../db/schemas";

import productivityRulesJson from "../../libraries/productivity/productivity_rules.json";
import devKeywords from "../../libraries/keywords/development.json";
import researchKeywords from "../../libraries/keywords/research.json";
import learningKeywords from "../../libraries/keywords/learning.json";
import commsKeywords from "../../libraries/keywords/communication.json";
import entertainmentKeywords from "../../libraries/keywords/entertainment.json";

export interface ClassificationInput {
  url: string;
  title: string;
  headings?: string[];
  metaDescription?: string;
  visibleTextExcerpt?: string;
  sessionId?: string;
  userRules?: UserRuleRecord[];
  userExclusions?: string[];
  workstreamId?: string;
}

export interface ClassificationResult {
  category: string;
  categoryScores: Array<{ label: string; score: number }>;
  confidence: number;
  activity: string;
  productivity: ProductivityType;
  productivityScore: number;
  modelVersion: string;
  isExcluded: boolean;
  exclusionReason?: string;
  sentenceVector?: Float32Array;
  compositeText: string;
  decisionTrace: Omit<DecisionTraceRecord, "decision_id">;
  inferenceLatencyMs: number;
}

export class Classifier {
  static async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const t0 = performance.now();
    const sessionId = input.sessionId || crypto.randomUUID();
    const sanitized = sanitizeUrl(input.url);

    if (!sanitized) {
      const latency = performance.now() - t0;
      return {
        category: "Uncategorized",
        categoryScores: [{ label: "Uncategorized", score: 1.0 }],
        confidence: 1.0,
        activity: "Unknown",
        productivity: "neutral",
        productivityScore: 0,
        modelVersion: "none",
        isExcluded: true,
        exclusionReason: "Non-trackable or internal URL protocol",
        compositeText: "",
        decisionTrace: this.makeTrace(sessionId, [], null, [], [], 1.0, "Unknown", "neutral", "None", {}, ["Non-trackable URL"], "none", latency),
        inferenceLatencyMs: latency,
      };
    }

    const { domain, pathTokens } = sanitized;
    const cleanTitle = (input.title || "").trim();
    const headings = input.headings || [];
    const reasons: string[] = [];

    // 1. PRIVACY EXCLUSION CHECK (Section 34)
    const exclCheck = ExclusionEngine.check(domain, input.url, input.userExclusions || []);
    if (exclCheck.isExcluded) {
      const latency = performance.now() - t0;
      return {
        category: "Private",
        categoryScores: [{ label: "Private", score: 1.0 }],
        confidence: 1.0,
        activity: "Excluded",
        productivity: "neutral",
        productivityScore: 0,
        modelVersion: "none",
        isExcluded: true,
        exclusionReason: exclCheck.reason,
        compositeText: domain,
        decisionTrace: this.makeTrace(sessionId, [], null, [], [], 1.0, "Excluded", "neutral", "None", {}, [exclCheck.reason || "Excluded"], "none", latency),
        inferenceLatencyMs: latency,
      };
    }

    // 2. USER RULES (Section 15 - Always Top Priority)
    const pageCtx: PageContext = {
      domain,
      url: input.url,
      title: cleanTitle,
      headings,
      timestamp: Date.now(),
    };

    const ruleMatch = RuleEngine.match(input.userRules || [], pageCtx);
    if (ruleMatch) {
      reasons.push(ruleMatch.reason);
      const action = ruleMatch.action;
      if (action.exclude_from_tracking || action.mark_as_private) {
        const latency = performance.now() - t0;
        return {
          category: action.category || "Private",
          categoryScores: [{ label: action.category || "Private", score: 1.0 }],
          confidence: 1.0,
          activity: action.activity_type || "Excluded",
          productivity: "neutral",
          productivityScore: 0,
          modelVersion: "user-rule",
          isExcluded: true,
          exclusionReason: ruleMatch.reason,
          compositeText: domain,
          decisionTrace: this.makeTrace(sessionId, [{ rule_id: ruleMatch.matchedRule.rule_id, name: ruleMatch.matchedRule.name, priority: ruleMatch.matchedRule.priority }], null, [], [], 1.0, action.activity_type || "Excluded", "neutral", action.force_workstream || "User Override", {}, reasons, "user-rule", latency),
          inferenceLatencyMs: latency,
        };
      }

      const assignedCategory = action.category || "Technology";
      const assignedActivity = action.activity_type || "Coding";
      const assignedProductivity = action.productivity_type || "productive";
      const latency = performance.now() - t0;

      return {
        category: assignedCategory,
        categoryScores: [{ label: assignedCategory, score: 1.0 }],
        confidence: 1.0,
        activity: assignedActivity,
        productivity: assignedProductivity,
        productivityScore: assignedProductivity === "productive" ? 1.0 : assignedProductivity === "distracting" ? -1.0 : 0.0,
        modelVersion: "user-rule",
        isExcluded: false,
        compositeText: buildCompositeFeatureText(domain, pathTokens, cleanTitle, headings, input.metaDescription, input.visibleTextExcerpt),
        decisionTrace: this.makeTrace(sessionId, [{ rule_id: ruleMatch.matchedRule.rule_id, name: ruleMatch.matchedRule.name, priority: ruleMatch.matchedRule.priority }], null, [], [{ label: assignedCategory, score: 1.0 }], 1.0, assignedActivity, assignedProductivity, action.force_workstream || "User Assigned", {}, reasons, "user-rule", latency),
        inferenceLatencyMs: latency,
      };
    }

    // 3. INFERENCE CACHE CHECK (Section 26)
    const cacheKey = InferenceCache.makeKey(domain, cleanTitle, headings);
    const cached = InferenceCache.get(cacheKey);
    if (cached) {
      reasons.push("Inference Cache Hit (24h TTL)");
      const latency = performance.now() - t0;
      return {
        category: cached.category,
        categoryScores: cached.categoryScores,
        confidence: cached.confidence,
        activity: cached.activity,
        productivity: cached.productivity,
        productivityScore: cached.productivity === "productive" ? 1.0 : cached.productivity === "distracting" ? -1.0 : 0.0,
        modelVersion: cached.modelVersion,
        isExcluded: false,
        compositeText: buildCompositeFeatureText(domain, pathTokens, cleanTitle, headings, input.metaDescription, input.visibleTextExcerpt),
        decisionTrace: this.makeTrace(sessionId, [], null, [], cached.categoryScores, cached.confidence, cached.activity, cached.productivity, "Cached", {}, reasons, cached.modelVersion, latency),
        inferenceLatencyMs: latency,
      };
    }

    // 4. FAST PATH: DOMAIN REPOSITORY CHECK (Section 37)
    let domainRecord = await DomainRepository.getByDomain(domain);
    if (!domainRecord) {
      await DomainRepository.seedDefaults();
      domainRecord = await DomainRepository.getByDomain(domain);
    }

    // 5. ML CLASSIFIER / FASTTEXT WASM INFERENCE (Section 10, 27)
    const compositeText = buildCompositeFeatureText(domain, pathTokens, cleanTitle, headings, input.metaDescription, input.visibleTextExcerpt);
    let model = ModelLoader.getActiveModel();
    if (!model) {
      model = await ModelLoader.load();
    }

    const predictions = model.predict(compositeText, 3, 0.0);
    const topPred = predictions[0] || { label: "Uncategorized", score: 0.5 };
    const sentenceVector = model.getSentenceVector(compositeText);

    // Merge Domain Knowledge with ML Predictions
    let finalCategory = topPred.label;
    let confidence = topPred.score;

    if (domainRecord && domainRecord.confidence >= 0.95) {
      // High confidence domain rule wins over generic ML
      finalCategory = domainRecord.category;
      confidence = domainRecord.confidence;
      reasons.push(`Curated domain rule '${domain}' matched (${domainRecord.category})`);
    } else {
      reasons.push(`fastText model predicted ${topPred.label} with confidence ${topPred.score.toFixed(2)}`);
    }

    // 6. ACTIVITY INFERENCE ENGINE (Section 17)
    const { activity, matchedKeywords } = this.inferActivity(compositeText, finalCategory, domainRecord?.default_activity);
    reasons.push(`Activity Engine determined '${activity}' based on keywords: [${matchedKeywords.slice(0, 3).join(", ")}]`);

    // 7. CONTEXTUAL PRODUCTIVITY ENGINE (Section 18)
    const productivity = this.inferProductivity(domain, compositeText, activity, finalCategory, domainRecord?.productivity_type);
    reasons.push(`Productivity Engine assigned '${productivity}'`);

    const latency = performance.now() - t0;
    const result: ClassificationResult = {
      category: finalCategory,
      categoryScores: predictions,
      confidence,
      activity,
      productivity,
      productivityScore: productivity === "productive" ? 1.0 : productivity === "distracting" ? -1.0 : 0.0,
      modelVersion: model.version,
      isExcluded: false,
      sentenceVector,
      compositeText,
      decisionTrace: this.makeTrace(
        sessionId,
        [],
        domainRecord ? { domain: domainRecord.domain, category: domainRecord.category, activity: domainRecord.default_activity } : null,
        matchedKeywords,
        predictions,
        confidence,
        activity,
        productivity,
        "Determined during Workstream Matching",
        {},
        reasons,
        model.version,
        latency
      ),
      inferenceLatencyMs: latency,
    };

    // Cache computed classification
    InferenceCache.set(cacheKey, {
      category: result.category,
      categoryScores: result.categoryScores,
      confidence: result.confidence,
      activity: result.activity,
      productivity: result.productivity,
      modelVersion: result.modelVersion,
      timestamp: Date.now(),
    });

    return result;
  }

  private static inferActivity(text: string, category: string, defaultActivity?: string): { activity: string; matchedKeywords: string[] } {
    const matched: string[] = [];
    const lower = text.toLowerCase();

    // Check keyword dictionaries
    const checkDict = (keywords: string[]) => {
      const hits: string[] = [];
      for (const kw of keywords) {
        if (lower.includes(kw.toLowerCase())) hits.push(kw);
      }
      return hits;
    };

    const devHits = checkDict(devKeywords.keywords);
    const resHits = checkDict(researchKeywords.keywords);
    const learnHits = checkDict(learningKeywords.keywords);
    const commHits = checkDict(commsKeywords.keywords);
    const entHits = checkDict(entertainmentKeywords.keywords);

    if (devHits.length > 0) {
      matched.push(...devHits);
      if (lower.includes("error") || lower.includes("exception") || lower.includes("debug") || lower.includes("issue")) {
        return { activity: "Debugging", matchedKeywords: matched };
      }
      if (lower.includes("docs") || lower.includes("documentation") || lower.includes("reference") || lower.includes("api")) {
        return { activity: "Documentation", matchedKeywords: matched };
      }
      return { activity: "Coding", matchedKeywords: matched };
    }

    if (resHits.length > 0) {
      matched.push(...resHits);
      return { activity: "Technical Research", matchedKeywords: matched };
    }

    if (learnHits.length > 0) {
      matched.push(...learnHits);
      if (lower.includes("tutorial") || lower.includes("walkthrough")) return { activity: "Tutorial", matchedKeywords: matched };
      if (lower.includes("lecture") || lower.includes("video")) return { activity: "Lecture", matchedKeywords: matched };
      return { activity: "Course", matchedKeywords: matched };
    }

    if (commHits.length > 0) {
      matched.push(...commHits);
      if (lower.includes("mail") || lower.includes("inbox")) return { activity: "Email", matchedKeywords: matched };
      return { activity: "Messaging", matchedKeywords: matched };
    }

    if (entHits.length > 0) {
      matched.push(...entHits);
      return { activity: "Video", matchedKeywords: matched };
    }

    return {
      activity: defaultActivity || (category === "Technology" ? "Coding" : category === "Education" ? "Paper Reading" : "General Browsing"),
      matchedKeywords: matched,
    };
  }

  private static inferProductivity(domain: string, text: string, activity: string, category: string, domainDefault?: ProductivityType): ProductivityType {
    const lowerText = text.toLowerCase();

    // YouTube Contextual Overrides (SRS Workflow 10 / Section 20)
    if (domain.includes("youtube.com")) {
      if (
        lowerText.includes("tutorial") ||
        lowerText.includes("lecture") ||
        lowerText.includes("course") ||
        lowerText.includes("documentation") ||
        lowerText.includes("programming") ||
        lowerText.includes("code")
      ) {
        return "productive";
      }
      return "distracting";
    }

    // Reddit Contextual Overrides
    if (domain.includes("reddit.com")) {
      if (lowerText.includes("learnprogramming") || lowerText.includes("programming") || lowerText.includes("machinelearning") || lowerText.includes("reactjs") || lowerText.includes("datascience")) {
        return "productive";
      }
      if (lowerText.includes("memes") || lowerText.includes("funny") || lowerText.includes("gaming")) {
        return "distracting";
      }
      return "neutral";
    }

    // Domain Library Default
    if (domainDefault) return domainDefault;

    // Activity Defaults
    const actDefaults = (productivityRulesJson as { activity_defaults: Record<string, ProductivityType> }).activity_defaults;
    if (actDefaults[activity]) {
      return actDefaults[activity];
    }

    if (category === "Technology" || category === "Education" || category === "Work") return "productive";
    if (category === "Entertainment" || category === "Shop") return "distracting";
    return "neutral";
  }

  private static makeTrace(
    sessionId: string,
    ruleMatches: Array<{ rule_id: string; name: string; priority: number }>,
    domainMatch: { domain: string; category?: string; activity?: string } | null,
    keywordMatches: string[],
    modelPredictions: Array<{ label: string; score: number }>,
    modelConfidence: number,
    selectedActivity: string,
    selectedProductivity: ProductivityType,
    selectedWorkstream: string,
    workstreamScores: Record<string, number>,
    finalReason: string[],
    modelVersion: string,
    totalLatencyMs: number
  ): Omit<DecisionTraceRecord, "decision_id"> {
    return {
      session_id: sessionId,
      timestamp: Date.now(),
      rule_matches: ruleMatches,
      domain_match: domainMatch,
      keyword_matches: keywordMatches,
      model_predictions: modelPredictions,
      model_confidence: modelConfidence,
      selected_activity: selectedActivity,
      selected_productivity: selectedProductivity,
      selected_workstream: selectedWorkstream,
      workstream_scores: workstreamScores,
      final_reason: finalReason,
      model_version: modelVersion,
      feature_schema_version: "1.0.0",
      total_latency_ms: Number(totalLatencyMs.toFixed(2)),
    };
  }
}
