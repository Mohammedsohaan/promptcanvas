import { RuntimeModel } from "./runtime";
import { RuntimeRecommendation } from "./runtime-recommendation";
import { PipelineContext } from "./pipeline-context";
import { PullRequestContext } from "./pull-request";
import { RepositoryDiff } from "./repository-diff";
import { EnvironmentModel } from "./environment";

export interface HealthAnalysis {
  availability: number;
  readiness: number;
  liveness: number;
  restartCount: number;
  crashLoops: number;
  deploymentHealth: "healthy" | "degraded" | "failing";
  nodeHealth: "healthy" | "degraded" | "failing";
  podHealth: "healthy" | "degraded" | "failing";
  containerHealth: "healthy" | "degraded" | "failing";
}

export interface IncidentAnalysis {
  severity: "SEV-1" | "SEV-2" | "SEV-3" | "SEV-4" | "SEV-5" | "none";
  affectedServices: string[];
  blastRadius: "isolated" | "localized" | "widespread" | "global";
  deploymentCorrelation: boolean;
  failureTimeline: string[];
  recoveryProgress: number; // percentage
  MTTD?: number; // minutes
  MTTR?: number; // minutes
  recurrenceFrequency: number;
  affectedUsersEstimate: number;
  businessImpact: "high" | "medium" | "low" | "none";
}

export interface PerformanceAnalysis {
  latency: number;
  p50: number;
  p95: number;
  p99: number;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  requestRate: number;
  errorRate: number;
  slowQueries: number;
  cacheHitRate: number;
}

export interface CapacityAnalysis {
  cpuHeadroom: number;
  memoryHeadroom: number;
  diskUtilization: number;
  networkUtilization: number;
  autoscalingRecommendation: "scale_up" | "scale_down" | "maintain";
  capacityTrend: "increasing" | "decreasing" | "stable";
  futureCapacityRisk: "high" | "medium" | "low";
}

export interface DependencyAnalysis {
  criticalPaths: string[];
  failurePropagation: boolean;
  dependencyFailures: string[];
  singlePointsOfFailure: string[];
  externalDependencyRisk: "high" | "medium" | "low";
}

export interface ObservabilityAnalysis {
  metricCoverage: number;
  logCoverage: number;
  traceCoverage: number;
  alertCoverage: number;
  dashboardCoverage: number;
  sloCompliance: boolean;
  sliCoverage: number;
  errorBudgetConsumption: number;
  missingTelemetry: string[];
  missingAlerts: string[];
  missingDashboards: string[];
}

export interface RuntimeContext {
  metadata: {
    analyzedAt: string;
    version: string;
  };
  runtimeModel: RuntimeModel;
  healthAnalysis: HealthAnalysis;
  incidentAnalysis: IncidentAnalysis;
  performanceAnalysis: PerformanceAnalysis;
  capacityAnalysis: CapacityAnalysis;
  dependencyAnalysis: DependencyAnalysis;
  observabilityAnalysis: ObservabilityAnalysis;
  runtimeRecommendation: RuntimeRecommendation;
  environmentModel?: EnvironmentModel;
  pipelineContext?: PipelineContext;
  pullRequestContext?: PullRequestContext;
  repositoryDiff?: RepositoryDiff;
}
