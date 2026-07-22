import { PipelineRecommendation } from "../../types/pipeline-recommendation";
import { PipelineAnalysis, ArtifactAnalysis, DeploymentRisk, ReleaseValidation } from "../../types/pipeline-context";
import { QualityGateResult } from "../../types/quality-gate";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * Generates actionable deterministic recommendations based on pipeline context.
 */
export class PipelineRecommendationService {
  public generate(
    analysis: PipelineAnalysis,
    qualityGate: QualityGateResult,
    artifactAnalysis: ArtifactAnalysis,
    deploymentRisk: DeploymentRisk,
    releaseValidation: ReleaseValidation
  ): PipelineRecommendation {
    
    let decision: PipelineRecommendation["decision"] = "proceed";
    const blockers: string[] = [];
    const warnings: string[] = [];
    const nextActions: string[] = [];

    // Blockers
    if (qualityGate.status === "failed") {
      blockers.push("Quality Gate failed.");
      decision = "block";
    }
    if (releaseValidation.releaseReadiness === "not_ready") {
      blockers.push(...releaseValidation.missingApprovals.map(a => `Missing approval: ${a}`));
      decision = "block";
    }

    // Warnings
    if (deploymentRisk.deploymentRisk === "high" || deploymentRisk.deploymentRisk === "critical") {
      warnings.push(`High deployment risk due to ${deploymentRisk.apiCompatibility === "breaking" ? "breaking API changes" : "infrastructure drift"}.`);
      if (decision === "proceed") decision = "manual_intervention_required";
    }
    if (analysis.flakyJobs.length > 0) {
      warnings.push(`Flaky jobs detected: ${analysis.flakyJobs.join(", ")}`);
    }

    // Next Actions
    if (decision === "block") {
      nextActions.push("Resolve blockers to unblock pipeline.");
    } else if (decision === "manual_intervention_required") {
      nextActions.push("Review high risk factors manually before proceeding.");
    } else {
      nextActions.push("Pipeline is healthy. Proceed with deployment strategy.");
    }

    const recommendation: PipelineRecommendation = {
      decision,
      blockers,
      warnings,
      nextActions,
      deploymentStrategy: deploymentRisk.deploymentRisk === "high" ? "Canary" : "Rolling",
      rollbackStrategy: "Automatic"
    };

    PlatformEventBus.getInstance().publish("PipelineRecommendationGenerated", { recommendation });
    return recommendation;
  }
}
