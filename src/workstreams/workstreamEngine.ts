/**
 * Workstream Engine — Atentiv
 * Intelligent connected tab clustering, centroid calculation, and task synthesis.
 */
import { WorkstreamRepository } from "../db/repositories/workstreamRepository";
import { computeWorkstreamSimilarity, cosineSimilarity } from "./similarity";
import type { WorkstreamRecord } from "../db/schemas";
import wsRules from "../../libraries/workstreams/workstream_rules.json";

export interface WorkstreamMatchInput {
  domain: string;
  title: string;
  category: string;
  activity: string;
  sentenceVector?: Float32Array | number[];
  timestamp: number;
  linkedNavigation?: boolean;
  currentWorkstreamId?: string;
}

export interface WorkstreamAssignment {
  workstreamId: string;
  workstreamName: string;
  confidence: number;
  isNewWorkstream: boolean;
  isTentative?: boolean;
  similarityScores: Record<string, number>;
}

// In-memory buffer for tentative pages (Gstell et al. uncertainty modeling)
interface TentativePage {
  domain: string;
  title: string;
  category: string;
  activity: string;
  timestamp: number;
  vector?: number[];
}
const tentativeBuffer: TentativePage[] = [];

export class WorkstreamEngine {
  static async assignWorkstream(input: WorkstreamMatchInput): Promise<WorkstreamAssignment> {
    const activeWorkstreams = await WorkstreamRepository.listActive(10);
    const enterThreshold = wsRules.clustering_thresholds.enter_threshold || 0.70;
    const keepThreshold = wsRules.clustering_thresholds.keep_threshold || 0.55;
    const delta = wsRules.clustering_thresholds.hysteresis_margin || 0.05;

    let bestWs: WorkstreamRecord | null = null;
    let bestScore = -1;
    let currentWsScore = -1;
    const similarityScores: Record<string, number> = {};

    for (const ws of activeWorkstreams) {
      const score = computeWorkstreamSimilarity({
        pageVector: input.sentenceVector,
        workstreamCentroid: ws.centroid,
        pageCategory: input.category,
        workstreamCategory: ws.category,
        pageActivity: input.activity,
        pageDomain: input.domain,
        lastActiveTimestamp: ws.last_active,
        currentTimestamp: input.timestamp,
        isLinkedNavigation: input.linkedNavigation,
      });

      similarityScores[ws.name] = Number(score.toFixed(3));
      if (input.currentWorkstreamId && ws.workstream_id === input.currentWorkstreamId) {
        currentWsScore = score;
      }
      if (score > bestScore) {
        bestScore = score;
        bestWs = ws;
      }
    }

    // ── Hysteresis Stability Check ──────────────────────────────────────────
    // If currently in a workstream and S_current >= keepThreshold (0.55):
    // Only switch if S_new > S_current + delta (0.05) AND S_new >= enterThreshold (0.70)
    if (input.currentWorkstreamId && currentWsScore >= keepThreshold) {
      const currentWs = activeWorkstreams.find((w) => w.workstream_id === input.currentWorkstreamId);
      if (currentWs) {
        const canSwitch = bestWs && bestWs.workstream_id !== currentWs.workstream_id && bestScore > currentWsScore + delta && bestScore >= enterThreshold;
        if (!canSwitch) {
          // Keep current workstream (prevents oscillation!)
          return {
            workstreamId: currentWs.workstream_id,
            workstreamName: currentWs.name,
            confidence: Number(currentWsScore.toFixed(3)),
            isNewWorkstream: false,
            similarityScores,
          };
        }
      }
    }

    // ── Enter Existing Workstream ───────────────────────────────────────────
    const attachThreshold = wsRules.clustering_thresholds.attach_to_existing_workstream || 0.68;
    if (bestWs && bestScore >= attachThreshold) {
      const newCentroid = this.blendCentroid(bestWs.centroid, input.sentenceVector);
      await WorkstreamRepository.updateCentroid(bestWs.workstream_id, newCentroid, 10);
      return {
        workstreamId: bestWs.workstream_id,
        workstreamName: bestWs.name,
        confidence: Number(bestScore.toFixed(3)),
        isNewWorkstream: false,
        similarityScores,
      };
    }

    // ── Tentative Workstream Buffer (Uncertainty Evaluation) ─────────────────
    // Check if there is already a tentative page with similar domain or category
    const matchingTentativeIdx = tentativeBuffer.findIndex(
      (t) => t.domain === input.domain || (t.category === input.category && Math.abs(t.timestamp - input.timestamp) < 600000)
    );

    if (matchingTentativeIdx !== -1) {
      // Confirmed by second related page! Create permanent workstream
      tentativeBuffer.splice(matchingTentativeIdx, 1);
      const synthesizedName = this.synthesizeWorkstreamName(input.title, input.domain, input.category, input.activity);
      const newWsId = crypto.randomUUID();
      const newRecord: WorkstreamRecord = {
        workstream_id: newWsId,
        name: synthesizedName,
        category: input.category,
        centroid: input.sentenceVector ? Array.from(input.sentenceVector) : undefined,
        created_at: input.timestamp,
        updated_at: input.timestamp,
        first_seen: input.timestamp,
        last_active: input.timestamp,
        total_active_seconds: 0,
        confidence: 0.9,
        status: "active",
      };
      await WorkstreamRepository.upsert(newRecord);
      return {
        workstreamId: newWsId,
        workstreamName: synthesizedName,
        confidence: 0.9,
        isNewWorkstream: true,
        similarityScores,
      };
    }

    // Otherwise, place in tentative buffer and synthesize tentative workstream
    tentativeBuffer.push({
      domain: input.domain,
      title: input.title,
      category: input.category,
      activity: input.activity,
      timestamp: input.timestamp,
      vector: input.sentenceVector ? Array.from(input.sentenceVector) : undefined,
    });
    if (tentativeBuffer.length > 10) tentativeBuffer.shift();

    const synthesizedName = this.synthesizeWorkstreamName(input.title, input.domain, input.category, input.activity);
    const newWsId = crypto.randomUUID();
    const newRecord: WorkstreamRecord = {
      workstream_id: newWsId,
      name: synthesizedName,
      category: input.category,
      centroid: input.sentenceVector ? Array.from(input.sentenceVector) : undefined,
      created_at: input.timestamp,
      updated_at: input.timestamp,
      first_seen: input.timestamp,
      last_active: input.timestamp,
      total_active_seconds: 0,
      confidence: 0.8,
      status: "active",
    };
    await WorkstreamRepository.upsert(newRecord);
    return {
      workstreamId: newWsId,
      workstreamName: synthesizedName,
      confidence: 0.8,
      isNewWorkstream: true,
      isTentative: true,
      similarityScores,
    };
  }

