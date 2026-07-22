import { PipelineModel } from "../../types/pipeline";
import { PipelineAnalysis } from "../../types/pipeline-context";
import { PlatformEventBus } from "../core/platform-event-bus";

/**
 * Pure deterministic logic for pipeline analysis.
 */
export class PipelineAnalysisService {
  public analyze(pipeline: PipelineModel): PipelineAnalysis {
    const failedStages = pipeline.stages.filter(s => s.status === "failed").map(s => s.name);
    const skippedStages = pipeline.stages.filter(s => s.status === "skipped").map(s => s.name);
    const flakyJobs = pipeline.stages.filter(s => s.retryCount > 0 && s.status === "success").map(s => s.name);
    
    let totalRetries = 0;
    pipeline.stages.forEach(s => totalRetries += s.retryCount);

    const successfulHistory = pipeline.history.filter(h => h.status === "success").length;
    const historicalSuccessRate = pipeline.history.length > 0 ? (successfulHistory / pipeline.history.length) * 100 : 100;

    const analysis: PipelineAnalysis = {
      executionDuration: pipeline.duration,
      queueTime: pipeline.queueTime,
      stageSuccessRate: pipeline.stages.length > 0 ? ((pipeline.stages.length - failedStages.length) / pipeline.stages.length) * 100 : 100,
      failedStages,
      skippedStages,
      flakyJobs,
      retryFrequency: totalRetries,
      artifactGenerationStatus: pipeline.artifacts.length > 0 ? "generated" : "none",
      deploymentTargets: pipeline.deployments.map(d => d.target),
      parallelism: pipeline.stages.filter(s => s.parallel).length,
      pipelineEfficiency: pipeline.duration > 0 ? Math.min(100, (pipeline.queueTime / pipeline.duration) * 100) : 100, // naive efficiency metric
      historicalSuccessRate,
      historicalFailureTrend: "stable",
      deploymentFrequency: pipeline.history.length,
      averageBuildTime: pipeline.history.length > 0 ? pipeline.history.reduce((a, b) => a + b.duration, 0) / pipeline.history.length : pipeline.duration,
      averageRecoveryTime: 0
    };

    PlatformEventBus.getInstance().publish("PipelineAnalyzed", { pipelineId: pipeline.id, analysis });
    return analysis;
  }
}
