import { RuntimeModel } from "../../types/runtime";
import { RuntimeContext } from "../../types/runtime-context";
import { PipelineContext } from "../../types/pipeline-context";
import { PlatformEventBus } from "../core/platform-event-bus";

import { HealthAnalysisService } from "./health-analysis";
import { IncidentAnalysisService } from "./incident-analysis";
import { PerformanceAnalysisService } from "./performance-analysis";
import { CapacityAnalysisService } from "./capacity-analysis";
import { DependencyAnalysisService } from "./dependency-analysis";
import { ObservabilityAnalysisService } from "./observability-analysis";
import { RuntimeRecommendationService } from "./runtime-recommendation-service";

export class RuntimeContextOrchestrator {
  private healthService = new HealthAnalysisService();
  private incidentService = new IncidentAnalysisService();
  private performanceService = new PerformanceAnalysisService();
  private capacityService = new CapacityAnalysisService();
  private dependencyService = new DependencyAnalysisService();
  private observabilityService = new ObservabilityAnalysisService();
  private recommendationService = new RuntimeRecommendationService();

  public async orchestrate(runtime: RuntimeModel, pipelineContext?: PipelineContext): Promise<RuntimeContext> {
    const healthAnalysis = this.healthService.analyze(runtime);
    const incidentAnalysis = this.incidentService.analyze(runtime);
    const performanceAnalysis = this.performanceService.analyze(runtime);
    const capacityAnalysis = this.capacityService.analyze(runtime);
    const dependencyAnalysis = this.dependencyService.analyze(runtime);
    const observabilityAnalysis = this.observabilityService.analyze(runtime);

    const runtimeRecommendation = this.recommendationService.generate(
      healthAnalysis,
      incidentAnalysis,
      performanceAnalysis,
      capacityAnalysis,
      dependencyAnalysis,
      observabilityAnalysis
    );

    const context: RuntimeContext = {
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "3.3.0"
      },
      runtimeModel: runtime,
      healthAnalysis,
      incidentAnalysis,
      performanceAnalysis,
      capacityAnalysis,
      dependencyAnalysis,
      observabilityAnalysis,
      runtimeRecommendation,
      environmentModel: runtime.environment,
      pipelineContext,
      pullRequestContext: pipelineContext?.pullRequestContext,
      repositoryDiff: pipelineContext?.repositoryDiff
    };

    PlatformEventBus.getInstance().publish("RuntimeContextCreated", { context });
    return context;
  }
}
