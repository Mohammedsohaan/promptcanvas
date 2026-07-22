import { DiffAnalysis, ImpactAnalysis, MergeReadiness } from "../../types/pull-request";
import { PlatformEventBus } from "../core/platform-event-bus";
// import { ReleaseContextService } from "../release-context";
// import { ArchitectureContextService } from "../architecture-context";

/**
 * Pure deterministic logic for evaluating readiness and risk metrics.
 */
export class MergeReadinessService {
  public async compute(diffAnalysis: DiffAnalysis, impactAnalysis: ImpactAnalysis): Promise<MergeReadiness> {
    let riskScore = 0;
    const warnings: string[] = [];
    const blockers: string[] = [];

    // Calculate risk
    if (diffAnalysis.breakingChanges.length > 0) {
      riskScore += 40;
      warnings.push("Breaking changes detected.");
    }
    if (diffAnalysis.securitySensitiveChanges.length > 0) {
      riskScore += 30;
      warnings.push("Security boundaries modified.");
    }
    if (diffAnalysis.largeRefactors.length > 0) {
      riskScore += 20;
    }
    if (impactAnalysis.missingDownstreamArtifacts.length > 0) {
      riskScore += 10;
      warnings.push(`Missing downstream artifacts: ${impactAnalysis.missingDownstreamArtifacts.join(", ")}`);
    }

    // Determine complexity
    let complexity: "low" | "medium" | "high" | "critical" = "low";
    if (riskScore > 75) complexity = "critical";
    else if (riskScore > 50) complexity = "high";
    else if (riskScore > 25) complexity = "medium";

    const estimatedReviewMinutes = Math.max(5, Math.floor(riskScore / 2) + diffAnalysis.largeRefactors.length * 15);

    const readiness: MergeReadiness = {
      riskScore,
      mergeReadinessStatus: blockers.length > 0 ? "not_ready" : warnings.length > 0 ? "warnings" : "ready",
      architectureImpact: diffAnalysis.largeRefactors.length > 0 ? "High structural changes" : "Minimal",
      releaseDelta: "Minor patch",
      securityImpact: diffAnalysis.securitySensitiveChanges.length > 0 ? "Elevated" : "Standard",
      warnings,
      blockers,
      reviewComplexity: complexity,
      estimatedReviewMinutes,
      codeChurn: diffAnalysis.largeRefactors.length * 500, // mock churn logic
      cyclomaticComplexityDelta: 0,
      ownershipDistribution: {},
      documentationCoverage: diffAnalysis.categories.documentation.length > 0 ? 100 : 0,
      testCoverageDelta: diffAnalysis.categories.tests.length > 0 ? 5 : -2,
      reviewConfidence: 100 - riskScore
    };

    PlatformEventBus.getInstance().publish("MergeReadinessComputed", { readiness });
    return readiness;
  }
}
