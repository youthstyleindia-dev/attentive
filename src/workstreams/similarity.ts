/**
 * Workstream Similarity Functions
 * Computes cosine semantic similarity, category overlap, and multi-factor scores.
 */
import wsRules from "../../libraries/workstreams/workstream_rules.json";

export function cosineSimilarity(v1?: Float32Array | number[], v2?: Float32Array | number[]): number {
  if (!v1 || !v2 || v1.length === 0 || v2.length === 0) return 0.0;
  let dot = 0.0;
  let norm1 = 0.0;
  let norm2 = 0.0;
  const len = Math.min(v1.length, v2.length);

  for (let i = 0; i < len; i++) {
    dot += v1[i] * v2[i];
    norm1 += v1[i] * v1[i];
    norm2 += v2[i] * v2[i];
  }

  if (norm1 === 0 || norm2 === 0) return 0.0;
  return Math.max(0, Math.min(1.0, dot / (Math.sqrt(norm1) * Math.sqrt(norm2))));
}

export interface SimilarityInputs {
  pageVector?: Float32Array | number[];
  workstreamCentroid?: number[];
  pageCategory: string;
  workstreamCategory: string;
  pageActivity: string;
  pageDomain: string;
  workstreamDomains?: string[];
  lastActiveTimestamp: number;
  currentTimestamp: number;
  isLinkedNavigation?: boolean;
}

export function computeWorkstreamSimilarity(input: SimilarityInputs): number {
  const weights = wsRules.similarity_weights;

  // 1. Semantic Similarity
  const semantic = cosineSimilarity(input.pageVector, input.workstreamCentroid);

  // 2. Category Similarity (exact match = 1.0, related = 0.5, different = 0.0)
  let categorySim = 0.0;
  if (input.pageCategory.toLowerCase() === input.workstreamCategory.toLowerCase()) {
    categorySim = 1.0;
  } else if (
    (input.pageCategory === "Technology" && input.workstreamCategory === "Education") ||
    (input.pageCategory === "Education" && input.workstreamCategory === "Technology")
  ) {
    categorySim = 0.5;
  }

  // 3. Activity Similarity
  let activitySim = 0.5;
  if (input.pageCategory === input.workstreamCategory) {
    activitySim = 0.8;
  }

  // 4. Domain Relationship
  let domainSim = 0.0;
  if (input.workstreamDomains && input.workstreamDomains.includes(input.pageDomain)) {
    domainSim = 1.0;
  }

  // 5. Temporal Proximity (decay over 20 minutes / 1200s per SRS)
  const deltaSeconds = Math.max(0, (input.currentTimestamp - input.lastActiveTimestamp) / 1000);
  const maxGap = wsRules.clustering_thresholds.max_temporal_gap_seconds || 1200;
  const temporal = Math.max(0, 1.0 - deltaSeconds / maxGap);

  // 6. Navigation Relationship (e.g. clicked link or parent tab)
  const nav = input.isLinkedNavigation ? 1.0 : 0.0;

  const totalScore =
    weights.semantic_similarity * semantic +
    weights.category_similarity * categorySim +
    weights.activity_similarity * activitySim +
    weights.domain_relationship * domainSim +
    weights.temporal_proximity * temporal +
    weights.navigation_relationship * nav;

  return Math.max(0.0, Math.min(1.0, totalScore));
}
