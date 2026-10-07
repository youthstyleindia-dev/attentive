/**
 * Focus Score Calculation Engine
 * 0–100 Explainable Metric grounded in active dwell time, workstream stability, and switch penalties.
 * 
 * PROVISIONAL SPECIFICATION NOTICE (SRS Revision 3.1 / Submission Version 3.0):
 * - PR (Productive Ratio): Officially marked [To Be Specified] in SRS Revision 3.1.
 *   Provisional implementation: productiveActiveSeconds / totalActiveSeconds.
 * - SR (Stability Ratio): Officially marked [To Be Specified] in SRS Revision 3.1.
 *   Provisional implementation: dominantWorkstreamSeconds / totalActiveSeconds.
 * - Formula: F = round(100 * (0.65 * PR + 0.35 * SR)) - min(40, 2N), clamped 0-100.
 * - Zero-Time (T = 0): Returns score 0 with displayScore "—" (no active tracking data recorded).
 */

export interface FocusScoreInputs {
  productiveActiveSeconds: number;
  neutralActiveSeconds: number;
  distractingActiveSeconds: number;
  dominantWorkstreamSeconds: number;
  contextSwitchCount: number;
}

export interface FocusScoreBreakdown {
  score: number; // 0 to 100
  displayScore: string; // "—" when totalActiveSeconds === 0, otherwise String(score)
  productiveRatio: number; // 0.0 to 1.0 (Provisional per SRS Revision 3.1)
  stabilityRatio: number; // 0.0 to 1.0 (Provisional per SRS Revision 3.1)
  switchPenalty: number; // 0 to 40
  explanation: string;
}

export class FocusScoreCalculator {
  static compute(inputs: FocusScoreInputs): FocusScoreBreakdown {
    const totalActiveSeconds =
      inputs.productiveActiveSeconds +
      inputs.neutralActiveSeconds +
      inputs.distractingActiveSeconds;

    if (totalActiveSeconds === 0) {
      return {
        score: 0,
        displayScore: "—",
        productiveRatio: 0,
        stabilityRatio: 0,
        switchPenalty: 0,
        explanation: "No active browsing dwell time recorded yet.",
      };
    }

    // Provisional Formulas per SRS Revision 3.1 [To Be Specified]:
    // PR = productiveActiveSeconds / totalActiveSeconds
    // SR = dominantWorkstreamSeconds / totalActiveSeconds
    const productiveRatio = inputs.productiveActiveSeconds / totalActiveSeconds;
    const stabilityRatio = inputs.dominantWorkstreamSeconds / totalActiveSeconds;
    const switchPenalty = Math.min(40, inputs.contextSwitchCount * 2);

    // Weighted combination: 65% productivity, 35% task stability
    const rawScore = 100 * (0.65 * productiveRatio + 0.35 * stabilityRatio) - switchPenalty;
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));

    let explanation = `Productive time share: ${(productiveRatio * 100).toFixed(0)}%, Workstream stability: ${(stabilityRatio * 100).toFixed(0)}%`;
    if (switchPenalty > 0) {
      explanation += `, Context switch penalty: -${switchPenalty} pts (${inputs.contextSwitchCount} switches)`;
    }

    return {
      score,
      displayScore: String(score),
      productiveRatio: Number(productiveRatio.toFixed(3)),
      stabilityRatio: Number(stabilityRatio.toFixed(3)),
      switchPenalty,
      explanation,
    };
  }
}