  private static blendCentroid(oldCentroid?: number[], newVector?: Float32Array | number[]): number[] {
    if (!newVector || newVector.length === 0) return oldCentroid || [];
    const vec = Array.from(newVector);
    if (!oldCentroid || oldCentroid.length === 0) return vec;

    const alpha = 0.8;
    return oldCentroid.map((c, i) => alpha * c + (1 - alpha) * (vec[i] || 0));
  }

  private static synthesizeWorkstreamName(title: string, domain: string, category: string, activity: string): string {
    const cleanTitle = title
      .replace(/[\-–|•].*$/, "") // Remove brand suffixes like " - Stack Overflow"
      .replace(/https?:\/\/\S+/g, "")
      .trim();

    if (cleanTitle && cleanTitle.length > 3 && cleanTitle.length < 50) {
      // Capitalize first letter
      return cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }

    // Specific domain synthesis
    if (domain.includes("github.com")) return "Code & Repository Work";
    if (domain.includes("stackoverflow.com")) return "Technical Debugging & Issues";
    if (domain.includes("arxiv.org") || domain.includes("scholar.google")) return "Academic Literature Research";
    if (domain.includes("youtube.com")) return activity === "Tutorial" ? "Technical Video Tutorial" : "Media & Video";
    if (domain.includes("notion.so") || domain.includes("linear.app")) return "Project Planning & Tasks";

    return `${category} — ${activity}`;
  }

  /**
   * SRS Revision 3.1: Merge rule (>3 tabs or centroid >0.85)
   */
  static canMergeWorkstreams(ws1: WorkstreamRecord, ws2: WorkstreamRecord, sharedTabsCount: number = 0): boolean {
    if (sharedTabsCount > (wsRules.merge_rules?.min_shared_tabs ?? 3)) return true;
    if (ws1.centroid && ws2.centroid) {
      const similarity = cosineSimilarity(ws1.centroid, ws2.centroid);
      if (similarity > (wsRules.merge_rules?.centroid_similarity_threshold ?? 0.85)) return true;
    }
    return false;
  }

  /**
   * Merges source workstream into target workstream and blends centroids
   */
  static async mergeWorkstreams(targetWsId: string, sourceWsId: string): Promise<void> {
    const active = await WorkstreamRepository.listActive(50);
    const target = active.find((w) => w.workstream_id === targetWsId);
    const source = active.find((w) => w.workstream_id === sourceWsId);
    if (!target || !source) return;

    if (source.centroid) {
      const blended = this.blendCentroid(target.centroid, source.centroid);
      await WorkstreamRepository.updateCentroid(targetWsId, blended, source.total_active_seconds);
    }
    await WorkstreamRepository.upsert({
      ...source,
      status: "archived",
      updated_at: Date.now(),
    });
  }

  /**
   * SRS Revision 3.1: Split rule (split after 15 min / 900s of unrelated browsing)
   */
  static shouldSplitWorkstream(unrelatedActiveSeconds: number): boolean {
    const splitThreshold = wsRules.split_rules?.unrelated_duration_seconds || 900;
    return unrelatedActiveSeconds >= splitThreshold;
  }
}
