import { PipelineModel } from "../../types/pipeline";
import { PipelineContext } from "../../types/pipeline-context";
import { PullRequestContext } from "../../types/pull-request";
import { PlatformEventBus } from "../core/platform-event-bus";

import { PipelineAnalysisService } from "./pipeline-analysis";
import { QualityGateService } from "./quality-gate-service";
import { ArtifactAnalysisService } from "./artifact-analysis";
import { DeploymentRiskService } from "./deployment-risk-service";
import { ReleaseValidationService } from "./release-validation";
import { PipelineRecommendationService } from "./pipeline-recommendation-service";

/**
 * Orchestrator that strictly aggregates output from deterministic services
 * into a single PipelineContext payload for the AI to consume.
 */
export class PipelineContextOrchestrator {
  private analysisService = new PipelineAnalysisService();
  private qualityGateService = new QualityGateService();
  private artifactService = new ArtifactAnalysisService();
  private deploymentRiskService = new DeploymentRiskService();
  private releaseValidationService = new ReleaseValidationService();
  private recommendationService = new PipelineRecommendationService();

  public async orchestrate(pipeline: PipelineModel, prContext?: PullRequestContext): Promise<PipelineContext> {
    const pipelineAnalysis = this.analysisService.analyze(pipeline);
    const qualityGate = this.qualityGateService.evaluate(pipeline);
    const artifactAnalysis = this.artifactService.analyze(pipeline);
    const deploymentRisk = this.deploymentRiskService.compute(pipeline, prContext);
    const releaseValidation = this.releaseValidationService.validate(pipeline);
    
    const pipelineRecommendation = this.recommendationService.generate(
      pipelineAnalysis,
      qualityGate,
      artifactAnalysis,
      deploymentRisk,
      releaseValidation
    );

    const context: PipelineContext = {
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "3.2.0"
      },
      pipelineModel: pipeline,
      pipelineAnalysis,
      qualityGate,
      artifactAnalysis,
      deploymentRisk,
      releaseValidation,
      pipelineRecommendation,
      repositoryDiff: prContext?.repositoryDiff,
      pullRequestContext: prContext,
    };

    PlatformEventBus.getInstance().publish("PipelineContextCreated", { context });
    return context;
  }
}
