import { MergeReadiness, ImpactAnalysis } from "../../types/pull-request";
import { ReviewRecommendation, ReviewDecision } from "../../types/review-recommendation";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * Consumes MergeReadiness and ImpactAnalysis to produce an actionable recommendation.
 */
export class ReviewRecommendationService {
  public generate(mergeReadiness: MergeReadiness, impactAnalysis: ImpactAnalysis): ReviewRecommendation {
    let decision: ReviewDecision = "approve";
    const nextActions: string[] = [];
    const reasonParts: string[] = [];

    if (mergeReadiness.blockers.length > 0) {
      decision = "request_changes";
      reasonParts.push("Critical blockers prevent merge.");
      nextActions.push("Resolve all blockers.");
    } else if (mergeReadiness.riskScore > 75 || mergeReadiness.warnings.length > 2) {
      decision = "request_changes";
      reasonParts.push("High risk score with multiple warnings.");
      nextActions.push("Address architecture and security warnings.");
    } else if (mergeReadiness.warnings.length > 0 || impactAnalysis.missingDownstreamArtifacts.length > 0) {
      decision = "comment";
      reasonParts.push("Minor warnings or missing downstream artifacts detected.");
      if (impactAnalysis.missingDownstreamArtifacts.length > 0) {
        nextActions.push(`Add missing artifacts: ${impactAnalysis.missingDownstreamArtifacts.join(", ")}`);
      }
    } else {
      reasonParts.push("No significant risks detected.");
      nextActions.push("Proceed with standard peer review.");
    }

    const recommendation: ReviewRecommendation = {
      decision,
      reason: reasonParts.join(" "),
      blockers: mergeReadiness.blockers,
      warnings: mergeReadiness.warnings,
      nextActions
    };

    PlatformEventBus.getInstance().publish("ReviewRecommendationGenerated", { recommendation });
    return recommendation;
  }
}
