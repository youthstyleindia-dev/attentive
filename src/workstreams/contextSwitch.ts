/**
 * Context Switch Penalty Evaluator
 * Quantifies cognitive friction caused by tab switching, fragmentation, and rapid multitasking.
 */

export interface SwitchContext {
  fromWorkstreamId: string;
  toWorkstreamId: string;
  fromCategory: string;
  toCategory: string;
  lastSwitchTimestamp: number;
  now: number;
  fromTabId?: number;
  toTabId?: number;
  fromUrl?: string;
  toUrl?: string;
}

export interface SwitchEvaluation {
  isSwitch: boolean;
  penaltyPoints: number;
  switchType: "none" | "within_workstream" | "same_category" | "related" | "unrelated";
  isRapidSwitch: boolean;
  switchBurden?: "low" | "medium" | "high";
  switchBurdenScore?: number;
}

export class ContextSwitchEvaluator {
  static evaluate(ctx: SwitchContext): SwitchEvaluation {
    const isTabSwitch =
      (ctx.fromTabId !== undefined && ctx.toTabId !== undefined && ctx.fromTabId !== ctx.toTabId) ||
      (ctx.fromUrl && ctx.toUrl && ctx.fromUrl !== ctx.toUrl);

    const isWorkstreamSwitch =
      Boolean(ctx.fromWorkstreamId && ctx.toWorkstreamId && ctx.fromWorkstreamId !== ctx.toWorkstreamId);

    if (!isTabSwitch && !isWorkstreamSwitch) {
      return {
        isSwitch: false,
        penaltyPoints: 0,
        switchType: "within_workstream",
        isRapidSwitch: false,
        switchBurden: "low",
        switchBurdenScore: 0,
      };
    }

    const elapsedSeconds = Math.max(0, (ctx.now - ctx.lastSwitchTimestamp) / 1000);
    const isRapid = elapsedSeconds <= 45;

    let basePenalty = 2;
    let switchType: "within_workstream" | "same_category" | "related" | "unrelated" = "related";

    if (!isWorkstreamSwitch) {
      basePenalty = 0; // SRS: CU=0 for within-workstream switch
      switchType = "within_workstream";
    } else if (ctx.fromCategory && ctx.toCategory && ctx.fromCategory.toLowerCase() === ctx.toCategory.toLowerCase()) {
      basePenalty = 1;
      switchType = "same_category";
    } else if (
      (ctx.fromCategory === "Technology" && ctx.toCategory === "Education") ||
      (ctx.fromCategory === "Education" && ctx.toCategory === "Technology")
    ) {
      basePenalty = 2;
      switchType = "related";
    } else {
      basePenalty = 4;
      switchType = "unrelated";
    }

    const penaltyPoints = isRapid ? Math.round(basePenalty * 1.5) : basePenalty;
    const switchBurden: "low" | "medium" | "high" = penaltyPoints <= 1 ? "low" : penaltyPoints <= 3 ? "medium" : "high";
    const switchBurdenScore = Math.min(100, penaltyPoints * 18);

    return {
      isSwitch: true,
      penaltyPoints,
      switchType,
      isRapidSwitch: isRapid,
      switchBurden,
      switchBurdenScore,
    };
  }
}
