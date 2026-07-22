import { RepositoryDiff } from "./repository-diff";
import { PullRequestContext } from "./pull-request";
import { PipelineContext } from "./pipeline-context";
import { RuntimeContext } from "./runtime-context";
import { SecurityContext } from "./security-context";
import { BillingSummary } from "./billing-summary";
import { CostBreakdown } from "./cost-breakdown";
import { OptimizationAnalysis } from "./optimization";
import { SavingsOpportunity } from "./savings-opportunity";
import { FinOpsScore } from "./finops-score";
import { CostRecommendation } from "./cost-recommendation";

export interface CostAnomaly {
  id: string;
  type: "UnexpectedSpend" | "DailySpike" | "WeeklySpike" | "MonthlySpike" | "ForecastDeviation" | "IdleCostGrowth";
  description: string;
  impactAmount: number;
  currency: string;
  detectedAt: string;
}

export interface SustainabilityAnalysis {
  estimatedCarbonFootprint: number; // in kg CO2e
  energyConsumption: number; // in kWh
  greenRegionOpportunities: string[];
  sustainabilityScore: number;
}

export interface FinOpsContext {
  metadata: {
    analyzedAt: string;
    version: string;
  };
  repositoryContext?: RepositoryDiff;
  pullRequestContext?: PullRequestContext;
  pipelineContext?: PipelineContext;
  runtimeContext?: RuntimeContext;
  securityContext?: SecurityContext;
  
  billingSummary: BillingSummary;
  costBreakdowns: CostBreakdown[];
  optimizationAnalysis: OptimizationAnalysis;
  savingsOpportunities: SavingsOpportunity[];
  finOpsScore: FinOpsScore;
  recommendations: CostRecommendation[];
  costAnomalies?: CostAnomaly[];
  sustainability?: SustainabilityAnalysis;
}
