import { PlatformEventBus } from "../core/platform-event-bus";
import { FinOpsContext } from "../../types/finops-context";
import { ResourceAnalysisService } from "./resource-analysis-service";
import { ComputeCostService } from "./compute-cost-service";
import { StorageCostService } from "./storage-cost-service";
import { NetworkCostService } from "./network-cost-service";
import { KubernetesCostService } from "./kubernetes-cost-service";
import { ApplicationCostService } from "./application-cost-service";
import { PipelineCostService } from "./pipeline-cost-service";
import { SecurityCostService } from "./security-cost-service";
import { BillingSummaryService } from "./billing-summary-service";
import { SustainabilityAnalysisService } from "./sustainability-analysis-service";
import { CostAnomalyService } from "./cost-anomaly-service";
import { OptimizationService } from "./optimization-service";
import { SavingsOpportunityService } from "./savings-opportunity-service";
import { FinOpsScoreService } from "./finops-score-service";
import { CostRecommendationService } from "./cost-recommendation-service";

export class FinOpsContextOrchestrator {
  public orchestrate(rawBillingData: any, resources: any[], resourceCosts: any[], existingContexts: any): FinOpsContext {
    const billingSummary = new BillingSummaryService().compute(rawBillingData);
    const resourceAnalysis = new ResourceAnalysisService().analyze(resources);
    const computeCost = new ComputeCostService().calculate(resourceCosts);
    const storageCost = new StorageCostService().calculate(resourceCosts);
    const networkCost = new NetworkCostService().calculate(resourceCosts);
    const k8sCost = new KubernetesCostService().calculate(resourceCosts);
    const appCost = new ApplicationCostService().calculate(existingContexts.runtimeContext);
    const pipelineCost = new PipelineCostService().calculate(existingContexts.pipelineContext);
    const securityCost = new SecurityCostService().calculate(existingContexts.securityContext);
    const sustainability = new SustainabilityAnalysisService().analyze(resources);
    const anomalies = new CostAnomalyService().detect(resourceCosts);
    const optimization = new OptimizationService().compute(resources, resourceCosts);
    const savings = new SavingsOpportunityService().compute(optimization);
    const score = new FinOpsScoreService().compute({ resourceAnalysis, computeCost });
    const recommendations = new CostRecommendationService().generate(savings, score);

    const context: FinOpsContext = {
      metadata: {
        analyzedAt: new Date().toISOString(),
        version: "3.5"
      },
      repositoryContext: existingContexts.repositoryContext,
      pullRequestContext: existingContexts.pullRequestContext,
      pipelineContext: existingContexts.pipelineContext,
      runtimeContext: existingContexts.runtimeContext,
      securityContext: existingContexts.securityContext,
      billingSummary,
      costBreakdowns: [],
      optimizationAnalysis: optimization,
      savingsOpportunities: savings,
      finOpsScore: score,
      recommendations,
      costAnomalies: anomalies,
      sustainability
    };

    PlatformEventBus.getInstance().publish("FinOpsContextCreated", context);
    return context;
  }
}
